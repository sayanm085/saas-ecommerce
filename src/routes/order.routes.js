import { Router } from "express";
import verifyJWT from "../middlewares/auth.middleware.js";
import {createOrder,ordervarify, getOrders, getOrderById} from "../controllers/OrderList.controllers.js";


const router = Router();

router.route("/create-order").post(createOrder);
router.route("/order-varify").post(ordervarify);
router.route("/get-orders").get(getOrders);
router.route("/get-order/:id").get(getOrderById);

export default router;