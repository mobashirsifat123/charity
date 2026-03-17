import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder');

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co",
    process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder_key'
);

export async function POST(req) {
    try {
        const body = await req.json();
        const { amount, campaignTitle, campaignId, userEmail, userName, userId } = body;

        // 1. Insert pending donation into Supabase using Service Role
        const { data: donation, error: insertError } = await supabase
            .from('donations')
            .insert({
                campaign_id: campaignId,
                donor_id: userId || null,
                donor_name: userName || 'Anonymous',
                donor_email: userEmail || 'anonymous@example.com',
                amount: amount,
                payment_status: 'pending',
                campaign_title: campaignTitle
            })
            .select()
            .single();

        if (insertError) throw insertError;

        // 2. Create Stripe Checkout Session
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [
                {
                    price_data: {
                        currency: 'usd',
                        product_data: {
                            name: `Donation to ${campaignTitle}`,
                        },
                        unit_amount: Math.round(amount * 100), // Stripe expects cents
                    },
                    quantity: 1,
                },
            ],
            mode: 'payment',
            success_url: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/donation/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/cause-details/${campaignId}`,
            client_reference_id: donation.id.toString(),
            metadata: {
                donationId: donation.id,
                campaignId: campaignId
            }
        });

        return NextResponse.json({ success: true, url: session.url });
    } catch (error) {
        console.error('Stripe session error:', error);
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}
