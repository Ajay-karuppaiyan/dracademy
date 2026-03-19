const express = require("express");
const router = express.Router();
const Student = require("../models/Student");
const Course = require("../models/Course");
const Payment = require("../models/Payment");

const { protect } = require("../middleware/authMiddleware");

// GET /api/dashboard-stats
router.get("/", protect, async (req, res) => {
  try {
    let studentQuery = {};
    if (req.user.role === "center") {
      studentQuery.center = req.user.center;
    }

    // Total students
    const totalStudents = await Student.countDocuments(studentQuery);

    // Active courses
    const activeCourses = await Course.countDocuments({ isActive: true });

    // Total enrollments
    const students = await Student.find(studentQuery, 'enrolledCourses');
    const totalEnrollments = students.reduce((sum, s) => sum + (s.enrolledCourses?.length || 0), 0);

    // Total revenue (for now showing global or filtered if we had center in payment)
    // To filter revenue by center, we'd need to join or find payments of these students
    let revenueQuery = {};
    if (req.user.role === "center") {
      const studentIds = students.map(s => s._id);
      revenueQuery.student = { $in: studentIds };
    }
    
    const payments = await Payment.find(revenueQuery);
    const totalRevenue = payments.reduce((sum, p) => sum + (p.amount || 0), 0);

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

router.get("/recent-students", protect, async (req, res) => {
  try {
    let query = {};
    if (req.user.role === "center") {
      query.center = req.user.center;
    }
    const students = await Student.find(query)
      .populate("enrolledCourses", "courseName") 
      .sort({ createdAt: -1 })
      .limit(5);

    res.json(students);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/recent-enrollments", protect, async (req, res) => {
  try {
    let query = { type: "inward" };
    if (req.user.role === "center") {
      const centerStudents = await Student.find({ center: req.user.center }).select("_id");
      const studentIds = centerStudents.map(s => s._id);
      query.student = { $in: studentIds };
    }
    const enrollments = await Payment.find(query)
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