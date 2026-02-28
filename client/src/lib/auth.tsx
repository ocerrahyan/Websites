import { createContext, useContext, useState, useEffect } from "react";
import { logAdminAction } from "./activity-logger";

interface AuthContextType {
  isAdmin: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  isAdmin: false,
  isLoading: true,
  login: async (_u, _p) => false,
  logout: () => {},
});

// Admin accounts for static/demo hosting fallback
const STATIC_ADMINS = [
  { username: "osheenadmin", password: "Turbohyetrident1!" },
  { username: "Alisadmin", password: "Guluzar19821!" },
];

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check localStorage for static admin session
    const staticSession = localStorage.getItem("alis-admin-session");
    if (staticSession === "true") {
      setIsAdmin(true);
      setIsLoading(false);
      return;
    }

    fetch("/api/admin/session", { credentials: "include" })
      .then((res) => {
        if (res.ok) {
          const contentType = res.headers.get("content-type");
          if (contentType && contentType.includes("application/json")) {
            return res.json();
          }
        }
        return { authenticated: false };
      })
      .then((data) => setIsAdmin(data.authenticated))
      .catch(() => setIsAdmin(false))
      .finally(() => setIsLoading(false));
  }, []);

  const login = async (username: string, password: string) => {
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
        credentials: "include",
      });
      if (res.ok) {
        const contentType = res.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          const data = await res.json();
          if (data.authenticated) {
            setIsAdmin(true);
            return true;
          }
        }
      }
    } catch {
      // API unavailable — fall through to static check
    }

    // Fallback: static credential check for demo/static hosting
    const match = STATIC_ADMINS.find(
      (a) => a.username.toLowerCase() === username.toLowerCase() && a.password === password
    );
    if (match) {
      localStorage.setItem("alis-admin-session", "true");
      localStorage.setItem("alis-admin-username", match.username);
      setIsAdmin(true);
      logAdminAction(match.username, "admin_login", { username: match.username }, "auth");
      return true;
    }

    logAdminAction(username, "admin_login_failed", { username }, "auth");
    return false;
  };

  const logout = async () => {
    const adminUser = localStorage.getItem("alis-admin-username") || "unknown-admin";
    logAdminAction(adminUser, "admin_logout", undefined, "auth");
    try {
      await fetch("/api/admin/logout", { method: "POST", credentials: "include" });
    } catch {
      // ignore on static hosting
    }
    localStorage.removeItem("alis-admin-session");
    localStorage.removeItem("alis-admin-username");
    setIsAdmin(false);
  };

  return (
    <AuthContext.Provider value={{ isAdmin, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
