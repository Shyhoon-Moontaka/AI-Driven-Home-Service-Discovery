import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
  const stripePublishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
  
  return NextResponse.json({
    hasStripeSecretKey: !!stripeSecretKey,
    hasStripePublishableKey: !!stripePublishableKey,
    stripeSecretKeyLength: stripeSecretKey ? stripeSecretKey.length : 0,
    stripePublishableKeyLength: stripePublishableKey ? stripePublishableKey.length : 0,
    env: process.env.NODE_ENV,
  });
}