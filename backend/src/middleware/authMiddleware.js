const jwt = require('jsonwebtoken');

/**
 * Verify JWT token middleware
 * Extracts token from Authorization header and validates it
 */
const verifyToken = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader) {
            return res.status(401).json({
                success: false,
                message: 'Access denied. No token provided.',
            });
        }

        // Extract token from "Bearer <token>" format
        const token = authHeader.startsWith('Bearer ')
            ? authHeader.slice(7)
            : authHeader;

        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Access denied. Invalid token format.',
            });
        }

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded; // Attach user info to request
        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                message: 'Token has expired.',
            });
        }
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({
                success: false,
                message: 'Invalid token.',
            });
        }
        return res.status(500).json({
            success: false,
            message: 'Failed to authenticate token.',
        });
    }
};

/**
 * Require admin role middleware
 * Must be used after verifyToken
 */
const requireAdmin = (req, res, next) => {
    try {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required.',
            });
        }

        if (req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Access denied. Admin privileges required.',
            });
        }

        next();
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Authorization check failed.',
        });
    }
};

module.exports = {
    verifyToken,
    requireAdmin,
};
