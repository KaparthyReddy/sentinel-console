/*
  The access token lives in a module variable, never in localStorage or
  sessionStorage. Script injected by an XSS bug therefore can't read it from
  storage, and it disappears on refresh or tab close.
*/
let accessToken: string | null = null;

export function getAccessToken(): string | null {
  return accessToken;
}

export function setAccessToken(token: string): void {
  accessToken = token;
}

export function clearAccessToken(): void {
  accessToken = null;
}
