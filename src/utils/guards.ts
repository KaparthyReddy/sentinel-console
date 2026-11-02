import {
  ALERT_STATUSES,
  SEVERITIES,
  SHIPMENT_STATUSES,
  type AlertStatus,
  type Severity,
  type ShipmentStatus,
} from '@/api/types';

/** Narrow a <select> value (always a string) back to the app's union types. */
export const isSeverity = (value: string): value is Severity =>
  (SEVERITIES as readonly string[]).includes(value);

export const isAlertStatus = (value: string): value is AlertStatus =>
  (ALERT_STATUSES as readonly string[]).includes(value);

export const isShipmentStatus = (value: string): value is ShipmentStatus =>
  (SHIPMENT_STATUSES as readonly string[]).includes(value);
