const mongoose = require('mongoose');

const enquirySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    required: true,
  },
  email: {
    type: String,
  },
  message: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ['new', 'contacted', 'resolved'],
    default: 'new',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Enquiry', enquirySchema);
