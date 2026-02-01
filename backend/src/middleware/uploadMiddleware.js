const multer = require('multer');
const path = require('path');
const crypto = require('crypto');

// Configure storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        // Generate unique filename: timestamp-randomstring.extension
        const uniqueSuffix = Date.now() + '-' + crypto.randomBytes(6).toString('hex');
        const ext = path.extname(file.originalname).toLowerCase();
        cb(null, `image-${uniqueSuffix}${ext}`);
    }
});

// File filter - only allow images
const fileFilter = (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];

    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Only image files (JPEG, PNG, GIF, WebP) are allowed'), false);
    }
};

// Create multer instance
const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB max
    }
});

module.exports = upload;
