import { describe, expect, it } from 'vitest';
import { renderWithProviders, screen } from '@/test/test-utils';
import { ShipmentDetail } from './ShipmentDetail';

describe('ShipmentDetail', () => {
  it('shows the shipment reference as the page heading', async () => {
    renderWithProviders(<ShipmentDetail id="shp-002" />);
    expect(
      await screen.findByRole('heading', { level: 1, name: 'CC-2026-0002' }),
    ).toBeInTheDocument();
  });

  it('flags a shipment that is out of range', async () => {
    renderWithProviders(<ShipmentDetail id="shp-002" />);
    expect(await screen.findByText('Out of range')).toBeInTheDocument();
    expect(screen.getByText('At risk')).toBeInTheDocument();
  });

  it('shows a delivered shipment as delivered', async () => {
    renderWithProviders(<ShipmentDetail id="shp-001" />);
    expect(await screen.findByText('Delivered')).toBeInTheDocument();
  });

  it('describes the temperature history chart in text', async () => {
    renderWithProviders(<ShipmentDetail id="shp-002" />);
    expect(
      await screen.findByRole('img', { name: /Line chart of 48 temperature readings/ }),
    ).toBeInTheDocument();
  });

  it('shows the API message when the shipment does not exist', async () => {
    renderWithProviders(<ShipmentDetail id="nope" />);
    expect(await screen.findByText('Could not load this shipment')).toBeInTheDocument();
    expect(screen.getByText('Shipment not found.')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Back to shipments' })).toBeInTheDocument();
  });
});
