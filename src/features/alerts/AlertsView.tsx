import { useState } from 'react';
import { useAlertAction, useAlerts } from '@/api/hooks';
import {
  ALERT_STATUSES,
  SEVERITIES,
  type AlertAction,
  type AlertStatus,
  type Severity,
} from '@/api/types';
import { can } from '@/auth/permissions';
import { useAuth } from '@/auth/useAuth';
import { ErrorState } from '@/components/ui/ErrorState';
import { Notice } from '@/components/ui/Notice';
import { Pagination } from '@/components/ui/Pagination';
import { SelectField } from '@/components/ui/SelectField';
import { Spinner } from '@/components/ui/Spinner';
import { errorMessage } from '@/utils/errors';
import { isAlertStatus, isSeverity } from '@/utils/guards';
import { ALERT_STATUS_LABEL, SEVERITY_LABEL } from '@/utils/severity';
import { AlertsTable } from './AlertsTable';
import styles from './AlertsView.module.css';

const PAGE_SIZE = 10;

const SEVERITY_OPTIONS = [
  { value: '', label: 'All severities' },
  ...SEVERITIES.map((value) => ({ value, label: SEVERITY_LABEL[value] })),
];

const STATUS_OPTIONS = [
  { value: '', label: 'All statuses' },
  ...ALERT_STATUSES.map((value) => ({ value, label: ALERT_STATUS_LABEL[value] })),
];

interface Feedback {
  tone: 'success' | 'error';
  message: string;
}

export function AlertsView() {
  const { user } = useAuth();
  const [severity, setSeverity] = useState<Severity | ''>('');
  const [status, setStatus] = useState<AlertStatus | ''>('');
  const [page, setPage] = useState(1);
  const [feedback, setFeedback] = useState<Feedback | null>(null);

  const query = useAlerts({
    page,
    pageSize: PAGE_SIZE,
    severity: severity || undefined,
    status: status || undefined,
  });
  const mutation = useAlertAction();
  const canAct = user ? can(user.role, 'alerts:update') : false;

  const handleAction = (id: string, action: AlertAction) => {
    setFeedback(null);
    mutation.mutate(
      { id, action },
      {
        onSuccess: (alert) =>
          setFeedback({
            tone: 'success',
            message: `Alert for ${alert.shipmentRef} ${action === 'acknowledge' ? 'acknowledged' : 'resolved'}.`,
          }),
        onError: (error) =>
          setFeedback({
            tone: 'error',
            message: errorMessage(error, 'Could not update the alert.'),
          }),
      },
    );
  };

  return (
    <div className="stack">
      <div role="group" aria-label="Filter alerts" className={styles.filters}>
        <SelectField
          label="Severity"
          options={SEVERITY_OPTIONS}
          value={severity}
          onChange={(event) => {
            const value = event.target.value;
            setSeverity(isSeverity(value) ? value : '');
            setPage(1);
          }}
        />
        <SelectField
          label="Status"
          options={STATUS_OPTIONS}
          value={status}
          onChange={(event) => {
            const value = event.target.value;
            setStatus(isAlertStatus(value) ? value : '');
            setPage(1);
          }}
        />
      </div>

      {/* Always rendered so screen readers announce messages added later */}
      <div aria-live="polite" aria-atomic="true">
        {feedback && <Notice tone={feedback.tone}>{feedback.message}</Notice>}
      </div>

      {query.isPending && <Spinner block label="Loading alerts" />}
      {query.isError && (
        <ErrorState
          title="Could not load alerts"
          message={errorMessage(query.error)}
          onRetry={() => void query.refetch()}
        />
      )}
      {query.data && (
        <>
          <AlertsTable
            alerts={query.data.items}
            canAct={canAct}
            pendingId={mutation.isPending ? (mutation.variables?.id ?? null) : null}
            busy={query.isPlaceholderData}
            onAction={handleAction}
          />
          <Pagination
            page={query.data.page}
            pageSize={query.data.pageSize}
            total={query.data.total}
            onPageChange={setPage}
          />
        </>
      )}
    </div>
  );
}
