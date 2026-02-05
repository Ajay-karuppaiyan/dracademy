const mongoose = require('mongoose');

const lessonSchema = mongoose.Schema({
    title: { type: String, required: true },
    type: { type: String, enum: ['video', 'document', 'quiz'], default: 'video' },
    url: { type: String, required: true }, // URL to video or document
    duration: { type: String }, // e.g., "10:30"
    isFree: { type: Boolean, default: false }, // For preview
});

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
        type: Number, // Number of weeks/months
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
    rating: {
        type: Number,
        required: true,
        default: 0,
    },
    numReviews: {
        type: Number,
        required: true,
        default: 0,
    },
}, {
    timestamps: true,
});

const Course = mongoose.model('Course', courseSchema);

module.exports = Course;
