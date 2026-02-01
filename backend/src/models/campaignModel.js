const pool = require('../config/db');

/**
 * Get campaigns with search, filter, and pagination
 * @param {Object} options - Query options
 * @param {string} options.search - Search term for title/description
 * @param {string} options.category - Category filter
 * @param {number} options.page - Page number (1-indexed)
 * @param {number} options.limit - Items per page
 * @returns {Promise<Object>} { campaigns, totalPages, currentPage, total }
 */
const getCampaignsWithFilters = async ({ search = '', category = '', page = 1, limit = 6 }) => {
    const offset = (page - 1) * limit;
    const params = [];
    let whereConditions = [];
    let paramIndex = 1;

    // Search filter (case-insensitive)
    if (search && search.trim()) {
        whereConditions.push(`(LOWER(title) LIKE LOWER($${paramIndex}) OR LOWER(description) LIKE LOWER($${paramIndex}))`);
        params.push(`%${search.trim()}%`);
        paramIndex++;
    }

    // Category filter
    if (category && category.trim() && category !== 'all') {
        whereConditions.push(`category = $${paramIndex}`);
        params.push(category.trim());
        paramIndex++;
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

    // Count total matching campaigns
    const countQuery = `SELECT COUNT(*) FROM campaigns ${whereClause}`;
    const countResult = await pool.query(countQuery, params);
    const total = parseInt(countResult.rows[0].count);
    const totalPages = Math.ceil(total / limit);

    // Get paginated campaigns
    const dataQuery = `
        SELECT id, title, description, goal_amount, raised_amount, image_url, category, created_at
        FROM campaigns
        ${whereClause}
        ORDER BY created_at DESC
        LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;
    params.push(limit, offset);

    const dataResult = await pool.query(dataQuery, params);

    return {
        campaigns: dataResult.rows,
        totalPages,
        currentPage: page,
        total,
    };
};

/**
 * Get all campaigns (backward compatibility)
 * @returns {Promise<Array>} Array of campaign objects
 */
const getAllCampaigns = async () => {
    const query = `
        SELECT id, title, description, goal_amount, raised_amount, image_url, category, created_at
        FROM campaigns
        ORDER BY created_at DESC
    `;
    const result = await pool.query(query);
    return result.rows;
};

/**
 * Get all unique categories
 * @returns {Promise<Array>} Array of category strings
 */
const getCategories = async () => {
    const query = `
        SELECT DISTINCT category 
        FROM campaigns 
        WHERE category IS NOT NULL AND category != ''
        ORDER BY category
    `;
    const result = await pool.query(query);
    return result.rows.map(row => row.category);
};

/**
 * Get campaign by ID
 * @param {number} id - Campaign ID
 * @returns {Promise<Object|null>} Campaign object or null
 */
const getCampaignById = async (id) => {
    const query = `
        SELECT id, title, description, goal_amount, raised_amount, image_url, category, created_at
        FROM campaigns
        WHERE id = $1
    `;
    const result = await pool.query(query, [id]);
    return result.rows[0] || null;
};

/**
 * Create a new campaign
 * @param {string} title - Campaign title
 * @param {string} description - Campaign description
 * @param {number} goalAmount - Fundraising goal
 * @param {string} imageUrl - Optional image URL
 * @param {string} category - Campaign category
 * @returns {Promise<Object>} Created campaign object
 */
const createCampaign = async (title, description, goalAmount, imageUrl = null, category = null) => {
    const query = `
        INSERT INTO campaigns (title, description, goal_amount, image_url, category)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING id, title, description, goal_amount, raised_amount, image_url, category, created_at
    `;
    const values = [title, description, goalAmount, imageUrl, category];
    const result = await pool.query(query, values);
    return result.rows[0];
};

/**
 * Update raised amount for a campaign
 * @param {number} campaignId - Campaign ID
 * @param {number} amount - Amount to add to raised_amount
 * @returns {Promise<Object>} Updated campaign object
 */
const updateRaisedAmount = async (campaignId, amount) => {
    const query = `
        UPDATE campaigns
        SET raised_amount = raised_amount + $2
        WHERE id = $1
        RETURNING id, title, raised_amount, goal_amount
    `;
    const result = await pool.query(query, [campaignId, amount]);
    return result.rows[0];
};

module.exports = {
    getAllCampaigns,
    getCampaignsWithFilters,
    getCategories,
    getCampaignById,
    createCampaign,
    updateRaisedAmount,
};
