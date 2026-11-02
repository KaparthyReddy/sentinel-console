import type { AlertStatus, Severity, ShipmentStatus } from '@/api/types';
import {
  ALERT_STATUS_LABEL,
  SEVERITY_LABEL,
  SHIPMENT_STATUS_LABEL,
} from '@/utils/severity';
import { Badge, type BadgeTone } from './Badge';

const SEVERITY_TONE: Record<Severity, BadgeTone> = {
  CRITICAL: 'critical',
  HIGH: 'high',
  MEDIUM: 'medium',
  LOW: 'low',
};

const ALERT_STATUS_TONE: Record<AlertStatus, BadgeTone> = {
  OPEN: 'high',
  ACKNOWLEDGED: 'low',
  RESOLVED: 'ok',
};

const SHIPMENT_STATUS_TONE: Record<ShipmentStatus, BadgeTone> = {
  IN_TRANSIT: 'low',
  AT_RISK: 'high',
  DELIVERED: 'ok',
};

export function SeverityBadge({ severity }: { severity: Severity }) {
  return <Badge tone={SEVERITY_TONE[severity]}>{SEVERITY_LABEL[severity]}</Badge>;
}

export function AlertStatusBadge({ status }: { status: AlertStatus }) {
  return (
    <Badge tone={ALERT_STATUS_TONE[status]} outlined>
      {ALERT_STATUS_LABEL[status]}
    </Badge>
  );
}

export function ShipmentStatusBadge({ status }: { status: ShipmentStatus }) {
  return (
    <Badge tone={SHIPMENT_STATUS_TONE[status]} outlined>
      {SHIPMENT_STATUS_LABEL[status]}
    </Badge>
  );
}
