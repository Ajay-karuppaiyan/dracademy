const mongoose = require("mongoose");

const leaveSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true },
    employeeName: { type: String, required: true },

    // 🔥 NEW: Mode (leave / permission)
    mode: {
      type: String,
      enum: ["leave", "permission"],
      required: true,
    },

    leaveType: { type: String, required: true },
    reason: { type: String, required: true },

    // ===== LEAVE FIELDS =====
    startDate: { type: Date },
    endDate: { type: Date },
    numDays: { type: Number },

    // ===== PERMISSION FIELDS =====
    permissionDate: { type: Date },
    startTime: { type: String },
    endTime: { type: String },

    // ===== COMMON =====
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },

    fileUrl: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Leave", leaveSchema);