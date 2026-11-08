import type { AlertSocketLike } from '@/hooks/alertSocket';

/** A hand-driven stand-in for a WebSocket: tests decide when it opens, receives and drops. */
export class FakeSocket implements AlertSocketLike {
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
    this.onmessage?.(new MessageEvent('message', { data: JSON.stringify(data) }));
  }
  drop(): void {
    this.onclose?.(new CloseEvent('close'));
  }
}

/** The returned createSocket is a stable reference, as useAlertStream requires. */
export function createSocketFactory() {
  const sockets: FakeSocket[] = [];
  const createSocket = () => {
    const socket = new FakeSocket();
    sockets.push(socket);
    return socket;
  };
  return { sockets, createSocket };
}
