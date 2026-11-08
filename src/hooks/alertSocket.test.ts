import { describe, expect, it } from 'vitest';
import { makeAlert } from '@/test/factories';
import { parseAlertMessage } from './alertSocket';

describe('parseAlertMessage', () => {
  const alert = makeAlert();

  it('parses a bare alert', () => {
    expect(parseAlertMessage(JSON.stringify(alert))).toEqual(alert);
  });

  it('parses an alert wrapped in an envelope', () => {
    expect(parseAlertMessage(JSON.stringify({ type: 'alert', alert }))).toEqual(alert);
  });

  it.each([
    ['invalid JSON', '{not json'],
    ['an empty object', '{}'],
    ['an array', '[]'],
    ['null', 'null'],
    ['a number', '42'],
  ])('returns null for %s', (_label, raw) => {
    expect(parseAlertMessage(raw)).toBeNull();
  });

  it('returns null for non-string frames', () => {
    expect(parseAlertMessage(undefined)).toBeNull();
    expect(parseAlertMessage(new ArrayBuffer(8))).toBeNull();
  });

  it('rejects an unknown severity or status', () => {
    expect(parseAlertMessage(JSON.stringify({ ...alert, severity: 'EXTREME' }))).toBeNull();
    expect(parseAlertMessage(JSON.stringify({ ...alert, status: 'DELETED' }))).toBeNull();
  });

  it('rejects an alert with a missing field', () => {
    const broken: Record<string, unknown> = { ...alert };
    delete broken.message;
    expect(parseAlertMessage(JSON.stringify(broken))).toBeNull();
  });

  it('rejects an envelope whose inner alert is invalid', () => {
    expect(parseAlertMessage(JSON.stringify({ type: 'alert', alert: { id: 'x' } }))).toBeNull();
  });
});
