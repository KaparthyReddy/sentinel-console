import { PageHeader } from '@/components/layout/PageHeader';
import { ShipmentsView } from '@/features/shipments/ShipmentsView';

export function ShipmentsPage() {
  return (
    <>
      <PageHeader title="Shipments" description="Search and filter every cold-chain shipment." />
      <ShipmentsView />
    </>
  );
}
