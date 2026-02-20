const mongoose = require("mongoose");

const leaveSchema = new mongoose.Schema({
  userId: { type: String, required: true }, // Logged-in user ID sent from frontend
  employeeName: { type: String, required: true },
  leaveType: { type: String, required: true },
  reason: { type: String, required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  numDays: { type: Number, required: true },
  status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" },
  fileUrl: { type: String },
}, { timestamps: true });

module.exports = mongoose.model("Leave", leaveSchema);
