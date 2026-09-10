import { createContext, ReactNode, useCallback, useContext, useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { api, csrf } from "./api";

export type Role = "parent" | "teacher" | "school" | "ppd" | "state" | "country" | "admin";

export interface AuthUser {
  id: number;
  name: string;
  email: string;
  roles?: string[];
  role?: Role;
  school_id?: number | null;
  [key: string]: unknown;
}

interface AuthState {
  user: AuthUser | null;
  role: Role;
  loading: boolean;
  login: (email: string, password: string, remember?: boolean) => Promise<AuthUser | null>;
  logout: () => Promise<void>;
  refresh: () => Promise<AuthUser | null>;
}

const AuthContext = createContext<AuthState | null>(null);

const KNOWN_ROLES: Role[] = ["parent", "teacher", "school", "ppd", "state", "country", "admin"];

export function resolveRole(user: AuthUser | null): Role {
  if (!user) return "parent";
  const raw = user.role ?? user.roles?.[0];
  return (KNOWN_ROLES.find((r) => r === raw) ?? "parent") as Role;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      // JSON endpoint served by the Laravel backend (routes/api.php -> portal/me)
      const me = await api<AuthUser>("/api/portal/me");
      setUser(me);
      return me;
    } catch {
      setUser(null);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const login = useCallback(
    async (email: string, password: string, remember = false) => {
      await csrf();
      // Fortify's login route on the existing Laravel backend
      await api("/login", { method: "POST", body: { email, password, remember }, form: true });
      return await refresh();
    },
    [refresh]
  );

  const logout = useCallback(async () => {
    try {
      await api("/logout", { method: "POST", body: {}, form: true });
    } catch {
      /* ignore */
    }
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, role: resolveRole(user), loading, login, logout, refresh }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

/** Blocks a route until the Laravel session is confirmed. */
export function RequireAuth({ children, roles }: { children: ReactNode; roles?: Role[] }) {
  const { user, role, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div className="min-vh-100 d-flex flex-center text-muted">Loading…</div>;
  }
  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }
  if (roles && roles.length > 0 && !roles.includes(role)) {
    return <Navigate to="/dashboard" replace />;
  }
  return <>{children}</>;
}
