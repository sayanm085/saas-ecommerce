import mongoose from 'mongoose';

// Define the Contact schema
const contactSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    trim: true,
    match: /^\S+@\S+\.\S+$/,
  },
  phone: {
    type: String,
    required: false,
    trim: true,
    match: /^\+?[1-9]\d{1,14}$/, // Optional: Validates international phone numbers
  },
    message: {
        type: String,
        required: true,
        trim: true,
    },
    contactuniquenumber: {
        type: String,
        required: true,
        unique: true,
        trim: true,
    },
    adminresponse: {
        type: String,
        required: false,
        trim: true,
    },
    adminresponsestatus: {
        type: Boolean,
        required: false,
    },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Create the Contact model
const Contact = mongoose.model('Contact', contactSchema);

export default Contact;
