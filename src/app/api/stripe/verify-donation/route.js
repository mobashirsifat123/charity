import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripeSecretKey = process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder';
const stripe = new Stripe(stripeSecretKey);

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co",
    process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder_key'
);

export async function POST(req) {
    try {
        const body = await req.json();
        const { sessionId } = body;

        if (!sessionId) {
            return NextResponse.json({ success: false, message: 'Session ID is required.' }, { status: 400 });
        }

        if (!stripeSecretKey.startsWith('sk_') || stripeSecretKey.includes('placeholder')) {
            return NextResponse.json(
                {
                    success: false,
                    message: 'Stripe verification is not configured in this environment yet.',
                },
                { status: 503 }
            );
        }

        // Fetch session from Stripe directly
        const session = await stripe.checkout.sessions.retrieve(sessionId);

        if (!session) {
            return NextResponse.json({ success: false, message: 'Invalid session ID' }, { status: 400 });
        }

        const donationId = session.client_reference_id || session.metadata?.donationId;

        if (!donationId) {
            return NextResponse.json({ success: false, message: 'No donation associated with this session' });
        }

        // Fetch donation record
        const { data: donation, error } = await supabase
            .from('donations')
            .select('*')
            .eq('id', donationId)
            .single();

        if (error) throw error;

        // Note: webhooks handle the actual fulfillment/status update. 
        // This route is purely for the UI to display confirmation data quickly.
        
        return NextResponse.json({ success: true, data: donation });
    } catch (error) {
        console.error('Verify donation error:', error);
        if (String(error?.message || '').includes('Invalid API Key')) {
            return NextResponse.json(
                {
                    success: false,
                    message: 'Stripe verification is unavailable because the configured secret key is invalid.',
                },
                { status: 503 }
            );
        }
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}
