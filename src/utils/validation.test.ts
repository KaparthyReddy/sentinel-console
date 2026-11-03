import { describe, expect, it } from 'vitest';
import { validateThresholdForm } from './validation';

describe('validateThresholdForm', () => {
  it('accepts a valid range and returns parsed numbers', () => {
    const result = validateThresholdForm({ minTempC: '2', maxTempC: '8' });
    expect(result.errors).toEqual({});
    expect(result.parsed).toEqual({ minTempC: 2, maxTempC: 8 });
  });

  it('trims whitespace and accepts negative decimals', () => {
    const result = validateThresholdForm({ minTempC: ' -25.5 ', maxTempC: '-15' });
    expect(result.parsed).toEqual({ minTempC: -25.5, maxTempC: -15 });
  });

  it('requires both fields', () => {
    const result = validateThresholdForm({ minTempC: '', maxTempC: '   ' });
    expect(result.errors.minTempC).toBe('Minimum temperature is required.');
    expect(result.errors.maxTempC).toBe('Maximum temperature is required.');
    expect(result.parsed).toBeNull();
  });

  it('rejects non-numeric input', () => {
    const result = validateThresholdForm({ minTempC: 'abc', maxTempC: '8' });
    expect(result.errors.minTempC).toBe('Minimum temperature must be a number.');
    expect(result.parsed).toBeNull();
  });

  it('rejects values outside the allowed bounds', () => {
    const result = validateThresholdForm({ minTempC: '-100', maxTempC: '60' });
    expect(result.errors.minTempC).toMatch(/between -80 and 40/);
    expect(result.errors.maxTempC).toMatch(/between -80 and 40/);
  });

  it('rejects a maximum that is not greater than the minimum', () => {
    const reversed = validateThresholdForm({ minTempC: '8', maxTempC: '2' });
    expect(reversed.errors.maxTempC).toBe('Maximum temperature must be greater than the minimum.');
    expect(reversed.parsed).toBeNull();

    const equal = validateThresholdForm({ minTempC: '5', maxTempC: '5' });
    expect(equal.errors.maxTempC).toBe('Maximum temperature must be greater than the minimum.');
  });
});
