import type { AlertSocketLike } from '@/hooks/alertSocket';
import { createLiveAlert } from './data';

interface MockAlertSocketOptions {
  /** Time between simulated alerts. */
  intervalMs?: number;
  /** Delay before the "connection" opens. */
  openDelayMs?: number;
}

export class MockAlertSocket implements AlertSocketLike {
  onopen: ((event: Event) => void) | null = null;
  onmessage: ((event: MessageEvent) => void) | null = null;
  onclose: ((event: CloseEvent) => void) | null = null;
  onerror: ((event: Event) => void) | null = null;

  private closed = false;
  private openTimer: ReturnType<typeof setTimeout> | undefined;
  private emitTimer: ReturnType<typeof setInterval> | undefined;

  constructor({ intervalMs = 10_000, openDelayMs = 150 }: MockAlertSocketOptions = {}) {
    this.openTimer = setTimeout(() => {
      if (this.closed) return;
      this.onopen?.(new Event('open'));
      this.emitTimer = setInterval(() => this.emitAlert(), intervalMs);
    }, openDelayMs);
  }

  private emitAlert(): void {
    const alert = createLiveAlert();
    this.onmessage?.(
      new MessageEvent('message', { data: JSON.stringify({ type: 'alert', alert }) }),
    );
  }

  close(): void {
    if (this.closed) return;
    this.closed = true;
    clearTimeout(this.openTimer);
    clearInterval(this.emitTimer);
    // Real sockets fire "close" asynchronously, so do the same.
    setTimeout(() => this.onclose?.(new CloseEvent('close', { code: 1000 })), 0);
  }
}
