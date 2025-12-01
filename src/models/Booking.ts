import mongoose, { Document, Schema } from "mongoose";

export interface IBooking extends Document {
  _id: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId;
  service: mongoose.Types.ObjectId;
  provider: mongoose.Types.ObjectId;
  date: Date;
  status: "pending" | "confirmed" | "in_progress" | "completed" | "cancelled";
  notes?: string;
  totalPrice: number;
  paymentStatus: "pending" | "paid" | "refunded";
  createdAt: Date;
  updatedAt: Date;
}

const BookingSchema: Schema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    service: { type: Schema.Types.ObjectId, ref: "Service", required: true },
    provider: { type: Schema.Types.ObjectId, ref: "User", required: true },
    date: { type: Date, required: true },
    status: {
      type: String,
      enum: ["pending", "confirmed", "in_progress", "completed", "cancelled"],
      default: "pending",
    },
    notes: { type: String },
    totalPrice: { type: Number, required: true },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "refunded"],
      default: "pending",
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Booking ||
  mongoose.model<IBooking>("Booking", BookingSchema);
