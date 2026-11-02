import { useRef, useState, type FormEvent } from 'react';
import { useUpdateThreshold } from '@/api/hooks';
import type { ProductThreshold } from '@/api/types';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Notice } from '@/components/ui/Notice';
import { TextField } from '@/components/ui/TextField';
import { errorMessage } from '@/utils/errors';
import {
  MAX_ALLOWED_C,
  MIN_ALLOWED_C,
  validateThresholdForm,
  type ThresholdFormErrors,
  type ThresholdFormValues,
} from '@/utils/validation';
import styles from './ThresholdsView.module.css';

interface Feedback {
  tone: 'success' | 'error';
  message: string;
}

export function ThresholdForm({ threshold }: { threshold: ProductThreshold }) {
  const mutation = useUpdateThreshold();
  const [values, setValues] = useState<ThresholdFormValues>({
    minTempC: String(threshold.minTempC),
    maxTempC: String(threshold.maxTempC),
  });
  const [errors, setErrors] = useState<ThresholdFormErrors>({});
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const minRef = useRef<HTMLInputElement>(null);
  const maxRef = useRef<HTMLInputElement>(null);

  function update(field: keyof ThresholdFormValues, value: string) {
    setValues((previous) => ({ ...previous, [field]: value }));
    setFeedback(null);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (mutation.isPending) return;

    const { errors: nextErrors, parsed } = validateThresholdForm(values);
    setErrors(nextErrors);
    setFeedback(null);

    if (!parsed) {
      // Move focus to the first field with a problem
      (nextErrors.minTempC ? minRef : maxRef).current?.focus();
      return;
    }

    mutation.mutate(
      { id: threshold.id, ...parsed },
      {
        onSuccess: () =>
          setFeedback({ tone: 'success', message: `${threshold.product} thresholds saved.` }),
        onError: (error) =>
          setFeedback({ tone: 'error', message: errorMessage(error, 'Could not save the thresholds.') }),
      },
    );
  }

  return (
    <Card title={threshold.product}>
      <form noValidate aria-label={`${threshold.product} temperature thresholds`} onSubmit={handleSubmit}>
        <div className={styles.fields}>
          <TextField
            ref={minRef}
            label={'Minimum (\u00b0C)'}
            type="text"
            inputMode="decimal"
            autoComplete="off"
            value={values.minTempC}
            error={errors.minTempC}
            onChange={(event) => update('minTempC', event.target.value)}
          />
          <TextField
            ref={maxRef}
            label={'Maximum (\u00b0C)'}
            type="text"
            inputMode="decimal"
            autoComplete="off"
            value={values.maxTempC}
            error={errors.maxTempC}
            onChange={(event) => update('maxTempC', event.target.value)}
          />
        </div>
        <p className="text-muted" style={{ marginTop: 'var(--space-2)', fontSize: 'var(--text-sm)' }}>
          Allowed values: {MIN_ALLOWED_C} to {MAX_ALLOWED_C} {'\u00b0C'}
        </p>

        {/* Always rendered so screen readers announce messages added later */}
        <div aria-live="polite" aria-atomic="true" className={styles.feedback}>
          {feedback && <Notice tone={feedback.tone}>{feedback.message}</Notice>}
        </div>

        <Button type="submit" loading={mutation.isPending}>
          Save thresholds
        </Button>
      </form>
    </Card>
  );
}
