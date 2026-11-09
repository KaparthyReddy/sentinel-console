import { Link } from 'react-router-dom';
import { useReadings, useShipment } from '@/api/hooks';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { ErrorState } from '@/components/ui/ErrorState';
import { Spinner } from '@/components/ui/Spinner';
import { ShipmentStatusBadge } from '@/components/ui/StatusBadges';
import { PageHeader } from '@/components/layout/PageHeader';
import { errorMessage } from '@/utils/errors';
import { formatDateTime, formatTemperature } from '@/utils/format';
import { isOutOfRange } from '@/utils/temperature';
import { TemperatureChart } from './TemperatureChart';
import styles from './ShipmentDetail.module.css';

interface ShipmentDetailProps {
  id: string;
}

export function ShipmentDetail({ id }: ShipmentDetailProps) {
  const shipmentQuery = useShipment(id);
  const readingsQuery = useReadings(id);

  if (shipmentQuery.isPending) {
    return (
      <>
        <PageHeader title="Shipment" />
        <Spinner block label="Loading shipment" />
      </>
    );
  }

  if (shipmentQuery.isError) {
    return (
      <>
        <PageHeader title="Shipment" />
        <ErrorState
          title="Could not load this shipment"
          message={errorMessage(shipmentQuery.error)}
          onRetry={() => void shipmentQuery.refetch()}
        />
        <p>
          <Link to="/shipments">Back to shipments</Link>
        </p>
      </>
    );
  }

  const shipment = shipmentQuery.data;
  const outOfRange = isOutOfRange(shipment.currentTempC, shipment.minTempC, shipment.maxTempC);

  return (
    <div className="stack">
      <PageHeader
        title={shipment.reference}
        description={`${shipment.product} \u00b7 ${shipment.origin} to ${shipment.destination}`}
        actions={<Link to="/shipments">Back to shipments</Link>}
      />

      <Card title="Details">
        <dl className={styles.facts}>
          <div>
            <dt>Status</dt>
            <dd>
              <ShipmentStatusBadge status={shipment.status} />
            </dd>
          </div>
          <div>
            <dt>Current temperature</dt>
            <dd className="cluster">
              <span>{formatTemperature(shipment.currentTempC)}</span>
              {outOfRange && <Badge tone="critical">Out of range</Badge>}
            </dd>
          </div>
          <div>
            <dt>Allowed range</dt>
            <dd>{`${shipment.minTempC} to ${shipment.maxTempC} \u00b0C`}</dd>
          </div>
          <div>
            <dt>Last reading</dt>
            <dd>
              <time dateTime={shipment.lastReadingAt}>
                {formatDateTime(shipment.lastReadingAt)}
              </time>
            </dd>
          </div>
        </dl>
      </Card>

      <Card title="Temperature history">
        {readingsQuery.isPending && <Spinner block label="Loading readings" />}
        {readingsQuery.isError && (
          <ErrorState
            title="Could not load readings"
            message={errorMessage(readingsQuery.error)}
            onRetry={() => void readingsQuery.refetch()}
          />
        )}
        {readingsQuery.data && (
          <TemperatureChart
            readings={readingsQuery.data}
            minC={shipment.minTempC}
            maxC={shipment.maxTempC}
          />
        )}
      </Card>
    </div>
  );
}
