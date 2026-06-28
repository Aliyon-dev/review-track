import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { getMe, login as apiLogin, logout as apiLogout } from '@/api/client';
import { mapUser } from '@/api/mappers';
import {
  clearSession,
  getStoredUser,
  getToken,
  setStoredUser,
  setToken,
} from '@/api/token';
import type { ApiUser, UiUser } from '@/types/ui';

interface AuthContextValue {
  user: UiUser | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<UiUser>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function loadUser(): UiUser | null {
  const raw = getStoredUser();
  if (!raw) return null;
  try {
    const apiUser = JSON.parse(raw) as ApiUser;
    return mapUser(apiUser);
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UiUser | null>(() => loadUser());
  const [token, setTokenState] = useState<string | null>(() => getToken());

  useEffect(() => {
    if (!getToken()) return;
    getMe()
      .then((apiUser) => {
        setStoredUser(JSON.stringify(apiUser));
        setUser(mapUser(apiUser));
      })
      .catch(() => {
        clearSession();
        setUser(null);
        setTokenState(null);
      });
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const { token: newToken, user: apiUser } = await apiLogin(email, password);
    setToken(newToken);
    setStoredUser(JSON.stringify(apiUser));
    const uiUser = mapUser(apiUser);
    setUser(uiUser);
    setTokenState(newToken);
    return uiUser;
  }, []);

  const logout = useCallback(async () => {
    try {
      if (getToken()) await apiLogout();
    } catch {
      // JWT logout is client-side; ignore server errors
    }
    clearSession();
    setUser(null);
    setTokenState(null);
  }, []);

  const value = useMemo(
    () => ({
      user,
      token,
      isAuthenticated: Boolean(token && user),
      login,
      logout,
    }),
    [user, token, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
