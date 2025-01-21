import { Router } from "express";
import {
  uploadImages,
  WebContentcreate,
  WebContentget,
  updateHeroContent,
  updateBrandPartnersContent,
  updateServicesContent,
  updateWhyChooseUsContent,
  updateCallBookingContent,
  updateFAQsContent,
} from "../controllers/WebContent.controllers.js";
import upload from "../middlewares/multer.middleware.js";
import { verifyAdminJWT } from "../middlewares/auth.middleware.js";

const router = Router();


// Upload Images
router.route("/uploadImages").post(
  verifyAdminJWT,
  upload.fields([
    { name: "image", maxCount: 10 },
  ]),
  uploadImages);









// Update Hero Content
router.route("/updateHeroContent").put(
  verifyAdminJWT,
  upload.fields([
    { name: "heroImage", maxCount: 1 },
  ]),
  updateHeroContent
);

// Update Brand Partners Content
router.route("/updateBrandPartnersContent").put(
  verifyAdminJWT,
  upload.fields([
    { name: "brandLogo", maxCount: 10 },
  ]),
  updateBrandPartnersContent
);

// Update Services Content
router.route("/updateServicesContent").put(verifyAdminJWT,updateServicesContent);

// Update Why Choose Us Content
router.route("/updateWhyChooseUsContent").put(
  verifyAdminJWT,
  upload.fields([
    { name: "WhyChooseUsLogo", maxCount: 20 },
  ]),
  updateWhyChooseUsContent
);

// Update Call Booking Content
router.route("/updateCallBookingContent").put(verifyAdminJWT,updateCallBookingContent);

// Update FAQs Content
router.route("/updateFAQsContent").put(verifyAdminJWT,updateFAQsContent);



router.route("/webcontent-create").post(verifyAdminJWT,WebContentcreate);
router.route("/webcontent-get").get(WebContentget);




export default router;