import { useState } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { RouterProvider } from 'react-router-dom';
import { createQueryClient } from '@/api/queryClient';
import { AuthProvider } from '@/auth/AuthProvider';
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';
import { createAppRouter } from './router';

export function App() {
  // Created once per mount (lazy initialiser), not on every render
  const [queryClient] = useState(createQueryClient);
  const [router] = useState(createAppRouter);

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <RouterProvider router={router} />
        </AuthProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}
