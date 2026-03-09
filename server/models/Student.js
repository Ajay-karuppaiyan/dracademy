const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    parent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    // BASIC DETAILS
    studentNameEnglish: { type: String, required: true },
    studentNameMotherTongue: String,
    fatherName: String,
    dob: Date,
    age: Number,
    gender: String,
    nationality: String,

    // ID DETAILS
    aadharNo: String,
    kcetRegNo: String,
    neetRegNo: String,
    apaarId: String,
    debId: String,
    abcId: String,

    religion: String,
    community: String,
    maritalStatus: String,

    // CONTACT
    email: { type: String, required: true },
    phone: String,
    whatsapp: String,

    // ADDRESS
    address: {
      village: String,
      post: String,
      taluk: String,
      district: String,
      pin: String,
    },

    // LANGUAGE
    englishFluency: String,
    languagesKnown: [String],

    // BANK DETAILS
    bankDetails: {
      accountHolderName: String,
      accountNumber: String,
      ifscCode: String,
      bankNameBranch: String,
    },

    // ACADEMIC
    enrolledCourses: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Course",
      },
    ],

    year: String,
    department: String,

    profilePic: {
      url: String,
      public_id: String,
      name: String,
    },

    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Student", studentSchema);