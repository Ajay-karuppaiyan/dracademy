const express = require("express");
const router = express.Router();
const Leave = require("../models/Leave");

const Notification = require("../models/Notification");
const multer = require("multer");
const path = require("path");
const { protect, admin } = require("../middleware/authMiddleware"); 
const User = require("../models/User");
const Student = require("../models/Student");

// Multer setup for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname)),
});
const upload = multer({ storage });

// =================== APPLY LEAVE ===================
router.post("/apply", protect, upload.single("file"), async (req, res) => {
  try {
    const {
      mode,
      leaveType,
      reason,
      startDate,
      endDate,
      numDays,
      permissionDate,
      startTime,
      endTime,
    } = req.body;

    if (!mode || !leaveType || !reason) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // ===== VALIDATION =====
    if (mode === "leave") {
      if (!startDate || !endDate || !numDays) {
        return res.status(400).json({ message: "Leave fields required" });
      }
    }

    if (mode === "permission") {
      if (!permissionDate || !startTime || !endTime) {
        return res.status(400).json({ message: "Permission fields required" });
      }
    }

    // ===== CREATE DATA =====
    const leave = new Leave({
      userId: req.user._id,  // Now stores as ObjectId reference
      employeeName: req.user.name,
      mode,
      leaveType,
      reason,

      // Leave fields
      startDate: mode === "leave" ? new Date(startDate) : undefined,
      endDate: mode === "leave" ? new Date(endDate) : undefined,
      numDays: mode === "leave" ? Number(numDays) : undefined,

      // Permission fields
      permissionDate:
        mode === "permission" ? new Date(permissionDate) : undefined,
      startTime: mode === "permission" ? startTime : undefined,
      endTime: mode === "permission" ? endTime : undefined,

      fileUrl: req.file ? req.file.path : undefined,
    });

    await leave.save();

    // 🔥 NOTIFY ONLY ADMIN ABOUT NEW LEAVE APPLICATION
    const admins = await User.find({ role: "admin" });
    
    const notificationPromises = admins.map(recipient => 
      Notification.create({
        recipient: recipient._id,
        sender: req.user._id,
        type: "leave_applied",
        title: "New Leave Application",
        message: `${req.user.name} has applied for ${mode === "leave" ? "leave" : "permission"}.`,
        link: `/dashboard/leave-request?id=${leave._id}`,
        entityId: leave._id,
      })
    );

    // ✅ IF APPLICANT IS A STUDENT, ALSO NOTIFY THE PARENT
    const applicantUser = await User.findById(req.user._id);
    if (applicantUser.role === "student") {
      const student = await Student.findOne({ user: req.user._id });
      if (student && student.parent) {
        notificationPromises.push(
          Notification.create({
            recipient: student.parent,
            sender: req.user._id,
            type: "leave_applied",
            title: "Child's Leave Application",
            message: `Your child ${student.studentNameEnglish} has applied for ${mode === "leave" ? "leave" : "permission"}.`,
            link: `/dashboard/leave-request?id=${leave._id}`,
            entityId: leave._id,
          })
        );
      }
    }

    await Promise.all(notificationPromises);

    res.status(201).json({
      message:
        mode === "leave"
          ? "Leave applied successfully"
          : "Permission requested successfully",
      leave,
    });
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

    if (!["approved", "rejected"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const leave = await Leave.findById(req.params.id).populate("userId");
    if (!leave) {
      return res.status(404).json({ message: "Leave not found" });
    }

    leave.status = status;
    await leave.save();

    // Get applicant user details
    const applicant = await User.findById(leave.userId);
    if (!applicant) {
      return res.status(404).json({ message: "Applicant not found" });
    }

    const notificationPromises = [];

    // ✅ 1. SEND NOTIFICATION TO THE APPLICANT (Student/Employee who applied)
    notificationPromises.push(
      Notification.create({
        recipient: leave.userId,
        sender: req.user._id,
        type: status === "approved" ? "leave_approved" : "leave_rejected",
        title: status === "approved" ? "Leave Approved" : "Leave Rejected",
        message: `Your ${leave.mode === "leave" ? "leave" : "permission"} request has been ${status}.`,
        link: `/dashboard/leave-request?id=${leave._id}`,
        entityId: leave._id,
      })
    );

    // ✅ 2. IF APPLICANT IS A STUDENT, ALSO NOTIFY THE PARENT
    if (applicant.role === "student") {
      const student = await Student.findOne({ user: leave.userId });
      if (student && student.parent) {
        notificationPromises.push(
          Notification.create({
            recipient: student.parent,
            sender: req.user._id,
            type: status === "approved" ? "leave_approved" : "leave_rejected",
            title: `Child's Leave ${status === "approved" ? "Approved" : "Rejected"}`,
            message: `Your child ${student.studentNameEnglish}'s ${leave.mode === "leave" ? "leave" : "permission"} request has been ${status}.`,
            link: `/dashboard/leave-request?id=${leave._id}`,
            entityId: leave._id,
          })
        );
      }
    }

    // Execute all notification promises
    await Promise.all(notificationPromises);

    res.json({ message: `Leave ${status} successfully and notifications sent to applicant${applicant.role === "student" ? " and parent" : ""}` });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});


module.exports = router;
