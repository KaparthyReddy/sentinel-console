const INVALID = '\u2014'; // em dash

export function formatTemperature(value: number, digits = 1): string {
  return `${value.toFixed(digits)} \u00b0C`;
}

export function formatDateTime(iso: string, locale = 'en-GB', timeZone?: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return INVALID;
  return new Intl.DateTimeFormat(locale, {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone,
  }).format(date);
}

export function formatTime(iso: string, locale = 'en-GB', timeZone?: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return INVALID;
  return new Intl.DateTimeFormat(locale, {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
    timeZone,
  }).format(date);
}

export function formatRelativeTime(iso: string, now: number = Date.now(), locale = 'en'): string {
  const target = new Date(iso).getTime();
  if (Number.isNaN(target)) return INVALID;

  const diffSeconds = Math.round((target - now) / 1000);
  const abs = Math.abs(diffSeconds);
  const formatter = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });

  if (abs < 60) return formatter.format(diffSeconds, 'second');
  if (abs < 3600) return formatter.format(Math.round(diffSeconds / 60), 'minute');
  if (abs < 86400) return formatter.format(Math.round(diffSeconds / 3600), 'hour');
  return formatter.format(Math.round(diffSeconds / 86400), 'day');
}
