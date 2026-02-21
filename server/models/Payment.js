const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },

    userName: {
      type: String,
      required: true,
    },

    amount: {
      type: Number,
      required: true,
    },

    currency: {
      type: String,
      default: "INR",
    },

    razorpayOrderId: {
      type: String,
      required: true,
    },

    razorpayPaymentId: {
      type: String,
      unique: true,
      sparse: true,
    },

    razorpaySignature: String,

    paymentMethod: String,

    status: {
      type: String,
      enum: ["created", "success", "failed", "refunded"],
      default: "created",
    },

    receipt: String,

    rawResponse: Object,
  },
  { timestamps: true }
);

module.exports = mongoose.model("Payment", paymentSchema);