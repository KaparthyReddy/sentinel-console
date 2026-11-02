import type {
  Alert,
  DashboardSummary,
  Paged,
  ProductThreshold,
  Role,
  Severity,
  Shipment,
  ShipmentStatus,
  TemperatureReading,
} from '@/api/types';
import { excursionDelta } from '@/utils/temperature';

export interface MockUser {
  username: string;
  password: string;
  role: Role;
}

/** Demo credentials, shown on the login page when mock mode is on. */
export const MOCK_USERS: readonly MockUser[] = [
  { username: 'admin', password: 'admin123', role: 'ADMIN' },
  { username: 'operator', password: 'operator123', role: 'OPERATOR' },
  { username: 'viewer', password: 'viewer123', role: 'VIEWER' },
];

const PRODUCTS = [
  { name: 'Insulin', min: 2, max: 8 },
  { name: 'Influenza vaccine', min: 2, max: 8 },
  { name: 'Monoclonal antibodies', min: 2, max: 8 },
  { name: 'Blood plasma', min: -30, max: -18 },
  { name: 'Frozen biologics', min: -25, max: -15 },
] as const;

const CITIES = [
  'Mumbai',
  'Bengaluru',
  'Hyderabad',
  'Chennai',
  'Delhi',
  'Pune',
  'Kolkata',
  'Ahmedabad',
] as const;

const MINUTE = 60_000;
const HOUR = 60 * MINUTE;

/** Small seeded PRNG (mulberry32) so seed data is identical on every run. */
function createRng(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const round1 = (value: number): number => Math.round(value * 10) / 10;
const pad = (value: number, width: number): string => String(value).padStart(width, '0');

export function severityFor(delta: number): Severity {
  if (delta >= 5) return 'CRITICAL';
  if (delta >= 3) return 'HIGH';
  if (delta >= 1.5) return 'MEDIUM';
  return 'LOW';
}

function alertMessage(temperatureC: number, minC: number, maxC: number): string {
  if (temperatureC > maxC) {
    return `Temperature ${temperatureC.toFixed(1)} \u00b0C exceeded the maximum of ${maxC} \u00b0C`;
  }
  return `Temperature ${temperatureC.toFixed(1)} \u00b0C fell below the minimum of ${minC} \u00b0C`;
}

interface MockDb {
  shipments: Shipment[];
  readings: Map<string, TemperatureReading[]>;
  alerts: Alert[];
  thresholds: ProductThreshold[];
  nextAlertSeq: number;
}

function createDb(): MockDb {
  const rng = createRng(42);
  const now = Date.now();

  const shipments: Shipment[] = [];
  const readings = new Map<string, TemperatureReading[]>();
  const alerts: Alert[] = [];
  let alertSeq = 1;
  const nextAlertId = (): string => `alt-${pad(alertSeq++, 3)}`;

  for (let i = 0; i < 24; i += 1) {
    const product = PRODUCTS[i % PRODUCTS.length];
    const status: ShipmentStatus =
      i % 8 === 0 ? 'DELIVERED' : i % 6 === 1 ? 'AT_RISK' : 'IN_TRANSIT';

    const mid = (product.min + product.max) / 2;
    const half = (product.max - product.min) / 2;

    const origin = CITIES[(i * 3) % CITIES.length];
    let destination = CITIES[(i * 5 + 1) % CITIES.length];
    if (destination === origin) destination = CITIES[(i * 5 + 2) % CITIES.length];

    const currentTempC =
      status === 'AT_RISK'
        ? round1(product.max + 1 + rng() * 5)
        : round1(mid + (rng() - 0.5) * half * 1.2);

    const minutesAgo =
      status === 'DELIVERED' ? 180 + Math.floor(rng() * 600) : 1 + Math.floor(rng() * 20);
    const lastReadingMs = now - minutesAgo * MINUTE;

    const id = `shp-${pad(i + 1, 3)}`;
    const reference = `CC-2026-${pad(i + 1, 4)}`;

    shipments.push({
      id,
      reference,
      product: product.name,
      origin,
      destination,
      status,
      minTempC: product.min,
      maxTempC: product.max,
      currentTempC,
      lastReadingAt: new Date(lastReadingMs).toISOString(),
    });

    // 48 readings, one every 30 minutes, ending at the last reading time.
    const series: TemperatureReading[] = [];
    for (let k = 0; k < 48; k += 1) {
      const value = mid + Math.sin(k / 6) * half * 0.35 + (rng() - 0.5) * half * 0.2;
      series.push({
        timestamp: new Date(lastReadingMs - (47 - k) * 30 * MINUTE).toISOString(),
        temperatureC: round1(value),
      });
    }
    if (status === 'AT_RISK') {
      // Drift out of range over the last four readings.
      const start = series[43].temperatureC;
      for (let k = 44; k < 48; k += 1) {
        series[k].temperatureC = round1(start + ((currentTempC - start) * (k - 43)) / 4);
      }
    } else {
      series[47].temperatureC = currentTempC;
    }
    readings.set(id, series);

    // One open alert per at-risk shipment.
    if (status === 'AT_RISK') {
      const delta = excursionDelta(currentTempC, product.min, product.max);
      alerts.push({
        id: nextAlertId(),
        shipmentId: id,
        shipmentRef: reference,
        severity: severityFor(delta),
        status: 'OPEN',
        temperatureC: currentTempC,
        thresholdC: product.max,
        message: alertMessage(currentTempC, product.min, product.max),
        createdAt: new Date(lastReadingMs - 5 * MINUTE).toISOString(),
      });
    }

    // A few historical alerts on other shipments.
    for (let j = 0; j < i % 3; j += 1) {
      const above = rng() > 0.25;
      const overshoot = round1(0.5 + rng() * 6.5);
      const temperatureC = above ? round1(product.max + overshoot) : round1(product.min - overshoot);
      const delta = excursionDelta(temperatureC, product.min, product.max);
      const resolved = rng() > 0.4;
      const createdMs = now - (2 + rng() * 68) * HOUR;
      alerts.push({
        id: nextAlertId(),
        shipmentId: id,
        shipmentRef: reference,
        severity: severityFor(delta),
        status: resolved ? 'RESOLVED' : 'ACKNOWLEDGED',
        temperatureC,
        thresholdC: above ? product.max : product.min,
        message: alertMessage(temperatureC, product.min, product.max),
        createdAt: new Date(createdMs).toISOString(),
        acknowledgedBy: 'operator',
        resolvedAt: resolved ? new Date(createdMs + 40 * MINUTE).toISOString() : undefined,
      });
    }
  }

  alerts.sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  const thresholds: ProductThreshold[] = PRODUCTS.map((product, index) => ({
    id: `thr-${pad(index + 1, 2)}`,
    product: product.name,
    minTempC: product.min,
    maxTempC: product.max,
  }));

  return { shipments, readings, alerts, thresholds, nextAlertSeq: alertSeq };
}

let db: MockDb = createDb();

export function getDb(): MockDb {
  return db;
}

/** Restores the original seed data. Tests call this after every test. */
export function resetMockData(): void {
  db = createDb();
}

export function summarize(): DashboardSummary {
  const { shipments, alerts } = db;
  return {
    activeShipments: shipments.filter((s) => s.status !== 'DELIVERED').length,
    shipmentsAtRisk: shipments.filter((s) => s.status === 'AT_RISK').length,
    openAlerts: alerts.filter((a) => a.status === 'OPEN').length,
    criticalAlerts: alerts.filter((a) => a.severity === 'CRITICAL' && a.status !== 'RESOLVED')
      .length,
  };
}

export function paginate<T>(items: T[], page: number, pageSize: number): Paged<T> {
  const start = (page - 1) * pageSize;
  return { items: items.slice(start, start + pageSize), total: items.length, page, pageSize };
}

/**
 * Creates a brand-new OPEN alert on a random active shipment and stores it.
 * Used by the simulated WebSocket to produce a believable live feed.
 */
export function createLiveAlert(random: () => number = Math.random): Alert {
  const candidates = db.shipments.filter((s) => s.status !== 'DELIVERED');
  const shipment = candidates[Math.floor(random() * candidates.length)] ?? db.shipments[0];

  const overshoot = round1(0.5 + random() * 6.5);
  const temperatureC = round1(shipment.maxTempC + overshoot);
  const delta = excursionDelta(temperatureC, shipment.minTempC, shipment.maxTempC);

  const alert: Alert = {
    id: `alt-${pad(db.nextAlertSeq++, 3)}`,
    shipmentId: shipment.id,
    shipmentRef: shipment.reference,
    severity: severityFor(delta),
    status: 'OPEN',
    temperatureC,
    thresholdC: shipment.maxTempC,
    message: alertMessage(temperatureC, shipment.minTempC, shipment.maxTempC),
    createdAt: new Date().toISOString(),
  };

  db.alerts.unshift(alert);
  shipment.currentTempC = temperatureC;
  shipment.status = 'AT_RISK';
  shipment.lastReadingAt = alert.createdAt;
  return alert;
}
