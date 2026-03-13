
import { stripe } from '@/lib/stripe';
import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import { initializeFirebase } from '@/firebase';
import { doc, updateDoc, getDoc, collection, query, where, getDocs, limit } from 'firebase/firestore';

export async function POST(req: Request) {
  const body = await req.text();
  const signature = (await headers()).get('stripe-signature') as string;

  if (!stripe || !process.env.STRIPE_WEBHOOK_SECRET) {
    console.error('Stripe configuration missing for webhook.');
    return new NextResponse('Stripe webhook configuration is missing', { status: 400 });
  }

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err: any) {
    return new NextResponse(`Webhook Error: ${err.message}`, { status: 400 });
  }

  const { firestore } = initializeFirebase();

  // 1. Handle Successful Initial Payment
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as any;
    const userId = session.metadata?.userId;

    if (userId) {
      const userRef = doc(firestore, 'users', userId);
      const userSnap = await getDoc(userRef);
      const userData = userSnap.data();

      if (userData?.organizationId) {
        const subscription = await stripe.subscriptions.retrieve(session.subscription);
        const usagePriceId = process.env.NEXT_PUBLIC_STRIPE_USAGE_PRICE_ID || 'price_usage_placeholder';
        const usageItem = subscription.items.data.find(item => item.price.id === usagePriceId);

        const orgRef = doc(firestore, 'organizations', userData.organizationId);
        await updateDoc(orgRef, {
          plan: 'pro',
          billing_status: 'active',
          stripeCustomerId: session.customer,
          stripeSubscriptionId: session.subscription,
          stripeUsageItemId: usageItem?.id || null,
          updatedAt: new Date().toISOString(),
        });

        await updateDoc(userRef, {
          plan: 'pro',
          updatedAt: new Date().toISOString(),
        });
      }
    }
  }

  // 2. Handle Subscription Updates (Status Changes)
  if (event.type === 'customer.subscription.updated') {
    const subscription = event.data.object as any;
    const orgsRef = collection(firestore, 'organizations');
    const q = query(orgsRef, where('stripeSubscriptionId', '==', subscription.id), limit(1));
    const querySnap = await getDocs(q);

    if (!querySnap.empty) {
      const orgRef = querySnap.docs[0].ref;
      let status: 'active' | 'past_due' | 'canceled' = 'active';
      
      if (subscription.status === 'past_due' || subscription.status === 'unpaid') {
        status = 'past_due';
      } else if (subscription.status === 'canceled' || subscription.status === 'incomplete_expired') {
        status = 'canceled';
      }

      await updateDoc(orgRef, {
        billing_status: status,
        updatedAt: new Date().toISOString(),
      });
    }
  }

  // 3. Handle Subscription Deletion
  if (event.type === 'customer.subscription.deleted') {
    const subscription = event.data.object as any;
    const orgsRef = collection(firestore, 'organizations');
    const q = query(orgsRef, where('stripeSubscriptionId', '==', subscription.id), limit(1));
    const querySnap = await getDocs(q);

    if (!querySnap.empty) {
      const orgRef = querySnap.docs[0].ref;
      await updateDoc(orgRef, {
        billing_status: 'canceled',
        plan: 'starter', // Reset to free tier
        updatedAt: new Date().toISOString(),
      });
    }
  }

  return NextResponse.json({ received: true });
}
