/**
 * Only allow same-site, absolute-path redirects after login. Stops an attacker
 * crafting a link that sends a user to another site (an "open redirect").
 */
export function safeRedirect(target: unknown, fallback = '/'): string {
  if (typeof target !== 'string') return fallback;
  if (!target.startsWith('/')) return fallback;
  if (target.startsWith('//') || target.startsWith('/\\')) return fallback;
  if (target.startsWith('/login')) return fallback;
  return target;
}
