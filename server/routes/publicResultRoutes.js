const express = require('express');
const router = express.Router();
const Student = require('../models/Student');
const Mark = require('../models/Mark');
const Otp = require('../models/Otp');
const nodemailer = require('nodemailer');

// Nodemailer transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Helper function to mask email
// Shows first 2 characters, masks the rest before '@'
const maskEmail = (email) => {
  if (!email) return '';
  const [localPart, domain] = email.split('@');
  if (!localPart || !domain) return email;
  
  const visibleLength = Math.min(2, localPart.length);
  const visible = localPart.substring(0, visibleLength);
  const maskedLength = Math.max(0, localPart.length - visibleLength);
  const masked = '*'.repeat(maskedLength > 0 ? (maskedLength > 5 ? 5 : maskedLength) : 3);
  
  return `${visible}${masked}@${domain}`;
};

// @route   GET /api/public-results/student/:studentId
// @desc    Get student details for result search
router.get('/student/:studentId', async (req, res) => {
  try {
    const student = await Student.findOne({ studentId: req.params.studentId });
    
    if (!student) {
      return res.status(404).json({ message: 'Student not found with this Roll Number' });
    }

    res.json({
      name: student.studentNameEnglish,
      maskedEmail: maskEmail(student.email)
    });
  } catch (error) {
    console.error('GET STUDENT FOR RESULT ERROR:', error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// @route   POST /api/public-results/send-otp
// @desc    Send OTP to student's registered email
router.post('/send-otp', async (req, res) => {
  try {
    const { studentId } = req.body;
    
    if (!studentId) {
      return res.status(400).json({ message: 'Student ID is required' });
    }

    const student = await Student.findOne({ studentId });
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    const email = student.email;
    if (!email) {
      return res.status(400).json({ message: 'No email registered for this student' });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Save to database
    await Otp.findOneAndUpdate(
      { email },
      { otp, createdAt: Date.now() },
      { upsert: true, new: true }
    );

    // Send Email
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Results Access OTP - Dr.RG Academy',
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 10px; max-width: 600px; margin: auto;">
          <h2 style="color: #b91c1c; text-align: center;">Dr.RG Academy</h2>
          <p>Dear ${student.studentNameEnglish},</p>
          <p>Your OTP to access your academic results is:</p>
          <div style="background: #f3f4f6; padding: 15px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 5px; color: #111827; border-radius: 8px; margin: 20px 0;">
            ${otp}
          </div>
          <p>This OTP is valid for 5 minutes. Please do not share it with anyone.</p>
          <p>If you didn't request this, please ignore this email.</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
          <p style="font-size: 12px; color: #6b7280; text-align: center;">
            &copy; ${new Date().getFullYear()} Dr.RG Academy. All rights reserved.
          </p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({ message: 'OTP sent successfully' });
  } catch (error) {
    console.error('SEND RESULT OTP ERROR:', error);
    res.status(500).json({ message: 'Failed to send OTP' });
  }
});

// @route   POST /api/public-results/results
// @desc    Verify OTP and fetch results
router.post('/results', async (req, res) => {
  try {
    const { studentId, otp } = req.body;
    
    if (!studentId || !otp) {
      return res.status(400).json({ message: 'Student ID and OTP are required' });
    }

    const student = await Student.findOne({ studentId })
      .populate('enrolledCourses.course', 'title');
      
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    const email = student.email;
    const otpRecord = await Otp.findOne({ email });

    if (!otpRecord) {
      return res.status(400).json({ message: 'OTP expired or not found. Please request a new one.' });
    }

    if (otpRecord.otp !== otp) {
      return res.status(400).json({ message: 'Invalid OTP' });
    }

    // Optional: Delete OTP after successful verification
    await Otp.deleteOne({ email });

    // Fetch marks
    const marks = await Mark.find({ student: student._id })
      .populate('course', 'title')
      .populate('subject', 'name code type')
      .sort({ semester: 1 });

    let courseName = '';
    if (student.enrolledCourses && student.enrolledCourses.length > 0 && student.enrolledCourses[0].course) {
       courseName = student.enrolledCourses[0].course.title;
    }

    res.status(200).json({
      message: 'Verified successfully',
      student: {
        name: student.studentNameEnglish,
        studentId: student.studentId,
        courseName: courseName
      },
      marks
    });
  } catch (error) {
    console.error('VERIFY OTP & FETCH RESULTS ERROR:', error);
    res.status(500).json({ message: 'Verification or fetching results failed' });
  }
});

module.exports = router;
