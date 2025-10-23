import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAppSelector } from '../../../store/hooks';
import { selectIsAuthenticated } from '../../../features/auth';

interface ProtectedRouteProps {
  children: ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const isAuthenticated = useAppSelector(selectIsAuthenticated);

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
