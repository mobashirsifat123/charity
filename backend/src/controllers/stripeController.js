const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

/**
 * Create a Stripe Checkout Session
 * @route POST /stripe/create-checkout-session
 */
const createCheckoutSession = async (req, res) => {
    try {
        const { amount, campaignTitle, campaignId } = req.body;
        const userId = req.user?.id;

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
            success_url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/donation/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/?cancelled=true`,
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
            parseInt(userId),
            parseInt(campaignId),
            parseFloat(amount),
            'completed',
            sessionId
        );

        // Update campaign raised amount
        await campaignModel.updateRaisedAmount(parseInt(campaignId), parseFloat(amount));

        res.status(200).json({
            success: true,
            message: 'Donation verified and recorded successfully',
            data: donation,
        });
    } catch (error) {
        console.error('Verify donation error:', error);
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
