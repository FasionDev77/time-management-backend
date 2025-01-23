import mongoose, { Schema, Document } from "mongoose";

export interface IRecord extends Document {
  userId: mongoose.Types.ObjectId;
  description: string;
  date: Date;
  duration: number;
  status: "red" | "green";
}

const recordSchema: Schema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    date: {
      type: Date,
      required: true,
    },
    duration: {
      type: Number,
      required: true,
      min: [0, "Duration must be a positive number"],
    },
    status: {
      type: String,
      enum: ["red", "green"],
      default: "red",
    },
  },
  { timestamps: true }
);

export const Record = mongoose.model<IRecord>("Record", recordSchema);
