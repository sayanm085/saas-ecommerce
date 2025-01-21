import { Router } from "express";
import { createAdmin, loginAdmin ,logoutAdmin} from "../controllers/admin.controllers.js";
import {verifyAdminJWT }from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/createAdmin").post(createAdmin);
router.route("/loginAdmin").post(loginAdmin);
router.route("/logoutAdmin").post(verifyAdminJWT,logoutAdmin);

export default router;