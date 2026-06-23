const mongoose = require('mongoose');

const examSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true,
  },
  semester: {
    type: Number,
    required: true,
    min: 1,
    max: 6,
  },
  center: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Center',
    required: true,
  },
  batch: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Batch',
  },
  subject: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subject',
  },
  totalMark: { type: Number, default: 100 },
  passMark: { type: Number, default: 35 },
  internalMark: { type: Number, default: 0 },
  externalMark: { type: Number, default: 0 },
  theoryMark: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('Exam', examSchema);
