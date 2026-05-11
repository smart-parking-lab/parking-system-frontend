import React, { createContext, useContext, useEffect, useState } from 'react';
import axiosClient from '../../services/axiosClient';

interface AuthContextType {
  session: { access_token: string } | null;
}

const AuthContext = createContext<AuthContextType>({ session: null });

const isMockMode = import.meta.env.VITE_USE_MOCK_DATA === 'true';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<{ access_token: string } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isMockMode) {
      const mock = localStorage.getItem('mock_session');
      setSession(mock ? { access_token: 'mock' } : null);
      setLoading(false);
      return;
    }

    const token = localStorage.getItem('access_token');
    if (!token) {
      setSession(null);
      setLoading(false);
      return;
    }

    // Best-effort verify token
    (async () => {
      try {
        await axiosClient.get('/auth/me');
        setSession({ access_token: token });
      } catch {
        localStorage.removeItem('access_token');
        setSession(null);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return <div className="h-screen flex items-center justify-center">Đang tải dữ liệu...</div>;
  }

  return <AuthContext.Provider value={{ session }}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);

