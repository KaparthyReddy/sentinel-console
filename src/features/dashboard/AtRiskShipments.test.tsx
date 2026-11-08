import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';
import { getDb } from '@/mocks/data';
import { server } from '@/mocks/server';
import { renderWithProviders, screen, within } from '@/test/test-utils';
import { AtRiskShipments } from './AtRiskShipments';

describe('AtRiskShipments', () => {
  it('lists every at-risk shipment', async () => {
    renderWithProviders(<AtRiskShipments />);
    const expected = getDb().shipments.filter((shipment) => shipment.status === 'AT_RISK').length;

    const table = await screen.findByRole('table', { name: 'Shipments currently at risk' });
    expect(within(table).getAllByRole('rowheader')).toHaveLength(expected);
  });

  it('links to the full shipments page', async () => {
    renderWithProviders(<AtRiskShipments />);
    await screen.findByRole('table', { name: 'Shipments currently at risk' });
    expect(screen.getByRole('link', { name: 'View all shipments' })).toHaveAttribute(
      'href',
      '/shipments',
    );
  });

  it('shows a reassuring empty state when nothing is at risk', async () => {
    server.use(
      http.get('*/api/shipments', () =>
        HttpResponse.json({ items: [], total: 0, page: 1, pageSize: 5 }),
      ),
    );
    renderWithProviders(<AtRiskShipments />);
    expect(await screen.findByText('No shipments at risk')).toBeInTheDocument();
  });
});
