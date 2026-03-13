
/**
 * @fileOverview Webhook Dispatcher Utility.
 * 
 * Provides logic to broadcast events to an organization's registered webhook endpoints.
 * Implements HMAC SHA-256 signatures for payload verification.
 */

import { initializeFirebase } from '@/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { webhookQueue } from './queues';
import { logger } from './logger';

export interface WebhookPayload {
  event: string;
  organizationId: string;
  timestamp: string;
  data: any;
}

/**
 * Enqueues webhook delivery tasks for all active endpoints of an organization
 * that are subscribed to the specific event type.
 * 
 * @param organizationId - The ID of the organization triggering the event.
 * @param event - The event name (e.g., 'SEO_AUDIT_COMPLETED').
 * @param data - The payload data associated with the event.
 */
export async function triggerWebhooks(organizationId: string, event: string, data: any) {
  const { firestore } = initializeFirebase();
  
  const endpointsRef = collection(firestore, 'organizations', organizationId, 'webhookEndpoints');
  // Filter by active status
  const q = query(endpointsRef, where('active', '==', true));

  try {
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      return { success: true, message: 'No active webhooks found.' };
    }

    const payload: WebhookPayload = {
      event,
      organizationId,
      timestamp: new Date().toISOString(),
      data
    };

    const deliveryPromises = [];

    for (const doc of querySnapshot.docs) {
      const endpoint = doc.data();
      
      // If eventTypes is defined, only deliver if it contains the current event
      if (endpoint.eventTypes && endpoint.eventTypes.length > 0) {
        if (!endpoint.eventTypes.includes(event)) {
          continue; 
        }
      }

      // Add delivery job to the persistent queue
      deliveryPromises.push(
        webhookQueue.add("deliver", {
          url: endpoint.url,
          secret: endpoint.secret,
          payload
        }, {
          attempts: 5,
          backoff: { 
            type: "exponential", 
            delay: 5000 
          }
        })
      );
    }

    const jobs = await Promise.all(deliveryPromises);
    
    logger.info({ 
      organizationId, 
      event, 
      endpointCount: jobs.length 
    }, "Webhook delivery jobs successfully queued");

    return { success: true, queuedJobs: jobs.length };
  } catch (err) {
    logger.error({ organizationId, event, error: err }, "Failed to queue webhooks");
    return { success: false, error: 'Failed to retrieve or queue webhooks.' };
  }
}
