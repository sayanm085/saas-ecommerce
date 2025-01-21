import { Router } from "express";
import {productUpload,productUpdate,productDelete,productLike,productReview,productReviewDelete,productSearch,productDetails} from "../controllers/ProductList.controllers.js";
import upload from "../middlewares/multer.middleware.js";
import {verifyJWT,verifyAdminJWT} from "../middlewares/auth.middleware.js";


const router = Router();

router.route("/product-upload").post(
    verifyAdminJWT,
    upload.fields([
    { name: "productImage", maxCount: 20 },
]), productUpload);

router.route("/product-update/:id").put(
    verifyAdminJWT,
    upload.fields([
    { name: "productImage", maxCount: 20 },
]),productUpdate);

router.route("/product-delete/:id").delete(
    verifyAdminJWT,
    productDelete);

router.route("/product-like/:id").put(verifyJWT,productLike);

router.route("/product-review/:id").put(
    verifyJWT,
    upload.fields([{ name: "reviewImg", maxCount: 3 }]),
    productReview
);

router.route("/product-review-delete/:id").delete(verifyJWT,productReviewDelete);


router.route("/product-search").get(productSearch);

router.route("/product-details/:id").get(productDetails);



export default router;