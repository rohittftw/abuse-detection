import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import {
  AUTH_ENDPOINTS,
  UNAUTHORIZED_EVENT,
  apiFetch,
  getStoredToken,
  setStoredToken,
} from '../config/api';

export type AuthUser = {
  id: string;
  name: string;
  email: string;
};

type AuthContextValue = {
  user: AuthUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<AuthUser>;
  signup: (name: string, email: string, password: string) => Promise<AuthUser>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

type AuthResponse = {
  token: string;
  user: AuthUser;
};

const readError = async (response: Response): Promise<string> => {
  try {
    const data = await response.json();
    return data?.error || data?.message || 'Something went wrong';
  } catch {
    return 'Something went wrong';
  }
};

export const AuthProvider = ({
  children,
}: {
  children: React.ReactNode;
}): React.JSX.Element => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  // Restore the session from the stored token on first load.
  useEffect(() => {
    const token = getStoredToken();

    if (!token) {
      setLoading(false);
      return;
    }

    let cancelled = false;

    apiFetch(AUTH_ENDPOINTS.ME)
      .then(async (response) => {
        if (!response.ok) throw new Error('Session expired');
        const data = await response.json();
        if (!cancelled) setUser(data.user as AuthUser);
      })
      .catch(() => {
        if (!cancelled) {
          setStoredToken(null);
          setUser(null);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  // Any 401 from the API ends the local session.
  useEffect(() => {
    const handleUnauthorized = () => setUser(null);
    window.addEventListener(UNAUTHORIZED_EVENT, handleUnauthorized);
    return () =>
      window.removeEventListener(UNAUTHORIZED_EVENT, handleUnauthorized);
  }, []);

  const handleAuthResponse = useCallback(async (response: Response) => {
    if (!response.ok) {
      throw new Error(await readError(response));
    }

    const data = (await response.json()) as AuthResponse;
    setStoredToken(data.token);
    setUser(data.user);
    return data.user;
  }, []);

  const login = useCallback(
    async (email: string, password: string): Promise<AuthUser> => {
      const response = await fetch(AUTH_ENDPOINTS.LOGIN, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      return handleAuthResponse(response);
    },
    [handleAuthResponse]
  );

  const signup = useCallback(
    async (
      name: string,
      email: string,
      password: string
    ): Promise<AuthUser> => {
      const response = await fetch(AUTH_ENDPOINTS.SIGNUP, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });
      return handleAuthResponse(response);
    },
    [handleAuthResponse]
  );

  const logout = useCallback(() => {
    setStoredToken(null);
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({ user, loading, login, signup, logout }),
    [user, loading, login, signup, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextValue => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used inside an AuthProvider');
  }

  return context;
};
