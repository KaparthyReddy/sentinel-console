import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { cx } from '@/utils/cx';
import styles from './Button.module.css';

export type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost';
export type ButtonSize = 'md' | 'sm';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** Shows a spinner and ignores clicks, but keeps keyboard focus on the button. */
  loading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    variant = 'primary',
    size = 'md',
    loading = false,
    type = 'button',
    className,
    onClick,
    children,
    ...rest
  },
  ref,
) {
  return (
    <button
      {...rest}
      ref={ref}
      type={type}
      className={cx(styles.button, styles[variant], size === 'sm' && styles.sm, className)}
      // aria-disabled (not `disabled`) so focus isn't lost while loading
      aria-disabled={loading || undefined}
      aria-busy={loading || undefined}
      onClick={loading ? undefined : onClick}
    >
      {loading && <span className={styles.spinner} aria-hidden="true" />}
      <span>{children}</span>
    </button>
  );
});
