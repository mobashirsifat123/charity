const campaignModel = require('../models/campaignModel');

/**
 * Get all campaigns with search, filter, and pagination
 * GET /campaigns?search=&category=&page=
 */
const getAllCampaigns = async (req, res) => {
    try {
        const { search, category, page = 1, limit = 6 } = req.query;

        const result = await campaignModel.getCampaignsWithFilters({
            search: search || '',
            category: category || '',
            page: parseInt(page) || 1,
            limit: parseInt(limit) || 6,
        });

        return res.status(200).json({
            success: true,
            message: 'Campaigns retrieved successfully.',
            data: result.campaigns,
            totalPages: result.totalPages,
            currentPage: result.currentPage,
            total: result.total,
        });
    } catch (error) {
        console.error('Get campaigns error:', error);
        return res.status(500).json({
            success: false,
            message: 'An error occurred while fetching campaigns.',
        });
    }
};

/**
 * Get all available categories
 * GET /campaigns/categories
 */
const getCategories = async (req, res) => {
    try {
        const categories = await campaignModel.getCategories();

        return res.status(200).json({
            success: true,
            data: categories,
        });
    } catch (error) {
        console.error('Get categories error:', error);
        return res.status(500).json({
            success: false,
            message: 'An error occurred while fetching categories.',
        });
    }
};

/**
 * Get single campaign by ID
 * GET /campaigns/:id
 */
const getCampaignById = async (req, res) => {
    try {
        const { id } = req.params;

        // Validate ID
        if (!id || isNaN(parseInt(id))) {
            return res.status(400).json({
                success: false,
                message: 'Valid campaign ID is required.',
            });
        }

        const campaign = await campaignModel.getCampaignById(parseInt(id));

        if (!campaign) {
            return res.status(404).json({
                success: false,
                message: 'Campaign not found.',
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Campaign retrieved successfully.',
            data: campaign,
        });
    } catch (error) {
        console.error('Get campaign error:', error);
        return res.status(500).json({
            success: false,
            message: 'An error occurred while fetching the campaign.',
        });
    }
};

/**
 * Create a new campaign (Admin only)
 * POST /campaigns
 */
const createCampaign = async (req, res) => {
    try {
        const { title, description, goal_amount, image_url, category } = req.body;

        // Validate required fields
        if (!title || !goal_amount) {
            return res.status(400).json({
                success: false,
                message: 'Title and goal_amount are required.',
            });
        }

        // Validate goal_amount
        const goalAmount = parseFloat(goal_amount);
        if (isNaN(goalAmount) || goalAmount <= 0) {
            return res.status(400).json({
                success: false,
                message: 'Goal amount must be a positive number.',
            });
        }

        const newCampaign = await campaignModel.createCampaign(
            title,
            description || null,
            goalAmount,
            image_url || null,
            category || null
        );

        return res.status(201).json({
            success: true,
            message: 'Campaign created successfully.',
            data: newCampaign,
        });
    } catch (error) {
        console.error('Create campaign error:', error);
        return res.status(500).json({
            success: false,
            message: 'An error occurred while creating the campaign.',
        });
    }
};

module.exports = {
    getAllCampaigns,
    getCategories,
    getCampaignById,
    createCampaign,
};
