import { Link } from 'react-router-dom';
import { useShipments } from '@/api/hooks';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { Spinner } from '@/components/ui/Spinner';
import { errorMessage } from '@/utils/errors';
import { ShipmentsTable } from '@/features/shipments/ShipmentsTable';

export function AtRiskShipments() {
  const { data, isPending, isError, error, refetch } = useShipments({
    page: 1,
    pageSize: 5,
    status: 'AT_RISK',
  });

  return (
    <Card
      title="Shipments at risk"
      actions={<Link to="/shipments">View all shipments</Link>}
    >
      {isPending && <Spinner block label="Loading shipments at risk" />}
      {isError && (
        <ErrorState
          title="Could not load shipments"
          message={errorMessage(error)}
          onRetry={() => void refetch()}
        />
      )}
      {data &&
        (data.items.length === 0 ? (
          <EmptyState
            title="No shipments at risk"
            description="Every active shipment is within its temperature range."
          />
        ) : (
          <ShipmentsTable shipments={data.items} caption="Shipments currently at risk" />
        ))}
    </Card>
  );
}
