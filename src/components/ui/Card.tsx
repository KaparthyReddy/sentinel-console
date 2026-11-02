import type { ReactNode } from 'react';
import { cx } from '@/utils/cx';
import styles from './Card.module.css';

interface CardProps {
  title?: string;
  /** Pick the level that fits the page outline (the page's h1 comes from PageHeader). */
  headingLevel?: 2 | 3 | 4;
  actions?: ReactNode;
  className?: string;
  children: ReactNode;
}

export function Card({ title, headingLevel = 2, actions, className, children }: CardProps) {
  const Heading = `h${headingLevel}` as 'h2' | 'h3' | 'h4';

  return (
    <section className={cx(styles.card, className)}>
      {(title || actions) && (
        <div className={styles.header}>
          {title && <Heading className={styles.title}>{title}</Heading>}
          {actions}
        </div>
      )}
      {children}
    </section>
  );
}
