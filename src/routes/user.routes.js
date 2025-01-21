import { Router } from "express";
import { registerUser,loginUser,logoutUser , refreshAccessToken ,profileEdit,verifyEmail,resendotp,forgotPassword} from "../controllers/User.controllers.js";
import {verifyJWT} from "../middlewares/auth.middleware.js";
import upload from "../middlewares/multer.middleware.js";


const router = Router();


router.route("/register").post(registerUser)
router.route("/verify-email").get(verifyEmail)
router.route("/forgot-password").post(forgotPassword)
router.route("/resend-otp").post(resendotp)
router.route("/login").post(loginUser)
router.route("/logout").get(verifyJWT,logoutUser)
router.route("/refresh-accessToken").get(refreshAccessToken)
router.route("/profile").put(verifyJWT,upload.single("avatar"),profileEdit)




export default router;