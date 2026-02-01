const pool = require('../config/db');

/**
 * Create a new user
 * @param {string} name - User's name
 * @param {string} email - User's email (unique)
 * @param {string} passwordHash - Hashed password
 * @param {string} role - User role ('admin' or 'donor')
 * @returns {Promise<Object>} Created user object
 */
const createUser = async (name, email, passwordHash, role = 'donor') => {
    const query = `
        INSERT INTO users (name, email, password_hash, role)
        VALUES ($1, $2, $3, $4)
        RETURNING id, name, email, role, created_at
    `;
    const values = [name, email, passwordHash, role];
    const result = await pool.query(query, values);
    return result.rows[0];
};

/**
 * Find user by email
 * @param {string} email - User's email
 * @returns {Promise<Object|null>} User object or null
 */
const findByEmail = async (email) => {
    const query = `
        SELECT id, name, email, password_hash, role, created_at
        FROM users
        WHERE email = $1
    `;
    const result = await pool.query(query, [email]);
    return result.rows[0] || null;
};

/**
 * Find user by ID
 * @param {number} id - User's ID
 * @returns {Promise<Object|null>} User object or null
 */
const findById = async (id) => {
    const query = `
        SELECT id, name, email, role, created_at
        FROM users
        WHERE id = $1
    `;
    const result = await pool.query(query, [id]);
    return result.rows[0] || null;
};

module.exports = {
    createUser,
    findByEmail,
    findById,
};
