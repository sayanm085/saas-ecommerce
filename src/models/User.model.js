import mongoose from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const userSchema = new mongoose.Schema({
    
      username: {
        type: String,
        required: true,
        unique: true, // Ensure usernames are unique
        lowercase: true, // Convert username to lowercase
        trim: true, // Remove leading/trailing whitespace
        index: true, // Add an index for this field
      },
      varifyby: {
        type: String,
        required: true,
        default: 'email',
      },
      email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
      },
      fullName: {
        type: String,
        required: true,
        trim: true,
        index: true,
      },
      avatar: {
        default: null,
        type: String, // URL to avatar image
      },
      password: {
        type: String,
        required: true,
      },
      phone: {
        default: null,
        type: String,
        required: false
      },
      shippingAddress: {
        default: null,
        type: String, // Refers to the address schema
        required: false
      },
      billingAddress: {
        default: null,
        type: String, // Refers to the address schema
        required: false
      },
      orders: [{
        default: [],  // Default to an empty array
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order' // Reference to the Order model (assumed you have an Order schema)
      }],
      wishlist: [{
        default: [],  // Default to an empty array
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product' // Reference to the Product model (assumed you have a Product schema)
      }],

      otp: {
        type: Number,
        required: false
      },
      otpExpires: {
        type: Date,
        required: false
      },
      isVerified: {
        type: Boolean,
        default: false
      },

      // cart: [{
      //   productId: {
      //     type: Schema.Types.ObjectId,
      //     ref: 'Product', // Reference to a Product model
      //     required: true
      //   },
      //   quantity: {
      //     default: 0,
      //     type: Number,
      //     required: true,
      //     min: 1
      //   }
      // }],
      refreshToken: {
        type: String,
      },

},{timestamps: true});

userSchema.pre("save", async function (next){ // encrypt password before saving
    if(this.isModified("password")){
        this.password= await bcrypt.hash(this.password, 10);
    }
    next();
} )

// *user model main code end here


// user model methods start here

userSchema.methods.verifyPassword= async function(password){ // Verify Password methods
  console.log(password);
  console.log(this.password);
    return await bcrypt.compare(password, this.password);
}


userSchema.methods.generaterefreshToken= function(){ // Generate Refresh Token methods 
    return jwt.sign(
        {
            _id: this._id,
            email: this.email,
            username: this.username,
            fullName: this.fullName,
        
        }, 
        process.env.REFRESH_TOKEN_SECRET, // Refresh Token Secret key
        {
            expiresIn:process.env.REFRESH_TOKEN_EXPIRY  // Token expires in 7 days
        }
    )
}

userSchema.methods.generateAccessToken= function(){  // Generate Access Token methods
    return jwt.sign(
        {
            _id: this._id,
        }, 
        process.env.ACCESS_TOKEN_SECRET, // Access Token Secret key
        {
            expiresIn:process.env.ACCESS_TOKEN_EXPIRY  // Token expires in 1 day
        }
    )
}

let User= mongoose.model("User", userSchema);

export default User; // Export User model