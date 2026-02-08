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

/**
 * Update a campaign (Admin only)
 * PUT /campaigns/:id
 */
const updateCampaign = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, description, goal_amount, image_url, category } = req.body;

        // Validate ID
        if (!id || isNaN(parseInt(id))) {
            return res.status(400).json({
                success: false,
                message: 'Valid campaign ID is required.',
            });
        }

        // Validate goal_amount if provided
        if (goal_amount !== undefined) {
            const goalAmount = parseFloat(goal_amount);
            if (isNaN(goalAmount) || goalAmount <= 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Goal amount must be a positive number.',
                });
            }
        }

        const updatedCampaign = await campaignModel.updateCampaign(parseInt(id), {
            title: title || undefined,
            description: description !== undefined ? description : undefined,
            goal_amount: goal_amount ? parseFloat(goal_amount) : undefined,
            image_url: image_url !== undefined ? image_url : undefined,
            category: category !== undefined ? category : undefined,
        });

        if (!updatedCampaign) {
            return res.status(404).json({
                success: false,
                message: 'Campaign not found.',
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Campaign updated successfully.',
            data: updatedCampaign,
        });
    } catch (error) {
        console.error('Update campaign error:', error);
        return res.status(500).json({
            success: false,
            message: 'An error occurred while updating the campaign.',
        });
    }
};

/**
 * Delete a campaign (Admin only)
 * DELETE /campaigns/:id
 */
const deleteCampaign = async (req, res) => {
    try {
        const { id } = req.params;

        // Validate ID
        if (!id || isNaN(parseInt(id))) {
            return res.status(400).json({
                success: false,
                message: 'Valid campaign ID is required.',
            });
        }

        const deleted = await campaignModel.deleteCampaign(parseInt(id));

        if (!deleted) {
            return res.status(404).json({
                success: false,
                message: 'Campaign not found.',
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Campaign deleted successfully.',
        });
    } catch (error) {
        console.error('Delete campaign error:', error);
        return res.status(500).json({
            success: false,
            message: 'An error occurred while deleting the campaign.',
        });
    }
};

module.exports = {
    getAllCampaigns,
    getCategories,
    getCampaignById,
    createCampaign,
    updateCampaign,
    deleteCampaign,
};
