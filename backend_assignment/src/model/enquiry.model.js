import mongoose from "mongoose";
import bcrypt from "bcryptjs";


const enquirySchema = new mongoose.Schema({
    name: { 
        type: String, 
        required: true, 
        toLowerCase: true, 
        trim: true 
    },
    email: {
        type: String,
        required: true,
        unique: true,
        index: true,
        lowercase: true,
        trim: true
    },
    phone: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    courseInterested: {
        type: String,
        required: true,
        trim: true
    },
    message: {
        type: String,
        trim: true
    },
    isClaimed: {
        type: Boolean,
        default: false
    },
    claimedBy: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "User"
    },
    claimedAt: {
        type: Date,
        default: null
    }

}, { timestamps: true });



export const Enquiry =  mongoose.model("Enquiry", enquirySchema);