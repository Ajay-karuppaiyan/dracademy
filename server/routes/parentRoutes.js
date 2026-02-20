const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");

const Student = require("../models/Student");
const User = require("../models/User");
const Attendance = require("../models/Attendance");
const { protect } = require("../middleware/authMiddleware");

router.post("/register-child", protect, async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      mobile,
      password,
      dob,
      gender,
      course,
      year
    } = req.body;

    console.log("BODY:", req.body);

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // ✅ STEP 1: Create User (login account for student)
    // Note: User model has pre-save hook that hashes the password automatically
    const newUser = await User.create({
      name: `${firstName} ${lastName}`,
      email,
      password, // Pass plain password, model will hash it
      role: "student"
    });

    // ✅ STEP 2: Create Student linked to User
    const student = await Student.create({
      user: newUser._id,
      parent: req.user._id,
      firstName,
      lastName,
      phone: mobile,
      email,
      dob,
      gender,
      course,
      year
    });

    res.status(201).json({
      message: "Child registered successfully",
      student
    });

  } catch (error) {
    console.error("REGISTER CHILD ERROR:", error);
    res.status(500).json({ message: error.message });
  }
});

// 🔹 GET all children of logged in parent
router.get("/children", protect, async (req, res) => {
  try {
    // Only fetch students linked to this parent
    const students = await Student.find({
      parent: req.user._id,
    }).populate("user", "email");

    res.json(students);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
});


// ✅ Get child overview
router.get("/child/:studentId/overview", protect, async (req, res) => {
  try {
    const { studentId } = req.params;

    const student = await Student.findOne({
      _id: studentId,
      parent: req.user._id   // ✅ Security check
    });
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    // Attendance
    const attendance = await Attendance.find({
      studentId: student.studentId,
    });

    const totalDays = attendance.length;
    const presentDays = attendance.filter(
      (a) => a.status === "Present"
    ).length;

    const percentage =
      totalDays > 0
        ? ((presentDays / totalDays) * 100).toFixed(1)
        : 0;

    res.json({
      student: {
        name: `${student.firstName} ${student.lastName}`,
        id: student.studentId,
        class: `${student.course} - ${student.year}`,
      },
      attendance: {
        percentage,
        totalDays,
        presentDays,
      },
      grades: [
        { subject: "Math", score: 85, grade: "A" },
        { subject: "Science", score: 90, grade: "A+" },
        { subject: "English", score: 75, grade: "B+" },
      ],
      fees: {
        pending: 20000,
        status: "Partial",
        nextDueDate: "2025-04-10",
      },
      certificates: [
        {
          name: "Science Fair Participation",
          date: "2024-11-15",
        },
      ],
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET ALL PARENTS
router.get("/parents", protect, async (req, res) => {
  try {
    const parents = await User.find({ role: "parent" }).select("-password");
    res.json(parents);
  } catch (error) {
    console.error("GET PARENTS ERROR:", error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;