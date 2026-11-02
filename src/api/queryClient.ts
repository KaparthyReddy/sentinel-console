import { QueryClient } from '@tanstack/react-query';
import { ApiError } from './client';

/** A factory (not a singleton) so every test gets a fresh, isolated cache. */
export function createQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 15_000,
        refetchOnWindowFocus: false,
        retry: (failureCount, error) => {
          // Don't retry client errors (bad request, forbidden, not found...)
          if (error instanceof ApiError && error.status >= 400 && error.status < 500) return false;
          return failureCount < 2;
        },
      },
    },
  });
}
