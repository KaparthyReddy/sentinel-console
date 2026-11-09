import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { Meta, StoryObj } from '@storybook/react';
import { makeAlert } from '@/test/factories';
import { FakeSocket } from '@/test/fakeSocket';
import { LiveAlertFeed } from './LiveAlertFeed';

const queryClient = new QueryClient();

/** A scripted socket: connects, then delivers two alerts. */
function createDemoSocket(): FakeSocket {
  const socket = new FakeSocket();
  setTimeout(() => socket.open(), 300);
  setTimeout(
    () =>
      socket.send(
        makeAlert({
          id: 'demo-1',
          severity: 'CRITICAL',
          shipmentRef: 'CC-2026-0007',
          message: 'Temperature 14.0 \u00b0C exceeded the maximum of 8 \u00b0C',
          createdAt: new Date().toISOString(),
        }),
      ),
    1200,
  );
  setTimeout(
    () =>
      socket.send(
        makeAlert({
          id: 'demo-2',
          severity: 'MEDIUM',
          shipmentRef: 'CC-2026-0012',
          message: 'Temperature 9.6 \u00b0C exceeded the maximum of 8 \u00b0C',
          createdAt: new Date().toISOString(),
        }),
      ),
    3000,
  );
  return socket;
}

const meta = {
  title: 'Features/LiveAlertFeed',
  component: LiveAlertFeed,
  decorators: [
    (Story) => (
      <QueryClientProvider client={queryClient}>
        <Story />
      </QueryClientProvider>
    ),
  ],
} satisfies Meta<typeof LiveAlertFeed>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Streaming: Story = { args: { createSocket: createDemoSocket } };

export const Unavailable: Story = {
  args: {
    createSocket: () => {
      throw new Error('WebSocket not configured');
    },
  },
};
