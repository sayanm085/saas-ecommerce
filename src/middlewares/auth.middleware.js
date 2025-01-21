import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";
import User from "../models/User.model.js";
import Admin from "../models/Admin.model.js";

const verifyJWT = asyncHandler(async (req, res, next) => {
  const token = req.cookies?.AccessToken;
  if (!token) {
    return res.status(401).json({ message: "You are not authorized" });
  }

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
  } catch (error) {
    return res.status(403).json({ message: "Invalid token" });
  }

  // 🔥 Fetch only necessary fields, use `.lean()` for better performance
  const user = await User.findById(decoded._id)
    .select("_id email username fullName")
    .lean();

  if (!user) {
    return res.status(401).json({ message: "User not found" });
  }

  req.user = user;
  next();
});



const verifyAdminJWT = asyncHandler(async (req, res, next) => {
  const token = req.cookies?.AdminAccessToken;
  if (!token) {
    return res.status(401).json({ message: "You are not authorized" });
  }

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
  } catch (error) {
    return res.status(403).json({ message: "Invalid token" });
  }

  // 🔥 Fetch only necessary fields, use `.lean()` for better performance
  const admin = await Admin.findById(decoded._id)
    .select("_id email username fullName")
    .lean();

  if (!admin) {
    return res.status(401).json({ message: "Admin not found" });
  }

  req.admin = admin;
  next();
  
});


export { verifyJWT, verifyAdminJWT };
