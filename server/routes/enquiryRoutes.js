const express = require('express');
const router = express.Router();
const Enquiry = require('../models/Enquiry');

// @desc    Create a new enquiry
// @route   POST /api/enquiries
// @access  Public
router.post('/', async (req, res) => {
  try {
    const { name, phone, email, message } = req.body;

    if (!name || !phone || !message) {
      return res.status(400).json({ message: 'Please provide name, phone and message' });
    }

    const enquiry = await Enquiry.create({
      name,
      phone,
      email,
      message,
    });

    res.status(201).json({
      success: true,
      data: enquiry,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// @desc    Get all enquiries
// @route   GET /api/enquiries
// @access  Private/Admin (for now public just to be safe but usually should be protected)
router.get('/', async (req, res) => {
  try {
    const enquiries = await Enquiry.find().sort({ createdAt: -1 });
    res.json(enquiries);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});

module.exports = router;
