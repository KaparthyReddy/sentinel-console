import { useThresholds } from '@/api/hooks';
import { can } from '@/auth/permissions';
import { useAuth } from '@/auth/useAuth';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { Spinner } from '@/components/ui/Spinner';
import { errorMessage } from '@/utils/errors';
import { ThresholdForm } from './ThresholdForm';
import styles from './ThresholdsView.module.css';

export function ThresholdsView() {
  const { user } = useAuth();
  const query = useThresholds();
  const canEdit = user ? can(user.role, 'thresholds:edit') : false;

  if (query.isPending) return <Spinner block label="Loading thresholds" />;
  if (query.isError) {
    return (
      <ErrorState
        title="Could not load thresholds"
        message={errorMessage(query.error)}
        onRetry={() => void query.refetch()}
      />
    );
  }
  if (query.data.length === 0) {
    return <EmptyState title="No thresholds configured" />;
  }

  return (
    <ul className={styles.list}>
      {query.data.map((threshold) => (
        <li key={threshold.id}>
          {canEdit ? (
            <ThresholdForm threshold={threshold} />
          ) : (
            <Card title={threshold.product}>
              <p>{`${threshold.minTempC} to ${threshold.maxTempC} \u00b0C`}</p>
            </Card>
          )}
        </li>
      ))}
    </ul>
  );
}
