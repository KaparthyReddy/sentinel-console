import { createContext } from 'react';
import type { Role } from '@/api/types';

export interface AuthUser {
  username: string;
  role: Role;
}

export interface AuthContextValue {
  user: AuthUser | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextValue | null>(null);
