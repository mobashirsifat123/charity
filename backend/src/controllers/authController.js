const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const userModel = require('../models/userModel');

const SALT_ROUNDS = 10;

/**
 * Register a new user
 * POST /auth/register
 */
const register = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;

        // Validate required fields
        if (!name || !email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Name, email, and password are required.',
            });
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid email format.',
            });
        }

        // Validate password length
        if (password.length < 6) {
            return res.status(400).json({
                success: false,
                message: 'Password must be at least 6 characters long.',
            });
        }

        // Check if user already exists
        const existingUser = await userModel.findByEmail(email);
        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: 'A user with this email already exists.',
            });
        }

        // Hash password
        const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

        // Validate role (only allow 'donor' during registration; admin must be set manually)
        const userRole = role === 'admin' ? 'admin' : 'donor';

        // Create user
        const newUser = await userModel.createUser(name, email, passwordHash, userRole);

        // Generate JWT token
        const token = jwt.sign(
            {
                id: newUser.id,
                email: newUser.email,
                role: newUser.role,
            },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        return res.status(201).json({
            success: true,
            message: 'User registered successfully.',
            data: {
                user: {
                    id: newUser.id,
                    name: newUser.name,
                    email: newUser.email,
                    role: newUser.role,
                    created_at: newUser.created_at,
                },
                token,
            },
        });
    } catch (error) {
        console.error('Registration error:', error);
        return res.status(500).json({
            success: false,
            message: 'An error occurred during registration.',
        });
    }
};

/**
 * Login user
 * POST /auth/login
 */
const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validate required fields
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Email and password are required.',
            });
        }

        // Find user by email
        const user = await userModel.findByEmail(email);
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password.',
            });
        }

        // Compare passwords
        const isValidPassword = await bcrypt.compare(password, user.password_hash);
        if (!isValidPassword) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password.',
            });
        }

        // Generate JWT token
        const token = jwt.sign(
            {
                id: user.id,
                email: user.email,
                role: user.role,
            },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        return res.status(200).json({
            success: true,
            message: 'Login successful.',
            data: {
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                },
                token,
            },
        });
    } catch (error) {
        console.error('Login error:', error);
        return res.status(500).json({
            success: false,
            message: 'An error occurred during login.',
        });
    }
};

module.exports = {
    register,
    login,
};
