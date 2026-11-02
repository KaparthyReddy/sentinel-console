import { forwardRef, useId, type SelectHTMLAttributes } from 'react';
import { cx } from '@/utils/cx';
import styles from './Field.module.css';

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectFieldProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  options: ReadonlyArray<SelectOption>;
  hint?: string;
  error?: string;
}

export const SelectField = forwardRef<HTMLSelectElement, SelectFieldProps>(function SelectField(
  { label, options, hint, error, id, className, ...rest },
  ref,
) {
  const autoId = useId();
  const selectId = id ?? autoId;
  const hintId = hint ? `${selectId}-hint` : undefined;
  const errorId = error ? `${selectId}-error` : undefined;
  const describedBy = [hintId, errorId].filter(Boolean).join(' ') || undefined;

  return (
    <div className={styles.field}>
      <label htmlFor={selectId} className={styles.label}>
        {label}
      </label>
      {hint && (
        <p id={hintId} className={styles.hint}>
          {hint}
        </p>
      )}
      <select
        {...rest}
        ref={ref}
        id={selectId}
        className={cx(styles.control, className)}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && (
        <p id={errorId} className={styles.error}>
          <span className="visually-hidden">Error: </span>
          {error}
        </p>
      )}
    </div>
  );
});
