import mongoose from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";


const AdminSchema = new mongoose.Schema(
    {
      fullName: {
        type: String,
        required: [true, "Full name is required"],
        trim: true,
      },
      username: {
        type: String,
        required: [true, "Username is required"],
        unique: true,
        trim: true,
      },
      email: {
        type: String,
        required: [true, "Email is required"],
        unique: true,
        lowercase: true,
      },
      password: {
        type: String,
        required: [true, "Password is required"],
        select: false, // Don't fetch password by default
      },
      role: {
        type: String,
        enum: ["superadmin", "manager", "support"], // Define roles
        default: "manager",
      },
      isActive: {
        type: Boolean,
        default: true, // Admin is active by default
      },
      refreshToken: {
        type: String,
        select: false, // Keep it hidden from default queries
      },
    },
    { timestamps: true }
  );


  AdminSchema.pre("save", async function (next){ // encrypt password before saving
    if(this.isModified("password")){
        this.password= await bcrypt.hash(this.password, 10);
    }
    next();
} )

// *Admin model main code end here


// Admin model methods start here

AdminSchema.methods.verifyPassword = async function (password) {
  console.log(password);
  console.log(this.password);
  if (!password || !this.password) {
    throw new Error("Password and hashed password are required");
  }

  return await bcrypt.compare(password, this.password);
};


AdminSchema.methods.generaterefreshToken= function(){ // Generate Refresh Token methods 
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

AdminSchema.methods.generateAccessToken= function(){  // Generate Access Token methods
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


    // Export the Admin model
const Admin = mongoose.model("Admin", AdminSchema);
export default Admin;