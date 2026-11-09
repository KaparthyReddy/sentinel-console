import type { Meta, StoryObj } from '@storybook/react';
import { TextField } from './TextField';

const meta = {
  title: 'UI/TextField',
  component: TextField,
  tags: ['autodocs'],
  args: { label: 'Username' },
} satisfies Meta<typeof TextField>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const WithHint: Story = { args: { label: 'Search', hint: 'Reference, product or city' } };

/** The error is wired to the input with aria-describedby and aria-invalid. */
export const WithError: Story = { args: { error: 'Enter your username.' } };
export const Password: Story = { args: { label: 'Password', type: 'password' } };
