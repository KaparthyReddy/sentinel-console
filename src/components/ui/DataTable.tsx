import type { ReactNode } from 'react';
import { cx } from '@/utils/cx';
import styles from './DataTable.module.css';

export interface Column<T> {
  key: string;
  header: string;
  render: (row: T) => ReactNode;
  align?: 'left' | 'right';
  /** Render this column's cells as row headers (<th scope="row">). */
  rowHeader?: boolean;
}

interface DataTableProps<T> {
  /** Accessible name for the table. */
  caption: string;
  columns: ReadonlyArray<Column<T>>;
  rows: ReadonlyArray<T>;
  getRowKey: (row: T) => string;
  emptyMessage?: string;
  /** Dims the table and marks it busy while new data loads. */
  busy?: boolean;
}

export function DataTable<T>({
  caption,
  columns,
  rows,
  getRowKey,
  emptyMessage = 'No results found.',
  busy = false,
}: DataTableProps<T>) {
  return (
    // A scrollable region must be reachable by keyboard, hence tabIndex={0}.
    // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex
    <div className={cx(styles.scroll, busy && styles.busy)} role="region" aria-label={caption} tabIndex={0}>
      <table className={styles.table} aria-busy={busy || undefined}>
        <caption className="visually-hidden">{caption}</caption>
        <thead>
          <tr>
            {columns.map((column) => (
              <th key={column.key} scope="col" className={cx(column.align === 'right' && styles.right)}>
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className={styles.empty}>
                {emptyMessage}
              </td>
            </tr>
          ) : (
            rows.map((row) => (
              <tr key={getRowKey(row)}>
                {columns.map((column) => {
                  const className = cx(column.align === 'right' && styles.right);
                  return column.rowHeader ? (
                    <th key={column.key} scope="row" className={className}>
                      {column.render(row)}
                    </th>
                  ) : (
                    <td key={column.key} className={className}>
                      {column.render(row)}
                    </td>
                  );
                })}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
