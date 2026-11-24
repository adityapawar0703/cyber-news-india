import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import type { AdminUser } from '../types';
import { api, getStoredToken, setStoredToken } from '../lib/api';

interface AuthContextValue {
  admin: AdminUser | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (identifier: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [admin, setAdmin] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = getStoredToken();
    if (!token) {
      setLoading(false);
      return;
    }

    api
      .getMe()
      .then((res) => setAdmin(res.admin))
      .catch(() => {
        setStoredToken(null);
        setAdmin(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const login = useCallback(async (identifier: string, password: string) => {
    const res = await api.login(identifier, password);
    setStoredToken(res.token);
    setAdmin(res.admin);
  }, []);

  const logout = useCallback(async () => {
    try {
      await api.logout();
    } catch {
      // ignore logout error if token already expired
    }
    setStoredToken(null);
    setAdmin(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        admin,
        loading,
        isAuthenticated: Boolean(admin),
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used inside AuthProvider');
  }
  return ctx;
}
