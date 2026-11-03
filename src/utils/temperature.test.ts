import { describe, expect, it } from 'vitest';
import { excursionDelta, isOutOfRange } from './temperature';

describe('isOutOfRange', () => {
  it('is false inside the range, including the boundaries', () => {
    expect(isOutOfRange(5, 2, 8)).toBe(false);
    expect(isOutOfRange(2, 2, 8)).toBe(false);
    expect(isOutOfRange(8, 2, 8)).toBe(false);
  });

  it('is true just outside either end', () => {
    expect(isOutOfRange(8.1, 2, 8)).toBe(true);
    expect(isOutOfRange(1.9, 2, 8)).toBe(true);
  });

  it('works for freezer ranges below zero', () => {
    expect(isOutOfRange(-20, -30, -18)).toBe(false);
    expect(isOutOfRange(-12.5, -30, -18)).toBe(true);
  });
});

describe('excursionDelta', () => {
  it('is 0 when within range', () => {
    expect(excursionDelta(5, 2, 8)).toBe(0);
  });

  it('measures how far above the maximum', () => {
    expect(excursionDelta(11.2, 2, 8)).toBe(3.2);
  });

  it('measures how far below the minimum', () => {
    expect(excursionDelta(-1, 2, 8)).toBe(3);
  });
});
