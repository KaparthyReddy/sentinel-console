export const config = {
  apiBaseUrl: (import.meta.env.VITE_API_BASE_URL ?? '').replace(/\/$/, ''),
  wsUrl: import.meta.env.VITE_WS_URL ?? '',
  useMocks: import.meta.env.VITE_USE_MOCKS === 'true',
} as const;
