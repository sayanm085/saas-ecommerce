import { Router } from "express";
import {verifyJWT} from "../middlewares/auth.middleware.js";
import {createOrder,ordervarify, getOrders, getOrderById} from "../controllers/OrderList.controllers.js";


const router = Router();

router.route("/create-order").post(verifyJWT,createOrder);
router.route("/order-varify").post(verifyJWT,ordervarify);
router.route("/get-orders").get(verifyJWT,getOrders);
router.route("/get-order/:id").get(verifyJWT,getOrderById);

export default router;