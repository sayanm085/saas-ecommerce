import dotenv from 'dotenv';
dotenv.config();


 
 const DB_NAME = process.env.DB_NAME;

// cloudinary key 
 const CLOUDINARY_CLOUD_NAME= process.env.CLOUDINARY_CLOUD_NAME;
 const CLOUDINARY_API_KEY= process.env.CLOUDINARY_API_KEY;
 const CLOUDINARY_API_SECRET= process.env.CLOUDINARY_API_SECRET;

 // razerpay key 
 const RAZORPAY_KEY_ID= process.env.RAZORPAY_KEY_ID;
 const RAZORPAY_KEY_SECRET= process.env.RAZORPAY_KEY_SECRET
 
export {DB_NAME,CLOUDINARY_CLOUD_NAME,CLOUDINARY_API_KEY,CLOUDINARY_API_SECRET ,RAZORPAY_KEY_ID,RAZORPAY_KEY_SECRET};