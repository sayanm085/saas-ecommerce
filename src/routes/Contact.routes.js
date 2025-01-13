import { Router } from "express";
import {createContactUs} from "../controllers/Contact.controllers.js";

const router = Router();

router.route('/contact-us').post(createContactUs);

export default router;