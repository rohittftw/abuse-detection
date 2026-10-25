import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

/**
 * Redirects unauthenticated visitors to /login, preserving the page they
 * were trying to reach so the auth screen can send them back.
 */
export const RequireAuth = ({
  children,
}: {
  children: React.ReactNode;
}): React.JSX.Element => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="home-page flex min-h-screen items-center justify-center bg-home-bg">
        <div className="flex flex-col items-center gap-4">
          <div className="tw-spinner h-9 w-9" />
          <p className="text-sm text-home-muted">Checking your session…</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <Navigate
        to="/login"
        state={{ from: `${location.pathname}${location.search}` }}
        replace
      />
    );
  }

  return <>{children}</>;
};

export default RequireAuth;
