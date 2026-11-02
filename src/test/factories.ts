import type { Alert, Shipment } from '@/api/types';

/** Builders for fixed, readable test data. Override only what the test cares about. */
export function makeAlert(overrides: Partial<Alert> = {}): Alert {
  return {
    id: 'alt-test-1',
    shipmentId: 'shp-001',
    shipmentRef: 'CC-2026-0001',
    severity: 'HIGH',
    status: 'OPEN',
    temperatureC: 11.2,
    thresholdC: 8,
    message: 'Temperature 11.2 \u00b0C exceeded the maximum of 8 \u00b0C',
    createdAt: '2026-01-15T10:30:00.000Z',
    ...overrides,
  };
}

export function makeShipment(overrides: Partial<Shipment> = {}): Shipment {
  return {
    id: 'shp-test-1',
    reference: 'CC-2026-0001',
    product: 'Insulin',
    origin: 'Mumbai',
    destination: 'Bengaluru',
    status: 'IN_TRANSIT',
    minTempC: 2,
    maxTempC: 8,
    currentTempC: 5.1,
    lastReadingAt: '2026-01-15T10:30:00.000Z',
    ...overrides,
  };
}
