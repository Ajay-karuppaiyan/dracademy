const express = require("express");
const router = express.Router();

const Student = require("../models/Student");
const User = require("../models/User");
const Attendance = require("../models/Attendance");
const { protect } = require("../middleware/authMiddleware");


// =======================================================
// ✅ REGISTER CHILD (Parent Only)
// =======================================================
router.post("/register-child", protect, async (req, res) => {
  try {
    if (req.user.role !== "parent") {
      return res.status(403).json({ message: "Only parents can register children" });
    }

    const {
      firstName,
      lastName,
      email,
      mobile,
      password,
      dob,
      gender,
      course,
      year,
    } = req.body;

    // Check existing user
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Create login account for student
    const newUser = await User.create({
      name: `${firstName} ${lastName}`,
      email,
      password,
      role: "student",
    });

    // Create student profile
    const student = await Student.create({
      user: newUser._id,
      parent: req.user._id,
      firstName,
      lastName,
      phone: mobile,
      email,
      dob,
      gender,
      course,
      year,
    });

    res.status(201).json({
      message: "Child registered successfully",
      student,
    });

  } catch (error) {
    console.error("REGISTER CHILD ERROR:", error);
    res.status(500).json({ message: "Server Error" });
  }
});


// =======================================================
// ✅ GET CHILDREN OF LOGGED-IN PARENT
// =======================================================
router.get("/children", protect, async (req, res) => {
  try {
    if (req.user.role !== "parent") {
      return res.status(403).json({ message: "Access denied" });
    }

    const students = await Student.find({
      parent: req.user._id,
    }).populate("user", "email");

    res.json(students);

  } catch (error) {
    console.error("GET CHILDREN ERROR:", error);
    res.status(500).json({ message: "Server Error" });
  }
});


// =======================================================
// ✅ GET CHILD OVERVIEW
// =======================================================
router.get("/child/:studentId/overview", protect, async (req, res) => {
  try {
    if (req.user.role !== "parent") {
      return res.status(403).json({ message: "Access denied" });
    }

    const { studentId } = req.params;

    // Ensure student belongs to parent
    const student = await Student.findOne({
      _id: studentId,
      parent: req.user._id,
    });

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    // 🔹 Attendance (using ObjectId reference)
    const attendanceRecords = await Attendance.find({
      student: student._id,
    });

    const totalDays = attendanceRecords.length;
    const presentDays = attendanceRecords.filter(
      (a) => a.status === "Present"
    ).length;

    const percentage =
      totalDays > 0
        ? Number(((presentDays / totalDays) * 100).toFixed(1))
        : 0;

    res.json({
      student: {
        name: `${student.firstName} ${student.lastName}`,
        id: student._id,
        class: `${student.course} - ${student.year}`,
      },
      attendance: {
        percentage,
        totalDays,
        presentDays,
      },
      grades: [
        { subject: "Math", score: 85, grade: "A" },
        { subject: "Science", score: 90, grade: "A+" },
        { subject: "English", score: 75, grade: "B+" },
      ],
      fees: {
        pending: 20000,
        status: "Partial",
        nextDueDate: "2025-04-10",
      },
      certificates: [
        {
          name: "Science Fair Participation",
          date: "2024-11-15",
        },
      ],
    });

  } catch (err) {
    console.error("OVERVIEW ERROR:", err);
    res.status(500).json({ message: "Server Error" });
  }
});


// =======================================================
// ✅ GET ALL PARENTS (Admin Only)
// =======================================================
router.get("/parents", protect, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied" });
    }

    const parents = await User.find({ role: "parent" }).select("-password");

    res.json(parents);

  } catch (error) {
    console.error("GET PARENTS ERROR:", error);
    res.status(500).json({ message: "Server Error" });
  }
});


// =======================================================
// 🔴 DELETE PARENT (Admin Only)
// =======================================================
router.delete("/parent/:parentId", protect, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied" });
    }

    const { parentId } = req.params;

    const parent = await User.findOne({
      _id: parentId,
      role: "parent",
    });

    if (!parent) {
      return res.status(404).json({ message: "Parent not found" });
    }

    const students = await Student.find({ parent: parentId });

    for (const student of students) {
      await User.findByIdAndDelete(student.user);
      await Attendance.deleteMany({ student: student._id });
      await Student.findByIdAndDelete(student._id);
    }

    await User.findByIdAndDelete(parentId);

    res.json({
      message: "Parent and related data deleted successfully",
    });

  } catch (error) {
    console.error("DELETE PARENT ERROR:", error);
    res.status(500).json({ message: "Server Error" });
  }
});

// =======================================================
// ✅ GET CHILD ATTENDANCE LIST
// =======================================================
router.get("/child/:studentId/attendance", protect, async (req, res) => {
  try {
    if (req.user.role !== "parent") {
      return res.status(403).json({ message: "Access denied" });
    }

    const { studentId } = req.params;
    const { month } = req.query;

    const student = await Student.findOne({
      _id: studentId,
      parent: req.user._id,
    });

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    let query = {
      userId: student.user,
      role: "student",
    };

    // Month filter (YYYY-MM)
    if (month) {
      query.date = { $regex: `^${month}` };
    }

    const attendance = await Attendance.find(query).sort({ date: -1 });

    const formatted = attendance.map((a, index) => {
      let totalHours = "0h 0m";
      let status = "Absent";

      if (a.loginTime) {
        status = "Present";

        if (a.logoutTime) {
          const login = new Date(`1970-01-01T${a.loginTime}`);
          const logout = new Date(`1970-01-01T${a.logoutTime}`);

          const diffMs = logout - login;

          if (diffMs > 0) {
            const hours = Math.floor(diffMs / (1000 * 60 * 60));
            const minutes = Math.floor((diffMs / (1000 * 60)) % 60);
            totalHours = `${hours}h ${minutes}m`;
          }
        } else {
          totalHours = "In Progress";
        }
      }

      const dayName = new Date(a.date).toLocaleDateString("en-US", {
        weekday: "long",
      });

      return {
        sNo: index + 1,
        date: a.date,
        day: dayName,
        loginTime: a.loginTime || "-",
        logoutTime: a.logoutTime || "-",
        totalHours,
        status,
      };
    });

    res.json(formatted);

  } catch (error) {
    console.error("ATTENDANCE ERROR:", error);
    res.status(500).json({ message: "Server Error" });
  }
});

module.exports = router;