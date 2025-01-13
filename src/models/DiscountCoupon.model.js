import mongoose from 'mongoose';

const discountCouponSchema = new mongoose.Schema({
    code: {
        type: String,
        required: true,
        unique: true, // Ensure coupon codes are unique
        trim: true,
    },
    discountType: {
        type: String,
        required: true,
        enum: ['percentage', 'flat'], // Percentage discount or flat discount
    },
    discountValue: {
        type: Number,
        required: true,
        min: 0, // Ensure the discount value is not negative
    },
    minimumPurchase: {
        type: Number,
        default: 0, // Minimum order value to apply the coupon
    },
    maximumDiscount: {
        type: Number, // Maximum discount value for percentage coupons
        default: null,
    },
    expiryDate: {
        type: Date,
        required: true, // Coupon expiration date
    },
    isActive: {
        type: Boolean,
        default: true, // Whether the coupon is active or not
    },
    usageLimit: {
        type: Number, // Total number of times the coupon can be used
        default: null,
    },
    usageCount: {
        type: Number, // Tracks how many times the coupon has been used
        default: 0,
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // Reference to the user/admin who created the coupon
    },
    createdAt: {
        type: Date,
        default: Date.now, // Automatically set the creation date
    },
    updatedAt: {
        type: Date,
        default: Date.now, // Automatically set the update date
    },
});

// Middleware to update `updatedAt` on each save
discountCouponSchema.pre('save', function (next) {
    this.updatedAt = Date.now();
    next();
});

const DiscountCoupon = mongoose.models.DiscountCoupon || mongoose.model('DiscountCoupon', discountCouponSchema);

export default DiscountCoupon;
