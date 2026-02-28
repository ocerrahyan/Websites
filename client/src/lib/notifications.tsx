import { createContext, useContext, useState, useEffect, useCallback } from "react";

export interface ClientNotification {
  id: string;
  type: "appointment" | "offer" | "message" | "birthday" | "general";
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  link?: string;
}

interface NotificationContextType {
  notifications: ClientNotification[];
  unreadCount: number;
  addNotification: (n: Omit<ClientNotification, "id" | "read" | "createdAt">) => void;
  markRead: (id: string) => void;
  markAllRead: () => void;
  clearAll: () => void;
}

const NotificationContext = createContext<NotificationContextType>({
  notifications: [],
  unreadCount: 0,
  addNotification: () => {},
  markRead: () => {},
  markAllRead: () => {},
  clearAll: () => {},
});

const NOTIF_KEY = "alis-client-notifications";

function getStored(clientId: string): ClientNotification[] {
  try {
    const all = JSON.parse(localStorage.getItem(NOTIF_KEY) || "{}");
    return all[clientId] || [];
  } catch {
    return [];
  }
}

function saveStored(clientId: string, notifs: ClientNotification[]) {
  const all = JSON.parse(localStorage.getItem(NOTIF_KEY) || "{}");
  all[clientId] = notifs;
  localStorage.setItem(NOTIF_KEY, JSON.stringify(all));
}

const defaultNotifications: ClientNotification[] = [
  {
    id: "n1",
    type: "general",
    title: "Welcome to Alis' Portal! 🎉",
    message: "Thank you for creating your account. Explore your portal to manage appointments, prayer requests, and more.",
    read: false,
    createdAt: new Date().toISOString(),
    link: "/portal",
  },
  {
    id: "n2",
    type: "offer",
    title: "Special Offer Just for You! 💕",
    message: "As a new member, enjoy 10% off your first booking. Book now and experience the Alis' difference.",
    read: false,
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    link: "/booking",
  },
];

export function ClientNotificationProvider({
  children,
  clientId,
}: {
  children: React.ReactNode;
  clientId: string | null;
}) {
  const [notifications, setNotifications] = useState<ClientNotification[]>([]);

  useEffect(() => {
    if (clientId) {
      const stored = getStored(clientId);
      if (stored.length === 0) {
        setNotifications(defaultNotifications);
        saveStored(clientId, defaultNotifications);
      } else {
        setNotifications(stored);
      }
    } else {
      setNotifications([]);
    }
  }, [clientId]);

  const addNotification = useCallback(
    (n: Omit<ClientNotification, "id" | "read" | "createdAt">) => {
      if (!clientId) return;
      const notif: ClientNotification = {
        ...n,
        id: "n-" + Date.now(),
        read: false,
        createdAt: new Date().toISOString(),
      };
      setNotifications((prev) => {
        const updated = [notif, ...prev];
        saveStored(clientId, updated);
        return updated;
      });
    },
    [clientId]
  );

  const markRead = useCallback(
    (id: string) => {
      if (!clientId) return;
      setNotifications((prev) => {
        const updated = prev.map((n) => (n.id === id ? { ...n, read: true } : n));
        saveStored(clientId, updated);
        return updated;
      });
    },
    [clientId]
  );

  const markAllRead = useCallback(() => {
    if (!clientId) return;
    setNotifications((prev) => {
      const updated = prev.map((n) => ({ ...n, read: true }));
      saveStored(clientId, updated);
      return updated;
    });
  }, [clientId]);

  const clearAll = useCallback(() => {
    if (!clientId) return;
    setNotifications([]);
    saveStored(clientId, []);
  }, [clientId]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <NotificationContext.Provider
      value={{ notifications, unreadCount, addNotification, markRead, markAllRead, clearAll }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useClientNotifications() {
  return useContext(NotificationContext);
}
