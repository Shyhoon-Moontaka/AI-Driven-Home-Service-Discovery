import mongoose, { Document, Schema } from "mongoose";

export interface IService extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  description: string;
  category: string;
  price: number;
  duration: number; // in minutes
  provider: mongoose.Types.ObjectId;
  location: string;
  availability: {
    days: string[]; // ['monday', 'tuesday', etc.]
    startTime: string; // '09:00'
    endTime: string; // '17:00'
  };
  tags: string[];
  rating: number;
  reviewCount: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ServiceSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    description: { type: String, required: true },
    category: { type: String, required: true },
    price: { type: Number, required: true },
    duration: { type: Number, required: true },
    provider: { type: Schema.Types.ObjectId, ref: "User", required: true },
    location: { type: String, required: true },
    availability: {
      days: [{ type: String }],
      startTime: { type: String },
      endTime: { type: String },
    },
    tags: [{ type: String }],
    rating: { type: Number, default: 0 },
    reviewCount: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Service ||
  mongoose.model<IService>("Service", ServiceSchema);
