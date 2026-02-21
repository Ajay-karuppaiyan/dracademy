const express = require('express');
const router = express.Router();
const { upload } = require('../config/cloudinary');
const Student = require('../models/Student');
const User = require('../models/User');

// ======================================================
// CREATE STUDENT (Creates User + Student)
// ======================================================
router.post(
  '/',
  upload.fields([
    { name: 'profilePic', maxCount: 1 },
    { name: 'idFile', maxCount: 1 },
    { name: 'certificateFile', maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      const {
        firstName,
        lastName,
        email,
        phone,
        dob,
        gender,
        studentId,
        course,
        department,
        year,
        role,
      } = req.body;

      // Check if email already exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({
          message: 'User with this email already exists',
        });
      }

      const defaultPassword = "Student@123";

      // 1️⃣ Create User
      const user = await User.create({
        name: `${firstName} ${lastName}`,
        email,
        password: defaultPassword,
        role: role || 'student',
      });

      // Helper function for file
      const getFileData = (fieldName) => {
        if (req.files && req.files[fieldName]) {
          const file = req.files[fieldName][0];
          return {
            url: file.path,
            public_id: file.filename,
            name: file.originalname,
          };
        }
        return null;
      };

      // 2️⃣ Create Student
      const student = await Student.create({
        user: user._id,
        firstName,
        lastName,
        phone,
        dob,
        gender,
        studentId,
        course,
        department,
        year,
        profilePic: getFileData('profilePic'),
        idFile: getFileData('idFile'),
        certificateFile: getFileData('certificateFile'),
      });

      // 3️⃣ Link Student to User
      user.studentProfile = student._id;
      await user.save();

      res.status(201).json({
        message: 'Student created successfully',
        student,
      });

    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);


// ======================================================
// GET ALL STUDENTS (From Users Collection)
// ======================================================
router.get("/", async (req, res) => {
  try {
    const students = await Student.find()
      .populate("user", "-password"); // populate linked login account

    res.json(students);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


// ======================================================
// GET STUDENT BY USER _ID
router.get('/user/:id', async (req, res) => {
  try {
    const userId = req.params.id;

    // First, find the user by their Mongo _id
    const user = await User.findById(userId).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Then, find the corresponding student profile (if exists)
    const student = await Student.findOne({ user: user._id });

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
  '/:id',
  upload.fields([
    { name: 'profilePic', maxCount: 1 },
    { name: 'idFile', maxCount: 1 },
    { name: 'certificateFile', maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      const student = await Student.findById(req.params.id).populate('user');

      if (!student) {
        return res.status(404).json({ message: 'Student not found' });
      }

      const {
        firstName,
        lastName,
        email,
        role,
        ...otherUpdates
      } = req.body;

      // Update Student fields
      Object.keys(otherUpdates).forEach((key) => {
        student[key] = otherUpdates[key];
      });

      // Update files if uploaded
      const updateFileData = (fieldName, existingFile) => {
        if (req.files && req.files[fieldName]) {
          const file = req.files[fieldName][0];
          return {
            url: file.path,
            public_id: file.filename,
            name: file.originalname,
          };
        }
        return existingFile;
      };

      student.profilePic = updateFileData('profilePic', student.profilePic);
      student.idFile = updateFileData('idFile', student.idFile);
      student.certificateFile = updateFileData(
        'certificateFile',
        student.certificateFile
      );

      await student.save();

      // Update User fields
      if (student.user) {
        if (email) student.user.email = email;
        if (role) student.user.role = role;

        if (firstName || lastName) {
          student.user.name = `${firstName || student.firstName} ${
            lastName || student.lastName
          }`;
        }

        await student.user.save();
      }

      res.json({
        message: 'Student updated successfully',
        student,
      });

    } catch (error) {
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
