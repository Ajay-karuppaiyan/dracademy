const mongoose = require('mongoose');

/* =========================
   LESSON SCHEMA
========================= */
const lessonSchema = mongoose.Schema({
  title: { type: String, required: true },

  type: { 
    type: String, 
    enum: ['video', 'document', 'quiz', 'assignment'], 
    default: 'video' 
  },

  url: { type: String }, // only for video/document

  duration: { type: String },

  isFree: { type: Boolean, default: false },

  // Quiz structure (only if type = quiz)
  questions: [{
    question: String,
    options: [String],
    correctAnswer: String
  }],

  // Assignment submission type
  maxMarks: Number,
});


/* =========================
   COURSE SCHEMA
========================= */
const courseSchema = mongoose.Schema({
  
  title: {
    type: String,
    required: true,
  },

  description: {
    type: String,
    required: true,
  },

  duration: {
    type: Number,
  },

  durationUnit: {
    type: String,
    enum: ['week', 'month'],
    default: 'week'
  },

  isActive: {
    type: Boolean,
    default: true
  },

  syllabus: [{
    week: String,
    topic: String,
    description: String,
    projectName: String
  }],

  instructor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },

  thumbnail: {
    url: String,
    public_id: String
  },

  price: {
    type: Number,
    required: true,
    default: 0,
  },

  category: {
    type: String,
    required: true,
  },

  level: {
    type: String,
    enum: ['Beginner', 'Intermediate', 'Advanced'],
    default: 'Beginner',
  },

  lessons: [lessonSchema],

  totalLessons: {
    type: Number,
    default: 0
  },

  enrolledCount: {
    type: Number,
    default: 0
  },

  certificateEnabled: {
    type: Boolean,
    default: false
  },

  milestones: [{
    title: String,
    description: String,
    unlockAfterPercentage: Number
  }],

  rating: {
    type: Number,
    default: 0,
  },

  numReviews: {
    type: Number,
    default: 0,
  },

}, {
  timestamps: true,
});

const Course = mongoose.model('Course', courseSchema);

module.exports = Course;