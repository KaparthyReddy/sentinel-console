import type { ReactNode } from 'react';
import { cx } from '@/utils/cx';
import styles from './Notice.module.css';

export type NoticeTone = 'info' | 'success' | 'warning' | 'error';

interface NoticeProps {
  tone?: NoticeTone;
  title?: string;
  children: ReactNode;
}

/** Inline message. Errors use role="alert" (announced at once); the rest use role="status". */
export function Notice({ tone = 'info', title, children }: NoticeProps) {
  return (
    <div role={tone === 'error' ? 'alert' : 'status'} className={cx(styles.notice, styles[tone])}>
      {title && <p className={styles.title}>{title}</p>}
      <div>{children}</div>
    </div>
  );
}
