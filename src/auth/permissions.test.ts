import { describe, expect, it } from 'vitest';
import { can, isRole } from './permissions';

describe('can', () => {
  it('gives ADMIN every permission', () => {
    expect(can('ADMIN', 'alerts:update')).toBe(true);
    expect(can('ADMIN', 'thresholds:view')).toBe(true);
    expect(can('ADMIN', 'thresholds:edit')).toBe(true);
  });

  it('lets OPERATOR act on alerts but not touch thresholds', () => {
    expect(can('OPERATOR', 'alerts:update')).toBe(true);
    expect(can('OPERATOR', 'thresholds:view')).toBe(false);
    expect(can('OPERATOR', 'thresholds:edit')).toBe(false);
  });

  it('keeps VIEWER read-only', () => {
    expect(can('VIEWER', 'alerts:update')).toBe(false);
    expect(can('VIEWER', 'thresholds:view')).toBe(false);
    expect(can('VIEWER', 'thresholds:edit')).toBe(false);
  });
});

describe('isRole', () => {
  it('accepts the three known roles', () => {
    expect(isRole('ADMIN')).toBe(true);
    expect(isRole('OPERATOR')).toBe(true);
    expect(isRole('VIEWER')).toBe(true);
  });

  it('rejects anything else', () => {
    expect(isRole('SUPERUSER')).toBe(false);
    expect(isRole('admin')).toBe(false);
    expect(isRole(undefined)).toBe(false);
    expect(isRole(7)).toBe(false);
  });
});
