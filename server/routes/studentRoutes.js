const express = require('express');
const router = express.Router();
const { upload } = require('../config/cloudinary');
const Student = require('../models/Student');
const User = require('../models/User');

// // ======================================================
// // CREATE STUDENT (Creates User + Student)
// // ======================================================
// router.post(
//   '/',
//   upload.fields([
//     { name: 'profilePic', maxCount: 1 },
//     { name: 'idFile', maxCount: 1 },
//     { name: 'certificateFile', maxCount: 1 },
//   ]),
//   async (req, res) => {
//     try {
//      const {
//   studentNameEnglish,
//   studentNameMotherTongue,
//   fatherName,
//   dob,
//   age,
//   gender,
//   nationality,
//   aadharNo,
//   kcetRegNo,
//   neetRegNo,
//   apaarId,
//   debId,
//   abcId,
//   religion,
//   community,
//   maritalStatus,
//   email,
//   phone,
//   whatsapp,
//   village,
//   post,
//   taluk,
//   district,
//   pin,
//   englishFluency,
//   language1,
//   language2,
//   language3,
//   accountHolderName,
//   accountNumber,
//   ifscCode,
//   bankNameBranch,
//   role,
// } = req.body;

//       // Check if email already exists
//       const existingUser = await User.findOne({ email });
//       if (existingUser) {
//         return res.status(400).json({
//           message: 'User with this email already exists',
//         });
//       }

//       const defaultPassword = "Student@123";

//       // 1️⃣ Create User
//       const user = await User.create({
//        name: studentNameEnglish,
//         email,
//         password: defaultPassword,
//         role: role || 'student',
//       });

//       // Helper function for file
//       const getFileData = (fieldName) => {
//         if (req.files && req.files[fieldName]) {
//           const file = req.files[fieldName][0];
//           return {
//             url: file.path,
//             public_id: file.filename,
//             name: file.originalname,
//           };
//         }
//         return null;
//       };

//       // 2️⃣ Create Student
//       const student = await Student.create({
//   user: user._id,

//   studentNameEnglish,
//   studentNameMotherTongue,
//   fatherName,
//   dob,
//   age,
//   gender,
//   nationality,

//   aadharNo,
//   kcetRegNo,
//   neetRegNo,
//   apaarId,
//   debId,
//   abcId,

//   religion,
//   community,
//   maritalStatus,

//   email,
//   phone,
//   whatsapp,

//   address: {
//     village,
//     post,
//     taluk,
//     district,
//     pin,
//   },

//   englishFluency,
//   languagesKnown: [language1, language2, language3],

//   bankDetails: {
//     accountHolderName,
//     accountNumber,
//     ifscCode,
//     bankNameBranch,
//   },
// });

//       // 3️⃣ Link Student to User
//       user.studentProfile = student._id;
//       await user.save();

//       res.status(201).json({
//         message: 'Student created successfully',
//         student,
//       });

//     } catch (error) {
//       res.status(500).json({ message: error.message });
//     }
//   }
// );

// ======================================================
// GET ALL STUDENTS (From Users Collection)
// ======================================================
// ======================================================
// GET ALL STUDENTS (FULL DATA)
// ======================================================
const { protect } = require("../middleware/authMiddleware");
router.get("/", protect, async (req, res) => {
  try {
    let query = {};
    if (req.user.role === "center") {
      query.center = req.user.center;
    }

    const students = await Student.find(query)
      .populate("user", "-password")
      .populate("parent", "name email")
      .populate("enrolledCourses", "title price category duration")
      .populate("center", "name location");

    res.json({
      count: students.length,
      students,
    });

  } catch (error) {
    console.error("GET STUDENTS ERROR:", error);
    res.status(500).json({ message: error.message });
  }
});

// ======================================================
// GET STUDENT BY USER _ID
router.get('/user/:id', protect, async (req, res) => {
  try {
    const userId = req.params.id;

    // First, find the user by their Mongo _id
    const user = await User.findById(userId).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Then, find the corresponding student profile (if exists)
    const student = await Student.findOne({ user: user._id }).populate("center", "name location");

    res.json({
      user,
      studentProfile: student || null,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
});

// ======================================================
// UPDATE STUDENT (Updates BOTH User + Student)
// ======================================================
router.put(
  "/:id",
  upload.fields([
    { name: "profilePic", maxCount: 1 },
    { name: "idFile", maxCount: 1 },
    { name: "certificateFile", maxCount: 1 },
  ]),
  async (req, res) => {
    try {

      const student = await Student.findById(req.params.id).populate("user");

      if (!student) {
        return res.status(404).json({ message: "Student not found" });
      }

      const data = req.body;

      // =========================
      // UPDATE STUDENT FIELDS
      // =========================

      Object.assign(student, data);

      // =========================
      // UPDATE FILES (IF PROVIDED)
      // =========================

      const updateFile = (field, existing) => {
        if (req.files && req.files[field]) {
          const file = req.files[field][0];
          return {
            url: file.path,
            public_id: file.filename,
            name: file.originalname,
          };
        }
        return existing;
      };

      student.profilePic = updateFile("profilePic", student.profilePic);
      student.idFile = updateFile("idFile", student.idFile);
      student.certificateFile = updateFile(
        "certificateFile",
        student.certificateFile
      );

      await student.save();

      // =========================
      // UPDATE USER DATA
      // =========================

      if (student.user) {
        const updateData = {
          ...(data.email && { email: data.email }),
          ...(data.studentNameEnglish && { name: data.studentNameEnglish }),
        };

        if (req.files && req.files.profilePic) {
          updateData.profilePic = {
            url: req.files.profilePic[0].path,
            public_id: req.files.profilePic[0].filename,
            name: req.files.profilePic[0].originalname,
          };
        }

        await User.findByIdAndUpdate(
          student.user._id,
          updateData,
          { new: true }
        );
      }

      const updatedStudent = await Student.findById(student._id)
      .populate("user", "-password")
      .populate("parent", "name email")
      .populate("enrolledCourses", "title price category duration")
      .populate("center", "name location");

      res.json({
        message: "Student updated successfully",
        student: updatedStudent,
      });

    } catch (error) {
      console.error("UPDATE STUDENT ERROR:", error);
      res.status(500).json({ message: error.message });
    }
  }
);

// ======================================================
// DELETE STUDENT (Deletes BOTH User + Student)
// ======================================================
router.delete("/:id", async (req, res) => {
  try {
    // 1️⃣ Find student first
    const student = await Student.findById(req.params.id);

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    // 2️⃣ Delete linked user account
    await User.findByIdAndDelete(student.user);

    // 3️⃣ Delete student document
    await Student.findByIdAndDelete(req.params.id);

    res.json({
      message: "Student and linked user deleted successfully",
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ======================================================
// TOGGLE STATUS
// ======================================================
router.patch('/:id/status', async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);

    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    student.status =
      student.status === 'active' ? 'inactive' : 'active';

    await student.save();

    res.json({
      message: `Student ${
        student.status === 'active' ? 'unblocked' : 'blocked'
      } successfully`,
      status: student.status,
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


module.exports = router;