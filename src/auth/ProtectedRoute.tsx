import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { can, type Permission } from './permissions';
import { useAuth } from './useAuth';

interface ProtectedRouteProps {
  /** If set, the signed-in user's role must grant this permission. */
  permission?: Permission;
  children: ReactNode;
}

export function ProtectedRoute({ permission, children }: ProtectedRouteProps) {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname + location.search }} />;
  }

  if (permission && !can(user.role, permission)) {
    return <Navigate to="/forbidden" replace />;
  }

  return <>{children}</>;
}
