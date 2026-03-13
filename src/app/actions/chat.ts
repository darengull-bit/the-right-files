
'use server';

import { processAssistantChat, type ChatInput } from "@/ai/flows/chat-flow";
import { initializeFirebase } from "@/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { assertWithinPlanLimits } from "@/core/guards/usage-guard";
import { logger } from "@/core/logging/logger";

/**
 * Server Action to handle AI Assistant chat messages.
 * Includes usage enforcement and persistent logging.
 */
export async function sendAssistantMessageAction(
  organizationId: string, 
  userId: string, 
  message: string,
  history: any[] = []
) {
  try {
    // 1. Quota Enforcement (AI usage)
    await assertWithinPlanLimits(organizationId, 'ai');

    const { firestore } = initializeFirebase();

    // 2. Log User Message
    const messagesRef = collection(firestore, `organizations/${organizationId}/chat_messages`);
    await addDoc(messagesRef, {
      role: 'user',
      content: message,
      userId,
      organizationId,
      createdAt: new Date().toISOString()
    });

    // 3. Process with AI
    logger.info({ organizationId, userId }, "AI Assistant: Processing message");
    const result = await processAssistantChat({
      organizationId,
      userId,
      message,
      history
    });

    // 4. Log AI Response
    await addDoc(messagesRef, {
      role: 'assistant',
      content: result.text,
      userId: 'system',
      organizationId,
      createdAt: new Date().toISOString()
    });

    return {
      success: true,
      text: result.text
    };

  } catch (err: any) {
    logger.error({ error: err.message }, "AI Assistant Action Failure");
    return {
      success: false,
      error: err.message || "The assistant is temporarily unavailable."
    };
  }
}
