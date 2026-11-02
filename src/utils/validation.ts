export const MIN_ALLOWED_C = -80;
export const MAX_ALLOWED_C = 40;

export interface ThresholdFormValues {
  minTempC: string;
  maxTempC: string;
}

export interface ThresholdFormErrors {
  minTempC?: string;
  maxTempC?: string;
}

export interface ThresholdValidation {
  errors: ThresholdFormErrors;
  /** Parsed numbers; null when any field is invalid. */
  parsed: { minTempC: number; maxTempC: number } | null;
}

function parseField(raw: string, label: string): { value?: number; error?: string } {
  const trimmed = raw.trim();
  if (trimmed === '') return { error: `${label} is required.` };

  const value = Number(trimmed);
  if (!Number.isFinite(value)) return { error: `${label} must be a number.` };
  if (value < MIN_ALLOWED_C || value > MAX_ALLOWED_C) {
    return { error: `${label} must be between ${MIN_ALLOWED_C} and ${MAX_ALLOWED_C} \u00b0C.` };
  }
  return { value };
}

export function validateThresholdForm(values: ThresholdFormValues): ThresholdValidation {
  const min = parseField(values.minTempC, 'Minimum temperature');
  const max = parseField(values.maxTempC, 'Maximum temperature');

  const errors: ThresholdFormErrors = {};
  if (min.error) errors.minTempC = min.error;
  if (max.error) errors.maxTempC = max.error;

  if (min.value !== undefined && max.value !== undefined && min.value >= max.value) {
    errors.maxTempC = 'Maximum temperature must be greater than the minimum.';
  }

  if (errors.minTempC || errors.maxTempC || min.value === undefined || max.value === undefined) {
    return { errors, parsed: null };
  }
  return { errors, parsed: { minTempC: min.value, maxTempC: max.value } };
}
