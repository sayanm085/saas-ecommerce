import {asyncHandler} from '../utils/asyncHandler.js';
import {ApiResponse} from '../utils/ApiResponse.js';
import uploadImage from '../utils/cloudinary.js';
import User from '../models/User.model.js';
import jwt from 'jsonwebtoken';
import mailsend from "../utils/nodemailer.utils.js";
import {OTPtemplate,welcomeTemplate} from "../email template/email template.js";
import admin from '../utils/firebaseAdmin.js';

// Utility function for setting cookies
const setAuthCookies = (res, accessToken, refreshToken) => {
  const options = { httpOnly: true, secure:true ,maxAge: 1000 * 60 * 60 * 24 * 7 }; // 7 days in milliseconds
  res
  .cookie("AccessToken", accessToken, options)
  .cookie("refreshToken", refreshToken, options)
};

// Helper to generate a 6-digit OTP
const generateOTP = () => Math.floor(100000 + Math.random() * 900000);

// Helper to calculate OTP expiration time (in milliseconds)
const getOTPExpiryTime = (minutes = 10) => Date.now() + minutes * 60 * 1000;

// Helper function to generate random password
const generateRandomPassword = () => {
  return Array.from(crypto.getRandomValues(new Uint8Array(16)), byte => String.fromCharCode(byte % 94 + 33)).join('');
};

// Helper function to generate random username
const generateUsername = (displayName) => {
  return displayName.replace(/\s+/g, '') + Math.floor(Math.random() * 10000);
};

//*end of helper functions 

// Register a new user in the database and send a jwt token

const registerUser = asyncHandler(async (req, res) => {
  const { varifyby, fullName, username, email, password, userdata } = req.body;

  if (varifyby === 'email') {
    if (!fullName || !username || !email || !password) {
      return res.status(400).json(ApiResponse(400, null, "Missing required fields", false));
    }

    // Check if the email already exists
    if (await User.exists({ email })) {
      return res.status(400).json(ApiResponse(400, null, "Email is already in use", false));
    }

    // Create user and generate OTP in parallel
    const otp = generateOTP();
    const user = new User({ fullName, username, email, password, varifyby, otp, otpExpires: getOTPExpiryTime() });

    await user.save();

    // Send OTP email asynchronously (non-blocking)
    mailsend(user.email, "Email Verification Code", OTPtemplate(otp)).catch(console.error);

    console.log("✅ OTP sent to the user email");

    return res.status(201).json(ApiResponse(201, { username, email, fullName }, "Kindly check your email inbox", true));
  }

  if (varifyby === 'google.com') {
    if (!userdata) {
      return res.status(400).json(ApiResponse(400, null, "Missing required fields", false));
    }

    const decodedToken = await admin.auth().verifyIdToken(userdata);
    if (!decodedToken?.email) {
      return res.status(400).json(ApiResponse(400, null, "Invalid Google token", false));
    }

    const { name, email, picture } = decodedToken;

    // Check if the email already exists
    if (await User.exists({ email })) {
      return res.status(400).json(ApiResponse(400, null, "Email is already in use", false));
    }

    // Create user object
    const user = new User({
      fullName: name,
      username: generateUsername(name),
      email,
      varifyby,
      password: generateRandomPassword(),
      avatar: picture,
      isVerified: true,
    });

    // Generate tokens in parallel
    const [refreshToken, accessToken] = await Promise.all([
      user.generaterefreshToken(),
      user.generateAccessToken(),
    ]);

    // Set auth cookies
    setAuthCookies(res, accessToken, refreshToken);

    // Save refresh token without blocking response
    user.refreshToken = refreshToken;
    await user.save().catch(console.error);

    // Send welcome email asynchronously
    mailsend(user.email, "Welcome to our platform", welcomeTemplate(name)).catch(console.error);

    return res.status(201).json(ApiResponse(201, { username: user.username, email, fullName: user.fullName }, "User created successfully", true));
  }

  res.status(400).json(ApiResponse(400, null, "Invalid verification method", false));
});


const verifyEmail = asyncHandler(async (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    return res.status(400).json(ApiResponse(400, null, "Email and OTP are required", false));
  }

  // Check if the email exists before making a full query
  if (!(await User.exists({ email }))) {
    return res.status(404).json(ApiResponse(404, null, "User not found", false));
  }

  // Fetch only required fields
  const user = await User.findOne({ email }).select("+otp +otpExpires +isVerified +refreshToken");

  if (user.isVerified) {
    return res.status(400).json(ApiResponse(400, null, "Email is already verified", false));
  }

  // Early return if OTP is incorrect
  if (user.otp !== otp || Date.now() > user.otpExpires) {
    return res.status(400).json(ApiResponse(400, null, "Invalid OTP", false));
  }

  // Update user verification status
  user.isVerified = true;
  user.otp = null;
  user.otpExpires = null;

  // Generate tokens in parallel
  const [refreshToken, accessToken] = await Promise.all([
    user.generaterefreshToken(),
    user.generateAccessToken(),
  ]);

  // Set auth cookies before DB write (non-blocking)
  setAuthCookies(res, accessToken, refreshToken);

  // Update refresh token and save in parallel with response
  user.refreshToken = refreshToken;
  user.save({ validateBeforeSave: false }).catch(console.error); // Non-blocking save

  // Send response immediately
  res.status(200).json(ApiResponse(200, { username: user.username, email, fullName: user.fullName }, "Email verified successfully", true));

  // Send welcome email asynchronously
  mailsend(user.email, "Welcome to our platform", welcomeTemplate(user.fullName)).catch(console.error);
});


const resendotp = asyncHandler(async (req, res) => {
  const { email } = req.body;

  // Generate OTP and expiry ahead of database update
  const newotp = generateOTP();
  const otpExpires = getOTPExpiryTime();

  // Update the user OTP directly in the database
  const updateResult = await User.updateOne(
    { email },
    { $set: { otp: newotp, otpExpires } }
  );

  // Check if the user exists
  if (updateResult.matchedCount === 0) {
    return res.status(404).json(ApiResponse(404, null, "User not found", false));
  }

  // Send the email asynchronously
  const emailTask = mailsend(email, "New OTP", OTPtemplate(newotp));

  // Send response immediately after OTP update
  res.status(200).json(ApiResponse(200, null, "New OTP sent to your email", true));

  // Perform email sending in the background
  await emailTask;
});


const forgotPassword = asyncHandler(async (req, res) => {
  // get the email from the request body
  const { email } = req.body;

  // find a user with the email
  const user = await User.findOne({ email });

  // check if the user exists
  if (!user) {
    return res.status(404).json(ApiResponse(404, null, "User not found", false));
  }

  // generate a new password for the user
  const newPassword = generateRandomPassword();
  user.password = newPassword;
  await user.save();

  // send email to the user email with the new password
  const html = `
    <p>Your new password is: <strong>${newPassword}</strong></p>
    <p>Please change your password after logging in.</p>
  `;
  await sendEmail(user.email, "New Password", html);

  // send a success response
  res.status(200).json(ApiResponse(200, null, "New password sent to your email", true));
});



// Login a user with email and password and send a jwt token in a cookie 
const loginUser = asyncHandler(async (req, res) => {
  const { varifyby, email, password, userdata } = req.body;

  let user;
  let refreshToken;
  let accessToken;

  if (varifyby === 'email') {
    if (!email || !password) {
      return res.status(400).json(ApiResponse(400, null, "Email and password are required", false));
    }

    // 🔥 Fetch only necessary fields to reduce DB load
    user = await User.findOne({ email }).select("+password +isVerified +refreshToken");

    if (!user) {
      return res.status(404).json(ApiResponse(404, null, "User not found", false));
    }

    if (!user.isVerified) {
      return res.status(401).json(ApiResponse(401, null, "Email is not verified", false));
    }

    // 🔥 Faster password verification
    if (!user.verifyPassword(password)) {
      return res.status(401).json(ApiResponse(401, null, "Incorrect password", false));
    }
  } 
  
  else if (varifyby === 'google.com') {
    if (!userdata) {
      return res.status(400).json(ApiResponse(400, null, "Google data is required", false));
    }

    // 🔥 Verify Google Token & Extract Email
    const decodedToken = await admin.auth().verifyIdToken(userdata);
    
    if (!decodedToken?.email) {
      return res.status(400).json(ApiResponse(400, null, "Invalid Google token", false));
    }


    // 🔥 Fetch only necessary fields to reduce DB load
    user = await User.findOne({ email: decodedToken.email }).select("+refreshToken");
    if (!user) {
      return res.status(404).json(ApiResponse(404, null, "User not found", false));
    }

    
  } 
  
  else {
    return res.status(400).json(ApiResponse(400, null, "Invalid verification method", false));
  }

  // 🔥 Generate JWT Tokens in parallel
  [refreshToken, accessToken] = await Promise.all([
    user.generaterefreshToken(),
    user.generateAccessToken(),
  ]);

  // 🔥 Set cookies & update user in parallel (non-blocking)
  setAuthCookies(res, accessToken, refreshToken);
  user.refreshToken = refreshToken;
  user.updatedAt = Date.now();
  user.save({ validateBeforeSave: false }).catch(console.error); // Non-blocking save

  // Prepare response
  const userResponse = {
    username: user.username,
    email: user.email,
    fullName: user.fullName,
  };

  res.status(200).json(ApiResponse(200, userResponse, "User logged in successfully", true));
});






const logoutUser = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  // 🚀 Use updateOne instead of findById + save to improve performance
  await User.updateOne({ _id: userId }, { $unset: { refreshToken: 1 } });

  // 🚀 Clear cookies efficiently
  res
    .status(200)
    .clearCookie("AccessToken", { httpOnly: true, secure: true })
    .clearCookie("refreshToken", { httpOnly: true, secure: true })
    .json(ApiResponse(200, null, "User logged out successfully", true));
});



const refreshAccessToken = asyncHandler(async (req, res) => {
  // get the refresh token from the cookie
  const Token = req.cookies?.refreshToken;
  // check if the refresh token is present
  if (!Token) {
    return res.status(401).json(ApiResponse(401, null, "You are not authorized", false));
  }

  // verify the refresh token and get the user id from it if it is valid  
  let userId;

  try {
    userId = jwt.verify(Token, process.env.REFRESH_TOKEN_SECRET)._id;
  } catch (error) {
    return res.status(401).json(ApiResponse(401, null, "You are not authorized", false));
  }

  // find the user with the id from the refresh token

  const user= await User.findById(userId);
  // check if the user exists
  if (!user) {
    return res.status(404).json(ApiResponse(404, null, "User not found", false));
  }

  // generate a new access token for the user and send it in the response body and in a cookie  
      // jwt token sent to the user
      const refreshToken = user.generaterefreshToken();
      const AccessToken = user.generateAccessToken();

  setAuthCookies(res, AccessToken, refreshToken);

  // save the refresh token in the database
  user.refreshToken = refreshToken;
  await user.save({ validateBeforeSave: false });

  // send a success response
  res.status(200).json(ApiResponse(200, { AccessToken }, "Access token refreshed", true));

});


const profileEdit= asyncHandler(async (req, res) => {

  const { fullName, username } = req.body;
  const avatar = req.file?.path;
 // get the user id from the request object
  const userid = req.user._id;
  const user = await User.findById(userid);

  // fist check if the username is available
  const existing = await User .findOne({ username });

  if (existing && existing._id.toString() !== userid) {
    return res.status(400).json(ApiResponse(400, null, "Username is already in use", false));
  }


    // Validate and upload images to cloudinary
  let uploadedImage;
   if (avatar) {
     uploadedImage = await uploadImage(avatar);
  }


  user.username = username || user.username;
  user.fullName = fullName || user.fullName;
  user.avatar = uploadedImage || user.avatar;

 

  // save the updated user object to the database
  await user.save();

  // Prepare the response object with only the necessary fields
  const userResponse = {
    username: user.username,
    email: user.email,
    fullName: user.fullName,
    avatar: user.avatar,
  };

  // send a success response
  res.status(200).json(ApiResponse(200, userResponse, "User updated successfully", true));

  
});



export {registerUser,loginUser,logoutUser , refreshAccessToken,profileEdit, verifyEmail,resendotp,forgotPassword};