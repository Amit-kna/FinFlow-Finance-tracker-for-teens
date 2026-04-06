import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(request: Request) {
  const stripeKey = process.env.STRIPE_SECRET_KEY;
  if (!stripeKey) {
    return NextResponse.json({ error: 'Stripe not configured' }, { status: 503 });
  }

  const stripe = new Stripe(stripeKey, {
    apiVersion: '2024-12-18.acacia' as any,
  });

  try {
    const body = await request.json();
    const { userId, userEmail } = body;

    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }

    console.log('[Stripe Activate] Activation request for userId:', userId, 'email:', userEmail);

    // Check if user already has active subscription in DB
    if (supabaseAdmin) {
      const { data: existingSub } = await supabaseAdmin
        .from('subscriptions')
        .select('status')
        .eq('user_id', userId)
        .eq('status', 'active')
        .single();

      if (existingSub) {
        console.log('[Stripe Activate] User already has active subscription in DB:', userId);
        return NextResponse.json({ activated: true, source: 'database' });
      }
    } else {
      console.error('[Stripe Activate] supabaseAdmin is null - check SUPABASE_SERVICE_ROLE_KEY');
    }

    // Method 1: Check Stripe for active subscriptions with userId in metadata
    const subscriptions = await stripe.subscriptions.list({
      status: 'active',
      limit: 100,
    });

    const userSub = subscriptions.data.find(
      (sub) => sub.metadata?.userId === userId
    );

    if (userSub && supabaseAdmin) {
      await supabaseAdmin.from('users').update({ is_pro: true }).eq('id', userId);
      await supabaseAdmin.from('subscriptions').upsert({
        user_id: userId,
        status: 'active',
        plan: 'pro',
        price: 2.99,
        started_at: new Date().toISOString(),
        stripe_subscription_id: userSub.id,
        stripe_customer_id: userSub.customer as string,
        expires_at: new Date((userSub as any).current_period_end * 1000).toISOString(),
      }, { onConflict: 'user_id' });

      console.log('[Stripe Activate] Pro activated via subscription metadata for user:', userId);
      return NextResponse.json({ activated: true, source: 'stripe_subscription_metadata' });
    }

    // Method 2: Check for completed checkout sessions by customer ID
    // First get customer from subscriptions, then check sessions
    if (userEmail && userSub) {
      // We already found a subscription, try to get checkout sessions
      // This method is handled by the subscription lookup above
    }

    // Method 3: Check all subscriptions (including non-active) by metadata
    const allSubscriptions = await stripe.subscriptions.list({
      limit: 100,
    });

    const anyUserSub = allSubscriptions.data.find(
      sub => sub.metadata?.userId === userId
    );

    if (anyUserSub && supabaseAdmin) {
      await supabaseAdmin.from('users').update({ is_pro: true }).eq('id', userId);
      await supabaseAdmin.from('subscriptions').upsert({
        user_id: userId,
        status: 'active',
        plan: 'pro',
        price: 2.99,
        started_at: new Date().toISOString(),
        stripe_subscription_id: anyUserSub.id,
        stripe_customer_id: anyUserSub.customer as string,
        expires_at: new Date((anyUserSub as any).current_period_end * 1000).toISOString(),
      }, { onConflict: 'user_id' });

      console.log('[Stripe Activate] Pro activated via any subscription record for user:', userId);
      return NextResponse.json({ activated: true, source: 'stripe_any_subscription' });
    }

    console.log('[Stripe Activate] No active subscription found for user:', userId, 'email:', userEmail);
    return NextResponse.json({
      activated: false,
      message: 'No active subscription found. Webhook may not have fired yet.'
    });
  } catch (error: any) {
    console.error('[Stripe Activate] Error:', error.message);
    console.error('[Stripe Activate] Stack:', error.stack);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
