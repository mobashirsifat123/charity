import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder');

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

export async function POST(req) {
    const rawBody = await req.text();
    const sig = req.headers.get('stripe-signature');

    let event;

    try {
        // You should set STRIPE_WEBHOOK_SECRET in production config
        const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
        if (webhookSecret && sig) {
            event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret);
        } else {
            // Unverified local development bypass if no webhook secret is set
            event = JSON.parse(rawBody);
        }
    } catch (err) {
        console.error('Webhook signature verification failed:', err);
        return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
    }

    if (event.type === 'checkout.session.completed') {
        const session = event.data.object;
        const donationId = session.client_reference_id || session.metadata?.donationId;
        const campaignId = session.metadata?.campaignId;

        if (donationId) {
            // Update donation status to completed
            await supabase
                .from('donations')
                .update({ payment_status: 'completed', stripe_session_id: session.id })
                .eq('id', donationId);

            // Update campaign raised amount natively
            if (campaignId) {
                const { data: campaign } = await supabase
                    .from('campaigns')
                    .select('raised_amount')
                    .eq('id', campaignId)
                    .single();

                if (campaign) {
                    const newAmount = Number(campaign.raised_amount || 0) + Number(session.amount_total / 100);
                    await supabase
                        .from('campaigns')
                        .update({ raised_amount: newAmount })
                        .eq('id', campaignId);
                }
            }
        }
    }

    return NextResponse.json({ received: true });
}
