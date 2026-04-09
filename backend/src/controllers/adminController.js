const adminModel = require('../models/adminModel');
const DB_UNAVAILABLE_MESSAGE = 'Backend database is unavailable. Configure DATABASE_URL (or DB_USER/DB_HOST/DB_NAME/DB_PASSWORD/DB_PORT).';

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
        if (error?.code === 'DB_NOT_CONFIGURED') {
            return res.status(503).json({
                success: false,
                message: DB_UNAVAILABLE_MESSAGE,
            });
        }
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
        if (error?.code === 'DB_NOT_CONFIGURED') {
            return res.status(503).json({
                success: false,
                message: DB_UNAVAILABLE_MESSAGE,
            });
        }
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
