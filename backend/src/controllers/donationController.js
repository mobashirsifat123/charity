const donationModel = require('../models/donationModel');
const campaignModel = require('../models/campaignModel');

/**
 * Process a donation
 * POST /donations
 */
const processDonation = async (req, res) => {
    try {
        const { campaign_id, amount } = req.body;
        const userId = req.user.id; // From JWT token

        // Validate required fields
        if (!campaign_id || !amount) {
            return res.status(400).json({
                success: false,
                message: 'Campaign ID and amount are required.',
            });
        }

        // Validate amount
        const donationAmount = parseFloat(amount);
        if (isNaN(donationAmount) || donationAmount <= 0) {
            return res.status(400).json({
                success: false,
                message: 'Donation amount must be a positive number.',
            });
        }

        // Check if campaign exists
        const campaign = await campaignModel.getCampaignById(parseInt(campaign_id));
        if (!campaign) {
            return res.status(404).json({
                success: false,
                message: 'Campaign not found.',
            });
        }

        // Create donation record
        const donation = await donationModel.createDonation(
            userId,
            parseInt(campaign_id),
            donationAmount
        );

        // Simulate payment processing (in production, integrate with payment gateway)
        // For now, mark as completed and update campaign raised amount
        await donationModel.updatePaymentStatus(donation.id, 'completed');
        await campaignModel.updateRaisedAmount(parseInt(campaign_id), donationAmount);

        return res.status(201).json({
            success: true,
            message: 'Donation processed successfully.',
            data: {
                donation_id: donation.id,
                amount: donationAmount,
                campaign_id: campaign_id,
                payment_status: 'completed',
                created_at: donation.created_at,
            },
        });
    } catch (error) {
        console.error('Process donation error:', error);
        return res.status(500).json({
            success: false,
            message: 'An error occurred while processing the donation.',
        });
    }
};

/**
 * Get user's donation history
 * GET /donations/my-donations
 */
const getMyDonations = async (req, res) => {
    try {
        const userId = req.user.id;

        const donations = await donationModel.getDonationsByUser(userId);

        return res.status(200).json({
            success: true,
            message: 'Donations retrieved successfully.',
            data: donations,
        });
    } catch (error) {
        console.error('Get donations error:', error);
        return res.status(500).json({
            success: false,
            message: 'An error occurred while fetching donations.',
        });
    }
};

module.exports = {
    processDonation,
    getMyDonations,
};
