import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { logClientAction, logVisitorAction } from "./activity-logger";

export interface ClientUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  memberTier?: string;
  birthday?: string;
  createdAt: string;
  lastLoginAt?: string;
}

interface ClientAuthContextType {
  client: ClientUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  register: (data: RegisterData) => Promise<{ ok: boolean; error?: string }>;
  logout: () => void;
  updateProfile: (data: Partial<ClientUser>) => void;
}

interface RegisterData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
  birthday?: string;
}

const ClientAuthContext = createContext<ClientAuthContextType>({
  client: null,
  isLoading: true,
  isAuthenticated: false,
  login: async () => ({ ok: false }),
  register: async () => ({ ok: false }),
  logout: () => {},
  updateProfile: () => {},
});

const SESSION_KEY = "alis-client-session";
const PHP_CLIENTS_API = "/api/clients.php";

export function ClientAuthProvider({ children }: { children: React.ReactNode }) {
  const [client, setClient] = useState<ClientUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Restore session from localStorage cache
    try {
      const stored = localStorage.getItem(SESSION_KEY);
      if (stored) {
        setClient(JSON.parse(stored));
      }
    } catch {
      localStorage.removeItem(SESSION_KEY);
    }
    setIsLoading(false);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    // Try PHP API first (persistent server-side storage)
    try {
      const res = await fetch(PHP_CLIENTS_API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "login", email, password }),
      });
      const ct = res.headers.get("content-type");
      if (ct?.includes("application/json")) {
        const data = await res.json();
        if (res.ok && data.id) {
          setClient(data);
          localStorage.setItem(SESSION_KEY, JSON.stringify(data));
          logClientAction(data.id, `${data.firstName} ${data.lastName}`, "login", { email }, "auth");
          return { ok: true };
        }
        if (data.error) {
          logVisitorAction("login_failed", { email, error: data.error }, "auth");
          return { ok: false, error: data.error };
        }
      }
    } catch {
      // PHP API unavailable
    }

    // Try original Node API as secondary fallback
    try {
      const res = await fetch("/api/client/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
        credentials: "include",
      });
      const ct = res.headers.get("content-type");
      if (res.ok && ct?.includes("application/json")) {
        const data = await res.json();
        setClient(data);
        localStorage.setItem(SESSION_KEY, JSON.stringify(data));
        return { ok: true };
      }
    } catch {
      // API unavailable
    }

    return { ok: false, error: "Invalid email or password" };
  }, []);

  const register = useCallback(async (data: RegisterData) => {
    // Try PHP API first (persistent)
    try {
      const res = await fetch(PHP_CLIENTS_API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "register", ...data }),
      });
      const ct = res.headers.get("content-type");
      if (ct?.includes("application/json")) {
        const result = await res.json();
        if (res.ok && result.id) {
          setClient(result);
          localStorage.setItem(SESSION_KEY, JSON.stringify(result));
          logClientAction(result.id, `${result.firstName} ${result.lastName}`, "register", { email: data.email, firstName: data.firstName, lastName: data.lastName }, "auth");
          return { ok: true };
        }
        if (result.error) {
          logVisitorAction("register_failed", { email: data.email, error: result.error }, "auth");
          return { ok: false, error: result.error };
        }
      }
    } catch {
      // PHP API unavailable
    }

    // Try original Node API as fallback
    try {
      const res = await fetch("/api/client/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      const ct = res.headers.get("content-type");
      if (res.ok && ct?.includes("application/json")) {
        const user = await res.json();
        setClient(user);
        localStorage.setItem(SESSION_KEY, JSON.stringify(user));
        return { ok: true };
      }
    } catch {
      // API unavailable
    }

    return { ok: false, error: "Registration failed. Please try again later." };
  }, []);

  const logout = useCallback(() => {
    if (client) {
      logClientAction(client.id, `${client.firstName} ${client.lastName}`, "logout", undefined, "auth");
    }
    setClient(null);
    localStorage.removeItem(SESSION_KEY);
    fetch("/api/client/logout", { method: "POST", credentials: "include" }).catch(() => {});
  }, [client]);

  const updateProfile = useCallback((data: Partial<ClientUser>) => {
    setClient((prev) => {
      if (!prev) return prev;
      const updated = { ...prev, ...data };
      localStorage.setItem(SESSION_KEY, JSON.stringify(updated));
      logClientAction(prev.id, `${prev.firstName} ${prev.lastName}`, "profile_update", data, "profile");

      // Persist to PHP backend
      fetch(PHP_CLIENTS_API, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: prev.id, ...data }),
      }).then(async (res) => {
        const ct = res.headers.get("content-type");
        if (res.ok && ct?.includes("application/json")) {
          const serverUser = await res.json();
          if (serverUser.id) {
            setClient(serverUser);
            localStorage.setItem(SESSION_KEY, JSON.stringify(serverUser));
          }
        }
      }).catch(() => {});

      return updated;
    });
  }, []);

  return (
    <ClientAuthContext.Provider
      value={{
        client,
        isLoading,
        isAuthenticated: !!client,
        login,
        register,
        logout,
        updateProfile,
      }}
    >
      {children}
    </ClientAuthContext.Provider>
  );
}

export function useClientAuth() {
  return useContext(ClientAuthContext);
}
