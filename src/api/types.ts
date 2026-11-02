export const ROLES = ['ADMIN', 'OPERATOR', 'VIEWER'] as const;
export type Role = (typeof ROLES)[number];

export const SEVERITIES = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'] as const;
export type Severity = (typeof SEVERITIES)[number];

export const ALERT_STATUSES = ['OPEN', 'ACKNOWLEDGED', 'RESOLVED'] as const;
export type AlertStatus = (typeof ALERT_STATUSES)[number];

export const SHIPMENT_STATUSES = ['IN_TRANSIT', 'AT_RISK', 'DELIVERED'] as const;
export type ShipmentStatus = (typeof SHIPMENT_STATUSES)[number];

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  username: string;
  role: string;
}

export interface Paged<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}

export interface Shipment {
  id: string;
  reference: string;
  product: string;
  origin: string;
  destination: string;
  status: ShipmentStatus;
  minTempC: number;
  maxTempC: number;
  currentTempC: number;
  lastReadingAt: string;
}

export interface TemperatureReading {
  timestamp: string;
  temperatureC: number;
}

export interface Alert {
  id: string;
  shipmentId: string;
  shipmentRef: string;
  severity: Severity;
  status: AlertStatus;
  temperatureC: number;
  thresholdC: number;
  message: string;
  createdAt: string;
  acknowledgedBy?: string;
  resolvedAt?: string;
}

export interface DashboardSummary {
  activeShipments: number;
  shipmentsAtRisk: number;
  openAlerts: number;
  criticalAlerts: number;
}

export interface ProductThreshold {
  id: string;
  product: string;
  minTempC: number;
  maxTempC: number;
}

export type AlertAction = 'acknowledge' | 'resolve';
