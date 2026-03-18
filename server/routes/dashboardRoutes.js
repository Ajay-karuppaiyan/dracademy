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

    // Total enrollments (count of items in enrolledCourses across all students)
    const students = await Student.find({}, 'enrolledCourses');
    const totalEnrollments = students.reduce((sum, s) => sum + (s.enrolledCourses?.length || 0), 0);

    // Total revenue (sum of payments)
    const payments = await Payment.find();
    const totalRevenue = payments.reduce((sum, p) => sum + p.amount, 0);

    res.json({
      totalStudents,
      activeCourses,
      totalRevenue,
      totalEnrollments
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

router.get("/recent-enrollments", async (req, res) => {
  try {
    const enrollments = await Payment.find({ type: "inward" })
      .populate("student", "studentNameEnglish email")
      .populate("course", "title price")
      .sort({ createdAt: -1 })
      .limit(5);

    res.json(enrollments);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;