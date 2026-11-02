import type { ReactElement, ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, type RenderOptions } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { configureAxe } from 'vitest-axe';
import { expect, vi } from 'vitest';
import { AuthContext, type AuthContextValue, type AuthUser } from '@/auth/authContext';
import { setAccessToken } from '@/auth/tokenStore';

export { screen, waitFor, within } from '@testing-library/react';
export { default as userEvent } from '@testing-library/user-event';

export const DEFAULT_TEST_USER: AuthUser = { username: 'operator', role: 'OPERATOR' };

interface RenderWithProvidersOptions extends Omit<RenderOptions, 'wrapper'> {
  /** Initial URL for the in-memory router. */
  route?: string;
  /** Signed-in user. Pass null to render as a signed-out visitor. */
  user?: AuthUser | null;
}

/**
 * Renders a component with the same providers the real app uses:
 * React Query, auth, and a router. Also sets a mock-API token for the user's
 * role so requests to the MSW handlers are authorised.
 */
export function renderWithProviders(
  ui: ReactElement,
  { route = '/', user = DEFAULT_TEST_USER, ...options }: RenderWithProvidersOptions = {},
) {
  if (user) setAccessToken(`mock-token-${user.role}`);

  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: Infinity }, mutations: { retry: false } },
  });

  const authValue: AuthContextValue = {
    user,
    login: vi.fn().mockResolvedValue(undefined),
    logout: vi.fn(),
  };

  function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        <AuthContext.Provider value={authValue}>
          <MemoryRouter initialEntries={[route]}>{children}</MemoryRouter>
        </AuthContext.Provider>
      </QueryClientProvider>
    );
  }

  return { queryClient, authValue, ...render(ui, { wrapper: Wrapper, ...options }) };
}

// jsdom cannot compute colours, so contrast is checked in the Playwright a11y tests instead.
const axe = configureAxe({ rules: { 'color-contrast': { enabled: false } } });

/** Fails the test, listing the rules broken, if axe finds accessibility violations. */
export async function expectNoAxeViolations(container: Element): Promise<void> {
  const results = await axe(container);
  expect(results.violations).toEqual([]);
}
