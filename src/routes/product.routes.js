import { Router } from "express";
import {productUpload,productUpdate,productDelete,productLike,productReview,productReviewDelete} from "../controllers/ProductList.controllers.js";
import upload from "../middlewares/multer.middleware.js";


const router = Router();

router.route("/product-upload").post(upload.fields([
    { name: "productImage", maxCount: 20 },
]), productUpload);

router.route("/product-update/:id").put(upload.fields([
    { name: "productImage", maxCount: 20 },
]),productUpdate);

router.route("/product-delete/:id").delete(productDelete);

router.route("/product-like/:id").put(productLike);

router.route("/product-review/:id").put(
    upload.fields([
        { name: "reviewImg", maxCount: 3 },
    ])
    ,productReview);

router.route("/product-review-delete/:id").delete(productReviewDelete);


export default router;