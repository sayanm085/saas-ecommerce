import {asyncHandler} from '../utils/asyncHandler.js';
import {ApiResponse} from '../utils/ApiResponse.js';
import Coupon from '../models/DiscountCoupon.model.js';


const createCoupon = asyncHandler(async (req, res) => {
    // Code to create a new coupon
   const {code,discountType, discountValue,minimumPurchase, maximumDiscount,usageLimit,expiryDate} = req.body;
    const coupon = await Coupon.create({
      code,
      discountType,
      discountValue,
      minimumPurchase,
      maximumDiscount,
      usageLimit,
      expiryDate: new Date(expiryDate),
    });
    // Return the response with the newly created coupon object and a success message
    res.status(201).json(new ApiResponse(201, 'Coupon created successfully', coupon));
} );

const getCoupons = asyncHandler(async (req, res) => {
    // Code to get all coupons
    // ...
    // ...
    // ...
    // Return the response
    res.status(200).json(new ApiResponse(200, 'Coupons fetched successfully', coupons));
});

export {createCoupon, getCoupons};