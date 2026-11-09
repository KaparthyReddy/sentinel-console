import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Pagination } from './Pagination';

function PaginationDemo({ total }: { total: number }) {
  const [page, setPage] = useState(1);
  return <Pagination page={page} pageSize={10} total={total} onPageChange={setPage} />;
}

const meta = {
  title: 'UI/Pagination',
  component: PaginationDemo,
  tags: ['autodocs'],
  args: { total: 47 },
} satisfies Meta<typeof PaginationDemo>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const SinglePage: Story = { args: { total: 6 } };
export const NoResults: Story = { args: { total: 0 } };
