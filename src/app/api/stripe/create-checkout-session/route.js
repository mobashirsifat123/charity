import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';
import { isMissingColumnError } from '@/lib/content-utils';

const stripeSecretKey = process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder';
const stripe = new Stripe(stripeSecretKey);

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co",
    process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder_key'
);

export async function POST(req) {
    try {
        const body = await req.json();
        const { amount, campaignTitle, campaignId, userEmail, userName, userId, successUrl, cancelUrl } = body;

        if (!amount || Number(amount) < 1) {
            return NextResponse.json({ success: false, message: 'A valid donation amount is required.' }, { status: 400 });
        }

        if (!stripeSecretKey.startsWith('sk_') || stripeSecretKey.includes('placeholder')) {
            return NextResponse.json(
                {
                    success: false,
                    message: 'Stripe is not configured in this environment. Add a valid STRIPE_SECRET_KEY before testing checkout.',
                },
                { status: 503 }
            );
        }

        // 1. Insert pending donation into Supabase using Service Role
        const baseDonationPayload = {
            campaign_id: campaignId || null,
            donor_id: userId || null,
            donor_name: userName || 'Anonymous',
            donor_email: userEmail || 'anonymous@example.com',
            amount: amount,
            payment_status: 'pending',
        };

        const fullDonationPayload = {
            ...baseDonationPayload,
            campaign_title: campaignTitle || 'General Donation',
        };

        let donationQuery = await supabase
            .from('donations')
            .insert(fullDonationPayload)
            .select()
            .single();

        if (donationQuery.error && isMissingColumnError(donationQuery.error)) {
            donationQuery = await supabase
                .from('donations')
                .insert(baseDonationPayload)
                .select()
                .single();
        }

        if (donationQuery.error) {
            if (isMissingColumnError(donationQuery.error)) {
                return NextResponse.json(
                    {
                        success: false,
                        message: 'Donation storage is not fully configured yet. Please update the Supabase schema before testing checkout.',
                    },
                    { status: 503 }
                );
            }
            throw donationQuery.error;
        }

        const donation = donationQuery.data;

        // 2. Create Stripe Checkout Session
        const defaultSiteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
        const normalizedSuccessUrl = successUrl
            ? `${successUrl}?session_id={CHECKOUT_SESSION_ID}`
            : `${defaultSiteUrl}/donation/success?session_id={CHECKOUT_SESSION_ID}`;
        const normalizedCancelUrl = cancelUrl || (campaignId
            ? `${defaultSiteUrl}/cause-details/${campaignId}`
            : `${defaultSiteUrl}/donation`);

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [
                {
                    price_data: {
                        currency: 'usd',
                        product_data: {
                            name: `Donation to ${campaignTitle || 'IRWA'}`,
                        },
                        unit_amount: Math.round(amount * 100), // Stripe expects cents
                    },
                    quantity: 1,
                },
            ],
            mode: 'payment',
            success_url: normalizedSuccessUrl,
            cancel_url: normalizedCancelUrl,
            client_reference_id: donation.id.toString(),
            metadata: {
                donationId: donation.id,
                campaignId: campaignId || ''
            }
        });

        return NextResponse.json({ success: true, url: session.url });
    } catch (error) {
        console.error('Stripe session error:', error);
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}
