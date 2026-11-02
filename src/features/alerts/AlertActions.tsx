import type { Alert, AlertAction } from '@/api/types';
import { Button } from '@/components/ui/Button';

interface AlertActionsProps {
  alert: Alert;
  /** True while a request for THIS alert is in flight. */
  pending: boolean;
  onAction: (id: string, action: AlertAction) => void;
}

export function AlertActions({ alert, pending, onAction }: AlertActionsProps) {
  if (alert.status === 'RESOLVED') {
    return <span className="text-muted">No actions</span>;
  }

  return (
    <div className="cluster">
      {alert.status === 'OPEN' && (
        <Button
          size="sm"
          variant="secondary"
          loading={pending}
          aria-label={`Acknowledge alert for ${alert.shipmentRef}`}
          onClick={() => onAction(alert.id, 'acknowledge')}
        >
          Acknowledge
        </Button>
      )}
      <Button
        size="sm"
        loading={pending}
        aria-label={`Resolve alert for ${alert.shipmentRef}`}
        onClick={() => onAction(alert.id, 'resolve')}
      >
        Resolve
      </Button>
    </div>
  );
}
