const express = require("express");
const router = express.Router();
const Leave = require("../models/Leave");
const multer = require("multer");
const path = require("path");
const { protect, admin } = require("../middleware/authMiddleware"); 

// Multer setup for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname)),
});
const upload = multer({ storage });

// =================== APPLY LEAVE ===================
router.post("/apply", protect, upload.single("file"), async (req, res) => {
  try {
    const { leaveType, reason, startDate, endDate, numDays } = req.body;

    if (!leaveType || !reason || !startDate || !endDate || !numDays) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const leave = new Leave({
      userId: req.user._id,               // ✅ From token
      employeeName: req.user.name,        // ✅ From token
      leaveType,
      reason,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      numDays: Number(numDays),
      fileUrl: req.file ? req.file.path : undefined,
    });

    await leave.save();
    res.status(201).json({ message: "Leave applied successfully", leave });

  } catch (err) {
    console.error("SERVER ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
});


// =================== GET ALL LEAVES (All Users) ===================
router.get("/all", protect, admin, async (req, res) => {
  try {
    const leaves = await Leave.find().sort({ createdAt: -1 });
    res.json(leaves);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// =================== GET SINGLE LEAVE BY ID ===================
router.get("/:id", protect, async (req, res) => {
  try {
    const leave = await Leave.findById(req.params.id);

    if (!leave) {
      return res.status(404).json({ message: "Leave not found" });
    }

    res.json(leave);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


// =================== GET ALL LEAVES OF EMPLOYEE===================
router.get("/", protect, async (req, res) => {
  try {
    // Optional: only fetch leaves of logged-in user
    const leaves = await Leave.find({ userId: req.user._id });
    res.json(leaves);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});


// =================== UPDATE LEAVE ===================
router.put("/:id", protect, upload.single("file"), async (req, res) => {
  try {
    const leave = await Leave.findById(req.params.id);
    if (!leave) return res.status(404).json({ message: "Leave not found" });

    // Optional: only allow the owner to update
    if (leave.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to update this leave" });
    }

    const { reason, leaveType, startDate, endDate, numDays } = req.body;

    leave.reason = reason || leave.reason;
    leave.leaveType = leaveType || leave.leaveType;
    leave.startDate = startDate || leave.startDate;
    leave.endDate = endDate || leave.endDate;
    leave.numDays = numDays || leave.numDays;
    if (req.file) leave.fileUrl = req.file.path;

    await leave.save();
    res.json({ message: "Leave updated successfully", leave });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// =================== DELETE LEAVE ===================
router.delete("/:id", protect, async (req, res) => {
  try {
    const leave = await Leave.findById(req.params.id);
    if (!leave) return res.status(404).json({ message: "Leave not found" });

    // Delete without checking ownership
    await leave.deleteOne();
    res.json({ message: "Leave deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});


// =================== APPROVE / REJECT LEAVE (Admin only) ===================
router.patch("/:id/status", protect, admin, async (req, res) => {
  try {
    const { status } = req.body;

    // Allow admin to set pending, approved, or rejected
    if (!["pending", "approved", "rejected"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const leave = await Leave.findById(req.params.id);
    if (!leave) return res.status(404).json({ message: "Leave not found" });

    leave.status = status;
    await leave.save();

    res.json({ message: `Leave status updated to ${status}`, leave });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});


module.exports = router;
