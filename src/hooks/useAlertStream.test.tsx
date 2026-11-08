import { act, renderHook } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { makeAlert } from '@/test/factories';
import type { AlertSocketLike } from './alertSocket';
import { useAlertStream } from './useAlertStream';

class FakeSocket implements AlertSocketLike {
  onopen: ((event: Event) => void) | null = null;
  onmessage: ((event: MessageEvent) => void) | null = null;
  onclose: ((event: CloseEvent) => void) | null = null;
  onerror: ((event: Event) => void) | null = null;
  closed = false;

  close(): void {
    this.closed = true;
  }
  open(): void {
    this.onopen?.(new Event('open'));
  }
  send(data: unknown): void {
    this.sendRaw(JSON.stringify(data));
  }
  sendRaw(data: string): void {
    this.onmessage?.(new MessageEvent('message', { data }));
  }
  drop(): void {
    this.onclose?.(new CloseEvent('close'));
  }
  fail(): void {
    this.onerror?.(new Event('error'));
  }
}

type StreamOptions = Parameters<typeof useAlertStream>[0];

function setup(options: StreamOptions = {}) {
  const sockets: FakeSocket[] = [];
  const createSocket = () => {
    const socket = new FakeSocket();
    sockets.push(socket);
    return socket;
  };
  const hook = renderHook(() => useAlertStream({ createSocket, ...options }));
  return { sockets, ...hook };
}

afterEach(() => {
  vi.useRealTimers();
});

describe('useAlertStream', () => {
  it('starts as connecting and becomes open', () => {
    const { sockets, result } = setup();
    expect(result.current.status).toBe('connecting');
    expect(sockets).toHaveLength(1);

    act(() => sockets[0].open());
    expect(result.current.status).toBe('open');
  });

  it('collects alerts newest first and replaces duplicates by id', () => {
    const onAlert = vi.fn();
    const { sockets, result } = setup({ onAlert });
    const a = makeAlert({ id: 'a' });
    const b = makeAlert({ id: 'b' });

    act(() => {
      sockets[0].send(a);
      sockets[0].send({ type: 'alert', alert: b });
    });
    expect(result.current.alerts.map((alert) => alert.id)).toEqual(['b', 'a']);

    act(() => sockets[0].send({ ...a, status: 'ACKNOWLEDGED' }));
    expect(result.current.alerts.map((alert) => alert.id)).toEqual(['a', 'b']);
    expect(result.current.alerts[0].status).toBe('ACKNOWLEDGED');
    expect(onAlert).toHaveBeenCalledTimes(3);
  });

  it('ignores malformed frames', () => {
    const onAlert = vi.fn();
    const { sockets, result } = setup({ onAlert });

    act(() => {
      sockets[0].sendRaw('not json');
      sockets[0].sendRaw('{"hello":"world"}');
    });
    expect(result.current.alerts).toEqual([]);
    expect(onAlert).not.toHaveBeenCalled();
  });

  it('keeps only the most recent maxItems alerts', () => {
    const { sockets, result } = setup({ maxItems: 2 });

    act(() => {
      sockets[0].send(makeAlert({ id: 'a' }));
      sockets[0].send(makeAlert({ id: 'b' }));
      sockets[0].send(makeAlert({ id: 'c' }));
    });
    expect(result.current.alerts.map((alert) => alert.id)).toEqual(['c', 'b']);
  });

  it('reconnects with exponential backoff and resets after a successful open', () => {
    vi.useFakeTimers();
    const { sockets, result } = setup();

    act(() => sockets[0].open());
    act(() => sockets[0].drop());
    expect(result.current.status).toBe('reconnecting');

    // First retry waits 1s
    act(() => {
      vi.advanceTimersByTime(999);
    });
    expect(sockets).toHaveLength(1);
    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(sockets).toHaveLength(2);

    // A second failure in a row waits twice as long (2s)
    act(() => sockets[1].drop());
    act(() => {
      vi.advanceTimersByTime(1999);
    });
    expect(sockets).toHaveLength(2);
    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(sockets).toHaveLength(3);

    // A successful connection resets the backoff back to 1s
    act(() => sockets[2].open());
    expect(result.current.status).toBe('open');
    act(() => sockets[2].drop());
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(sockets).toHaveLength(4);
  });

  it('caps the reconnect delay at reconnectMaxMs', () => {
    vi.useFakeTimers();
    const { sockets } = setup({ reconnectBaseMs: 1000, reconnectMaxMs: 3000 });

    act(() => sockets[0].drop()); // waits 1s
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    act(() => sockets[1].drop()); // waits 2s
    act(() => {
      vi.advanceTimersByTime(2000);
    });
    act(() => sockets[2].drop()); // would be 4s, capped at 3s
    act(() => {
      vi.advanceTimersByTime(2999);
    });
    expect(sockets).toHaveLength(3);
    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(sockets).toHaveLength(4);
  });

  it('closes the socket when the connection errors', () => {
    const { sockets } = setup();
    act(() => sockets[0].fail());
    expect(sockets[0].closed).toBe(true);
  });

  it('closes the socket on unmount and stops reconnecting', () => {
    vi.useFakeTimers();
    const { sockets, unmount } = setup();

    act(() => sockets[0].drop());
    unmount();
    expect(sockets[0].closed).toBe(true);
    expect(sockets[0].onmessage).toBeNull();

    act(() => {
      vi.advanceTimersByTime(30_000);
    });
    expect(sockets).toHaveLength(1);
  });

  it('reports "unavailable" when a socket cannot be created', () => {
    const createSocket = (): AlertSocketLike => {
      throw new Error('VITE_WS_URL is not configured.');
    };
    const { result } = renderHook(() => useAlertStream({ createSocket }));
    expect(result.current.status).toBe('unavailable');
  });
});
