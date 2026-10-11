import express from "express"
import cors from "cors"
import dotenv from "dotenv"

import { connectDB } from "./config/db.js";
dotenv.config();

const app = express();


app.use(cors({
  origin: process.env.ORIGIN,
  credentials: true,
}));

app.use(express.json());



import authRoutes from "./routes/user.route.js"
import leadRoutes from "./routes/lead.route.js"

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/lead", leadRoutes);






// ─── Health check ─────────────────────────────────────────────
app.get("/", (req, res) => {
    return res.status(200).json({
        success: true,
        message: `Server is running up...`
    })
});



// Start Server
const PORT = process.env.PORT || 4011;

;(async () => {
    try{
        await connectDB();
        
        app.listen(PORT, '0.0.0.0', () => { 
            console.log(`✅ Server running on port ${PORT}`);
        });

    } catch(err){
        console.log("❌ Server startup failed", err);
        process.exit(1);
    }
})()
