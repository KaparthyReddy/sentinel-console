import { Link } from 'react-router-dom';
import { PageHeader } from '@/components/layout/PageHeader';
import { Notice } from '@/components/ui/Notice';

export function ForbiddenPage() {
  return (
    <>
      <PageHeader title="Access denied" />
      <div className="stack">
        <Notice tone="warning" title="You don't have access to this page">
          Your role does not include this feature. Ask an administrator if you need access.
        </Notice>
        <p>
          <Link to="/">Back to the dashboard</Link>
        </p>
      </div>
    </>
  );
}
