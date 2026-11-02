import type { ReactNode } from 'react';
import styles from './State.module.css';

interface EmptyStateProps {
  title: string;
  description?: string;
  action?: ReactNode;
}

export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <div className={styles.state}>
      <p className={styles.title}>{title}</p>
      {description && <p className="text-muted">{description}</p>}
      {action}
    </div>
  );
}
