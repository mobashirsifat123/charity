const express = require('express');
const router = express.Router();
const stripeController = require('../controllers/stripeController');
const { verifyToken } = require('../middleware/authMiddleware');

/**
 * @route   POST /stripe/create-checkout-session
 * @desc    Create a Stripe Checkout Session
 * @access  Private (Authenticated users)
 */
router.post('/create-checkout-session', verifyToken, stripeController.createCheckoutSession);

/**
 * @route   POST /stripe/verify-donation
 * @desc    Verify payment and save donation
 * @access  Private (Authenticated users)
 */
router.post('/verify-donation', verifyToken, stripeController.verifyDonation);

module.exports = router;
