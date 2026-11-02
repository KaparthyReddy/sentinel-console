import type { AlertAction } from './types';

export const endpoints = {
  login: '/api/auth/login',
  summary: '/api/dashboard/summary',
  shipments: '/api/shipments',
  shipment: (id: string) => `/api/shipments/${encodeURIComponent(id)}`,
  shipmentReadings: (id: string) => `/api/shipments/${encodeURIComponent(id)}/readings`,
  alerts: '/api/alerts',
  alertAction: (id: string, action: AlertAction) =>
    `/api/alerts/${encodeURIComponent(id)}/${action}`,
  thresholds: '/api/thresholds',
  threshold: (id: string) => `/api/thresholds/${encodeURIComponent(id)}`,
} as const;
