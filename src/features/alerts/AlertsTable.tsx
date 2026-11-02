import { Link } from 'react-router-dom';
import type { Alert, AlertAction } from '@/api/types';
import { DataTable, type Column } from '@/components/ui/DataTable';
import { AlertStatusBadge, SeverityBadge } from '@/components/ui/StatusBadges';
import { formatDateTime } from '@/utils/format';
import { AlertActions } from './AlertActions';

interface AlertsTableProps {
  alerts: ReadonlyArray<Alert>;
  /** Whether the signed-in role may acknowledge / resolve alerts. */
  canAct: boolean;
  /** Id of the alert with a request in flight, if any. */
  pendingId: string | null;
  busy?: boolean;
  caption?: string;
  onAction: (id: string, action: AlertAction) => void;
}

export function AlertsTable({
  alerts,
  canAct,
  pendingId,
  busy = false,
  caption = 'Alerts',
  onAction,
}: AlertsTableProps) {
  const columns: Column<Alert>[] = [
    {
      key: 'shipment',
      header: 'Shipment',
      rowHeader: true,
      render: (alert) => <Link to={`/shipments/${alert.shipmentId}`}>{alert.shipmentRef}</Link>,
    },
    { key: 'severity', header: 'Severity', render: (alert) => <SeverityBadge severity={alert.severity} /> },
    { key: 'status', header: 'Status', render: (alert) => <AlertStatusBadge status={alert.status} /> },
    { key: 'details', header: 'Details', render: (alert) => alert.message },
    {
      key: 'raised',
      header: 'Raised',
      render: (alert) => <time dateTime={alert.createdAt}>{formatDateTime(alert.createdAt)}</time>,
    },
  ];

  if (canAct) {
    columns.push({
      key: 'actions',
      header: 'Actions',
      render: (alert) => (
        <AlertActions alert={alert} pending={pendingId === alert.id} onAction={onAction} />
      ),
    });
  }

  return (
    <DataTable
      caption={caption}
      columns={columns}
      rows={alerts}
      getRowKey={(alert) => alert.id}
      emptyMessage="No alerts match these filters."
      busy={busy}
    />
  );
}
