import { useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { queryKeys } from '@/api/hooks';
import type { AlertSocketLike } from '@/hooks/alertSocket';
import { useAlertStream, type StreamStatus } from '@/hooks/useAlertStream';
import { Badge, type BadgeTone } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { SeverityBadge } from '@/components/ui/StatusBadges';
import { formatTime } from '@/utils/format';
import { SEVERITY_LABEL } from '@/utils/severity';
import styles from './LiveAlertFeed.module.css';

const STATUS_TEXT: Record<StreamStatus, string> = {
  connecting: 'Connecting\u2026',
  open: 'Live',
  reconnecting: 'Reconnecting\u2026',
  unavailable: 'Live updates unavailable',
};

const STATUS_TONE: Record<StreamStatus, BadgeTone> = {
  connecting: 'neutral',
  open: 'ok',
  reconnecting: 'neutral',
  unavailable: 'high',
};

interface LiveAlertFeedProps {
  /** Lets tests and Storybook inject a fake socket. Must be a stable reference. */
  createSocket?: () => AlertSocketLike;
}

export function LiveAlertFeed({ createSocket }: LiveAlertFeedProps) {
  const queryClient = useQueryClient();

  // A new alert changes the alert list, the summary and shipment statuses.
  const handleAlert = useCallback(() => {
    void queryClient.invalidateQueries({ queryKey: ['alerts'] });
    void queryClient.invalidateQueries({ queryKey: ['shipments'] });
    void queryClient.invalidateQueries({ queryKey: queryKeys.summary });
  }, [queryClient]);

  const { alerts, status } = useAlertStream({ createSocket, onAlert: handleAlert });
  const latest = alerts[0];

  return (
    <Card
      title="Live alerts"
      actions={
        <span className="cluster">
          <span className="text-muted">Connection:</span>
          <Badge tone={STATUS_TONE[status]} outlined>
            {STATUS_TEXT[status]}
          </Badge>
        </span>
      }
    >
      {/* Announces only the newest alert, so screen readers aren't flooded */}
      <p className="visually-hidden" role="status">
        {latest
          ? `New ${SEVERITY_LABEL[latest.severity]} alert for ${latest.shipmentRef}: ${latest.message}`
          : ''}
      </p>

      {alerts.length === 0 ? (
        <EmptyState
          title="Waiting for alerts"
          description="New temperature excursions appear here as soon as they are detected."
        />
      ) : (
        <ol className={styles.list} aria-label="Recent live alerts">
          {alerts.map((alert) => (
            <li key={alert.id} className={styles.item}>
              <div className={styles.top}>
                <SeverityBadge severity={alert.severity} />
                <Link to={`/shipments/${alert.shipmentId}`}>{alert.shipmentRef}</Link>
                <time className="text-muted" dateTime={alert.createdAt}>
                  {formatTime(alert.createdAt)}
                </time>
              </div>
              <p>{alert.message}</p>
            </li>
          ))}
        </ol>
      )}
    </Card>
  );
}
