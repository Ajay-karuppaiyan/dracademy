const express = require('express');
const router = express.Router();
const Course = require('../models/Course');
const { upload } = require('../config/cloudinary');
const fs = require('fs');
const path = require('path');
const { protect } = require('../middleware/authMiddleware');
const User = require('../models/User');

const logFile = path.join(__dirname, '../debug_course.log');
const log = (msg) => {
    const timestamp = new Date().toISOString();
    fs.appendFileSync(logFile, `[${timestamp}] ${msg}\n`);
};

// @desc    Fetch all courses
// @route   GET /api/courses
// @access  Public
router.get('/', async (req, res) => {
    try {
        const courses = await Course.find({}).populate('instructor', 'name');
        res.json(courses);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
});

// @desc    Fetch courses enrolled by current user
// @route   GET /api/courses/mine
// @access  Private
router.get('/mine', protect, async (req, res) => {
    try {
        const user = await User.findById(req.user._id).populate({
            path: 'enrolledCourses',
            populate: { path: 'instructor', select: 'name' }
        });
        res.json(user.enrolledCourses || []);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Fetch courses available for enrollment (excluding already enrolled)
// @route   GET /api/courses/available
// @access  Private
router.get('/available', protect, async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        const enrolledIds = user.enrolledCourses || [];

        const courses = await Course.find({
            _id: { $nin: enrolledIds },
            isActive: true
        }).populate('instructor', 'name');

        res.json(courses);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Fetch single course
// @route   GET /api/courses/:id
// @access  Public
router.get('/:id', async (req, res) => {
    try {
        const course = await Course.findById(req.params.id).populate('instructor', 'name');
        if (course) {
            res.json(course);
        } else {
            res.status(404).json({ message: 'Course not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
});

// @desc    Enroll in a course
// @route   POST /api/courses/:id/enroll
// @access  Private
router.post('/:id/enroll', protect, async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        const course = await Course.findById(req.params.id);

        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }

        if (!user.enrolledCourses) {
            user.enrolledCourses = [];
        }

        const isAlreadyEnrolled = user.enrolledCourses.some(
            (id) => id.toString() === course._id.toString()
        );

        if (isAlreadyEnrolled) {
            return res.status(400).json({ message: 'Already enrolled in this course' });
        }

        user.enrolledCourses.push(course._id);
        await user.save();

        res.json({ message: 'Successfully enrolled', courseId: course._id });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Create a course
// @route   POST /api/courses
// @access  Private/Admin
router.post('/', (req, res, next) => {
    upload.single('thumbnail')(req, res, (err) => {
        if (err) {
            log(`Multer Error: ${err.message}`);
            return res.status(400).json({ message: `Upload error: ${err.message}` });
        }
        next();
    });
}, async (req, res) => {
    try {
        log(`POST /api/courses started`);
        log(`Body keys: ${Object.keys(req.body).join(', ')}`);

        const { title, description, instructor, price, category, level, duration, durationUnit, syllabus, isActive } = req.body;

        const thumbnail = req.file ? {
            url: req.file.path,
            public_id: req.file.filename
        } : null;

        let parsedSyllabus = [];
        if (syllabus) {
            try {
                parsedSyllabus = typeof syllabus === 'string' ? JSON.parse(syllabus) : syllabus;
            } catch (e) {
                log(`Syllabus parse error: ${e.message}`);
                console.error("Syllabus parse error:", e);
            }
        }

        const instructorId = instructor;

        if (!instructorId) {
            log(`Error: Missing instructorId. Body keys received: ${Object.keys(req.body).join(', ')}`);
            return res.status(400).json({ message: 'Instructor ID is required' });
        }

        const course = new Course({
            title,
            description,
            duration: duration ? Number(duration) : 0,
            durationUnit: durationUnit || 'week',
            isActive: isActive === 'false' ? false : true,
            syllabus: parsedSyllabus,
            instructor: instructorId,
            thumbnail,
            price: Number(price) || 0,
            category,
            level
        });

        const createdCourse = await course.save();
        log(`Course created: ${createdCourse._id}`);
        res.status(201).json(createdCourse);
    } catch (error) {
        log(`Create Error: ${error.message}`);
        console.error("POST /api/courses - Error:", error.message);
        res.status(400).json({ message: error.message });
    }
});

// @desc    Update a course
// @route   PUT /api/courses/:id
// @access  Private/Admin
router.put('/:id', upload.single('thumbnail'), async (req, res) => {
    try {
        const course = await Course.findById(req.params.id);
        if (!course) return res.status(404).json({ message: 'Course not found' });

        const { title, description, instructor, price, category, level, duration, durationUnit, syllabus, isActive } = req.body;

        if (req.file) {
            course.thumbnail = {
                url: req.file.path,
                public_id: req.file.filename
            };
        }

        if (syllabus) {
            try {
                course.syllabus = typeof syllabus === 'string' ? JSON.parse(syllabus) : syllabus;
            } catch (e) {
                console.error("Syllabus parse error:", e);
            }
        }

        course.title = title || course.title;
        course.description = description || course.description;
        course.price = price !== undefined ? Number(price) : course.price;
        course.category = category || course.category;
        course.level = level || course.level;
        course.duration = duration !== undefined ? Number(duration) : course.duration;
        course.durationUnit = durationUnit || course.durationUnit;
        course.isActive = isActive !== undefined ? (isActive === 'false' ? false : true) : course.isActive;
        course.instructor = instructor || course.instructor;

        const updatedCourse = await course.save();
        res.json(updatedCourse);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// @desc    Toggle course visibility
// @route   PATCH /api/courses/:id/status
router.patch('/:id/status', async (req, res) => {
    try {
        const course = await Course.findById(req.params.id);
        if (!course) return res.status(404).json({ message: 'Course not found' });

        course.isActive = !course.isActive;
        await course.save();

        res.json({ message: `Course ${course.isActive ? 'enabled' : 'disabled'}`, isActive: course.isActive });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Delete a course
// @route   DELETE /api/courses/:id
// @access  Private/Admin
router.delete('/:id', async (req, res) => {
    try {
        const course = await Course.findById(req.params.id);

        if (course) {
            await course.deleteOne();
            res.json({ message: 'Course removed' });
        } else {
            res.status(404).json({ message: 'Course not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
