const express = require('express');
const router = express.Router();
const upload = require('../middleware/uploadMiddleware');
const uploadController = require('../controllers/uploadController');
const { verifyToken } = require('../middleware/authMiddleware');

/**
 * @route   POST /upload
 * @desc    Upload a single image
 * @access  Private (Authenticated users)
 */
router.post('/', verifyToken, (req, res, next) => {
    upload.single('image')(req, res, (err) => {
        if (err) {
            return res.status(400).json({
                success: false,
                message: err.message || 'Upload failed',
            });
        }
        uploadController.uploadImage(req, res);
    });
});

module.exports = router;
