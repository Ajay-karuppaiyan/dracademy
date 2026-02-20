const express = require("express");
const router = express.Router();
const Attendance = require("../models/Attendance");
const { protect } = require("../middleware/authMiddleware");

// POST /attendance - Mark attendance (login)
router.post("/", protect, async (req, res) => {
  try {
    const { name, role, date, loginTime, photo } = req.body;
    const userId = req.user._id;
    // Only one attendance per day per user
    const existing = await Attendance.findOne({ userId, date });
    if (existing) return res.status(400).json({ message: "Attendance already marked for today." });
    const attendance = await Attendance.create({ userId, name, role, date, loginTime, photo });
    res.status(201).json(attendance);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PATCH /attendance/logout/:id - Set logout time
router.patch("/logout/:id", protect, async (req, res) => {
  try {
    const { logoutTime } = req.body;
    const attendance = await Attendance.findByIdAndUpdate(
      req.params.id,
      { logoutTime },
      { new: true }
    );
    res.json(attendance);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /attendance - Get all attendance (admin/employee)
router.get("/", protect, async (req, res) => {
  try {
    let query = {};
    if (req.user.role !== "admin" && req.user.role !== "employee") {
      query.userId = req.user._id;
    }
    // Optional: filter by name/month
    if (req.query.name) query.name = new RegExp(req.query.name, "i");
    if (req.query.month && req.query.year) {
      query.date = { $regex: `^${req.query.year}-${req.query.month.padStart(2, "0")}` };
    }
    const data = await Attendance.find(query).sort({ date: -1 });
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
