
/**
 * @fileOverview Role-Based Access Control (RBAC) Decorators.
 */

export type UserRole = 'platform_admin' | 'org_owner' | 'org_admin' | 'agent_user' | 'readonly_user';

/**
 * Metadata key for storing required roles on routes or methods.
 */
export const ROLES_KEY = 'roles';

/**
 * Decorator helper to specify required roles for an operation.
 * 
 * @param roles - List of allowed roles.
 */
export const Roles = (...roles: UserRole[]) => {
  // In a class-based modular system, this would be used with NestJS @SetMetadata
  // For the AgentPro prototype, we use this as a semantic marker.
  return (target: any, key?: string, descriptor?: any) => {
    if (descriptor) {
      descriptor.roles = roles;
    } else {
      target.roles = roles;
    }
  };
};
