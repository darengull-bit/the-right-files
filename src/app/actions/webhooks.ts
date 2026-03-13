'use server';

import { triggerWebhooks as triggerWebhooksLib } from "@/lib/webhooks";

/**
 * Server action wrapper for triggering webhooks from the client.
 */
export async function triggerWebhooks(organizationId: string, event: string, data: any) {
  return triggerWebhooksLib(organizationId, event, data);
}
