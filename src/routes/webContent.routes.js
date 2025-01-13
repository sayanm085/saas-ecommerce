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

const router = Router();


// Upload Images
router.route("/uploadImages").post(
  upload.fields([
    { name: "image", maxCount: 10 },
  ]),
  uploadImages);









// Update Hero Content
router.route("/updateHeroContent").put(
  upload.fields([
    { name: "heroImage", maxCount: 1 },
  ]),
  updateHeroContent
);

// Update Brand Partners Content
router.route("/updateBrandPartnersContent").put(
  upload.fields([
    { name: "brandLogo", maxCount: 10 },
  ]),
  updateBrandPartnersContent
);

// Update Services Content
router.route("/updateServicesContent").put(updateServicesContent);

// Update Why Choose Us Content
router.route("/updateWhyChooseUsContent").put(
  upload.fields([
    { name: "WhyChooseUsLogo", maxCount: 20 },
  ]),
  updateWhyChooseUsContent
);

// Update Call Booking Content
router.route("/updateCallBookingContent").put(updateCallBookingContent);

// Update FAQs Content
router.route("/updateFAQsContent").put(updateFAQsContent);



router.route("/webcontent-create").post(WebContentcreate);
router.route("/webcontent-get").get(WebContentget);




export default router;