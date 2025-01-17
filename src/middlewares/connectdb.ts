import { Request, Response, NextFunction } from "express";
import mongoose from "mongoose";

const connectDB = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const mongoUri = process.env.MONGO_URI || "mongodb://localhost:27017/timemanagement";
    if (!mongoUri) {
      throw next(new Error("MONGO_URI is not defined"));
    }
    await mongoose.connect(mongoUri, {});
    console.log("MongoDB connected successfully");
    next();
  } catch (error) {
    next(error);
  }
};

export default connectDB;
