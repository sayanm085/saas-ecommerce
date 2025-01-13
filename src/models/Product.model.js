import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true, // The product name is required
    trim: true, // Removes any whitespace
  },

  title: {
    type: String,
    trim: true,
    required: true,
  },
  description: {
    type: String,
    required: true,
    trim: true,
  },

  details: {
    type: String,
    required: true,
  },

  features: [
    {
      type: String,
    },
  ],

  image: [
    {
      type: String,
      required: true,
    },
  ],

  livePreview: {
    default: null,
    type: String,
  },
  price: {
    type: Number,
    required: true,
    min: 0, // Price must be a positive number
  },
  category: {
    type: String,
    // Define allowed categories
    default: "Other",
  },

  tags: [
    {
      type: String,
    },
  ],

  stock: {
    type: Number,
    default: 1,
  },

  likeSummary: {
    count: {
      type: Number,
      default: 0,
    },
    likedBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },  

  reviewIds: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Review",
  }],
  reviewcount: {
    type: Number,
    default: 0,
  },
  reviewavg: {
    type: Number,
    default: 0,
  },  


  
  totalOrders: {
    type: Number,
    default: 0,
  },



  orderby: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],
  totalReturns: {
    type: Number,
    default: 0,
  },
  totalSuccessfulDeliveries: {
    type: Number,
    default: 0,
  },
  totalReviews: {
    type: Number,
    default: 0,
  },
  averageRating: {
    type: Number,
    default: 0,
  },

  createdAt: {
    type: Date,
    default: Date.now, // Automatically set creation date
  },
  updatedAt: {
    type: Date,
    default: Date.now, // Automatically set update date
  },
});

productSchema.pre("save", function (next) {
  this.updatedAt = Date.now(); // Update the updatedAt timestamp before saving
  next();
});

// Export the model
const Product = mongoose.model('Product', productSchema);

export default Product;
