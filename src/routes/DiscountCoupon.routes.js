import { Router } from "express";
import {verifyAdminJWT} from "../middlewares/auth.middleware.js";
import {createCoupon, getCoupons} from "../controllers/DiscountCoupon.controllers.js";
const router = Router();


router.route("/create-coupon").post(verifyAdminJWT, createCoupon);
router.route("/get-coupons").get(verifyAdminJWT, getCoupons);

export default router;