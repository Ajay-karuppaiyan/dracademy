const express = require('express');
const router = express.Router();
const StudentFee = require('../models/StudentFee');
const { protect } = require('../middleware/authMiddleware');

// Get all student fees
router.get('/', protect, async (req, res) => {
  try {
    const fees = await StudentFee.find()
      .populate('student', 'studentNameEnglish studentId')
      .populate('center', 'name')
      .populate('course', 'title')
      .populate('batch', 'name')
      .sort({ createdAt: -1 });
    res.json(fees);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create new student fee
router.post('/', protect, async (req, res) => {
  try {
    const { student, center, course, batch, feeType, otherFeeType, terms, amount, status } = req.body;
    
    const fee = await StudentFee.create({
      student,
      center,
      course,
      batch,
      feeType,
      otherFeeType,
      terms,
      amount,
      status: status || 'pending'
    });

    await fee.populate('student', 'studentNameEnglish studentId');
    await fee.populate('center', 'name');
    await fee.populate('course', 'title');
    await fee.populate('batch', 'name');

    res.status(201).json(fee);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Toggle status
router.patch('/:id/toggle-status', protect, async (req, res) => {
  try {
    const fee = await StudentFee.findById(req.params.id);
    if (!fee) {
      return res.status(404).json({ message: 'Fee record not found' });
    }

    fee.status = fee.status === 'paid' ? 'pending' : 'paid';
    await fee.save();
    
    await fee.populate('student', 'studentNameEnglish studentId');
    await fee.populate('center', 'name');
    await fee.populate('course', 'title');
    await fee.populate('batch', 'name');

    res.json(fee);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete student fee
router.delete('/:id', protect, async (req, res) => {
  try {
    const fee = await StudentFee.findById(req.params.id);
    if (!fee) {
      return res.status(404).json({ message: 'Fee record not found' });
    }
    await fee.deleteOne();
    res.json({ message: 'Fee record deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
