import { SEVERITIES, type AlertStatus, type Severity, type ShipmentStatus } from '@/api/types';

export { SEVERITIES };

const RANK: Record<Severity, number> = { CRITICAL: 4, HIGH: 3, MEDIUM: 2, LOW: 1 };

export function severityRank(severity: Severity): number {
  return RANK[severity];
}

/** Comparator: most severe first. */
export function compareSeverityDesc(a: Severity, b: Severity): number {
  return RANK[b] - RANK[a];
}

export const SEVERITY_LABEL: Record<Severity, string> = {
  CRITICAL: 'Critical',
  HIGH: 'High',
  MEDIUM: 'Medium',
  LOW: 'Low',
};

export const ALERT_STATUS_LABEL: Record<AlertStatus, string> = {
  OPEN: 'Open',
  ACKNOWLEDGED: 'Acknowledged',
  RESOLVED: 'Resolved',
};

export const SHIPMENT_STATUS_LABEL: Record<ShipmentStatus, string> = {
  IN_TRANSIT: 'In transit',
  AT_RISK: 'At risk',
  DELIVERED: 'Delivered',
};
