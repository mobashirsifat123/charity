require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

// Import routes
const authRoutes = require('./src/routes/authRoutes');
const campaignRoutes = require('./src/routes/campaignRoutes');
const donationRoutes = require('./src/routes/donationRoutes');
const adminRoutes = require('./src/routes/adminRoutes');
const uploadRoutes = require('./src/routes/uploadRoutes');
const stripeRoutes = require('./src/routes/stripeRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Serve uploaded files statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Health check route
app.get('/', (req, res) => {
    res.json({
        success: true,
        message: 'Charity Crowdfunding API is running!',
        version: '1.0.0',
        endpoints: {
            auth: '/auth',
            campaigns: '/campaigns',
            donations: '/donations',
            admin: '/admin',
            upload: '/upload',
            stripe: '/stripe',
        },
    });
});

// Mount routes
app.use('/auth', authRoutes);
app.use('/campaigns', campaignRoutes);
app.use('/donations', donationRoutes);
app.use('/admin', adminRoutes);
app.use('/upload', uploadRoutes);
app.use('/stripe', stripeRoutes);

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route not found.',
    });
});

// Global error handler
app.use((err, req, res, next) => {
    console.error('Global error:', err);
    res.status(500).json({
        success: false,
        message: 'Internal server error.',
    });
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
    console.log('Available endpoints:');
    console.log('  POST /auth/register - Register new user');
    console.log('  POST /auth/login - Login user');
    console.log('  GET  /campaigns - Get all campaigns');
    console.log('  POST /campaigns - Create campaign (admin)');
    console.log('  POST /donations - Process donation');
});