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

// Any request without a matching handler fails the test instead of hitting the network.
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));

afterEach(() => {
  cleanup();
  server.resetHandlers();
  resetMockData();
  clearAccessToken();
});

afterAll(() => server.close());
