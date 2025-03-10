import mongoose from "mongoose";

const AppointmentSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  date: { type: Date, required: true }, // Tarih ve saat birleşik olarak saklanacak
  status: { type: String, enum: ["booked"], default: "booked" }, // Sadece "booked" olanları saklıyoruz
}, { timestamps: true });

AppointmentSchema.index({ date: 1 }, { unique: true }); // Aynı tarih ve saate çift randevu engellenir

export const Appointment = mongoose.model("Appointment", AppointmentSchema);
