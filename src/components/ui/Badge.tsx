import type { ReactNode } from 'react';
import { cx } from '@/utils/cx';
import styles from './Badge.module.css';

export type BadgeTone = 'critical' | 'high' | 'medium' | 'low' | 'ok' | 'neutral';

interface BadgeProps {
  tone: BadgeTone;
  /** Adds a border. Used for statuses so they look different from severities. */
  outlined?: boolean;
  children: ReactNode;
}

/** Always contains text, so meaning never depends on colour alone. */
export function Badge({ tone, outlined = false, children }: BadgeProps) {
  return <span className={cx(styles.badge, styles[tone], outlined && styles.outlined)}>{children}</span>;
}
