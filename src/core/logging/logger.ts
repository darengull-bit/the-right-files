import pino from "pino";

/**
 * DEFINITIVE LOGGER SINGLETON
 * Build-Safe: Prevents console pollution and crashes during CI.
 */

const isBrowser = typeof window !== 'undefined';
const isProduction = process.env.NODE_ENV === 'production';
const isBuild = !isBrowser && (
  process.env.NEXT_PHASE === 'phase-production-build' ||
  process.env.CI === 'true'
);

export const logger = pino({
  level: "info",
  ...(isBrowser || isProduction || isBuild ? {} : {
    transport: {
      target: "pino-pretty",
      options: {
        colorize: true,
        ignore: 'pid,hostname',
        translateTime: 'SYS:standard',
      }
    }
  })
});
