const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// Create profile pictures directory
const profilePicsDir = path.join(uploadsDir, 'profile-pictures');
if (!fs.existsSync(profilePicsDir)) {
    fs.mkdirSync(profilePicsDir, { recursive: true });
}

// Create course images directory
const courseImagesDir = path.join(uploadsDir, 'course-images');
if (!fs.existsSync(courseImagesDir)) {
    fs.mkdirSync(courseImagesDir, { recursive: true });
}

// Configure storage for profile pictures
const profileStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, profilePicsDir);
    },
    filename: function (req, file, cb) {
        // Create unique filename: userId_timestamp.extension
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const extension = path.extname(file.originalname);
        cb(null, `${req.userId}_${uniqueSuffix}${extension}`);
    }
});

// Configure storage for course images
const courseStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, courseImagesDir);
    },
    filename: function (req, file, cb) {
        // Create unique filename: course_userId_timestamp.extension
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const extension = path.extname(file.originalname);
        cb(null, `course_${req.userId}_${uniqueSuffix}${extension}`);
    }
});

// File filter to only allow images
const fileFilter = (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
        return cb(null, true);
    } else {
        cb(new Error('Only image files (jpeg, jpg, png, gif, webp) are allowed!'));
    }
};

// Configure multer for profile pictures
const profileUpload = multer({
    storage: profileStorage,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB limit
    },
    fileFilter: fileFilter
});

// Configure multer for course images
const courseUpload = multer({
    storage: courseStorage,
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB limit for course images
    },
    fileFilter: fileFilter
});

// Middleware for single profile picture upload
const uploadProfilePicture = profileUpload.single('profilePicture');

// Middleware for single course image upload
const uploadCourseImage = courseUpload.single('courseImage');

// Error handling middleware
const handleUploadError = (err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({
                message: 'File too large. Maximum size is 5MB.'
            });
        }
        if (err.code === 'LIMIT_UNEXPECTED_FILE') {
            return res.status(400).json({
                message: 'Unexpected field name. Use "profilePicture" as field name.'
            });
        }
    }
    
    if (err.message.includes('Only image files')) {
        return res.status(400).json({
            message: err.message
        });
    }
    
    next(err);
};

// Function to delete old profile picture
const deleteOldProfilePicture = (oldImagePath) => {
    if (oldImagePath && oldImagePath.includes('/uploads/profile-pictures/')) {
        const filename = path.basename(oldImagePath);
        const fullPath = path.join(profilePicsDir, filename);

        fs.unlink(fullPath, (err) => {
            if (err && err.code !== 'ENOENT') {
                console.error('Error deleting old profile picture:', err);
            }
        });
    }
};

// Function to delete old course image
const deleteOldCourseImage = (oldImagePath) => {
    if (oldImagePath && oldImagePath.includes('/uploads/course-images/')) {
        const filename = path.basename(oldImagePath);
        const fullPath = path.join(courseImagesDir, filename);

        fs.unlink(fullPath, (err) => {
            if (err && err.code !== 'ENOENT') {
                console.error('Error deleting old course image:', err);
            }
        });
    }
};

module.exports = {
    uploadProfilePicture,
    uploadCourseImage,
    handleUploadError,
    deleteOldProfilePicture,
    deleteOldCourseImage
};
