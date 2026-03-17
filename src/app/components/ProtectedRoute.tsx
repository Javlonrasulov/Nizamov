import { ReactNode } from 'react';
import { Navigate } from 'react-router';
import { useApp } from '../context/AppContext';
import { UserRole } from '../data/mockData';

interface ProtectedRouteProps {
  children: ReactNode;
  role: UserRole;
}

export const ProtectedRoute = ({ children, role }: ProtectedRouteProps) => {
  const { currentUser } = useApp();

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  if (currentUser.role !== role) {
    if (currentUser.role === 'agent') return <Navigate to="/agent" replace />;
    if (currentUser.role === 'delivery') return <Navigate to="/delivery" replace />;
    if (currentUser.role === 'admin') return <Navigate to="/admin" replace />;
  }

  return <>{children}</>;
};
