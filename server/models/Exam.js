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
  subjects: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subject',
  }]
}, { timestamps: true });

module.exports = mongoose.model('Exam', examSchema);
