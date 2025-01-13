import {asyncHandler} from '../utils/asyncHandler.js';
import {ApiResponse} from '../utils/ApiResponse.js'
import uploadImage from '../utils/cloudinary.js';;
import User from '../models/User.model.js';
import jwt from 'jsonwebtoken';


// Utility function for setting cookies
const setAuthCookies = (res, accessToken, refreshToken) => {
  const options = { httpOnly: true, secure:true ,maxAge: 1000 * 60 * 60 * 24 * 7 }; // 7 days in milliseconds
  res
  .cookie("AccessToken", accessToken, options)
  .cookie("refreshToken", refreshToken, options)
};
// Helper function to generate random password
const generateRandomPassword = () => {
  return Array.from(crypto.getRandomValues(new Uint8Array(16)), byte => String.fromCharCode(byte % 94 + 33)).join('');
};

// Helper function to generate random username
const generateUsername = (displayName) => {
  return displayName.replace(/\s+/g, '') + Math.floor(Math.random() * 10000);
};


// Register a new user in the database and send a jwt token

const registerUser = asyncHandler(async (req, res) => {
  
  const {varifyby} = req.body; // varifyby is either email or google.com


  if(varifyby === 'email'){
      // data from the request body
  const { fullName, username, email, password ,varifyby, } = req.body;

  // check if the required fields are present
  if (!fullName || !username || !email || !password || !varifyby) {
    return res.status(400).json(ApiResponse(400, null, "Missing required fields", false));
  }

  // Check if the email already exists in the database to avoid duplicates
  const existingUser = await User.findOne({ email }).lean();
  if (existingUser) {
    return res.status(400).json(ApiResponse(400, null, "Email is already in use", false));
  }

  // create a new user object with the data from the request body
  const user = new User({ fullName, username, email, password,varifyby });

  // save the user object to the database
  await user.save();

  // jwt token sent to the user
  const refreshToken = user.generaterefreshToken();
  const AccessToken = user.generateAccessToken();

  // set the token in a cookie
  setAuthCookies(res, AccessToken, refreshToken);

  // save the refresh token in the database
  user.refreshToken = refreshToken;
  await user.save();

  // Prepare the response object with only the necessary fields
  const userResponse = {
    username: user.username,
    email: user.email,
    fullName: user.fullName,
  };

  // send a success response
  res.status(201).json(ApiResponse(201, userResponse, "User created successfully", true));

  // send email to the user email , confirm email and welcome email



  }

  if(varifyby === 'google.com'){
    // data from the request body
    const { userdata, varifyby } = req.body;
    // Destructure userdata for cleaner code
    const { displayName, email, photoURL } = userdata;
    // check if the required fields are present
    if (!userdata) {
      return res
        .status(400)
        .json(ApiResponse(400, null, "Missing required fields", false));
    }

    // Check if the email already exists in the database to avoid duplicates
    const existing = await User.findOne({ email:email }).lean();
    if (existing) {
      return res
        .status(400)
        .json(ApiResponse(400, null, "Email is already in use", false));
    }

    // Create a new user object
    const user = new User({
      fullName: displayName,
      username: generateUsername(displayName),
      email,
      varifyby,
      password: generateRandomPassword(),
      avatar: photoURL,
    });

    // save the user object to the database
    await user.save();

    // jwt token sent to the user after registration
    const refreshToken = user.generaterefreshToken();
    const AccessToken = user.generateAccessToken();

    // set the token in a cookie
    setAuthCookies(res, AccessToken, refreshToken);

    // save the refresh token in the database
    user.refreshToken = refreshToken;
    await user.save();

    // Prepare the response object with only the necessary fields

    const userResponse = {
      username: user.username,
      email: user.email,
      fullName: user.fullName,
    };

    // send a success response
    res
      .status(201)
      .json(ApiResponse(201, userResponse, "User created successfully", true));

      //! send email to the user email , welcome email
  }

  



});





const loginUser = asyncHandler(async (req, res) => {
  const {varifyby} = req.body; // varifyby is either email or google.com

if(varifyby === 'email'){
    // data from the request body
    const { email, password } = req.body;
    // find a user with the email
    const user = await User .findOne({ email });

    // check if the user exists
    if (!user) {
      return res.status(404).json(ApiResponse(404, null, "User not found", false));
    }

    // check if the password is correct
    const isMatch = await user.verifyPassword(password);
    if (!isMatch) {
      return res.status(401).json(ApiResponse(401, null, "Incorrect password", false));
    }
    // jwt token sent to the user
    const refreshToken = user.generaterefreshToken();
    const AccessToken = user.generateAccessToken();
    // set the token in a cookie
    setAuthCookies(res, AccessToken, refreshToken);
    // save the refresh token in the database
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

  // Prepare the response object with only the necessary fields
   const userResponse = {
    username: user.username,
    email: user.email,
    fullName: user.fullName,
  };
    // send a success response

    res.status(200).json(ApiResponse(200, refreshToken, "User logged in successfully", true));



}

if(varifyby === 'google.com'){
  // data from the request body
  const { userdata} = req.body;
  // Destructure userdata for cleaner code
  const { email } = userdata;
  // check if the required fields are present
  if (!userdata) {
    return res
      .status(400)
      .json(ApiResponse(400, null, "Missing required fields", false));
  }

  // find a user with the email
  const user = await User.findOne({ email });

  // check if the user exists
  if (!user) {
    return res
      .status(404)
      .json(ApiResponse(404, null, "User not found", false));
  }

  // jwt token sent to the user
  const refreshToken = user.generaterefreshToken();
  const AccessToken = user.generateAccessToken();

  // set the token in a cookie
  setAuthCookies(res, AccessToken, refreshToken);

  // save the refresh token in the database
  user.refreshToken = refreshToken;
  await user.save({ validateBeforeSave: false });

  // Prepare the response object with only the necessary fields
  const userResponse = {
    username: user.username,
    email: user.email,
    fullName: user.fullName,
  };

  // send a success response
  res
    .status(200)
    .json(ApiResponse(200, userResponse, "User logged in successfully", true));



}

});



const logoutUser = asyncHandler(async (req, res) => {
   // User refreshToken deleted from the database
  const user = await User.findById(req.user._id);
  user.refreshToken = null;
  await user.save({ validateBeforeSave: false });

  // options for the cookie

  const cookieOptions = { httpOnly: true, secure: true };
  // clear the cookie
  res
    .status(200)
    .clearCookie("AccessToken", cookieOptions)
    .clearCookie("refreshToken", cookieOptions)
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



export {registerUser,loginUser,logoutUser , refreshAccessToken,profileEdit};