import type { Meta, StoryObj } from '@storybook/react';
import { TemperatureChart } from './TemperatureChart';

const start = Date.parse('2026-01-15T00:00:00.000Z');
const readings = Array.from({ length: 48 }, (_, index) => ({
  timestamp: new Date(start + index * 30 * 60_000).toISOString(),
  temperatureC: Math.round((5 + Math.sin(index / 5) * 2.2) * 10) / 10,
}));

const meta = {
  title: 'Features/TemperatureChart',
  component: TemperatureChart,
  tags: ['autodocs'],
  args: { readings, minC: 2, maxC: 8 },
} satisfies Meta<typeof TemperatureChart>;

export default meta;
type Story = StoryObj<typeof meta>;

export const WithinRange: Story = {};

export const WithExcursion: Story = {
  args: {
    readings: readings.map((reading, index) =>
      index >= 44 ? { ...reading, temperatureC: 8 + (index - 43) * 1.2 } : reading,
    ),
  },
};

export const NoReadings: Story = { args: { readings: [] } };
