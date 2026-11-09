import type { Meta, StoryObj } from '@storybook/react';
import { makeAlert } from '@/test/factories';
import { AlertsTable } from './AlertsTable';

const alerts = [
  makeAlert({ id: '1', shipmentRef: 'CC-2026-0002', severity: 'CRITICAL', status: 'OPEN' }),
  makeAlert({ id: '2', shipmentRef: 'CC-2026-0008', severity: 'HIGH', status: 'OPEN' }),
  makeAlert({ id: '3', shipmentRef: 'CC-2026-0014', severity: 'MEDIUM', status: 'ACKNOWLEDGED' }),
  makeAlert({ id: '4', shipmentRef: 'CC-2026-0020', severity: 'LOW', status: 'RESOLVED' }),
];

const meta = {
  title: 'Features/AlertsTable',
  component: AlertsTable,
  tags: ['autodocs'],
  args: { alerts, canAct: true, pendingId: null, onAction: () => {} },
} satisfies Meta<typeof AlertsTable>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Operators and admins get an Actions column. */
export const Operator: Story = {};

/** Viewers are read-only: the Actions column is not rendered at all. */
export const ReadOnlyViewer: Story = { args: { canAct: false } };

export const ActionInFlight: Story = { args: { pendingId: '1' } };
export const Empty: Story = { args: { alerts: [] } };
