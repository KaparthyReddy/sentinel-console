import { Link } from 'react-router-dom';
import type { Shipment } from '@/api/types';
import { Badge } from '@/components/ui/Badge';
import { DataTable, type Column } from '@/components/ui/DataTable';
import { ShipmentStatusBadge } from '@/components/ui/StatusBadges';
import { formatRelativeTime, formatTemperature } from '@/utils/format';
import { isOutOfRange } from '@/utils/temperature';

interface ShipmentsTableProps {
  shipments: ReadonlyArray<Shipment>;
  busy?: boolean;
  caption?: string;
}

const columns: Column<Shipment>[] = [
  {
    key: 'reference',
    header: 'Reference',
    rowHeader: true,
    render: (shipment) => <Link to={`/shipments/${shipment.id}`}>{shipment.reference}</Link>,
  },
  { key: 'product', header: 'Product', render: (shipment) => shipment.product },
  {
    key: 'route',
    header: 'Route',
    render: (shipment) => `${shipment.origin} to ${shipment.destination}`,
  },
  {
    key: 'status',
    header: 'Status',
    render: (shipment) => <ShipmentStatusBadge status={shipment.status} />,
  },
  {
    key: 'temperature',
    header: 'Temperature',
    render: (shipment) => (
      <span className="cluster" style={{ '--cluster-gap': '0.5rem' } as React.CSSProperties}>
        <span>{formatTemperature(shipment.currentTempC)}</span>
        {isOutOfRange(shipment.currentTempC, shipment.minTempC, shipment.maxTempC) && (
          <Badge tone="critical">Out of range</Badge>
        )}
      </span>
    ),
  },
  {
    key: 'range',
    header: 'Allowed range',
    render: (shipment) => `${shipment.minTempC} to ${shipment.maxTempC} \u00b0C`,
  },
  {
    key: 'last',
    header: 'Last reading',
    render: (shipment) => (
      <time dateTime={shipment.lastReadingAt}>{formatRelativeTime(shipment.lastReadingAt)}</time>
    ),
  },
];

export function ShipmentsTable({
  shipments,
  busy = false,
  caption = 'Shipments',
}: ShipmentsTableProps) {
  return (
    <DataTable
      caption={caption}
      columns={columns}
      rows={shipments}
      getRowKey={(shipment) => shipment.id}
      emptyMessage="No shipments match your search."
      busy={busy}
    />
  );
}
