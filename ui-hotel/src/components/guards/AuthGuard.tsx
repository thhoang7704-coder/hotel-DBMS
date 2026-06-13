import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';

interface AuthGuardProps {
  allowedRoles?: string[];
}

const AuthGuard: React.FC<AuthGuardProps> = ({ allowedRoles }) => {
  const { isAuthenticated, user } = useAuthStore();
  const location = useLocation();

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // If user doesn't have the right role, redirect to their respective dashboard
    const redirectPath = user.role === 'ADMIN' ? '/admin/dashboard' : '/user/dashboard';
    return <Navigate to={redirectPath} replace />;
  }

  return <Outlet />;
};

export default AuthGuard;
