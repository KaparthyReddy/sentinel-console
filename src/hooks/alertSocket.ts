import { config } from '@/api/config';
import { ALERT_STATUSES, SEVERITIES, type Alert } from '@/api/types';
import { getAccessToken } from '@/auth/tokenStore';
import { MockAlertSocket } from '@/mocks/mockAlertSocket';

/** The small slice of the WebSocket API the app relies on (easy to fake in tests). */
export interface AlertSocketLike {
  onopen: ((event: Event) => void) | null;
  onmessage: ((event: MessageEvent) => void) | null;
  onclose: ((event: CloseEvent) => void) | null;
  onerror: ((event: Event) => void) | null;
  close(): void;
}

export function createAlertSocket(): AlertSocketLike {
  if (config.useMocks) return new MockAlertSocket();

  if (!config.wsUrl) {
    throw new Error('VITE_WS_URL is not configured.');
  }

  // Browsers cannot set an Authorization header on a WebSocket, so the token
  // goes in the query string. See the README security notes for the trade-off.
  const url = new URL(config.wsUrl);
  const token = getAccessToken();
  if (token) url.searchParams.set('token', token);
  return new WebSocket(url.toString());
}

function isAlert(value: unknown): value is Alert {
  if (typeof value !== 'object' || value === null) return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.id === 'string' &&
    typeof v.shipmentId === 'string' &&
    typeof v.shipmentRef === 'string' &&
    typeof v.severity === 'string' &&
    (SEVERITIES as readonly string[]).includes(v.severity) &&
    typeof v.status === 'string' &&
    (ALERT_STATUSES as readonly string[]).includes(v.status) &&
    typeof v.temperatureC === 'number' &&
    typeof v.thresholdC === 'number' &&
    typeof v.message === 'string' &&
    typeof v.createdAt === 'string'
  );
}

/**
 * Parses a WebSocket frame. Accepts either a bare alert or
 * { "type": "alert", "alert": { ... } }. Anything else is ignored.
 */
export function parseAlertMessage(data: unknown): Alert | null {
  if (typeof data !== 'string') return null;
  try {
    const parsed: unknown = JSON.parse(data);
    if (typeof parsed === 'object' && parsed !== null && 'alert' in parsed) {
      const candidate = (parsed as { alert: unknown }).alert;
      return isAlert(candidate) ? candidate : null;
    }
    return isAlert(parsed) ? parsed : null;
  } catch {
    return null;
  }
}
