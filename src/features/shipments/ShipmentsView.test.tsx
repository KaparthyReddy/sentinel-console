import { describe, expect, it } from 'vitest';
import {
  expectNoAxeViolations,
  renderWithProviders,
  screen,
  userEvent,
  within,
} from '@/test/test-utils';
import { ShipmentsView } from './ShipmentsView';

const SLOW = { timeout: 3000 };

describe('ShipmentsView', () => {
  it('shows the first page of shipments', async () => {
    renderWithProviders(<ShipmentsView />);

    const table = await screen.findByRole('table', { name: 'Shipments' });
    expect(within(table).getAllByRole('row')).toHaveLength(11); // header + 10 rows
    expect(await screen.findByText(/Showing 1.10 of 24/)).toBeInTheDocument();
  });

  it('moves to the next page', async () => {
    const user = userEvent.setup();
    renderWithProviders(<ShipmentsView />);
    await screen.findByRole('table', { name: 'Shipments' });

    await user.click(screen.getByRole('button', { name: 'Next' }));
    expect(await screen.findByText(/Showing 11.20 of 24/, {}, SLOW)).toBeInTheDocument();
  });

  it('searches after the user pauses typing', async () => {
    const user = userEvent.setup();
    renderWithProviders(<ShipmentsView />);
    await screen.findByRole('table', { name: 'Shipments' });

    await user.type(screen.getByLabelText('Search'), 'insulin');
    expect(await screen.findByText(/Showing 1.5 of 5/, {}, SLOW)).toBeInTheDocument();
  });

  it('filters by status', async () => {
    const user = userEvent.setup();
    renderWithProviders(<ShipmentsView />);
    await screen.findByRole('table', { name: 'Shipments' });

    await user.selectOptions(screen.getByLabelText('Status'), 'AT_RISK');
    expect(await screen.findByText(/Showing 1.4 of 4/, {}, SLOW)).toBeInTheDocument();
  });

  it('shows a message when the search matches nothing', async () => {
    const user = userEvent.setup();
    renderWithProviders(<ShipmentsView />);
    await screen.findByRole('table', { name: 'Shipments' });

    await user.type(screen.getByLabelText('Search'), 'zzzz');
    expect(
      await screen.findByText('No shipments match your search.', {}, SLOW),
    ).toBeInTheDocument();
  });

  it('has no accessibility violations once loaded', async () => {
    const { container } = renderWithProviders(<ShipmentsView />);
    await screen.findByRole('table', { name: 'Shipments' });
    await expectNoAxeViolations(container);
  });
});
