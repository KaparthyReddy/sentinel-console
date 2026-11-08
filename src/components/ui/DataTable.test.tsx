import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { expectNoAxeViolations } from '@/test/test-utils';
import { DataTable, type Column } from './DataTable';

interface Row {
  id: string;
  name: string;
  value: number;
}

const rows: Row[] = [
  { id: '1', name: 'Alpha', value: 10 },
  { id: '2', name: 'Beta', value: 20 },
];

const columns: Column<Row>[] = [
  { key: 'name', header: 'Name', rowHeader: true, render: (row) => row.name },
  { key: 'value', header: 'Value', align: 'right', render: (row) => `${row.value} units` },
];

function renderTable(overrides: Partial<Parameters<typeof DataTable<Row>>[0]> = {}) {
  return render(
    <DataTable
      caption="Test table"
      columns={columns}
      rows={rows}
      getRowKey={(row) => row.id}
      {...overrides}
    />,
  );
}

describe('DataTable', () => {
  it('names the table from its caption', () => {
    renderTable();
    expect(screen.getByRole('table', { name: 'Test table' })).toBeInTheDocument();
  });

  it('renders a column header for each column', () => {
    renderTable();
    expect(screen.getAllByRole('columnheader').map((cell) => cell.textContent)).toEqual([
      'Name',
      'Value',
    ]);
  });

  it('renders row headers and cells from the render functions', () => {
    renderTable();
    expect(screen.getAllByRole('rowheader').map((cell) => cell.textContent)).toEqual([
      'Alpha',
      'Beta',
    ]);
    expect(screen.getByRole('cell', { name: '10 units' })).toBeInTheDocument();
    expect(screen.getByRole('cell', { name: '20 units' })).toBeInTheDocument();
  });

  it('shows the default empty message when there are no rows', () => {
    renderTable({ rows: [] });
    expect(screen.getByText('No results found.')).toBeInTheDocument();
  });

  it('shows a custom empty message', () => {
    renderTable({ rows: [], emptyMessage: 'Nothing here yet.' });
    expect(screen.getByText('Nothing here yet.')).toBeInTheDocument();
  });

  it('marks the table busy while new data loads', () => {
    renderTable({ busy: true });
    expect(screen.getByRole('table', { name: 'Test table' })).toHaveAttribute('aria-busy', 'true');
  });

  it('is not marked busy by default', () => {
    renderTable();
    expect(screen.getByRole('table', { name: 'Test table' })).not.toHaveAttribute('aria-busy');
  });

  it('makes the scrollable region keyboard focusable', () => {
    renderTable();
    expect(screen.getByRole('region', { name: 'Test table' })).toHaveAttribute('tabindex', '0');
  });

  it('has no accessibility violations, with rows or empty', async () => {
    const { container } = renderTable();
    await expectNoAxeViolations(container);

    const empty = renderTable({ rows: [], caption: 'Empty table' });
    await expectNoAxeViolations(empty.container);
  });
});
