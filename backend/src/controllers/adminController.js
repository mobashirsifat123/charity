const adminModel = require('../models/adminModel');

/**
 * Get platform statistics (Admin only)
 * @route GET /admin/stats
 */
const getStats = async (req, res) => {
    try {
        const stats = await adminModel.getPlatformStats();

        res.status(200).json({
            success: true,
            data: stats,
        });
    } catch (error) {
        console.error('Get stats error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch platform statistics',
        });
    }
};

/**
 * Get all donations (Admin only)
 * @route GET /admin/donations
 */
const getAllDonations = async (req, res) => {
    try {
        const donations = await adminModel.getAllDonations();

        res.status(200).json({
            success: true,
            data: donations,
        });
    } catch (error) {
        console.error('Get all donations error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch donations',
        });
    }
};

module.exports = {
    getStats,
    getAllDonations,
};
