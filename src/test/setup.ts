import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterAll, afterEach, beforeAll } from 'vitest';
import { clearAccessToken } from '@/auth/tokenStore';
import { resetMockData } from '@/mocks/data';
import { server } from '@/mocks/server';

// jsdom has no ResizeObserver (Recharts' ResponsiveContainer needs one).
class ResizeObserverStub {
  observe(): void {}
  unobserve(): void {}
  disconnect(): void {}
}
if (!('ResizeObserver' in globalThis)) {
  globalThis.ResizeObserver = ResizeObserverStub as unknown as typeof ResizeObserver;
}

const realFetch = globalThis.fetch;

beforeAll(() => {
  // Any request without a matching handler fails the test instead of hitting the network.
  server.listen({ onUnhandledRequest: 'error' });

  // Safety net: Node's fetch can reject jsdom's AbortSignal with
  // "Expected signal to be an instance of AbortSignal". Drop the signal in tests.
  const interceptedFetch = globalThis.fetch;
  globalThis.fetch = ((input: RequestInfo | URL, init?: RequestInit) => {
    if (init?.signal) {
      const rest: RequestInit = { ...init };
      delete rest.signal;
      return interceptedFetch(input, rest);
    }
    return interceptedFetch(input, init);
  }) as typeof fetch;
});

afterEach(() => {
  cleanup();
  server.resetHandlers();
  resetMockData();
  clearAccessToken();
});

afterAll(() => {
  server.close();
  globalThis.fetch = realFetch;
});
