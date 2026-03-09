const express = require("express");
const router = express.Router();

const Student = require("../models/Student");
const User = require("../models/User");
const Leave = require("../models/Leave");
const Attendance = require("../models/Attendance");
const { protect } = require("../middleware/authMiddleware");


// =======================================================
// ✅ REGISTER CHILD (Parent Only)
// =======================================================
router.post("/register-child", protect, async (req, res) => {
  try {

    console.log("REQ BODY:", req.body);
    if (req.user.role !== "parent") {
      return res.status(403).json({ message: "Only parents can register children" });
    }

    const {
      studentNameEnglish,
      studentNameMotherTongue,
      fatherName,
      dob,
      age,
      gender,
      nationality,
      aadharNo,
      kcetRegNo,
      neetRegNo,
      apaarId,
      debId,
      abcId,
      religion,
      community,
      maritalStatus,
      email,
      phone,
      whatsapp,
      village,
      post,
      taluk,
      district,
      pin,
      englishFluency,
      language1,
      language2,
      language3,
      accountHolderName,
      accountNumber,
      ifscCode,
      bankNameBranch,
      year,
      department
    } = req.body;

    // 🔎 check existing user
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const defaultPassword = "Student@123";

    // 1️⃣ Create Login Account
    const newUser = await User.create({
      name: studentNameEnglish,
      email,
      password: defaultPassword,
      role: "student",
    });

    // 2️⃣ Create Student Profile
    const student = await Student.create({
      user: newUser._id,
      parent: req.user._id,

      studentNameEnglish,
      studentNameMotherTongue,
      fatherName,
      dob,
      age,
      gender,
      nationality,

      aadharNo,
      kcetRegNo,
      neetRegNo,
      apaarId,
      debId,
      abcId,

      religion,
      community,
      maritalStatus,

      email,
      phone,
      whatsapp,

      address: {
        village,
        post,
        taluk,
        district,
        pin,
      },

      englishFluency,
      languagesKnown: [language1, language2, language3],

      bankDetails: {
        accountHolderName,
        accountNumber,
        ifscCode,
        bankNameBranch,
      },

      year,
      department,
    });

    res.status(201).json({
      message: "Child registered successfully",
      student,
    });

  } catch (error) {
    console.error("REGISTER CHILD ERROR:", error);
    res.status(500).json({ message: error.message });
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
       studentNameEnglish: student.studentNameEnglish,
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

// GET CHILD ATTENDANCE LIST (filter by userId)
router.get("/child/:studentId/attendance", protect, async (req, res) => {
  try {
    if (req.user.role !== "parent") {
      return res.status(403).json({ message: "Access denied" });
    }

    const { studentId } = req.params;
    const { month } = req.query; // format: YYYY-MM

    // Find the student and ensure it belongs to the parent
    const student = await Student.findOne({
      _id: studentId,
      parent: req.user._id,
    }).populate("user", "email");

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    // Build query using userId
    let query = { userId: student.user._id };

    // Filter by month using Date ranges
    if (month) {
      const [year, mon] = month.split("-"); // "2026-02"
      const startDate = new Date(year, mon - 1, 1); // first day of month
      const endDate = new Date(year, mon, 0, 23, 59, 59); // last day of month
      query.date = { $gte: startDate, $lte: endDate };
    }

    const attendance = await Attendance.find(query).sort({ date: -1 });

    // Format data for frontend
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
        date: a.date.toISOString().slice(0, 10),
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

// GET CHILD LEAVE REQUESTS (Parent Only)
router.get("/child/:studentId/leave-request", protect, async (req, res) => {
  try {
    if (req.user.role !== "parent") {
      return res.status(403).json({ message: "Access denied" });
    }

    const { studentId } = req.params;

    // Find the student and ensure they belong to this parent
    const student = await Student.findOne({
      _id: studentId,
      parent: req.user._id,
    }).populate("user", "email name");

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    // Fetch leave requests for this student (using student.user._id)
    const leaves = await Leave.find({ userId: student.user._id }).sort({ startDate: -1 });

    // Format response for frontend
    const formatted = leaves.map((leave, index) => ({
      sNo: index + 1,
      employeeName: leave.employeeName,
      leaveType: leave.leaveType,
      reason: leave.reason,
      startDate: leave.startDate.toISOString().slice(0, 10),
      endDate: leave.endDate.toISOString().slice(0, 10),
      numDays: leave.numDays,
      status: leave.status,
      fileUrl: leave.fileUrl || null,
    }));

    res.json(formatted);
  } catch (err) {
    console.error("CHILD LEAVE REQUEST ERROR:", err);
    res.status(500).json({ message: "Server Error" });
  }
});

/////////////////////////////////////////////////////////////
// GET PARENT CHILDREN WITH COURSES
/////////////////////////////////////////////////////////////

router.get("/children-with-courses", protect, async (req, res) => {

  try {

    if (req.user.role !== "parent") {
      return res.status(403).json({ message: "Access denied" });
    }

    const children = await Student.find({ parent: req.user._id })
      .populate({
        path: "enrolledCourses",
        select: "title price category thumbnail duration durationUnit",
      });

    res.json(children);

  } catch (error) {

    console.error(error);

    res.status(500).json({
      message: "Failed to fetch children courses",
    });

  }

});

module.exports = router;