import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';
import { server } from '@/mocks/server';
import {
  expectNoAxeViolations,
  renderWithProviders,
  screen,
  userEvent,
  waitFor,
  within,
} from '@/test/test-utils';
import { AlertsView } from './AlertsView';

const OPERATOR = { username: 'operator', role: 'OPERATOR' } as const;
const VIEWER = { username: 'viewer', role: 'VIEWER' } as const;

describe('AlertsView', () => {
  it('lists alerts in a labelled table', async () => {
    renderWithProviders(<AlertsView />, { user: OPERATOR });
    expect(await screen.findByRole('table', { name: 'Alerts' })).toBeInTheDocument();
  });

  it('gives operators an Actions column with Acknowledge buttons', async () => {
    renderWithProviders(<AlertsView />, { user: OPERATOR });
    const buttons = await screen.findAllByRole('button', { name: /^Acknowledge alert for/ });
    expect(buttons.length).toBeGreaterThan(0);
    expect(screen.getByRole('columnheader', { name: 'Actions' })).toBeInTheDocument();
  });

  it('keeps viewers read-only', async () => {
    renderWithProviders(<AlertsView />, { user: VIEWER });
    await screen.findByRole('table', { name: 'Alerts' });
    expect(screen.queryByRole('columnheader', { name: 'Actions' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /alert for/i })).not.toBeInTheDocument();
  });

  it('acknowledges an alert and announces the result', async () => {
    const user = userEvent.setup();
    renderWithProviders(<AlertsView />, { user: OPERATOR });

    const [first] = await screen.findAllByRole('button', { name: /^Acknowledge alert for/ });
    await user.click(first);

    expect(
      await screen.findByText(/^Alert for CC-\d{4}-\d{4} acknowledged\.$/),
    ).toBeInTheDocument();
  });

  it('shows the server message when an action fails', async () => {
    server.use(
      http.post('*/api/alerts/:id/:action', () =>
        HttpResponse.json({ message: 'Boom' }, { status: 500 }),
      ),
    );
    const user = userEvent.setup();
    renderWithProviders(<AlertsView />, { user: OPERATOR });

    const [first] = await screen.findAllByRole('button', { name: /^Resolve alert for/ });
    await user.click(first);

    expect(await screen.findByRole('alert')).toHaveTextContent('Boom');
  });

  it('filters by severity', async () => {
    const user = userEvent.setup();
    renderWithProviders(<AlertsView />, { user: OPERATOR });
    await screen.findByRole('table', { name: 'Alerts' });

    await user.selectOptions(screen.getByLabelText('Severity'), 'CRITICAL');

    await waitFor(() => {
      const table = screen.getByRole('table', { name: 'Alerts' });
      const rows = within(table).getAllByRole('row').slice(1); // skip the header row
      expect(rows.length).toBeGreaterThan(0);
      for (const row of rows) {
        expect(within(row).getByText('Critical')).toBeInTheDocument();
      }
    });
  });

  it('shows a message when no alerts match', async () => {
    server.use(
      http.get('*/api/alerts', () =>
        HttpResponse.json({ items: [], total: 0, page: 1, pageSize: 10 }),
      ),
    );
    renderWithProviders(<AlertsView />, { user: OPERATOR });
    expect(await screen.findByText('No alerts match these filters.')).toBeInTheDocument();
  });

  it('recovers from a load error with Try again', async () => {
    server.use(
      http.get('*/api/alerts', () =>
        HttpResponse.json({ message: 'Server down' }, { status: 500 }),
      ),
    );
    const user = userEvent.setup();
    renderWithProviders(<AlertsView />, { user: OPERATOR });

    expect(await screen.findByText('Server down')).toBeInTheDocument();

    server.resetHandlers(); // the API "comes back"
    await user.click(screen.getByRole('button', { name: 'Try again' }));
    expect(await screen.findByRole('table', { name: 'Alerts' })).toBeInTheDocument();
  });

  it('has no accessibility violations once loaded', async () => {
    const { container } = renderWithProviders(<AlertsView />, { user: OPERATOR });
    await screen.findByRole('table', { name: 'Alerts' });
    await expectNoAxeViolations(container);
  });
});
