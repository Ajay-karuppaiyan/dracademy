const express = require("express");
const router = express.Router();
const Student = require("../models/Student");
const Course = require("../models/Course");
const Payment = require("../models/Payment");

// GET /api/dashboard-stats
router.get("/", async (req, res) => {
  try {
    // Total students
    const totalStudents = await Student.countDocuments();

    // Active courses
    const activeCourses = await Course.countDocuments({ isActive: true });

    // Total revenue (sum of payments)
    const payments = await Payment.find();
    const totalRevenue = payments.reduce((sum, p) => sum + p.amount, 0);

    res.json({
      totalStudents,
      activeCourses,
      totalRevenue,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
});

router.get("/recent-students", async (req, res) => {
  try {
    const students = await Student.find()
      .populate("enrolledCourses", "courseName") 
      .sort({ createdAt: -1 })
      .limit(5);

    res.json(students);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;