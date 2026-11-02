import type { ReactNode } from 'react';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import styles from './PageHeader.module.css';

interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: ReactNode;
}

/** The page's single <h1>. It also sets the browser tab title. */
export function PageHeader({ title, description, actions }: PageHeaderProps) {
  useDocumentTitle(title);

  return (
    <div className={styles.header}>
      <div>
        <h1 className={styles.title}>{title}</h1>
        {description && <p className="text-muted">{description}</p>}
      </div>
      {actions}
    </div>
  );
}
