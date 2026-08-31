import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { AuthUser, UserRole } from "@tesseracareerbridge/shared";
import { apiGet, apiPost, ApiRequestError } from "../lib/api";

interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
  hasRole: (...roles: UserRole[]) => boolean;
  refresh: () => Promise<void>;
  login: (email: string, password: string, remember: boolean) => Promise<AuthUser>;
  logout: () => Promise<void>;
  setUser: (user: AuthUser | null) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const data = await apiGet<{ user: AuthUser }>("/auth/me");
      setUser(data.user);
    } catch (error) {
      if (error instanceof ApiRequestError && (error.status === 401 || error.status === 403)) {
        setUser(null);
      } else {
        setUser(null);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
    const onPageShow = (event: PageTransitionEvent) => {
      if (event.persisted) void refresh();
    };
    window.addEventListener("pageshow", onPageShow);
    return () => window.removeEventListener("pageshow", onPageShow);
  }, [refresh]);

  const login = useCallback(async (email: string, password: string, remember: boolean) => {
    const data = await apiPost<{ user: AuthUser }>("/auth/login", { email, password, remember });
    setUser(data.user);
    return data.user;
  }, []);

  const logout = useCallback(async () => {
    try {
      await apiPost("/auth/logout");
    } finally {
      setUser(null);
    }
  }, []);

  const hasRole = useCallback(
    (...roles: UserRole[]) => {
      if (!user) return false;
      if (user.role === "SUPER_ADMIN") return true;
      return roles.includes(user.role);
    },
    [user],
  );

  const value = useMemo<AuthContextValue>(
    () => ({ user, loading, hasRole, refresh, login, logout, setUser }),
    [user, loading, hasRole, refresh, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
