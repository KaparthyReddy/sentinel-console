import type { Meta, StoryObj } from '@storybook/react';
import { DataTable, type Column } from './DataTable';

interface Row {
  id: string;
  product: string;
  temperature: number;
}

const rows: Row[] = [
  { id: '1', product: 'Insulin', temperature: 5.1 },
  { id: '2', product: 'Influenza vaccine', temperature: 4.4 },
  { id: '3', product: 'Blood plasma', temperature: -21.2 },
];

const columns: Column<Row>[] = [
  { key: 'product', header: 'Product', rowHeader: true, render: (row) => row.product },
  {
    key: 'temperature',
    header: 'Temperature',
    align: 'right',
    render: (row) => `${row.temperature.toFixed(1)} \u00b0C`,
  },
];

// A small non-generic wrapper keeps the story types simple
function SampleTable({ rows: data, busy }: { rows: Row[]; busy?: boolean }) {
  return (
    <DataTable
      caption="Sample shipments"
      columns={columns}
      rows={data}
      getRowKey={(row) => row.id}
      busy={busy}
    />
  );
}

const meta = {
  title: 'UI/DataTable',
  component: SampleTable,
  tags: ['autodocs'],
  args: { rows },
} satisfies Meta<typeof SampleTable>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Loading: Story = { args: { busy: true } };
export const Empty: Story = { args: { rows: [] } };
