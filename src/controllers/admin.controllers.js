import {asyncHandler} from '../utils/asyncHandler.js';
import {ApiResponse} from '../utils/ApiResponse.js';
import Admin from "../models/Admin.model.js";



// Utility function for setting cookies
const setAuthCookies = (res, accessToken, refreshToken) => {
    const options = { httpOnly: true, secure:true ,maxAge: 1000 * 60 * 60 * 24 * 7 }; // 7 days in milliseconds
    res
    .cookie("AdminAccessToken", accessToken, options)
    .cookie("AdminrefreshToken", refreshToken, options)
  };

// Create Admin controller
 const createAdmin = asyncHandler(async (req, res) => {
    const {fullName,email,username, password,role} = req.body;
    const admin = await Admin.create({fullName,username,email,password,role});
    const accessToken = admin.generateAccessToken();
    const refreshToken = admin.generaterefreshToken();
    setAuthCookies(res, accessToken, refreshToken);
    res.status(201).json(new ApiResponse(201, { admin }, "Admin created successfully"));
 });

// Login Admin controller
 const loginAdmin = asyncHandler(async (req, res) => {
   const { email, password } = req.body;
 
   // Select password explicitly
   const admin = await Admin.findOne({ email }).select("+password");
 
   if (!admin) {
     return res.status(401).json(new ApiResponse(401, null, "Invalid credentials"));
   }
 
   const isMatch = await admin.verifyPassword(password);
 
   if (!isMatch) {
     return res.status(401).json(new ApiResponse(401, null, "Invalid credentials"));
   }
 
   const accessToken = admin.generateAccessToken();
   const refreshToken = admin.generaterefreshToken();
   setAuthCookies(res, accessToken, refreshToken);

   // Update refresh token in the database
   await Admin.updateOne({ _id: admin._id }, { $set: { refreshToken } });
 
   // Remove password from response for security reasons
   const adminResponse = {
     _id: admin._id,
     fullName: admin.fullName,
     email: admin.email,
     username: admin.username,
     role: admin.role,
     isActive: admin.isActive,
   };
 
   res.status(200).json(new ApiResponse(200, adminResponse, "Admin logged in successfully"));
 });
 
// Logout Admin controller
 const logoutAdmin = asyncHandler(async (req, res) => {
   const adminId = req.admin._id;
  // 🚀 Use updateOne instead of findById + save to improve performance
   await Admin.updateOne({ _id: adminId }, { $set: { refreshToken: "" } });
   res.clearCookie("AdminAccessToken").clearCookie("AdminrefreshToken").json(new ApiResponse(200, null, "Admin logged out successfully"));
  });


export {createAdmin,loginAdmin,logoutAdmin };

