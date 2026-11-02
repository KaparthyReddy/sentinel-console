import { ROLES, type Role } from '@/api/types';

export type Permission = 'alerts:update' | 'thresholds:view' | 'thresholds:edit';

const GRANTS: Record<Role, readonly Permission[]> = {
  ADMIN: ['alerts:update', 'thresholds:view', 'thresholds:edit'],
  OPERATOR: ['alerts:update'],
  VIEWER: [],
};

export function can(role: Role, permission: Permission): boolean {
  return GRANTS[role].includes(permission);
}

export function isRole(value: unknown): value is Role {
  return typeof value === 'string' && (ROLES as readonly string[]).includes(value);
}
