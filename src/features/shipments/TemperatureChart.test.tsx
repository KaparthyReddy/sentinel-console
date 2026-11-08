import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import type { TemperatureReading } from '@/api/types';
import { TemperatureChart } from './TemperatureChart';

const readings: TemperatureReading[] = [
  { timestamp: '2026-01-15T08:00:00.000Z', temperatureC: 5 },
  { timestamp: '2026-01-15T09:00:00.000Z', temperatureC: 3.5 },
  { timestamp: '2026-01-15T10:00:00.000Z', temperatureC: 9 },
];

describe('TemperatureChart', () => {
  it('gives the chart a text alternative with latest, lowest, highest and the range', () => {
    render(<TemperatureChart readings={readings} minC={2} maxC={8} />);
    expect(
      screen.getByRole('img', {
        name:
          'Line chart of 3 temperature readings. Latest 9.0 \u00b0C, lowest 3.5 \u00b0C, ' +
          'highest 9.0 \u00b0C. Allowed range 2 to 8 degrees Celsius.',
      }),
    ).toBeInTheDocument();
  });

  it('offers the same data as a table, collapsed by default', () => {
    const { container } = render(<TemperatureChart readings={readings} minC={2} maxC={8} />);
    expect(screen.getByText('View the latest readings as a table')).toBeInTheDocument();
    expect(container.querySelector('details')).not.toHaveAttribute('open');
  });

  it('shows an empty state when there are no readings', () => {
    render(<TemperatureChart readings={[]} minC={2} maxC={8} />);
    expect(screen.getByText('No readings yet')).toBeInTheDocument();
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
  });
});
