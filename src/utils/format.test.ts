import { describe, expect, it } from 'vitest';
import { formatDateTime, formatRelativeTime, formatTemperature, formatTime } from './format';

describe('formatTemperature', () => {
  it('uses one decimal place and the degree sign', () => {
    expect(formatTemperature(5)).toBe('5.0 \u00b0C');
    expect(formatTemperature(-18.26)).toBe('-18.3 \u00b0C');
  });

  it('respects a custom number of digits', () => {
    expect(formatTemperature(5.123, 2)).toBe('5.12 \u00b0C');
  });
});

describe('formatDateTime', () => {
  it('formats an ISO timestamp in the requested time zone', () => {
    const result = formatDateTime('2026-01-15T10:30:00.000Z', 'en-GB', 'UTC');
    expect(result).toContain('15 Jan 2026');
    expect(result).toContain('10:30');
  });

  it('returns an em dash for an invalid date', () => {
    expect(formatDateTime('not-a-date')).toBe('\u2014');
  });
});

describe('formatTime', () => {
  it('formats hours, minutes and seconds in 24-hour time', () => {
    expect(formatTime('2026-01-15T10:30:45.000Z', 'en-GB', 'UTC')).toBe('10:30:45');
  });

  it('returns an em dash for an invalid date', () => {
    expect(formatTime('nope')).toBe('\u2014');
  });
});

describe('formatRelativeTime', () => {
  const NOW = Date.parse('2026-01-15T12:00:00.000Z');
  const ago = (ms: number) => new Date(NOW - ms).toISOString();

  it('describes recent past times', () => {
    expect(formatRelativeTime(ago(30_000), NOW)).toBe('30 seconds ago');
    expect(formatRelativeTime(ago(5 * 60_000), NOW)).toBe('5 minutes ago');
    expect(formatRelativeTime(ago(2 * 3_600_000), NOW)).toBe('2 hours ago');
  });

  it('describes days', () => {
    expect(formatRelativeTime(ago(86_400_000), NOW)).toBe('yesterday');
    expect(formatRelativeTime(ago(3 * 86_400_000), NOW)).toBe('3 days ago');
  });

  it('describes future times', () => {
    expect(formatRelativeTime(new Date(NOW + 10 * 60_000).toISOString(), NOW)).toBe(
      'in 10 minutes',
    );
  });

  it('returns an em dash for an invalid date', () => {
    expect(formatRelativeTime('bad', NOW)).toBe('\u2014');
  });
});
