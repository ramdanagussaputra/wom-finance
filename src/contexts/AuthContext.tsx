import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { login as doLogin, logout as doLogout, restoreSession } from '../services/auth';
import type { AuthState } from '../types/models';

type AuthContextValue = {
  state: AuthState;
  initializing: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

const empty: AuthState = { token: null, email: null, expiresAt: null };

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>(empty);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const session = await restoreSession();
        if (session) {
          setState({
            token: session.token,
            email: session.payload.email,
            expiresAt: session.payload.exp * 1000,
          });
        }
      } finally {
        setInitializing(false);
      }
    })();
  }, []);

  const signIn = useCallback(async (email: string, _password: string) => {
    const { token, payload } = await doLogin(email);
    setState({ token, email: payload.email, expiresAt: payload.exp * 1000 });
  }, []);

  const signOut = useCallback(async () => {
    try {
      await doLogout();
    } finally {
      setState(empty);
    }
  }, []);

  const value = useMemo(
    () => ({ state, initializing, signIn, signOut }),
    [state, initializing, signIn, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
