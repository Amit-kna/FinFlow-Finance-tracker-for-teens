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

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || '';
  const body = await request.text();
  const signature = request.headers.get('stripe-signature') || '';

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message);
    return NextResponse.json({ error: 'Webhook error' }, { status: 400 });
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.userId;
        const subscriptionId = session.subscription as string;

        console.log('[Stripe Webhook] checkout.session.completed - userId:', userId, 'subscriptionId:', subscriptionId);
        console.log('[Stripe Webhook] supabaseAdmin available:', !!supabaseAdmin);

        if (!supabaseAdmin) {
          console.error('[Stripe Webhook] supabaseAdmin is null - check SUPABASE_SERVICE_ROLE_KEY');
        }

        if (userId && supabaseAdmin) {
          const userResult = await supabaseAdmin.from('users').update({ is_pro: true }).eq('id', userId).select();
          console.log('[Stripe Webhook] User update result:', userResult);

          const subResult = await supabaseAdmin.from('subscriptions').upsert({
            user_id: userId,
            status: 'active',
            plan: 'pro',
            price: 2.99,
            started_at: new Date().toISOString(),
            stripe_subscription_id: subscriptionId,
          }, { onConflict: 'user_id' }).select();
          console.log('[Stripe Webhook] Subscription upsert result:', subResult);
        } else {
          console.error('[Stripe Webhook] Skipping DB update - userId:', userId, 'supabaseAdmin:', !!supabaseAdmin);
        }
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        const userId = subscription.metadata?.userId;

        console.log('[Stripe Webhook] customer.subscription.updated - userId:', userId, 'status:', subscription.status);

        if (!supabaseAdmin) {
          console.error('[Stripe Webhook] supabaseAdmin is null');
        }

        if (userId && supabaseAdmin) {
          const status = subscription.status === 'active' ? 'active' : 
                         subscription.status === 'past_due' ? 'active' : 
                         subscription.status === 'canceled' ? 'cancelled' : 'expired';

          await supabaseAdmin.from('subscriptions')
            .update({ status, expires_at: (subscription as any).current_period_end ? new Date((subscription as any).current_period_end * 1000).toISOString() : null })
            .eq('stripe_subscription_id', subscription.id);

          if (status === 'cancelled' || status === 'expired') {
            await supabaseAdmin.from('users').update({ is_pro: false }).eq('id', userId);
          }
          console.log('[Stripe Webhook] Subscription updated to:', status);
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        const userId = subscription.metadata?.userId;

        console.log('[Stripe Webhook] customer.subscription.deleted - userId:', userId);

        if (userId && supabaseAdmin) {
          await supabaseAdmin.from('subscriptions')
            .update({ status: 'cancelled', expires_at: new Date().toISOString() })
            .eq('stripe_subscription_id', subscription.id);
          await supabaseAdmin.from('users').update({ is_pro: false }).eq('id', userId);
          console.log('[Stripe Webhook] Subscription cancelled for user:', userId);
        }
        break;
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook handler error:', error);
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 });
  }
}
