import { apiRequest } from './client';
import { endpoints } from './endpoints';
import type {
  Alert,
  AlertAction,
  AlertStatus,
  DashboardSummary,
  LoginRequest,
  LoginResponse,
  Paged,
  ProductThreshold,
  Severity,
  Shipment,
  ShipmentStatus,
  TemperatureReading,
} from './types';

export interface ShipmentQuery {
  page: number;
  pageSize: number;
  search?: string;
  status?: ShipmentStatus;
}

export interface AlertQuery {
  page: number;
  pageSize: number;
  severity?: Severity;
  status?: AlertStatus;
}

export function login(credentials: LoginRequest): Promise<LoginResponse> {
  return apiRequest<LoginResponse>(endpoints.login, { method: 'POST', body: credentials });
}

export function fetchSummary(signal?: AbortSignal): Promise<DashboardSummary> {
  return apiRequest<DashboardSummary>(endpoints.summary, { signal });
}

export function fetchShipments(query: ShipmentQuery, signal?: AbortSignal): Promise<Paged<Shipment>> {
  return apiRequest<Paged<Shipment>>(endpoints.shipments, {
    query: {
      page: query.page,
      pageSize: query.pageSize,
      search: query.search,
      status: query.status,
    },
    signal,
  });
}

export function fetchShipment(id: string, signal?: AbortSignal): Promise<Shipment> {
  return apiRequest<Shipment>(endpoints.shipment(id), { signal });
}

export function fetchReadings(id: string, signal?: AbortSignal): Promise<TemperatureReading[]> {
  return apiRequest<TemperatureReading[]>(endpoints.shipmentReadings(id), { signal });
}

export function fetchAlerts(query: AlertQuery, signal?: AbortSignal): Promise<Paged<Alert>> {
  return apiRequest<Paged<Alert>>(endpoints.alerts, {
    query: {
      page: query.page,
      pageSize: query.pageSize,
      severity: query.severity,
      status: query.status,
    },
    signal,
  });
}

export function updateAlertStatus(id: string, action: AlertAction): Promise<Alert> {
  return apiRequest<Alert>(endpoints.alertAction(id, action), { method: 'POST' });
}

export function fetchThresholds(signal?: AbortSignal): Promise<ProductThreshold[]> {
  return apiRequest<ProductThreshold[]>(endpoints.thresholds, { signal });
}

export function updateThreshold(
  id: string,
  values: Pick<ProductThreshold, 'minTempC' | 'maxTempC'>,
): Promise<ProductThreshold> {
  return apiRequest<ProductThreshold>(endpoints.threshold(id), { method: 'PUT', body: values });
}
