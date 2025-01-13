// Importing required modules
import mongoose from "mongoose";


const orderSchema = new mongoose.Schema({
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    products:[{
      product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
      },
      quantity: {
        default: 1,
        type: Number,
        required: true
      }
    }],
    currency: {
      type: String,
      default: 'INR'
    },
    coupon : {
      type: String
    },
    totalAmount: {
      type: Number,
      required: true
    },

    paymentStatus: {
      type: String,
      default: 'Pending',
      enum: ['Pending', 'Completed', 'Failed']
    },
    paymentsid: {
      type: String
    },
    paymentResult: {
      id: {
        type: String
      },
      status: {
        type: String
      }
    },
    paymentType: {
      type: String,
      default: 'Cash on Delivery',
      enum: ['Cash on Delivery', 'Card Payment', 'UPI Payment']

    },
    paidAt: {
      type: Date
    },
    orderStatus: {
      type: String,
      default: 'Pending',
      enum: ['Pending', 'Processing', 'Delivered', 'Cancelled']
    },
    shippingAddress: {
      type: String,
      required: true
    },
    orderId: {
      type: String
    },
    orderedAt: {
      type: Date,
      default: Date.now
    }
  });
  
  const Order = mongoose.model('Order', orderSchema);
  export default Order;
  