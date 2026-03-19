const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');
require('dotenv').config();

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: async (req, file) => {
        console.log(`Cloudinary Upload starting for field: ${file.fieldname}`);

        let folder = 'drrj-academy';

        // =========================
        // COURSES
        // =========================
        if (file.fieldname === 'thumbnail') {
            folder += '/courses/thumbnails';
        }

        // =========================
        // EMPLOYEES
        // =========================
        else if (['profilePic', 'idFile', 'certificateFile', 'contractFile'].includes(file.fieldname)) {
            folder += '/employees';
            if (file.fieldname === 'profilePic') folder += '/profiles';
            else folder += '/documents';
        }

        // =========================
        // FORUM POSTS (NEW)
        // =========================
        else if (file.fieldname === 'forumImage') {
            folder += '/forum/posts';
        }

        // =========================
        // LESSONS (NEW)
        // =========================
        else if (file.fieldname === 'lessonFile') {
            folder += '/courses/lessons';
        }

        // =========================
        // DEFAULT
        // =========================
        else {
            folder += '/others';
        }

        const options = {
            folder: folder,
            resource_type: 'auto', // Detect video vs image vs raw
            allowed_formats: ['jpg', 'png', 'jpeg', 'pdf', 'docx', 'webp', 'mp4', 'mkv', 'xls', 'xlsx'],
            public_id: `${Date.now()}-${file.originalname.split('.')[0]}`,
        };

        // Profile image transformation
        if (file.fieldname === 'profilePic') {
            options.transformation = [
                { width: 500, height: 500, crop: 'fill', gravity: 'face' }
            ];
        }

        // Forum image optimization (NEW)
        if (file.fieldname === 'forumImage') {
            options.transformation = [
                { width: 1000, crop: 'limit' },  // prevent oversized images
                { quality: 'auto' },
                { fetch_format: 'auto' }
            ];
        }

        return options;
    },
});

const upload = multer({ storage });

module.exports = { cloudinary, upload };