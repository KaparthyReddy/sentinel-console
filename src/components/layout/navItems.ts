import type { Permission } from '@/auth/permissions';

export interface NavItem {
  to: string;
  label: string;
  /** Match the path exactly (needed for "/"). */
  end?: boolean;
  /** Only show this item to roles that hold this permission. */
  permission?: Permission;
}

export const NAV_ITEMS: ReadonlyArray<NavItem> = [
  { to: '/', label: 'Dashboard', end: true },
  { to: '/shipments', label: 'Shipments' },
  { to: '/alerts', label: 'Alerts' },
  { to: '/thresholds', label: 'Thresholds', permission: 'thresholds:view' },
];
