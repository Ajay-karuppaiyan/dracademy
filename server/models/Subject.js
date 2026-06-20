const mongoose = require("mongoose");

const subjectSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
    code: {
      type: String,
      required: true,
      unique: true,
    },
    type: {
      type: String,
      enum: ['Theory', 'Practical'],
      required: true,
      default: 'Theory'
    },
    semester: {
      type: Number,
      required: true,
      min: 1,
      max: 6,
      default: 1
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Subject", subjectSchema);
