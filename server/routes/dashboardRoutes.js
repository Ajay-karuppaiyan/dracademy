const express = require("express");
const router = express.Router();
const Student = require("../models/Student");
const Course = require("../models/Course");
const Payment = require("../models/Payment");
const Attendance = require("../models/Attendance");
const Announcement = require("../models/Announcement");

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

// GET /api/dashboard-stats/student
router.get("/student", protect, async (req, res) => {
  try {
    const student = await Student.findOne({ user: req.user._id }).populate("enrolledCourses.course");

    if (!student) {
      return res.status(404).json({ message: "Student profile not found" });
    }

    // 1. Progress stats
    const progressTotal = student.enrolledCourses.reduce((sum, c) => sum + (c.progress || 0), 0);
    const avgProgress = student.enrolledCourses.length > 0 ? (progressTotal / student.enrolledCourses.length).toFixed(0) : 0;

    // 2. Attendance stats (last 30 days attendance %)
    const totalDays = 30; // 30 days window
    const attendanceCount = await Attendance.countDocuments({
      userId: req.user._id,
      date: { $gte: new Date(Date.now() - totalDays * 24 * 60 * 60 * 1000) }
    });
    // For now simple attendance count or %
    const attendanceVal = attendanceCount > 0 ? ((attendanceCount / totalDays) * 100).toFixed(0) : 0;

    // 3. Upcoming events/lessons (mock or check announcements)
    const announcements = await Announcement.find({
      $or: [{ target: "all" }, { target: "student" }]
    }).sort({ createdAt: -1 }).limit(3);

    // 4. Certificates
    const certificatesCount = student.enrolledCourses.filter(c => c.completed).length;

    // Recent activity (mock for now or based on progress updates)
    const recentActivity = student.enrolledCourses.slice(0, 4).map(c => ({
      course: c.course?.title || "Course",
      activity: c.progress === 100 ? "Completed" : `Reached ${c.progress}%`,
      date: new Date().toLocaleDateString(),
      status: c.completed ? "Completed" : "In Progress"
    }));

    res.json({
      avgProgress: `${avgProgress}%`,
      attendance: `${attendanceVal}%`,
      upcoming: announcements.length,
      certificates: certificatesCount,
      recentActivity,
      announcements: announcements.map(a => ({
        title: a.title,
        time: new Date(a.createdAt).toLocaleDateString(),
        course: "Admin", // for now
        icon: "Play",
        color: "blue"
      }))
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;