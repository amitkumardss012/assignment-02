import mongoose from "mongoose";
import { ENV } from "./env.js";

async function connectDB() {
    try {
        if (!ENV.MONGO_URI) {
            throw new Error("MONGO_URI is not defined in environment variables");
        }
        await mongoose.connect(ENV.MONGO_URI);
        console.log("MongoDB connected");
    } catch (error) {
        console.error("MongoDB connection error:", error);
    }
}


export default connectDB;