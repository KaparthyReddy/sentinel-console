import { act } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type { AlertSocketLike } from '@/hooks/alertSocket';
import { makeAlert } from '@/test/factories';
import { createSocketFactory } from '@/test/fakeSocket';
import { expectNoAxeViolations, renderWithProviders, screen, within } from '@/test/test-utils';
import { LiveAlertFeed } from './LiveAlertFeed';

describe('LiveAlertFeed', () => {
  it('starts in a waiting state while connecting', () => {
    const { createSocket } = createSocketFactory();
    renderWithProviders(<LiveAlertFeed createSocket={createSocket} />);

    expect(screen.getByText('Waiting for alerts')).toBeInTheDocument();
    expect(screen.getByText('Connecting\u2026')).toBeInTheDocument();
  });

  it('shows "Live" once the connection opens', () => {
    const { sockets, createSocket } = createSocketFactory();
    renderWithProviders(<LiveAlertFeed createSocket={createSocket} />);

    act(() => sockets[0].open());
    expect(screen.getByText('Live')).toBeInTheDocument();
  });

  it('lists a new alert and announces it to screen readers', () => {
    const { sockets, createSocket } = createSocketFactory();
    renderWithProviders(<LiveAlertFeed createSocket={createSocket} />);

    act(() => {
      sockets[0].open();
      sockets[0].send(
        makeAlert({
          id: 'a1',
          severity: 'CRITICAL',
          shipmentRef: 'CC-2026-0007',
          message: 'Temperature 14.0 \u00b0C exceeded the maximum of 8 \u00b0C',
        }),
      );
    });

    const list = screen.getByRole('list', { name: 'Recent live alerts' });
    expect(within(list).getByRole('link', { name: 'CC-2026-0007' })).toBeInTheDocument();
    expect(within(list).getByText('Critical')).toBeInTheDocument();
    expect(within(list).getByText(/exceeded the maximum/)).toBeInTheDocument();
    expect(screen.getByText(/^New Critical alert for CC-2026-0007/)).toBeInTheDocument();
  });

  it('shows the newest alert first', () => {
    const { sockets, createSocket } = createSocketFactory();
    renderWithProviders(<LiveAlertFeed createSocket={createSocket} />);

    act(() => {
      sockets[0].send(makeAlert({ id: 'a', shipmentRef: 'CC-2026-0001' }));
      sockets[0].send(makeAlert({ id: 'b', shipmentRef: 'CC-2026-0002' }));
    });

    const items = within(screen.getByRole('list', { name: 'Recent live alerts' })).getAllByRole(
      'listitem',
    );
    expect(items[0]).toHaveTextContent('CC-2026-0002');
    expect(items[1]).toHaveTextContent('CC-2026-0001');
  });

  it('refreshes alerts, shipments and the summary when an alert arrives', () => {
    const { sockets, createSocket } = createSocketFactory();
    const { queryClient } = renderWithProviders(<LiveAlertFeed createSocket={createSocket} />);
    const spy = vi.spyOn(queryClient, 'invalidateQueries');

    act(() => sockets[0].send(makeAlert()));

    expect(spy).toHaveBeenCalledWith({ queryKey: ['alerts'] });
    expect(spy).toHaveBeenCalledWith({ queryKey: ['shipments'] });
    expect(spy).toHaveBeenCalledWith({ queryKey: ['summary'] });
  });

  it('says live updates are unavailable when no socket can be created', () => {
    const createSocket = (): AlertSocketLike => {
      throw new Error('not configured');
    };
    renderWithProviders(<LiveAlertFeed createSocket={createSocket} />);
    expect(screen.getByText('Live updates unavailable')).toBeInTheDocument();
  });

  it('has no accessibility violations with alerts listed', async () => {
    const { sockets, createSocket } = createSocketFactory();
    const { container } = renderWithProviders(<LiveAlertFeed createSocket={createSocket} />);
    act(() => sockets[0].send(makeAlert()));
    await expectNoAxeViolations(container);
  });
});
