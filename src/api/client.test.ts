import { http, HttpResponse } from 'msw';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { setAccessToken } from '@/auth/tokenStore';
import { server } from '@/mocks/server';
import { ApiError, apiRequest, setUnauthorizedHandler } from './client';

afterEach(() => setUnauthorizedHandler(null));

async function failureOf(path: string): Promise<ApiError> {
  const error = await apiRequest(path).catch((e: unknown) => e);
  expect(error).toBeInstanceOf(ApiError);
  return error as ApiError;
}

describe('apiRequest', () => {
  it('sends the bearer token when one is set', async () => {
    server.use(
      http.get('*/api/echo', ({ request }) =>
        HttpResponse.json({ auth: request.headers.get('Authorization') }),
      ),
    );
    setAccessToken('abc');
    await expect(apiRequest('/api/echo')).resolves.toEqual({ auth: 'Bearer abc' });
  });

  it('sends no Authorization header without a token', async () => {
    server.use(
      http.get('*/api/echo', ({ request }) =>
        HttpResponse.json({ auth: request.headers.get('Authorization') }),
      ),
    );
    await expect(apiRequest('/api/echo')).resolves.toEqual({ auth: null });
  });

  it('serialises a JSON body and sets the content type', async () => {
    server.use(
      http.post('*/api/echo', async ({ request }) =>
        HttpResponse.json({
          body: await request.json(),
          type: request.headers.get('Content-Type'),
        }),
      ),
    );
    await expect(apiRequest('/api/echo', { method: 'POST', body: { a: 1 } })).resolves.toEqual({
      body: { a: 1 },
      type: 'application/json',
    });
  });

  it('builds the query string and skips undefined and empty values', async () => {
    server.use(
      http.get('*/api/q', ({ request }) =>
        HttpResponse.json(Object.fromEntries(new URL(request.url).searchParams)),
      ),
    );
    const result = await apiRequest('/api/q', {
      query: { page: 2, search: undefined, status: '' },
    });
    expect(result).toEqual({ page: '2' });
  });

  it('returns undefined for 204 No Content', async () => {
    server.use(http.get('*/api/empty', () => new HttpResponse(null, { status: 204 })));
    await expect(apiRequest('/api/empty')).resolves.toBeUndefined();
  });

  it('throws an ApiError carrying the server message', async () => {
    server.use(
      http.get('*/api/fail', () => HttpResponse.json({ message: 'Nope' }, { status: 400 })),
    );
    const error = await failureOf('/api/fail');
    expect(error.status).toBe(400);
    expect(error.message).toBe('Nope');
  });

  it('falls back to a friendly message when the body is not JSON', async () => {
    server.use(http.get('*/api/fail', () => new HttpResponse(null, { status: 500 })));
    const error = await failureOf('/api/fail');
    expect(error.status).toBe(500);
    expect(error.message).toBe('The server ran into a problem. Please try again shortly.');
  });

  it('reports a network failure as status 0', async () => {
    server.use(http.get('*/api/down', () => HttpResponse.error()));
    const error = await failureOf('/api/down');
    expect(error.status).toBe(0);
    expect(error.message).toMatch(/cannot reach the server/i);
  });

  it('calls the unauthorized handler on a 401 when a token was sent', async () => {
    const handler = vi.fn();
    setUnauthorizedHandler(handler);
    setAccessToken('expired');
    server.use(http.get('*/api/private', () => new HttpResponse(null, { status: 401 })));

    const error = await failureOf('/api/private');
    expect(error.status).toBe(401);
    expect(handler).toHaveBeenCalledTimes(1);
  });

  it('does not call the unauthorized handler on a 401 without a token', async () => {
    const handler = vi.fn();
    setUnauthorizedHandler(handler);
    server.use(http.get('*/api/private', () => new HttpResponse(null, { status: 401 })));

    await failureOf('/api/private');
    expect(handler).not.toHaveBeenCalled();
  });
});
