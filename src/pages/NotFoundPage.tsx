import { Link } from 'react-router-dom';
import { PageHeader } from '@/components/layout/PageHeader';
import { EmptyState } from '@/components/ui/EmptyState';

export function NotFoundPage() {
  return (
    <>
      <PageHeader title="Page not found" />
      <EmptyState
        title="We couldn't find that page"
        description="The link may be broken or the page may have moved."
        action={<Link to="/">Back to the dashboard</Link>}
      />
    </>
  );
}
