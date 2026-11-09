import type { Meta, StoryObj } from '@storybook/react';
import { ALERT_STATUSES, SEVERITIES, SHIPMENT_STATUSES } from '@/api/types';
import { Badge } from './Badge';
import { AlertStatusBadge, SeverityBadge, ShipmentStatusBadge } from './StatusBadges';

const meta = {
  title: 'UI/Badge',
  component: Badge,
  tags: ['autodocs'],
  args: { tone: 'high', children: 'High' },
} satisfies Meta<typeof Badge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Outlined: Story = { args: { outlined: true } };

/** Every badge carries text, so meaning never depends on colour alone. */
export const DomainBadges: Story = {
  render: () => (
    <div className="stack">
      <div className="cluster">
        {SEVERITIES.map((severity) => (
          <SeverityBadge key={severity} severity={severity} />
        ))}
      </div>
      <div className="cluster">
        {ALERT_STATUSES.map((status) => (
          <AlertStatusBadge key={status} status={status} />
        ))}
      </div>
      <div className="cluster">
        {SHIPMENT_STATUSES.map((status) => (
          <ShipmentStatusBadge key={status} status={status} />
        ))}
      </div>
    </div>
  ),
};
