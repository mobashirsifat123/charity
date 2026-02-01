const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { verifyToken, requireAdmin } = require('../middleware/authMiddleware');

/**
 * @route   GET /admin/stats
 * @desc    Get platform-wide statistics
 * @access  Private (Admin only)
 */
router.get('/stats', verifyToken, requireAdmin, adminController.getStats);

/**
 * @route   GET /admin/donations
 * @desc    Get all donations from all users
 * @access  Private (Admin only)
 */
router.get('/donations', verifyToken, requireAdmin, adminController.getAllDonations);

module.exports = router;
