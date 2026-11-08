import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';
import { summarize } from '@/mocks/data';
import { server } from '@/mocks/server';
import { expectNoAxeViolations, renderWithProviders, screen } from '@/test/test-utils';
import { SummaryCards } from './SummaryCards';

describe('SummaryCards', () => {
  it('shows each figure from the API as a term and definition', async () => {
    renderWithProviders(<SummaryCards />);
    const expected = summarize();
    const rows: Array<[string, number]> = [
      ['Active shipments', expected.activeShipments],
      ['Shipments at risk', expected.shipmentsAtRisk],
      ['Open alerts', expected.openAlerts],
      ['Critical alerts', expected.criticalAlerts],
    ];

    for (const [label, value] of rows) {
      const term = await screen.findByText(label);
      expect(term.nextElementSibling).toHaveTextContent(new RegExp(`^${value}`));
    }
  });

  it('flags figures that need attention', async () => {
    renderWithProviders(<SummaryCards />);
    expect((await screen.findAllByText('Needs attention')).length).toBeGreaterThan(0);
  });

  it('shows an error with a retry button when the request fails', async () => {
    server.use(
      http.get('*/api/dashboard/summary', () =>
        HttpResponse.json({ message: 'Boom' }, { status: 500 }),
      ),
    );
    renderWithProviders(<SummaryCards />);

    expect(await screen.findByText('Could not load the summary')).toBeInTheDocument();
    expect(screen.getByText('Boom')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Try again' })).toBeInTheDocument();
  });

  it('has no accessibility violations once loaded', async () => {
    const { container } = renderWithProviders(<SummaryCards />);
    await screen.findByText('Active shipments');
    await expectNoAxeViolations(container);
  });
});
