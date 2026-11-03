import { describe, expect, it } from 'vitest';
import { safeRedirect } from './redirect';

describe('safeRedirect', () => {
  it('allows same-site absolute paths, including query strings', () => {
    expect(safeRedirect('/alerts')).toBe('/alerts');
    expect(safeRedirect('/shipments/shp-003?tab=chart')).toBe('/shipments/shp-003?tab=chart');
  });

  it.each([
    ['an external URL', 'https://evil.example.com'],
    ['a protocol-relative URL', '//evil.example.com'],
    ['a backslash trick', '/\\evil.example.com'],
    ['a relative path', 'alerts'],
    ['the login page itself', '/login'],
  ])('falls back for %s', (_label, target) => {
    expect(safeRedirect(target)).toBe('/');
  });

  it('falls back for non-string values', () => {
    expect(safeRedirect(undefined)).toBe('/');
    expect(safeRedirect(42)).toBe('/');
    expect(safeRedirect(null)).toBe('/');
  });

  it('uses a custom fallback when given', () => {
    expect(safeRedirect('//evil.example.com', '/alerts')).toBe('/alerts');
  });
});
