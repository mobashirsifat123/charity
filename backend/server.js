const path = require('path');
const dotenv = require('dotenv');
const express = require('express');
const cors = require('cors');
const Sentry = require('@sentry/node');
const { nodeProfilingIntegration } = require('@sentry/profiling-node');

Sentry.init({
  dsn: process.env.SENTRY_DSN || 'https://dummy-dsn@sentry.io/12345',
  integrations: [
    nodeProfilingIntegration(),
  ],
  tracesSampleRate: 1.0,
  profilesSampleRate: 1.0,
});
const helmet = require('helmet');
const { generalLimiter, strictLimiter } = require('./src/middleware/rateLimiter');

dotenv.config({ path: path.resolve(__dirname, '.env') });
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });
dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config();

// Import routes
const authRoutes = require('./src/routes/authRoutes');
const campaignRoutes = require('./src/routes/campaignRoutes');
const donationRoutes = require('./src/routes/donationRoutes');
const adminRoutes = require('./src/routes/adminRoutes');
const uploadRoutes = require('./src/routes/uploadRoutes');
const stripeRoutes = require('./src/routes/stripeRoutes');

const app = express();
const PORT = process.env.PORT || 5050;

Sentry.setupExpressErrorHandler(app);

// Middleware
app.use(helmet());
app.use(cors());
app.use(generalLimiter);
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
app.use('/auth', strictLimiter, authRoutes);
app.use('/campaigns', campaignRoutes);
app.use('/donations', strictLimiter, donationRoutes);
app.use('/admin', adminRoutes);
app.use('/upload', uploadRoutes);
app.use('/stripe', strictLimiter, stripeRoutes);

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
