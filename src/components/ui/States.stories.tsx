import type { Meta, StoryObj } from '@storybook/react';
import { Button } from './Button';
import { EmptyState } from './EmptyState';
import { ErrorState } from './ErrorState';
import { Spinner } from './Spinner';

const meta = {
  title: 'UI/States',
  component: EmptyState,
  args: {
    title: 'No shipments at risk',
    description: 'Every active shipment is within its temperature range.',
  },
} satisfies Meta<typeof EmptyState>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Empty: Story = {
  args: { action: <Button variant="secondary">Clear filters</Button> },
};

export const Error: Story = {
  render: () => (
    <ErrorState
      title="Could not load alerts"
      message="Cannot reach the server. Check your connection and try again."
      onRetry={() => {}}
    />
  ),
};

/** The label is announced by screen readers via role="status". */
export const Loading: Story = {
  render: () => <Spinner block label="Loading alerts" showLabel />,
};
