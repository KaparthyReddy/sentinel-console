import { useEffect, useRef, useState } from 'react';
import type { Alert } from '@/api/types';
import { createAlertSocket, parseAlertMessage, type AlertSocketLike } from './alertSocket';

export type StreamStatus = 'connecting' | 'open' | 'reconnecting' | 'unavailable';

interface UseAlertStreamOptions {
  /** Must be a stable reference (module-level function or useCallback). */
  createSocket?: () => AlertSocketLike;
  /** How many recent alerts to keep in memory. */
  maxItems?: number;
  /** Called for every valid alert received. */
  onAlert?: (alert: Alert) => void;
  reconnectBaseMs?: number;
  reconnectMaxMs?: number;
}

export function useAlertStream({
  createSocket = createAlertSocket,
  maxItems = 20,
  onAlert,
  reconnectBaseMs = 1000,
  reconnectMaxMs = 15_000,
}: UseAlertStreamOptions = {}) {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [status, setStatus] = useState<StreamStatus>('connecting');

  // Keep the latest callback without re-opening the socket when it changes.
  const onAlertRef = useRef(onAlert);
  useEffect(() => {
    onAlertRef.current = onAlert;
  }, [onAlert]);

  useEffect(() => {
    let disposed = false;
    let attempt = 0;
    let socket: AlertSocketLike | null = null;
    let timer: ReturnType<typeof setTimeout> | undefined;

    const connect = () => {
      setStatus(attempt === 0 ? 'connecting' : 'reconnecting');

      let current: AlertSocketLike;
      try {
        current = createSocket();
      } catch {
        setStatus('unavailable');
        return;
      }
      socket = current;

      current.onopen = () => {
        if (disposed) return;
        attempt = 0;
        setStatus('open');
      };

      current.onmessage = (event) => {
        if (disposed) return;
        const alert = parseAlertMessage(event.data);
        if (!alert) return;
        setAlerts((previous) =>
          [alert, ...previous.filter((item) => item.id !== alert.id)].slice(0, maxItems),
        );
        onAlertRef.current?.(alert);
      };

      current.onclose = () => {
        if (disposed) return;
        attempt += 1;
        setStatus('reconnecting');
        const delay = Math.min(reconnectBaseMs * 2 ** (attempt - 1), reconnectMaxMs);
        timer = setTimeout(connect, delay);
      };

      // An error is always followed by a close, which schedules the reconnect.
      current.onerror = () => current.close();
    };

    connect();

    return () => {
      disposed = true;
      clearTimeout(timer);
      if (socket) {
        socket.onopen = null;
        socket.onmessage = null;
        socket.onclose = null;
        socket.onerror = null;
        socket.close();
      }
    };
  }, [createSocket, maxItems, reconnectBaseMs, reconnectMaxMs]);

  return { alerts, status };
}
