import { PageHeader } from '@/components/layout/PageHeader';
import { ThresholdsView } from '@/features/thresholds/ThresholdsView';

export function ThresholdsPage() {
  return (
    <>
      <PageHeader
        title="Thresholds"
        description="Set the allowed temperature range for each product. Changes apply to new readings."
      />
      <ThresholdsView />
    </>
  );
}
