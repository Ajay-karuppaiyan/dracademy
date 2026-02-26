const express = require("express");
const router = express.Router();
const Attendance = require("../models/Attendance");
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

module.exports = router;