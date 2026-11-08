import { QueryClientProvider } from '@tanstack/react-query';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { createQueryClient } from '@/api/queryClient';
import { AuthProvider } from '@/auth/AuthProvider';
import { routes } from './router';

// The first visit to each lazy-loaded page compiles it, which can be slow.
vi.setConfig({ testTimeout: 20_000 });
const SLOW = { timeout: 8000 };

function renderApp(initialPath: string) {
  const router = createMemoryRouter(routes, { initialEntries: [initialPath] });
  render(
    <QueryClientProvider client={createQueryClient()}>
      <AuthProvider>
        <RouterProvider router={router} />
      </AuthProvider>
    </QueryClientProvider>,
  );
  return { router, user: userEvent.setup() };
}

async function signIn(user: ReturnType<typeof userEvent.setup>, name: string, password: string) {
  await user.type(await screen.findByLabelText('Username'), name);
  await user.type(screen.getByLabelText('Password'), password);
  await user.click(screen.getByRole('button', { name: 'Sign in' }));
}

describe('app routing', () => {
  it('sends a signed-out visitor to the login page', async () => {
    const { router } = renderApp('/alerts');
    expect(
      await screen.findByRole('heading', { level: 1, name: 'Sign in to Sentinel Console' }),
    ).toBeInTheDocument();
    expect(router.state.location.pathname).toBe('/login');
  });

  it('returns to the originally requested page after signing in', async () => {
    const { router, user } = renderApp('/alerts');
    await signIn(user, 'operator', 'operator123');

    expect(
      await screen.findByRole('heading', { level: 1, name: 'Alerts' }, SLOW),
    ).toBeInTheDocument();
    expect(router.state.location.pathname).toBe('/alerts');
  });

  it('lands on the dashboard when signing in from the login page', async () => {
    const { user } = renderApp('/login');
    await signIn(user, 'viewer', 'viewer123');

    expect(
      await screen.findByRole('heading', { level: 1, name: 'Dashboard' }, SLOW),
    ).toBeInTheDocument();
  });

  it('shows the Thresholds link to admins only', async () => {
    const admin = renderApp('/');
    await signIn(admin.user, 'admin', 'admin123');
    await screen.findByRole('heading', { level: 1, name: 'Dashboard' }, SLOW);
    // hidden: true because jsdom ignores the media queries that show the sidebar on desktop
    const nav = screen.getByRole('navigation', { name: 'Primary', hidden: true });
    expect(within(nav).getByRole('link', { name: 'Thresholds', hidden: true })).toBeInTheDocument();
  });

  it('hides the Thresholds link from operators', async () => {
    const { user } = renderApp('/');
    await signIn(user, 'operator', 'operator123');
    await screen.findByRole('heading', { level: 1, name: 'Dashboard' }, SLOW);

    const nav = screen.getByRole('navigation', { name: 'Primary', hidden: true });
    expect(
      within(nav).queryByRole('link', { name: 'Thresholds', hidden: true }),
    ).not.toBeInTheDocument();
  });

  it('blocks an operator who asks for the admin-only page', async () => {
    const { router, user } = renderApp('/thresholds');
    await signIn(user, 'operator', 'operator123');

    expect(
      await screen.findByRole('heading', { level: 1, name: 'Access denied' }, SLOW),
    ).toBeInTheDocument();
    expect(router.state.location.pathname).toBe('/forbidden');
  });

  it('shows a not-found page for an unknown address', async () => {
    const { user } = renderApp('/nowhere');
    await signIn(user, 'viewer', 'viewer123');

    expect(
      await screen.findByRole('heading', { level: 1, name: 'Page not found' }, SLOW),
    ).toBeInTheDocument();
  });

  it('signs out back to the login page', async () => {
    const { user } = renderApp('/');
    await signIn(user, 'viewer', 'viewer123');
    await screen.findByRole('heading', { level: 1, name: 'Dashboard' }, SLOW);

    await user.click(screen.getByRole('button', { name: 'Sign out' }));
    expect(
      await screen.findByRole('heading', { level: 1, name: 'Sign in to Sentinel Console' }),
    ).toBeInTheDocument();
  });
});
