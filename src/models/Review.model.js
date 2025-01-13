import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1, // Minimum rating
    max: 5  // Maximum rating
  },
  comment: {
    type: String,
    required: false,
    maxlength: 500
  },
  imageUrls: {
    type: [String], // Array of strings for image URLs
    required: false // Optional field
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Compile the model
const Review = mongoose.model('Review', reviewSchema);

export default Review;
