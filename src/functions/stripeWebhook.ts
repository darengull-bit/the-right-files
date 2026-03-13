import { stripe } from '@/lib/stripe';
import { initializeFirebase } from '@/firebase';
import { doc, updateDoc, collection, query, where, getDocs, limit } from 'firebase/firestore';
import { logger } from '@/core/logging/logger';

/**
 * Business logic for handling Stripe events.
 * Triggered by the /api/webhook/stripe endpoint.
 */
export async function handleStripeWebhookEvent(event: any) {
  const { firestore } = initializeFirebase();

  switch (event.type) {
    case 'customer.subscription.updated':
    case 'customer.subscription.deleted': {
      const subscription = event.data.object;
      const orgsRef = collection(firestore, 'organizations');
      const q = query(orgsRef, where('stripeSubscriptionId', '==', subscription.id), limit(1));
      const querySnap = await getDocs(q);

      if (!querySnap.empty) {
        const orgRef = querySnap.docs[0].ref;
        let status: 'active' | 'past_due' | 'canceled' = 'active';
        
        if (subscription.status === 'past_due' || subscription.status === 'unpaid') {
          status = 'past_due';
        } else if (subscription.status === 'canceled') {
          status = 'canceled';
        }

        await updateDoc(orgRef, {
          billing_status: status,
          updatedAt: new Date().toISOString(),
        });
        
        logger.info({ orgId: orgRef.id, status }, "StripeWebhook: Updated billing status");
      }
      break;
    }
    
    default:
      logger.debug({ type: event.type }, "StripeWebhook: Unhandled event type");
  }
}
