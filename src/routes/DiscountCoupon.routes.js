import { Router } from "express";
import verifyJWT from "../middlewares/auth.middleware.js";
import {createCoupon, getCoupons} from "../controllers/DiscountCoupon.controllers.js";
const router = Router();


router.route("/create-coupon").post( createCoupon);
router.route("/get-coupons").get( getCoupons);

export default router;