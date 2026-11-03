import { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';
import { server } from '@/mocks/server';
import { AuthProvider } from './AuthProvider';
import { getAccessToken } from './tokenStore';
import { useAuth } from './useAuth';

function Probe() {
  const { user, login, logout } = useAuth();
  const [error, setError] = useState('');

  const attempt = (username: string, password: string) => {
    setError('');
    login(username, password).catch((e: unknown) =>
      setError(e instanceof Error ? e.message : 'failed'),
    );
  };

  return (
    <div>
      <p data-testid="who">{user ? `${user.username}:${user.role}` : 'signed out'}</p>
      <p role="alert">{error}</p>
      <button onClick={() => attempt('admin', 'admin123')}>good login</button>
      <button onClick={() => attempt('admin', 'wrong')}>bad login</button>
      <button onClick={logout}>log out</button>
    </div>
  );
}

function renderProbe() {
  const queryClient = new QueryClient();
  render(
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Probe />
      </AuthProvider>
    </QueryClientProvider>,
  );
  return userEvent.setup();
}

describe('AuthProvider', () => {
  it('starts signed out with no token', () => {
    renderProbe();
    expect(screen.getByTestId('who')).toHaveTextContent('signed out');
    expect(getAccessToken()).toBeNull();
  });

  it('signs in, stores the token in memory and exposes the role', async () => {
    const user = renderProbe();
    await user.click(screen.getByRole('button', { name: 'good login' }));

    await waitFor(() => expect(screen.getByTestId('who')).toHaveTextContent('admin:ADMIN'));
    expect(getAccessToken()).toBe('mock-token-ADMIN');
  });

  it('surfaces the invalid-credentials message and stays signed out', async () => {
    const user = renderProbe();
    await user.click(screen.getByRole('button', { name: 'bad login' }));

    expect(await screen.findByText('Invalid username or password.')).toBeInTheDocument();
    expect(screen.getByTestId('who')).toHaveTextContent('signed out');
    expect(getAccessToken()).toBeNull();
  });

  it('downgrades an unknown server role to VIEWER', async () => {
    server.use(
      http.post('*/api/auth/login', () =>
        HttpResponse.json({ token: 't', username: 'x', role: 'SUPERUSER' }),
      ),
    );
    const user = renderProbe();
    await user.click(screen.getByRole('button', { name: 'good login' }));

    await waitFor(() => expect(screen.getByTestId('who')).toHaveTextContent('x:VIEWER'));
  });

  it('clears the user and the token on logout', async () => {
    const user = renderProbe();
    await user.click(screen.getByRole('button', { name: 'good login' }));
    await waitFor(() => expect(screen.getByTestId('who')).toHaveTextContent('admin:ADMIN'));

    await user.click(screen.getByRole('button', { name: 'log out' }));
    expect(screen.getByTestId('who')).toHaveTextContent('signed out');
    expect(getAccessToken()).toBeNull();
  });
});
