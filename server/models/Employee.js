const mongoose = require("mongoose");

const documentSchema = new mongoose.Schema({
  url: String,
  public_id: String,
  name: String,
});

const employeeSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    firstName: String,
    lastName: String,
    phone: String,
    dob: Date,
    gender: String,
    employeeId: {
      type: String,
      unique: true,
    },
    joiningDate: Date,
    department: String,
    designation: String,
    employmentType: String,
    salary: {
      type: Number,
      default: 0
    },

    profilePic: documentSchema,
    idFile: documentSchema,
    certificateFile: documentSchema,
    contractFile: documentSchema,

    role: {
        type: String,
        enum: ['coach', 'hr'],
    },

    status: {
      type: String,
      enum: ["active", "inactive", "on-leave"],
      default: "active",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Employee", employeeSchema);