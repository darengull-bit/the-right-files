import client from 'prom-client';

const isBuild = typeof window === 'undefined' && process.env.NODE_ENV === 'production';

const register = new client.Registry();

if (!isBuild && typeof window === 'undefined') {
  try {
    register.setDefaultLabels({ app: 'agentpro-api' });
    client.collectDefaultMetrics({ register });
  } catch (err) {
    // Silent fail during build
  }
}

export const httpRequestDuration = new client.Histogram({
  name: "http_request_duration_seconds",
  help: "Duration of HTTP requests",
  labelNames: ["method", "route", "status"],
  registers: [register]
});

export { register };
