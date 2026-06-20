const express = require('express');
const router = express.Router();
const Mark = require('../models/Mark');
const Student = require('../models/Student');
const Exam = require('../models/Exam');
const Course = require('../models/Course');
const Subject = require('../models/Subject');
const { protect } = require('../middleware/authMiddleware');
const { upload } = require('../config/cloudinary');

const isAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ message: 'Access denied: Admins only' });
  }
};

// GET all marks
router.get('/', protect, async (req, res) => {
  try {
    const marks = await Mark.find()
      .populate('student', 'studentNameEnglish studentId')
      .populate('exam', 'name date')
      .populate('course', 'title')
      .populate('subject', 'name code type')
      .sort({ createdAt: -1 });
    res.json(marks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET marks for a specific student
router.get('/student/:studentId', protect, async (req, res) => {
  try {
    const marks = await Mark.find({ student: req.params.studentId })
      .populate('exam', 'name date')
      .populate('course', 'title')
      .populate('subject', 'name code type');
    res.json(marks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST create a new mark (Admin only)
router.post('/', protect, isAdmin, upload.single('marksheet'), async (req, res) => {
  try {
    const { student, exam, course, subject, totalMark, passMark, theoryMark, internalMark, practicalMark } = req.body;
    
    // Check if mark for this student, exam and subject already exists
    const existing = await Mark.findOne({ student, exam, subject });
    if (existing) {
      return res.status(400).json({ message: 'Mark for this student and subject already exists in this exam.' });
    }

    const markData = {
      student,
      exam,
      course,
      subject,
      totalMark: Number(totalMark),
      passMark: Number(passMark),
      theoryMark: Number(theoryMark || 0),
      internalMark: Number(internalMark || 0),
      practicalMark: Number(practicalMark || 0)
    };

    if (req.file) {
      markData.marksheetUrl = req.file.path;
    }

    const mark = await Mark.create(markData);
    
    res.status(201).json(mark);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// PUT update a mark (Admin only)
router.put('/:id', protect, isAdmin, upload.single('marksheet'), async (req, res) => {
  try {
    const { student, exam, course, subject, totalMark, passMark, theoryMark, internalMark, practicalMark } = req.body;
    const mark = await Mark.findById(req.params.id);
    
    if (!mark) {
      return res.status(404).json({ message: 'Mark not found' });
    }

    if (student) mark.student = student;
    if (exam) mark.exam = exam;
    if (course) mark.course = course;
    if (subject) mark.subject = subject;
    if (totalMark !== undefined) mark.totalMark = Number(totalMark);
    if (passMark !== undefined) mark.passMark = Number(passMark);
    if (theoryMark !== undefined) mark.theoryMark = Number(theoryMark);
    if (internalMark !== undefined) mark.internalMark = Number(internalMark);
    if (practicalMark !== undefined) mark.practicalMark = Number(practicalMark);

    if (req.file) {
      mark.marksheetUrl = req.file.path;
    }

    await mark.save();
    res.json(mark);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// POST bulk upload marks via JSON array (Admin only)
router.post('/bulk', protect, isAdmin, async (req, res) => {
  try {
    const { marks } = req.body; // Array of objects
    if (!marks || !Array.isArray(marks)) {
      return res.status(400).json({ message: 'Invalid data format' });
    }

    const results = {
      success: 0,
      failed: 0,
      errors: []
    };

    for (let i = 0; i < marks.length; i++) {
      const row = marks[i];
      try {
        const studentDoc = await Student.findOne({ studentId: row['Student ID'] });
        const examDoc = await Exam.findOne({ name: row['Exam Name'] });
        const courseDoc = await Course.findOne({ title: row['Course Title'] });
        const subjectDoc = await Subject.findOne({ code: row['Subject Code'] });

        if (!studentDoc || !examDoc || !courseDoc || !subjectDoc) {
          throw new Error(`Missing reference: Student(${!!studentDoc}), Exam(${!!examDoc}), Course(${!!courseDoc}), Subject(${!!subjectDoc})`);
        }

        const existing = await Mark.findOne({ student: studentDoc._id, exam: examDoc._id, subject: subjectDoc._id });
        if (existing) {
          throw new Error('Mark already exists for this student, exam, and subject');
        }

        await Mark.create({
          student: studentDoc._id,
          exam: examDoc._id,
          course: courseDoc._id,
          subject: subjectDoc._id,
          totalMark: Number(row['Total Mark'] || 100),
          passMark: Number(row['Pass Mark'] || 35),
          theoryMark: Number(row['Theory Mark'] || 0),
          internalMark: Number(row['Internal Mark'] || 0),
          practicalMark: Number(row['Practical Mark'] || 0)
        });
        results.success += 1;
      } catch (err) {
        results.failed += 1;
        results.errors.push(`Row ${i + 1} (${row['Student ID'] || 'Unknown'}): ${err.message}`);
      }
    }

    res.json({ message: 'Bulk upload completed', results });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// DELETE a mark (Admin only)
router.delete('/:id', protect, isAdmin, async (req, res) => {
  try {
    const mark = await Mark.findById(req.params.id);
    if (!mark) {
      return res.status(404).json({ message: 'Mark not found' });
    }
    await mark.deleteOne();
    res.json({ message: 'Mark deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
