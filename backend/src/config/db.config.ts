import mongoose from "mongoose";
import { ENV } from "./env.config.js";

export const connectDB = async () => {
	try {
		await mongoose.connect(ENV.MONGODB_URI as string);
		console.log("Connected to MongoDB");
	} catch (error) {
		console.error("Error connecting to MongoDB:", error);
	}
};
