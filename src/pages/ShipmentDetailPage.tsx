import { useParams } from 'react-router-dom';
import { ShipmentDetail } from '@/features/shipments/ShipmentDetail';
import { NotFoundPage } from './NotFoundPage';

export function ShipmentDetailPage() {
  const { id } = useParams<{ id: string }>();
  if (!id) return <NotFoundPage />;
  return <ShipmentDetail id={id} />;
}
