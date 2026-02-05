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
        // Determine folder based on fieldname or general folder
        let folder = 'drrj-academy';

        if (file.fieldname === 'thumbnail') {
            folder += '/courses/thumbnails';
        } else if (['profilePic', 'idFile', 'certificateFile', 'contractFile'].includes(file.fieldname)) {
            folder += '/employees';
            if (file.fieldname === 'profilePic') folder += '/profiles';
            else folder += '/documents';
        } else {
            folder += '/others';
        }

        const options = {
            folder: folder,
            allowed_formats: ['jpg', 'png', 'jpeg', 'pdf', 'docx', 'webp'],
            public_id: `${Date.now()}-${file.originalname.split('.')[0]}`,
        };

        // If it's a profile pic, add auto-cropping centered on the face
        if (file.fieldname === 'profilePic') {
            options.transformation = [
                { width: 500, height: 500, crop: 'fill', gravity: 'face' }
            ];
        }

        return options;
    },
});

const upload = multer({ storage: storage });

module.exports = { cloudinary, upload };
