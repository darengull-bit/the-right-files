import { logger } from "@/core/logging/logger";
import { AppModule } from "./app.module";

/**
 * Server Entry Point.
 * HARDENED: Ensures AppModule only boots in valid runtime environments.
 */

const isBrowser = typeof window !== 'undefined';
const isBuild = !isBrowser && (
  process.env.NEXT_PHASE === 'phase-production-build' || 
  !process.env.GOOGLE_API_KEY ||
  process.env.CI === 'true'
);

if (!isBrowser && !isBuild) {
  AppModule.boot()
    .then(() => {
      logger.info("AgentPro Server Online (Production Runtime)");
    })
    .catch((err) => {
      logger.error({ error: err.message }, "AgentPro Runtime Boot Failure");
    });

  const shutdown = async (signal: string) => {
    logger.info({ signal }, "Graceful shutdown initiated...");
    process.exit(0);
  };

  process.on("SIGTERM", () => shutdown("SIGTERM"));
  process.on("SIGINT", () => shutdown("SIGINT"));
}
