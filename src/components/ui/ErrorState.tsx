import { Button } from './Button';
import { Notice } from './Notice';
import styles from './State.module.css';

interface ErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
}

export function ErrorState({ title = 'Something went wrong', message, onRetry }: ErrorStateProps) {
  return (
    <div className={styles.state}>
      <Notice tone="error" title={title}>
        {message}
      </Notice>
      {onRetry && (
        <Button variant="secondary" onClick={onRetry}>
          Try again
        </Button>
      )}
    </div>
  );
}
