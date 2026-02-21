const express = require("express");
const router = express.Router();
const Attendance = require("../models/Attendance");
const { protect } = require("../middleware/authMiddleware");

// ============================
// POST /attendance - Mark attendance (login)
// ============================
router.post("/", protect, async (req, res) => {
  try {
    const { name, role, date, loginTime, photo } = req.body;
    const userId = req.user._id;

    // Validate required fields
    if (!name || !role || !date || !loginTime || !photo) {
      return res.status(400).json({ message: "Missing required attendance fields." });
    }

    // Prevent multiple attendance per day
    const existing = await Attendance.findOne({ userId, date });
    if (existing) {
      return res.status(400).json({ message: "Attendance already marked for today." });
    }

    const attendance = await Attendance.create({
      userId,
      name,
      role,
      date,
      loginTime,
      photo,
    });

    res.status(201).json(attendance);
  } catch (err) {
    console.error("POST /attendance error:", err);
    res.status(500).json({ message: "Server error: " + err.message });
  }
});

// ============================
// PATCH /attendance/logout/:id - Set logout time
// ============================
router.patch("/logout/:id", protect, async (req, res) => {
  try {
    const { logoutTime } = req.body;

    if (!logoutTime) return res.status(400).json({ message: "Logout time is required." });

    const attendance = await Attendance.findByIdAndUpdate(
      req.params.id,
      { logoutTime },
      { new: true }
    );

    if (!attendance) return res.status(404).json({ message: "Attendance not found." });

    res.json(attendance);
  } catch (err) {
    console.error("PATCH /attendance/logout error:", err);
    res.status(500).json({ message: err.message });
  }
});

// ============================
// GET /attendance - Get all attendance (admin/employee)
// ============================
router.get("/", protect, async (req, res) => {
  try {
    let query = {};

    // Restrict access for non-admin/employee users
    if (req.user.role !== "admin" && req.user.role !== "employee") {
      query.userId = req.user._id;
    }

    // Optional filters: name, month, year
    if (req.query.name) query.name = new RegExp(req.query.name, "i");
    if (req.query.month && req.query.year) {
      const month = req.query.month.padStart(2, "0");
      query.date = { $regex: `^${req.query.year}-${month}` };
    }

    const data = await Attendance.find(query).sort({ date: -1 });
    res.json(data);
  } catch (err) {
    console.error("GET /attendance error:", err);
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;