import { delay, http, HttpResponse } from 'msw';
import {
  ALERT_STATUSES,
  SEVERITIES,
  SHIPMENT_STATUSES,
  type Alert,
  type AlertAction,
  type LoginRequest,
  type Role,
} from '@/api/types';
import { can, isRole } from '@/auth/permissions';
import { MOCK_USERS, getDb, paginate, summarize } from './data';

const TOKEN_PREFIX = 'mock-token-';

let latencyMs = 0;

/** Simulated network delay. The browser app sets this; tests leave it at 0. */
export function setMockLatency(ms: number): void {
  latencyMs = ms;
}

function roleFrom(request: Request): Role | null {
  const header = request.headers.get('Authorization');
  if (!header?.startsWith(`Bearer ${TOKEN_PREFIX}`)) return null;
  const role = header.slice(`Bearer ${TOKEN_PREFIX}`.length);
  return isRole(role) ? role : null;
}

function unauthorized() {
  return HttpResponse.json({ message: 'Authentication required.' }, { status: 401 });
}

function forbidden() {
  return HttpResponse.json({ message: 'You do not have permission to do that.' }, { status: 403 });
}

function notFound(what: string) {
  return HttpResponse.json({ message: `${what} not found.` }, { status: 404 });
}

function toInt(value: string | null, fallback: number, min = 1, max = 100): number {
  const parsed = Number.parseInt(value ?? '', 10);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.min(Math.max(parsed, min), max);
}

function pickEnum<T extends string>(value: string | null, allowed: readonly T[]): T | undefined {
  return allowed.find((item) => item === value);
}

export const handlers = [
  http.post('*/api/auth/login', async ({ request }) => {
    await delay(latencyMs);
    const body = (await request.json().catch(() => null)) as Partial<LoginRequest> | null;
    const user = MOCK_USERS.find(
      (candidate) => candidate.username === body?.username && candidate.password === body?.password,
    );
    if (!user) {
      return HttpResponse.json({ message: 'Invalid username or password.' }, { status: 401 });
    }
    return HttpResponse.json({
      token: `${TOKEN_PREFIX}${user.role}`,
      username: user.username,
      role: user.role,
    });
  }),

  http.get('*/api/dashboard/summary', async ({ request }) => {
    await delay(latencyMs);
    if (!roleFrom(request)) return unauthorized();
    return HttpResponse.json(summarize());
  }),

  http.get('*/api/shipments', async ({ request }) => {
    await delay(latencyMs);
    if (!roleFrom(request)) return unauthorized();

    const params = new URL(request.url).searchParams;
    const page = toInt(params.get('page'), 1, 1, 10_000);
    const pageSize = toInt(params.get('pageSize'), 10);
    const search = (params.get('search') ?? '').trim().toLowerCase();
    const status = pickEnum(params.get('status'), SHIPMENT_STATUSES);

    const filtered = getDb().shipments.filter((shipment) => {
      if (status && shipment.status !== status) return false;
      if (!search) return true;
      return [shipment.reference, shipment.product, shipment.origin, shipment.destination].some(
        (field) => field.toLowerCase().includes(search),
      );
    });

    return HttpResponse.json(paginate(filtered, page, pageSize));
  }),

  http.get('*/api/shipments/:id/readings', async ({ request, params }) => {
    await delay(latencyMs);
    if (!roleFrom(request)) return unauthorized();
    const readings = getDb().readings.get(String(params.id));
    if (!readings) return notFound('Shipment');
    return HttpResponse.json(readings);
  }),

  http.get('*/api/shipments/:id', async ({ request, params }) => {
    await delay(latencyMs);
    if (!roleFrom(request)) return unauthorized();
    const shipment = getDb().shipments.find((item) => item.id === String(params.id));
    if (!shipment) return notFound('Shipment');
    return HttpResponse.json(shipment);
  }),

  http.get('*/api/alerts', async ({ request }) => {
    await delay(latencyMs);
    if (!roleFrom(request)) return unauthorized();

    const params = new URL(request.url).searchParams;
    const page = toInt(params.get('page'), 1, 1, 10_000);
    const pageSize = toInt(params.get('pageSize'), 10);
    const severity = pickEnum(params.get('severity'), SEVERITIES);
    const status = pickEnum(params.get('status'), ALERT_STATUSES);

    const filtered = getDb().alerts.filter(
      (alert) => (!severity || alert.severity === severity) && (!status || alert.status === status),
    );

    return HttpResponse.json(paginate(filtered, page, pageSize));
  }),

  http.post('*/api/alerts/:id/:action', async ({ request, params }) => {
    await delay(latencyMs);
    const role = roleFrom(request);
    if (!role) return unauthorized();
    if (!can(role, 'alerts:update')) return forbidden();

    const action = String(params.action) as AlertAction;
    if (action !== 'acknowledge' && action !== 'resolve') {
      return HttpResponse.json({ message: 'Unknown action.' }, { status: 400 });
    }

    const db = getDb();
    const alert: Alert | undefined = db.alerts.find((item) => item.id === String(params.id));
    if (!alert) return notFound('Alert');

    if (action === 'acknowledge') {
      if (alert.status !== 'OPEN') {
        return HttpResponse.json(
          { message: 'Only open alerts can be acknowledged.' },
          { status: 409 },
        );
      }
      alert.status = 'ACKNOWLEDGED';
      alert.acknowledgedBy = role.toLowerCase();
    } else {
      if (alert.status === 'RESOLVED') {
        return HttpResponse.json({ message: 'This alert is already resolved.' }, { status: 409 });
      }
      alert.status = 'RESOLVED';
      alert.resolvedAt = new Date().toISOString();

      // No unresolved alerts left on the shipment: it is no longer at risk.
      const stillOpen = db.alerts.some(
        (item) => item.shipmentId === alert.shipmentId && item.status !== 'RESOLVED',
      );
      const shipment = db.shipments.find((item) => item.id === alert.shipmentId);
      if (shipment && shipment.status === 'AT_RISK' && !stillOpen) {
        shipment.status = 'IN_TRANSIT';
      }
    }

    return HttpResponse.json(alert);
  }),

  http.get('*/api/thresholds', async ({ request }) => {
    await delay(latencyMs);
    const role = roleFrom(request);
    if (!role) return unauthorized();
    if (!can(role, 'thresholds:view')) return forbidden();
    return HttpResponse.json(getDb().thresholds);
  }),

  http.put('*/api/thresholds/:id', async ({ request, params }) => {
    await delay(latencyMs);
    const role = roleFrom(request);
    if (!role) return unauthorized();
    if (!can(role, 'thresholds:edit')) return forbidden();

    const threshold = getDb().thresholds.find((item) => item.id === String(params.id));
    if (!threshold) return notFound('Threshold');

    const body = (await request.json().catch(() => null)) as {
      minTempC?: unknown;
      maxTempC?: unknown;
    } | null;

    if (
      typeof body?.minTempC !== 'number' ||
      typeof body.maxTempC !== 'number' ||
      !Number.isFinite(body.minTempC) ||
      !Number.isFinite(body.maxTempC)
    ) {
      return HttpResponse.json({ message: 'Both temperatures must be numbers.' }, { status: 400 });
    }
    if (body.minTempC >= body.maxTempC) {
      return HttpResponse.json(
        { message: 'Maximum temperature must be greater than the minimum.' },
        { status: 400 },
      );
    }

    threshold.minTempC = body.minTempC;
    threshold.maxTempC = body.maxTempC;
    return HttpResponse.json(threshold);
  }),
];
