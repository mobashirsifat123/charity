const express = require('express');
const router = express.Router();
const campaignController = require('../controllers/campaignController');
const { verifyToken, requireAdmin } = require('../middleware/authMiddleware');

/**
 * @route   GET /campaigns
 * @desc    Get all campaigns with search, filter, pagination
 * @access  Public
 */
router.get('/', campaignController.getAllCampaigns);

/**
 * @route   GET /campaigns/categories
 * @desc    Get all unique categories
 * @access  Public
 */
router.get('/categories', campaignController.getCategories);

/**
 * @route   GET /campaigns/:id
 * @desc    Get single campaign by ID
 * @access  Public
 */
router.get('/:id', campaignController.getCampaignById);

/**
 * @route   POST /campaigns
 * @desc    Create a new campaign
 * @access  Private (Admin only)
 */
router.post('/', verifyToken, requireAdmin, campaignController.createCampaign);

/**
 * @route   PUT /campaigns/:id
 * @desc    Update a campaign
 * @access  Private (Admin only)
 */
router.put('/:id', verifyToken, requireAdmin, campaignController.updateCampaign);

/**
 * @route   DELETE /campaigns/:id
 * @desc    Delete a campaign
 * @access  Private (Admin only)
 */
router.delete('/:id', verifyToken, requireAdmin, campaignController.deleteCampaign);

module.exports = router;
