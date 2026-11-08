import { Route, Routes } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { renderWithProviders, screen } from '@/test/test-utils';
import { ProtectedRoute } from './ProtectedRoute';

function Harness({ permission }: { permission?: 'thresholds:view' }) {
  return (
    <Routes>
      <Route path="/login" element={<p>login page</p>} />
      <Route path="/forbidden" element={<p>forbidden page</p>} />
      <Route
        path="/secret"
        element={
          <ProtectedRoute permission={permission}>
            <p>secret content</p>
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

describe('ProtectedRoute', () => {
  it('sends signed-out visitors to the login page', async () => {
    renderWithProviders(<Harness />, { route: '/secret', user: null });
    expect(await screen.findByText('login page')).toBeInTheDocument();
  });

  it('shows the content to any signed-in user when no permission is required', async () => {
    renderWithProviders(<Harness />, { route: '/secret', user: { username: 'v', role: 'VIEWER' } });
    expect(await screen.findByText('secret content')).toBeInTheDocument();
  });

  it('sends a user without the permission to the forbidden page', async () => {
    renderWithProviders(<Harness permission="thresholds:view" />, {
      route: '/secret',
      user: { username: 'op', role: 'OPERATOR' },
    });
    expect(await screen.findByText('forbidden page')).toBeInTheDocument();
    expect(screen.queryByText('secret content')).not.toBeInTheDocument();
  });

  it('shows the content to a user who holds the permission', async () => {
    renderWithProviders(<Harness permission="thresholds:view" />, {
      route: '/secret',
      user: { username: 'ad', role: 'ADMIN' },
    });
    expect(await screen.findByText('secret content')).toBeInTheDocument();
  });
});
