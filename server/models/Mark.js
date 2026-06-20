const mongoose = require('mongoose');

const markSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true,
  },
  exam: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Exam',
    required: true,
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true,
  },
  subject: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subject',
    required: true,
  },
  totalMark: {
    type: Number,
    required: true,
  },
  passMark: {
    type: Number,
    required: true,
  },
  theoryMark: {
    type: Number,
    default: 0,
  },
  internalMark: {
    type: Number,
    default: 0,
  },
  practicalMark: {
    type: Number,
    default: 0,
  },
  marksheetUrl: {
    type: String
  }
}, { timestamps: true });

module.exports = mongoose.model('Mark', markSchema);
