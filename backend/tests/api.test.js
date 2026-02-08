const request = require('supertest');
const express = require('express');
const jwt = require('jsonwebtoken');

// Set test environment - MUST be before loading routes
process.env.JWT_SECRET = 'test-secret-key-for-testing';
process.env.STRIPE_SECRET_KEY = 'sk_test_fake';

// Create mock app with routes
const app = express();
app.use(express.json());

// Import routes
const campaignRoutes = require('../src/routes/campaignRoutes');
const authRoutes = require('../src/routes/authRoutes');
const donationRoutes = require('../src/routes/donationRoutes');
const uploadRoutes = require('../src/routes/uploadRoutes');
const adminRoutes = require('../src/routes/adminRoutes');

// Mount routes
app.use('/campaigns', campaignRoutes);
app.use('/auth', authRoutes);
app.use('/donations', donationRoutes);
app.use('/upload', uploadRoutes);
app.use('/admin', adminRoutes);

// Helper to generate tokens
const generateToken = (payload) => {
    return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });
};

const adminToken = generateToken({ id: 1, email: 'admin@test.com', role: 'admin' });
const userToken = generateToken({ id: 2, email: 'user@test.com', role: 'donor' });
const invalidToken = 'invalid.token.here';

describe('API Contract Verification', () => {

    // ==========================================
    // AUTH ENDPOINTS - 401/403/200 tests
    // ==========================================
    describe('Auth Endpoints', () => {
        it('POST /auth/login should return 400 for missing fields', async () => {
            const res = await request(app)
                .post('/auth/login')
                .send({});

            expect(res.status).toBe(400);
            expect(res.body.success).toBe(false);
        });

        it('POST /auth/register should return 400 for missing fields', async () => {
            const res = await request(app)
                .post('/auth/register')
                .send({});

            expect(res.status).toBe(400);
            expect(res.body.success).toBe(false);
        });
    });

    // ==========================================
    // CAMPAIGN ADMIN ENDPOINTS - 401/403/200 tests
    // ==========================================
    describe('Campaign Admin Endpoints - Security', () => {

        describe('POST /campaigns', () => {
            it('should return 401 without token', async () => {
                const res = await request(app)
                    .post('/campaigns')
                    .send({ title: 'Test', goal_amount: 1000 });

                expect(res.status).toBe(401);
                expect(res.body.success).toBe(false);
                expect(res.body.message).toMatch(/token/i);
            });

            it('should return 401 with invalid token', async () => {
                const res = await request(app)
                    .post('/campaigns')
                    .set('Authorization', `Bearer ${invalidToken}`)
                    .send({ title: 'Test', goal_amount: 1000 });

                expect(res.status).toBe(401);
            });

            it('should return 403 with non-admin token', async () => {
                const res = await request(app)
                    .post('/campaigns')
                    .set('Authorization', `Bearer ${userToken}`)
                    .send({ title: 'Test', goal_amount: 1000 });

                expect(res.status).toBe(403);
                expect(res.body.success).toBe(false);
                expect(res.body.message).toMatch(/admin/i);
            });

            it('should pass auth with admin token (may fail at DB)', async () => {
                const res = await request(app)
                    .post('/campaigns')
                    .set('Authorization', `Bearer ${adminToken}`)
                    .send({ title: 'Test', goal_amount: 1000 });

                // Should NOT be 401 or 403 - auth passed
                expect(res.status).not.toBe(401);
                expect(res.status).not.toBe(403);
            });
        });

        describe('PUT /campaigns/:id', () => {
            it('should return 401 without token', async () => {
                const res = await request(app)
                    .put('/campaigns/1')
                    .send({ title: 'Updated' });

                expect(res.status).toBe(401);
                expect(res.body.success).toBe(false);
            });

            it('should return 403 with non-admin token', async () => {
                const res = await request(app)
                    .put('/campaigns/1')
                    .set('Authorization', `Bearer ${userToken}`)
                    .send({ title: 'Updated' });

                expect(res.status).toBe(403);
                expect(res.body.success).toBe(false);
            });

            it('should pass auth with admin token', async () => {
                const res = await request(app)
                    .put('/campaigns/1')
                    .set('Authorization', `Bearer ${adminToken}`)
                    .send({ title: 'Updated' });

                expect(res.status).not.toBe(401);
                expect(res.status).not.toBe(403);
            });
        });

        describe('DELETE /campaigns/:id', () => {
            it('should return 401 without token', async () => {
                const res = await request(app).delete('/campaigns/1');

                expect(res.status).toBe(401);
                expect(res.body.success).toBe(false);
            });

            it('should return 403 with non-admin token', async () => {
                const res = await request(app)
                    .delete('/campaigns/1')
                    .set('Authorization', `Bearer ${userToken}`);

                expect(res.status).toBe(403);
            });

            it('should pass auth with admin token', async () => {
                const res = await request(app)
                    .delete('/campaigns/1')
                    .set('Authorization', `Bearer ${adminToken}`);

                expect(res.status).not.toBe(401);
                expect(res.status).not.toBe(403);
            });
        });
    });

    // ==========================================
    // DONATION HISTORY - 401/200 tests
    // ==========================================
    describe('Donation History Endpoint', () => {
        it('GET /donations/my-donations should return 401 without token', async () => {
            const res = await request(app).get('/donations/my-donations');

            expect(res.status).toBe(401);
            expect(res.body.success).toBe(false);
        });

        it('GET /donations/my-donations should pass with any valid token', async () => {
            const res = await request(app)
                .get('/donations/my-donations')
                .set('Authorization', `Bearer ${userToken}`);

            // Auth passed - may fail at DB but not 401
            expect(res.status).not.toBe(401);
        });
    });

    // ==========================================
    // UPLOAD - 401/200 tests
    // ==========================================
    describe('Upload Endpoint', () => {
        it('POST /upload should return 401 without token', async () => {
            const res = await request(app).post('/upload');

            expect(res.status).toBe(401);
        });
    });

    // ==========================================
    // ADMIN ENDPOINTS - 401/403/200 tests
    // ==========================================
    describe('Admin Endpoints', () => {
        it('GET /admin/stats should return 401 without token', async () => {
            const res = await request(app).get('/admin/stats');

            expect(res.status).toBe(401);
        });

        it('GET /admin/stats should return 403 with non-admin token', async () => {
            const res = await request(app)
                .get('/admin/stats')
                .set('Authorization', `Bearer ${userToken}`);

            expect(res.status).toBe(403);
        });

        it('GET /admin/donations should return 401 without token', async () => {
            const res = await request(app).get('/admin/donations');

            expect(res.status).toBe(401);
        });

        it('GET /admin/donations should return 403 with non-admin token', async () => {
            const res = await request(app)
                .get('/admin/donations')
                .set('Authorization', `Bearer ${userToken}`);

            expect(res.status).toBe(403);
        });
    });

    // ==========================================
    // RESPONSE SHAPE CONSISTENCY
    // ==========================================
    describe('Response Shape Consistency', () => {
        it('Error responses should have {success: false, message}', async () => {
            const res = await request(app).post('/auth/login').send({});

            expect(res.body).toHaveProperty('success', false);
            expect(res.body).toHaveProperty('message');
        });
    });
});
