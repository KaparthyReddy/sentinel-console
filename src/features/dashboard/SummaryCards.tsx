import { useSummary } from '@/api/hooks';
import { ErrorState } from '@/components/ui/ErrorState';
import { Spinner } from '@/components/ui/Spinner';
import { cx } from '@/utils/cx';
import { errorMessage } from '@/utils/errors';
import styles from './SummaryCards.module.css';

export function SummaryCards() {
  const { data, isPending, isError, error, refetch } = useSummary();

  if (isPending) return <Spinner block label="Loading summary" />;
  if (isError) {
    return (
      <ErrorState
        title="Could not load the summary"
        message={errorMessage(error)}
        onRetry={() => void refetch()}
      />
    );
  }

  const items = [
    { label: 'Active shipments', value: data.activeShipments, attention: false },
    { label: 'Shipments at risk', value: data.shipmentsAtRisk, attention: data.shipmentsAtRisk > 0 },
    { label: 'Open alerts', value: data.openAlerts, attention: data.openAlerts > 0 },
    { label: 'Critical alerts', value: data.criticalAlerts, attention: data.criticalAlerts > 0 },
  ];

  return (
    <section aria-label="Summary">
      <dl className="grid-auto" style={{ '--grid-min': '12rem', margin: 0 } as React.CSSProperties}>
        {items.map((item) => (
          <div key={item.label} className={cx(styles.card, item.attention && styles.attention)}>
            <dt className={styles.label}>{item.label}</dt>
            <dd className={styles.value}>
              {item.value}
              {item.attention && <span className={styles.note}>Needs attention</span>}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
