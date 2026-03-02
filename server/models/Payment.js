const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
  {
    type: { 
      type: String, 
      enum: ["inward", "outward"],
      required: true 
    },

    // Inward Payment Fields
    student: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    course: { type: mongoose.Schema.Types.ObjectId, ref: "Course" }, 
    installmentNumber: { type: Number, default: 1 }, 
    totalInstallments: { type: Number, default: 1 },
    razorpayOrderId: String,
    razorpayPaymentId: { type: String, unique: true, sparse: true },
    razorpaySignature: String,

    // Outward Payment Fields
    recipientName: String,
    recipientType: { type: String, enum: ["vendor", "employee", "other"] },
    category: { type: String, enum: ["salary","reimbursement","vendorPayment","operationalExpense"] },
    referenceInvoice: String,
    notes: String,

    // Common Fields
    amount: { type: Number, required: true },
    currency: { type: String, default: "INR" },
    paymentMethod: String,
    status: {
      type: String, 
      enum: ["created","success","failed","refunded","pending","paid"], 
      default: "created" 
    },
    receipt: String,
    rawResponse: Object,
  },
  { timestamps: true }
);

module.exports = mongoose.model("Payment", paymentSchema);