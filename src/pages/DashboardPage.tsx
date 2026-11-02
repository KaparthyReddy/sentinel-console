import { PageHeader } from '@/components/layout/PageHeader';
import { LiveAlertFeed } from '@/features/alerts/LiveAlertFeed';
import { AtRiskShipments } from '@/features/dashboard/AtRiskShipments';
import { SummaryCards } from '@/features/dashboard/SummaryCards';
import styles from './DashboardPage.module.css';

export function DashboardPage() {
  return (
    <>
      <PageHeader
        title="Dashboard"
        description="Live overview of cold-chain shipments and temperature alerts."
      />
      <SummaryCards />
      <div className={styles.columns}>
        <AtRiskShipments />
        <LiveAlertFeed />
      </div>
    </>
  );
}
