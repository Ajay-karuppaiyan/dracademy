const mongoose = require('mongoose');

const certificateSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  certificateId: {
    type: String,
    required: true,
    unique: true // A unique identifier like 'CERT-2023-XYZ-123'
  },
  issuedAt: {
    type: Date,
    default: Date.now
  },
  expiresAt: {
    type: Date
  },
  data: {
    studentName: String,
    courseTitle: String,
    instructorName: String,
    completionDate: Date
  }
}, {
  timestamps: true
});

const Certificate = mongoose.model('Certificate', certificateSchema);

module.exports = Certificate;
