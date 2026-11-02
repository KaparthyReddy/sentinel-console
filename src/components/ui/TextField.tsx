import { forwardRef, useId, type InputHTMLAttributes } from 'react';
import { cx } from '@/utils/cx';
import styles from './Field.module.css';

export interface TextFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  hint?: string;
  error?: string;
}

export const TextField = forwardRef<HTMLInputElement, TextFieldProps>(function TextField(
  { label, hint, error, id, className, ...rest },
  ref,
) {
  const autoId = useId();
  const inputId = id ?? autoId;
  const hintId = hint ? `${inputId}-hint` : undefined;
  const errorId = error ? `${inputId}-error` : undefined;
  const describedBy = [hintId, errorId].filter(Boolean).join(' ') || undefined;

  return (
    <div className={styles.field}>
      <label htmlFor={inputId} className={styles.label}>
        {label}
      </label>
      {hint && (
        <p id={hintId} className={styles.hint}>
          {hint}
        </p>
      )}
      <input
        {...rest}
        ref={ref}
        id={inputId}
        className={cx(styles.control, className)}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
      />
      {error && (
        <p id={errorId} className={styles.error}>
          <span className="visually-hidden">Error: </span>
          {error}
        </p>
      )}
    </div>
  );
});
