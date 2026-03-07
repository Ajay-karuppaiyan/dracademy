const express = require("express");
const router = express.Router();
const Attendance = require("../models/Attendance");
const Leave = require("../models/Leave");
const { protect } = require("../middleware/authMiddleware");


// ============================
// POST - Mark login
// ============================
router.post("/", protect, async (req, res) => {
  try {
    const { loginTime, photo } = req.body;
    const userId = req.user._id;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const existing = await Attendance.findOne({
      userId,
      date: { $gte: today },
    });

    if (existing) {
      return res.status(400).json({
        message: "Attendance already marked for today.",
      });
    }

    const attendance = await Attendance.create({
      userId,
      name: req.user.name,
      role: req.user.role,
      loginTime,
      photo,
    });

    res.status(201).json(attendance);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


// ============================
// PATCH - Logout
// ============================
router.patch("/logout/:id", protect, async (req, res) => {
  try {
    const { logoutTime } = req.body;

    const attendance = await Attendance.findById(req.params.id);
    if (!attendance) {
      return res.status(404).json({ message: "Attendance not found." });
    }

    attendance.logoutTime = logoutTime;

    // 🔥 Calculate Working Hours
    const login = new Date(`1970-01-01T${attendance.loginTime}`);
    const logout = new Date(`1970-01-01T${logoutTime}`);

    const diffMs = logout - login;
    const diffHours = diffMs / (1000 * 60 * 60);

    attendance.workingHours = diffHours.toFixed(2);

    await attendance.save();

    res.json(attendance);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


// ============================
// GET - Summary (logged user)
// ============================
router.get("/summary", protect, async (req, res) => {
  try {
    const userId = req.user._id;

    const total = await Attendance.countDocuments({ userId });

    const thisMonth = new Date();
    thisMonth.setDate(1);
    thisMonth.setHours(0, 0, 0, 0);

    const monthly = await Attendance.countDocuments({
      userId,
      date: { $gte: thisMonth },
    });

    res.json({
      totalLogins: total,
      monthlyLogins: monthly,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


// ============================
// GET - Dashboard
// ============================
router.get("/dashboard", protect, async (req, res) => {
  try {
    const userId = req.user._id;

    const totalLogins = await Attendance.countDocuments({ userId });

    const recent = await Attendance.find({ userId })
      .sort({ date: -1 })
      .limit(5);

    res.json({
      user: req.user,
      totalLogins,
      recentAttendance: recent,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


// ============================
// GET - Admin Stats
// ============================
router.get("/admin-stats", protect, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Admin only" });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayLogins = await Attendance.countDocuments({
      date: { $gte: today },
    });

    const totalLogins = await Attendance.countDocuments();

    res.json({
      todayLogins,
      totalLogins,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


// ============================
// GET - List attendance
// ============================
router.get("/", protect, async (req, res) => {
  try {
    let query = {};

    if (req.user.role !== "admin" && req.user.role !== "employee") {
      query.userId = req.user._id;
    }

    const data = await Attendance.find(query).sort({ date: -1 });
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get("/monthly-chart", protect, async (req, res) => {
  try {
    const userId = req.user._id;

    const currentYear = new Date().getFullYear();

    const data = await Attendance.aggregate([
      {
        $match: {
          userId,
          date: {
            $gte: new Date(`${currentYear}-01-01`),
            $lte: new Date(`${currentYear}-12-31`),
          },
        },
      },
      {
        $group: {
          _id: { $month: "$date" },
          totalLogins: { $sum: 1 },
        },
      },
      {
        $sort: { "_id": 1 },
      },
    ]);

    res.json(data);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ============================
// GET - Employee Attendance Details
// ============================
router.get("/employee/:employeeId", protect, async (req, res) => {
  try {
    const { employeeId } = req.params;
    const { month, year } = req.query;

    if (!month || !year) {
      return res.status(400).json({ message: "Month and year required" });
    }

    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);

    // Total days in month
    const totalDays = endDate.getDate();

    // Attendance records
    const attendance = await Attendance.find({
      userId: employeeId,
      date: { $gte: startDate, $lte: endDate },
    }).sort({ date: 1 });

    const present = attendance.length;

    // Leave applications
    const leaves = await Leave.find({
      employee: employeeId,
      status: "approved",
      startDate: { $lte: endDate },
      endDate: { $gte: startDate },
    });

    let leaveCount = 0;

    leaves.forEach((leave) => {
      const start = new Date(leave.startDate);
      const end = new Date(leave.endDate);

      const diff =
        Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;

      leaveCount += diff;
    });

    const remainingDays = totalDays - present - leaveCount;

    res.json({
      summary: {
        totalDays,
        present,
        leaveCount,
        remainingDays,
      },
      attendance,
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ============================
// GET - Payroll Attendance
// ============================
router.get("/:employeeId", protect, async (req, res) => {
  try {

    const { employeeId } = req.params;
    const { month, year } = req.query;

    if (!month || !year) {
      return res.status(400).json({ message: "Month and year required" });
    }

    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);

    // Present days from attendance
    const present = await Attendance.countDocuments({
      userId: employeeId,
      date: { $gte: startDate, $lte: endDate }
    });

    // Approved leave applications
    const leaves = await Leave.find({
      employee: employeeId,
      status: "approved",
      startDate: { $lte: endDate },
      endDate: { $gte: startDate }
    });

    let absent = 0;

    leaves.forEach(leave => {
      const start = new Date(leave.startDate);
      const end = new Date(leave.endDate);

      const diff = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;

      absent += diff;
    });

    res.json({
      present,
      absent
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;