import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();


const connectDB = async() =>{
    try{
        if (!process.env.MONGO_URL || !process.env.MONGO_DB) {
            throw new Error("MONGO_URL or MONGO_DB environment variable is missing");
        }
        
        const mongoURI = `${process.env.MONGO_URL}/${process.env.MONGO_DB}`

        const conn = await mongoose.connect(mongoURI, {
            serverSelectionTimeoutMS: 5000,
        });

        const { name, port, host } = conn.connection;
        console.log("✅ Connected to DB");
        console.log(`   Host: ${host}:${port}  |  Database: ${name}`);
    }
    catch(err){
        console.log(" ❌ Error connecting to DB", err);
        throw err;
    }
}

export { connectDB };