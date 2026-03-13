'use server';

import { initializeFirebase } from "@/firebase";
import { doc, getDoc } from "firebase/firestore";

/**
 * @fileOverview Billing Guard.
 * Enforces Stripe subscription status for premium features.
 */

export async function assertActiveSubscription(organizationId: string) {
  const { firestore } = initializeFirebase();
  const orgRef = doc(firestore, "organizations", organizationId);
  const orgSnap = await getDoc(orgRef);

  if (!orgSnap.exists()) {
    throw new Error("Organization not found.");
  }

  const data = orgSnap.data();
  const status = data.billing_status || 'active';

  if (status !== 'active') {
    throw new Error(`Access restricted: Your subscription is currently ${status.replace('_', ' ')}.`);
  }

  return true;
}
