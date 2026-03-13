import { NextRequest, NextResponse } from 'next/server';
import { TenantService } from './tenant.service';
import { logger } from '@/core/logging/logger';

/**
 * @fileOverview Tenancy Context Middleware.
 * 
 * Extracts and validates the tenant (organization) context from 
 * headers or domain names for inbound requests.
 */

const tenantService = new TenantService();

export async function tenancyMiddleware(req: NextRequest) {
  const hostname = req.headers.get('host') || '';
  const headerOrgId = req.headers.get('x-org-id');

  // 1. Check for explicit Organization ID in headers (API use-case)
  if (headerOrgId) {
    const isActive = await tenantService.isTenantActive(headerOrgId);
    if (!isActive) {
      logger.warn({ headerOrgId }, "Request blocked: Inactive or missing tenant");
      return new NextResponse(JSON.stringify({ error: "Invalid organization context" }), {
        status: 403,
        headers: { 'content-type': 'application/json' },
      });
    }
    return NextResponse.next();
  }

  // 2. Handle Custom Domain Resolution (White-labeling use-case)
  // Skip resolution for internal domains
  const internalDomains = ['localhost', 'agentpro.io', 'vercel.app', 'web.app', 'firebaseapp.com'];
  const isInternal = internalDomains.some(d => hostname.includes(d));

  if (!isInternal) {
    const tenant = await tenantService.resolveTenantByDomain(hostname);
    if (!tenant) {
      logger.warn({ hostname }, "Request blocked: Unrecognized custom domain");
      return new NextResponse(JSON.stringify({ error: "Domain not registered" }), {
        status: 404,
        headers: { 'content-type': 'application/json' },
      });
    }
    
    // Attach tenant ID to headers for downstream consumption
    const response = NextResponse.next();
    response.headers.set('x-tenant-id', tenant.id);
    return response;
  }

  return NextResponse.next();
}
