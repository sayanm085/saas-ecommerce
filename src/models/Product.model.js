import mongoose from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";
import redisClient from "../db/Radis.db.js";

const productSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  title: { type: String, required: true, trim: true },
  description: { type: String, required: true, trim: true },
  details: { type: String, required: true },
  features: [{ type: String }],
  image: [{ type: String, required: true }],
  livePreview: { type: String, default: null },
  price: { type: Number, required: true, min: 0 },
  category: { type: String, default: "Other" },
  tags: [{ type: String }],
  stock: { type: Number, default: 1 },

  likeSummary: {
    count: { type: Number, default: 0 },
    likedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  },

  reviewIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "Review" }],
  reviewcount: { type: Number, default: 0 },
  reviewavg: { type: Number, default: 0 },

  totalOrders: { type: Number, default: 0 },
  orderby: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  totalReturns: { type: Number, default: 0 },
  totalSuccessfulDeliveries: { type: Number, default: 0 },
  totalReviews: { type: Number, default: 0 },
  averageRating: { type: Number, default: 0 },

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// 🔥 Auto-remove Redis cache when ANY product is updated
productSchema.pre("save", async function (next) {
  if (this.isModified()) {
    await redisClient.flushDb(); // Clears all search cache
    console.log("✅ Redis cache cleared due to product update");
  }
  this.updatedAt = Date.now();
  next();
});

// 🔥 Auto-remove Redis cache when ANY product is deleted
productSchema.post("findOneAndDelete", async function (doc) {
  if (doc) {
    await redisClient.flushDb(); // Clears all search cache
    console.log("❌ Redis cache cleared due to product deletion");
  }
});

productSchema.plugin(mongoosePaginate);

// Export the model
const Product = mongoose.model("Product", productSchema);

export default Product;
