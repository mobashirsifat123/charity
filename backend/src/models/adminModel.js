const pool = require('../config/db');

/**
 * Get platform-wide statistics
 * @returns {Promise<Object>} Stats object
 */
const getPlatformStats = async () => {
    // Total raised amount (completed donations only)
    const raisedQuery = `
        SELECT COALESCE(SUM(amount), 0) as total_raised
        FROM donations
        WHERE payment_status = 'completed'
    `;

    // Total unique donors
    const donorsQuery = `
        SELECT COUNT(DISTINCT user_id) as total_donors
        FROM donations
        WHERE payment_status = 'completed'
    `;

    // Total campaigns
    const campaignsQuery = `
        SELECT COUNT(*) as total_campaigns
        FROM campaigns
    `;

    // Total donations count
    const donationsQuery = `
        SELECT COUNT(*) as total_donations
        FROM donations
    `;

    const [raised, donors, campaigns, donations] = await Promise.all([
        pool.query(raisedQuery),
        pool.query(donorsQuery),
        pool.query(campaignsQuery),
        pool.query(donationsQuery),
    ]);

    return {
        totalRaised: parseFloat(raised.rows[0].total_raised) || 0,
        totalDonors: parseInt(donors.rows[0].total_donors) || 0,
        totalCampaigns: parseInt(campaigns.rows[0].total_campaigns) || 0,
        totalDonations: parseInt(donations.rows[0].total_donations) || 0,
    };
};

/**
 * Get all donations with user and campaign info (for admin)
 * @returns {Promise<Array>} Array of donation objects
 */
const getAllDonations = async () => {
    const query = `
        SELECT 
            d.id,
            d.amount,
            d.payment_status,
            d.created_at,
            u.id as user_id,
            u.name as donor_name,
            u.email as donor_email,
            c.id as campaign_id,
            c.title as campaign_title
        FROM donations d
        JOIN users u ON d.user_id = u.id
        JOIN campaigns c ON d.campaign_id = c.id
        ORDER BY d.created_at DESC
    `;
    const result = await pool.query(query);
    return result.rows;
};

module.exports = {
    getPlatformStats,
    getAllDonations,
};
