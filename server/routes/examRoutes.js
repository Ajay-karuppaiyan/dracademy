const express = require('express');
const router = express.Router();
const Exam = require('../models/Exam');
const { protect } = require('../middleware/authMiddleware');

const isAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ message: 'Access denied: Admins only' });
  }
};

// GET all exams
router.get('/', protect, async (req, res) => {
  try {
    const exams = await Exam.find()
      .populate('course', 'title')
      .populate('center', 'name location')
      .populate('subjects', 'name code type semester')
      .sort({ date: -1 });
    res.json(exams);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET a single exam
router.get('/:id', protect, async (req, res) => {
  try {
    const exam = await Exam.findById(req.params.id)
      .populate('course', 'title')
      .populate('center', 'name location')
      .populate('subjects', 'name code type semester');
    if (!exam) {
      return res.status(404).json({ message: 'Exam not found' });
    }
    res.json(exam);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST create a new exam (Admin only)
router.post('/', protect, isAdmin, async (req, res) => {
  try {
    const { name, date, course, semester, center, subjects } = req.body;
    const exam = await Exam.create({
      name,
      date,
      course,
      semester,
      center,
      subjects: subjects ? JSON.parse(subjects) : []
    });
    res.status(201).json(exam);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// PUT update an exam (Admin only)
router.put('/:id', protect, isAdmin, async (req, res) => {
  try {
    const { name, date, course, semester, center, subjects } = req.body;
    const exam = await Exam.findById(req.params.id);
    
    if (!exam) {
      return res.status(404).json({ message: 'Exam not found' });
    }

    if (name) exam.name = name;
    if (date) exam.date = date;
    if (course) exam.course = course;
    if (semester) exam.semester = semester;
    if (center) exam.center = center;
    if (subjects) exam.subjects = JSON.parse(subjects);

    await exam.save();
    res.json(exam);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// DELETE an exam (Admin only)
router.delete('/:id', protect, isAdmin, async (req, res) => {
  try {
    const exam = await Exam.findById(req.params.id);
    if (!exam) {
      return res.status(404).json({ message: 'Exam not found' });
    }
    await exam.deleteOne();
    res.json({ message: 'Exam deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
