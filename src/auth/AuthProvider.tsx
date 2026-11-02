import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { ApiError, setUnauthorizedHandler } from '@/api/client';
import { login as loginRequest } from '@/api/services';
import { AuthContext, type AuthContextValue, type AuthUser } from './authContext';
import { isRole } from './permissions';
import { clearAccessToken, setAccessToken } from './tokenStore';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const queryClient = useQueryClient();

  const logout = useCallback(() => {
    clearAccessToken();
    setUser(null);
    queryClient.clear();
  }, [queryClient]);

  // If the API ever rejects our token, drop the session.
  useEffect(() => {
    setUnauthorizedHandler(logout);
    return () => setUnauthorizedHandler(null);
  }, [logout]);

  const login = useCallback(async (username: string, password: string) => {
    try {
      const response = await loginRequest({ username, password });
      setAccessToken(response.token);
      // Unknown roles from the server get the least-privileged role.
      setUser({
        username: response.username,
        role: isRole(response.role) ? response.role : 'VIEWER',
      });
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        throw new ApiError(401, 'Invalid username or password.');
      }
      throw error;
    }
  }, []);

  const value = useMemo<AuthContextValue>(() => ({ user, login, logout }), [user, login, logout]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
