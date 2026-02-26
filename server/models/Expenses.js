const mongoose = require("mongoose");

const expenseSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    amount: { type: Number, required: true },
    category: { type: String, required: true },
    description: { type: String },
    date: { type: Date, default: Date.now },
    receipt: { type: String }, // file path
    status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" },
    submittedBy: {
      userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      name: String,
      role: String,
    },
    approvedBy: {
      userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      name: String,
      role: String,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Expense", expenseSchema);