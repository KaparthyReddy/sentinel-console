import { useState } from 'react';
import { useShipments } from '@/api/hooks';
import { SHIPMENT_STATUSES, type ShipmentStatus } from '@/api/types';
import { ErrorState } from '@/components/ui/ErrorState';
import { Pagination } from '@/components/ui/Pagination';
import { SelectField } from '@/components/ui/SelectField';
import { Spinner } from '@/components/ui/Spinner';
import { TextField } from '@/components/ui/TextField';
import { useDebounce } from '@/hooks/useDebounce';
import { errorMessage } from '@/utils/errors';
import { isShipmentStatus } from '@/utils/guards';
import { SHIPMENT_STATUS_LABEL } from '@/utils/severity';
import { ShipmentsTable } from './ShipmentsTable';
import styles from './ShipmentsView.module.css';

const PAGE_SIZE = 10;

const STATUS_OPTIONS = [
  { value: '', label: 'All statuses' },
  ...SHIPMENT_STATUSES.map((value) => ({ value, label: SHIPMENT_STATUS_LABEL[value] })),
];

export function ShipmentsView() {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<ShipmentStatus | ''>('');
  const [page, setPage] = useState(1);

  // Wait until the user pauses typing before querying the API.
  const debouncedSearch = useDebounce(search.trim(), 300);

  const query = useShipments({
    page,
    pageSize: PAGE_SIZE,
    search: debouncedSearch || undefined,
    status: status || undefined,
  });

  return (
    <div className="stack">
      <div role="group" aria-label="Filter shipments" className={styles.filters}>
        <TextField
          label="Search"
          type="search"
          hint="Reference, product or city"
          autoComplete="off"
          value={search}
          onChange={(event) => {
            setSearch(event.target.value);
            setPage(1);
          }}
        />
        <SelectField
          label="Status"
          options={STATUS_OPTIONS}
          value={status}
          onChange={(event) => {
            const value = event.target.value;
            setStatus(isShipmentStatus(value) ? value : '');
            setPage(1);
          }}
        />
      </div>

      {query.isPending && <Spinner block label="Loading shipments" />}
      {query.isError && (
        <ErrorState
          title="Could not load shipments"
          message={errorMessage(query.error)}
          onRetry={() => void query.refetch()}
        />
      )}
      {query.data && (
        <>
          <ShipmentsTable shipments={query.data.items} busy={query.isPlaceholderData} />
          <Pagination
            page={query.data.page}
            pageSize={query.data.pageSize}
            total={query.data.total}
            onPageChange={setPage}
          />
        </>
      )}
    </div>
  );
}
