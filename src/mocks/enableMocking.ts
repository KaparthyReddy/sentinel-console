import { config } from '@/api/config';

/**
 * Starts the MSW service worker when VITE_USE_MOCKS=true.
 * Dynamic imports keep MSW out of the bundle path when mocks are off.
 */
export async function enableMocking(): Promise<void> {
  if (!config.useMocks) return;

  const [{ worker }, { setMockLatency }] = await Promise.all([
    import('./browser'),
    import('./handlers'),
  ]);

  setMockLatency(300);
  await worker.start({ onUnhandledRequest: 'bypass', quiet: true });
}
