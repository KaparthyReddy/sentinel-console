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

/**
 * Node's fetch/Request reject jsdom's AbortSignal ("Expected signal to be an
 * instance of AbortSignal"). Nothing in the tests depends on aborting, so the
 * signal is dropped. Both fetch() and `new Request()` need this: React Query
 * uses the former, React Router's navigation uses the latter.
 */
function withoutSignal(init?: RequestInit): RequestInit | undefined {
  if (!init?.signal) return init;
  const rest: RequestInit = { ...init };
  delete rest.signal;
  return rest;
}

const realFetch = globalThis.fetch;
const realRequest = globalThis.Request;

beforeAll(() => {
  // Any request without a matching handler fails the test instead of hitting the network.
  server.listen({ onUnhandledRequest: 'error' });

  // Wrap AFTER server.listen(), so these sit on top of MSW's interceptors.
  const interceptedFetch = globalThis.fetch;
  globalThis.fetch = ((input: RequestInfo | URL, init?: RequestInit) =>
    interceptedFetch(input, withoutSignal(init))) as typeof fetch;

  const InterceptedRequest = globalThis.Request;
  globalThis.Request = class extends InterceptedRequest {
    constructor(input: RequestInfo | URL, init?: RequestInit) {
      super(input, withoutSignal(init));
    }
  } as typeof Request;
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
  globalThis.Request = realRequest;
});

// axe-core probes <canvas>, which jsdom doesn't implement; keep the output quiet.
HTMLCanvasElement.prototype.getContext = (() =>
  null) as unknown as typeof HTMLCanvasElement.prototype.getContext;
