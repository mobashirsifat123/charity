const express = require('express');
const router = express.Router();
const donationController = require('../controllers/donationController');
const { verifyToken } = require('../middleware/authMiddleware');

/**
 * @route   POST /donations
 * @desc    Process a new donation
 * @access  Private (Authenticated users)
 */
router.post('/', verifyToken, donationController.processDonation);

/**
 * @route   GET /donations/my-donations
 * @desc    Get current user's donation history
 * @access  Private (Authenticated users)
 */
router.get('/my-donations', verifyToken, donationController.getMyDonations);

module.exports = router;
