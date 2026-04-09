"use server";

import { redirect } from 'next/navigation';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';
import { headers } from 'next/headers';

import { isMissingColumnError } from '@/lib/content-utils';
import { resolveServerSiteUrl } from '@/lib/server/siteUrl';

const stripeSecretKey = process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder';
const stripe = new Stripe(stripeSecretKey);

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder_key'
);

const parseAmount = (value) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

export async function startZakatCheckout(formData) {
  const amount = parseAmount(formData.get('zakatAmount'));
  const zakatableWealth = parseAmount(formData.get('zakatableWealth'));
  const donorEmail = String(formData.get('donorEmail') || '').trim();
  const donorName = String(formData.get('donorName') || '').trim() || 'IRWA Member';
  const donorId = formData.get('donorId') ? String(formData.get('donorId')) : null;
  const currency = String(formData.get('currency') || 'GBP').trim().toLowerCase();

  if (!donorEmail) {
    throw new Error('Please log in before paying your zakat.');
  }

  if (amount < 1) {
    throw new Error('Your zakat due must be at least 1.00 before checkout.');
  }

  if (!stripeSecretKey.startsWith('sk_') || stripeSecretKey.includes('placeholder')) {
    throw new Error('Stripe is not configured in this environment yet.');
  }

  const requestHeaders = await headers();
  const siteUrl = resolveServerSiteUrl({
    headers: {
      get: (key) => requestHeaders.get(key),
    },
  });

  const baseDonationPayload = {
    campaign_id: null,
    donor_id: donorId || null,
    donor_name: donorName,
    donor_email: donorEmail,
    amount,
    payment_status: 'pending',
  };

  const fullDonationPayload = {
    ...baseDonationPayload,
    campaign_title: 'Zakat Payment',
  };

  let donationResult = await supabase
    .from('donations')
    .insert(fullDonationPayload)
    .select()
    .single();

  if (donationResult.error && isMissingColumnError(donationResult.error)) {
    donationResult = await supabase
      .from('donations')
      .insert(baseDonationPayload)
      .select()
      .single();
  }

  if (donationResult.error) {
    throw donationResult.error;
  }

  const donation = donationResult.data;

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    mode: 'payment',
    line_items: [
      {
        price_data: {
          currency,
          product_data: {
            name: 'IRWA Zakat Payment',
            description: 'Zakat payment calculated through the IRWA zakat calculator.',
          },
          unit_amount: Math.round(amount * 100),
        },
        quantity: 1,
      },
    ],
    success_url: `${siteUrl}/donation/success?session_id={CHECKOUT_SESSION_ID}&currency=${currency}&type=zakat`,
    cancel_url: `${siteUrl}/zakat`,
    client_reference_id: donation.id.toString(),
    metadata: {
      donationId: donation.id.toString(),
      campaignId: '',
      type: 'zakat',
      donorEmail,
      zakatableWealth: zakatableWealth.toFixed(2),
      zakatDue: amount.toFixed(2),
      currency: currency.toUpperCase(),
    },
  });

  redirect(session.url);
}
