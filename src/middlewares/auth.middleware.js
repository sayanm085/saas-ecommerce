import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";
import User from "../models/User.model.js";

const verifyJWT = asyncHandler(async (req, res, next) => {
try {
    const token = req.cookies?.AccessToken;
    if (!token) {
      return res.status(401).json({ message: "You are not authorized" });
    }
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
  
    const userdata = await User.findById(decoded._id);
  
    const user = {
      _id: userdata._id,
      email: userdata.email,
      username: userdata.username,
      fullName: userdata.fullName,
    };
  
    if (!user) {
      return res.status(401).json({ message: "You are not authorized" });
    }
  
    req.user = user;
    next();
} catch (error) {
    return res.status(500).json({ message:"server error" });
  
}
});

export default verifyJWT;
