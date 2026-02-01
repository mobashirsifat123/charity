const pool = require('../config/db');

/**
 * Create a new donation
 * @param {number} userId - ID of the donating user
 * @param {number} campaignId - ID of the campaign
 * @param {number} amount - Donation amount
 * @returns {Promise<Object>} Created donation object
 */
const createDonation = async (userId, campaignId, amount) => {
    const query = `
        INSERT INTO donations (user_id, campaign_id, amount, payment_status)
        VALUES ($1, $2, $3, 'pending')
        RETURNING id, user_id, campaign_id, amount, payment_status, created_at
    `;
    const values = [userId, campaignId, amount];
    const result = await pool.query(query, values);
    return result.rows[0];
};

/**
 * Create a donation with Stripe session ID
 * @param {number} userId - User ID
 * @param {number} campaignId - Campaign ID
 * @param {number} amount - Donation amount
 * @param {string} status - Payment status
 * @param {string} sessionId - Stripe session ID
 * @returns {Promise<Object>} Created donation object
 */
const createDonationWithSession = async (userId, campaignId, amount, status, sessionId) => {
    const query = `
        INSERT INTO donations (user_id, campaign_id, amount, payment_status, stripe_session_id)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING id, user_id, campaign_id, amount, payment_status, stripe_session_id, created_at
    `;
    const values = [userId, campaignId, amount, status, sessionId];
    const result = await pool.query(query, values);
    return result.rows[0];
};

/**
 * Get donation by Stripe session ID
 * @param {string} sessionId - Stripe session ID
 * @returns {Promise<Object|null>} Donation object or null
 */
const getDonationBySessionId = async (sessionId) => {
    const query = `
        SELECT id, user_id, campaign_id, amount, payment_status, stripe_session_id, created_at
        FROM donations
        WHERE stripe_session_id = $1
    `;
    const result = await pool.query(query, [sessionId]);
    return result.rows[0] || null;
};

/**
 * Update payment status for a donation
 * @param {number} donationId - Donation ID
 * @param {string} status - New status ('pending', 'completed', 'failed')
 * @returns {Promise<Object>} Updated donation object
 */
const updatePaymentStatus = async (donationId, status) => {
    const query = `
        UPDATE donations
        SET payment_status = $2
        WHERE id = $1
        RETURNING id, user_id, campaign_id, amount, payment_status, created_at
    `;
    const result = await pool.query(query, [donationId, status]);
    return result.rows[0];
};

/**
 * Get all donations by a specific user
 * @param {number} userId - User ID
 * @returns {Promise<Array>} Array of donation objects
 */
const getDonationsByUser = async (userId) => {
    const query = `
        SELECT d.id, d.amount, d.payment_status, d.created_at,
               c.id as campaign_id, c.title as campaign_title
        FROM donations d
        JOIN campaigns c ON d.campaign_id = c.id
        WHERE d.user_id = $1
        ORDER BY d.created_at DESC
    `;
    const result = await pool.query(query, [userId]);
    return result.rows;
};

/**
 * Get donation by ID
 * @param {number} id - Donation ID
 * @returns {Promise<Object|null>} Donation object or null
 */
const getDonationById = async (id) => {
    const query = `
        SELECT id, user_id, campaign_id, amount, payment_status, created_at
        FROM donations
        WHERE id = $1
    `;
    const result = await pool.query(query, [id]);
    return result.rows[0] || null;
};

module.exports = {
    createDonation,
    createDonationWithSession,
    getDonationBySessionId,
    updatePaymentStatus,
    getDonationsByUser,
    getDonationById,
};

