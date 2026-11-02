import { PageHeader } from '@/components/layout/PageHeader';
import { AlertsView } from '@/features/alerts/AlertsView';

export function AlertsPage() {
  return (
    <>
      <PageHeader title="Alerts" description="Review temperature excursions and act on open alerts." />
      <AlertsView />
    </>
  );
}
