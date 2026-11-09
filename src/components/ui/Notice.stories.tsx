import type { Meta, StoryObj } from '@storybook/react';
import { Notice } from './Notice';

const meta = {
  title: 'UI/Notice',
  component: Notice,
  tags: ['autodocs'],
  args: { children: 'Your changes have been saved.' },
} satisfies Meta<typeof Notice>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Info: Story = { args: { tone: 'info', title: 'Demo mode' } };
export const Success: Story = { args: { tone: 'success' } };
export const Warning: Story = { args: { tone: 'warning', title: 'Heads up' } };

/** Errors use role="alert" so screen readers announce them immediately. */
export const Error: Story = {
  args: { tone: 'error', title: 'Could not save', children: 'The server is not responding.' },
};
