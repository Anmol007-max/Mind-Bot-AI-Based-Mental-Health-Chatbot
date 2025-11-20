import mongoose from "mongoose";
import { logger } from "./logger";

const MONGODB_URI = 
    process.env.MONGODB_URI ||
    "mongodb+srv://anmolmishran:HPHbPUVV9nYm4HHj@ai-therapist-agent.pr20e2f.mongodb.net/?appName=ai-therapist-agent";

export const connectDB = async () => {
    try {
        await mongoose.connect(MONGODB_URI);
        logger.info("Connected to MongoDB Atlas");
    } catch (error) {
        logger.error("MongoDB connection error:",error);
        process.exit(1);
    }
};
