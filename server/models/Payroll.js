const mongoose = require("mongoose");

const payrollSchema = new mongoose.Schema(
  {
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
    },

    month: {
      type: Number,
      required: true,
    },

    year: {
      type: Number,
      required: true,
    },

    basicSalary: {
      type: Number,
      required: true,
      default: 0,
    },

    allowances: {
      hra: { type: Number, default: 0 },
      medical: { type: Number, default: 0 },
      bonus: { type: Number, default: 0 },
    },

    totalAllowances: {
      type: Number,
      default: 0,
    },

    deductions: {
      pf: { type: Number, default: 0 },
      tax: { type: Number, default: 0 },
    },

    totalDeductions: {
      type: Number,
      default: 0,
    },

    advance: {
      type: Number,
      default: 0,
    },

    totalDays: {
      type: Number,
      default: 30,
    },

    present: {
      type: Number,
      default: 0,
    },

    absent: {
      type: Number,
      default: 0,
    },

    lateDays: {
      type: Number,
      default: 0,
    },

    lateTime: {
      type: Number,
      default: 0,
    },

    netSalary: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

// Prevent duplicate payroll per month
payrollSchema.index({ employee: 1, month: 1, year: 1 }, { unique: true });

module.exports = mongoose.model("Payroll", payrollSchema);