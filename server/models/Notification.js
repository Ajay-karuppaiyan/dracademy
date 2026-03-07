const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    type: {
      type: String,
      enum: [
        "leave_applied",
        "leave_approved",
        "leave_rejected",
        "payment_received",
      ],
      required: true,
    },

    title: { type: String, required: true },
    message: { type: String, required: true },

    link: { type: String },
    entityId: { type: String },

    isRead: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Notification", notificationSchema);