const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { resolveFrontendUrl } = require('../config/siteUrl');
const DB_UNAVAILABLE_MESSAGE = 'Backend database is unavailable. Configure DATABASE_URL (or DB_USER/DB_HOST/DB_NAME/DB_PASSWORD/DB_PORT).';

/**
 * Create a Stripe Checkout Session
 * @route POST /stripe/create-checkout-session
 */
const createCheckoutSession = async (req, res) => {
    try {
        if (!process.env.STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY.includes('placeholder')) {
            return res.status(503).json({
                success: false,
                message: 'Stripe is not configured on the backend.',
            });
        }

        const { amount, campaignTitle, campaignId } = req.body;
        const userId = req.user?.id;
        const frontendUrl = resolveFrontendUrl(req);

        // Validate inputs
        if (!amount || amount <= 0) {
            return res.status(400).json({
                success: false,
                message: 'Invalid donation amount',
            });
        }

        if (!campaignId) {
            return res.status(400).json({
                success: false,
                message: 'Campaign ID is required',
            });
        }

        // Create Stripe Checkout Session
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            mode: 'payment',
            line_items: [
                {
                    price_data: {
                        currency: 'usd',
                        product_data: {
                            name: `Donation: ${campaignTitle || 'Campaign'}`,
                            description: `Supporting ${campaignTitle || 'this campaign'}`,
                        },
                        unit_amount: Math.round(amount * 100), // Convert to cents
                    },
                    quantity: 1,
                },
            ],
            metadata: {
                campaignId: String(campaignId),
                userId: String(userId),
                amount: String(amount),
            },
            success_url: `${frontendUrl}/donation/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${frontendUrl}/?cancelled=true`,
        });

        res.status(200).json({
            success: true,
            data: {
                sessionId: session.id,
                url: session.url,
            },
        });
    } catch (error) {
        console.error('Stripe checkout error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to create checkout session',
        });
    }
};

/**
 * Verify a completed Stripe payment and save donation
 * @route POST /stripe/verify-donation
 */
const verifyDonation = async (req, res) => {
    try {
        if (!process.env.STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY.includes('placeholder')) {
            return res.status(503).json({
                success: false,
                message: 'Stripe is not configured on the backend.',
            });
        }

        const { sessionId } = req.body;

        if (!sessionId) {
            return res.status(400).json({
                success: false,
                message: 'Session ID is required',
            });
        }

        // Retrieve the session from Stripe
        const session = await stripe.checkout.sessions.retrieve(sessionId);

        // Check if payment was successful
        if (session.payment_status !== 'paid') {
            return res.status(400).json({
                success: false,
                message: 'Payment not completed',
                status: session.payment_status,
            });
        }

        // Extract metadata
        const { campaignId, userId, amount } = session.metadata;
        const normalizedCampaignId = String(campaignId || '').trim();
        const normalizedUserId = String(userId || '').trim();
        const parsedAmount = Number(amount);

        if (!normalizedCampaignId || !normalizedUserId || !Number.isFinite(parsedAmount) || parsedAmount <= 0) {
            return res.status(400).json({
                success: false,
                message: 'Donation metadata is invalid or incomplete.',
            });
        }

        // Import models here to avoid circular dependencies
        const donationModel = require('../models/donationModel');
        const campaignModel = require('../models/campaignModel');

        // Check if donation already exists for this session
        const existingDonation = await donationModel.getDonationBySessionId(sessionId);
        if (existingDonation) {
            return res.status(200).json({
                success: true,
                message: 'Donation already recorded',
                data: existingDonation,
            });
        }

        // Create the donation with completed status
        const donation = await donationModel.createDonationWithSession(
            normalizedUserId,
            normalizedCampaignId,
            parsedAmount,
            'completed',
            sessionId
        );

        // Update campaign raised amount
        await campaignModel.updateRaisedAmount(normalizedCampaignId, parsedAmount);

        res.status(200).json({
            success: true,
            message: 'Donation verified and recorded successfully',
            data: donation,
        });
    } catch (error) {
        console.error('Verify donation error:', error);
        if (error?.code === 'DB_NOT_CONFIGURED') {
            return res.status(503).json({
                success: false,
                message: DB_UNAVAILABLE_MESSAGE,
            });
        }
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to verify donation',
        });
    }
};

module.exports = {
    createCheckoutSession,
    verifyDonation,
};
