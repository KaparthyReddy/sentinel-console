import { cx } from '@/utils/cx';
import styles from './Spinner.module.css';

interface SpinnerProps {
  label?: string;
  /** Show the label as visible text (otherwise screen readers only). */
  showLabel?: boolean;
  /** Centre it in a padded block, for use as a page or section loader. */
  block?: boolean;
}

export function Spinner({ label = 'Loading', showLabel = false, block = false }: SpinnerProps) {
  return (
    <span role="status" className={cx(styles.wrap, block && styles.block)}>
      <span className={styles.spinner} aria-hidden="true" />
      <span className={showLabel ? undefined : 'visually-hidden'}>{label}</span>
    </span>
  );
}
