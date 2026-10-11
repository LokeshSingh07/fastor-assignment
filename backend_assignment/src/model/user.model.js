import mongoose from "mongoose";
import bcrypt from "bcryptjs";


const userSchema = new mongoose.Schema({
    name: { type: String, required: true, toLowerCase: true, trim: true },
    email: { type: String, required: true, unique: true, index: true, lowercase: true, trim: true },
    password: { type: String, minLength: 6, required: true, select: false },
    role: { type: Number, enum: [1, 2, 3], default: 1 },
    isVerified: { type: Boolean, default: false },

}, { timestamps: true });


// middleware -> hash password
userSchema.pre("save", async function(){
    if(this.isModified("password")){
        this.password = await bcrypt.hash(this.password, 10);
    }
})

// methods -> compare password
userSchema.methods.comparePassword = async function(password){
    return await bcrypt.compare(password, this.password);
}



export const User =  mongoose.model("User", userSchema);