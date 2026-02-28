// Shared prayer request storage — uses PHP API on GoDaddy, localStorage as cache
const ADMIN_PRAYER_KEY = "alis-admin-prayer-requests";
const ADMIN_NOTIF_KEY = "alis-admin-local-notifications";
const PHP_API = "/api/prayers.php";

export interface AdminPrayerRequest {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  content: string;
  isRead: boolean;
  createdAt: string;
}

/** Fetch all prayer requests from PHP API, fall back to localStorage */
export async function fetchAllPrayerRequests(): Promise<AdminPrayerRequest[]> {
  try {
    const res = await fetch(PHP_API);
    if (res.ok) {
      const ct = res.headers.get("content-type");
      if (ct && ct.includes("application/json")) {
        const data = await res.json();
        // Cache locally
        localStorage.setItem(ADMIN_PRAYER_KEY, JSON.stringify(data));
        return data;
      }
    }
  } catch {
    // API unavailable
  }
  return getAllPrayerRequestsLocal();
}

/** Get all prayer requests from localStorage cache */
export function getAllPrayerRequestsLocal(): AdminPrayerRequest[] {
  try {
    return JSON.parse(localStorage.getItem(ADMIN_PRAYER_KEY) || "[]");
  } catch {
    return [];
  }
}

// Keep old name for backward compat
export const getAllPrayerRequests = getAllPrayerRequestsLocal;

/** Save a new prayer request via PHP API + localStorage */
export async function saveAdminPrayerRequest(data: {
  name: string;
  email?: string | null;
  phone?: string | null;
  content: string;
}): Promise<AdminPrayerRequest> {
  const request: AdminPrayerRequest = {
    id: "pr-" + Date.now(),
    name: data.name,
    email: data.email || null,
    phone: data.phone || null,
    content: data.content,
    isRead: false,
    createdAt: new Date().toISOString(),
  };

  // Try PHP API
  try {
    const res = await fetch(PHP_API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (res.ok) {
      const ct = res.headers.get("content-type");
      if (ct && ct.includes("application/json")) {
        const serverReq = await res.json();
        if (serverReq.id) {
          // Also cache locally
          const all = getAllPrayerRequestsLocal();
          all.unshift(serverReq);
          localStorage.setItem(ADMIN_PRAYER_KEY, JSON.stringify(all));
          addAdminNotification({
            type: "prayer_request",
            title: `New prayer request from ${data.name}`,
            message: data.content.substring(0, 100) + (data.content.length > 100 ? "..." : ""),
            referenceId: serverReq.id,
          });
          return serverReq;
        }
      }
    }
  } catch {
    // PHP API unavailable
  }

  // Fallback: localStorage only
  const all = getAllPrayerRequestsLocal();
  all.unshift(request);
  localStorage.setItem(ADMIN_PRAYER_KEY, JSON.stringify(all));

  addAdminNotification({
    type: "prayer_request",
    title: `New prayer request from ${data.name}`,
    message: data.content.substring(0, 100) + (data.content.length > 100 ? "..." : ""),
    referenceId: request.id,
  });

  return request;
}

/** Mark a prayer request as read via PHP API + localStorage */
export async function markPrayerRequestRead(id: string): Promise<void> {
  // Try PHP API
  try {
    await fetch(PHP_API, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
  } catch {
    // ignore
  }

  // Always update localStorage cache
  const all = getAllPrayerRequestsLocal();
  const idx = all.findIndex((r) => r.id === id);
  if (idx >= 0) {
    all[idx].isRead = true;
    localStorage.setItem(ADMIN_PRAYER_KEY, JSON.stringify(all));
  }
}

/** Get unread prayer request count from cache */
export function getUnreadPrayerCount(): number {
  return getAllPrayerRequestsLocal().filter((r) => !r.isRead).length;
}

// --- Admin local notifications (for static hosting) ---

export interface AdminLocalNotification {
  id: string;
  type: string;
  title: string;
  message: string | null;
  referenceId: string | null;
  isRead: boolean;
  createdAt: string;
}

export function getAdminNotifications(): AdminLocalNotification[] {
  try {
    return JSON.parse(localStorage.getItem(ADMIN_NOTIF_KEY) || "[]");
  } catch {
    return [];
  }
}

export function addAdminNotification(data: {
  type: string;
  title: string;
  message?: string;
  referenceId?: string;
}): void {
  const notifs = getAdminNotifications();
  notifs.unshift({
    id: "notif-" + Date.now(),
    type: data.type,
    title: data.title,
    message: data.message || null,
    referenceId: data.referenceId || null,
    isRead: false,
    createdAt: new Date().toISOString(),
  });
  localStorage.setItem(ADMIN_NOTIF_KEY, JSON.stringify(notifs));
}

export function markAdminNotificationRead(id: string): void {
  const notifs = getAdminNotifications();
  const idx = notifs.findIndex((n) => n.id === id);
  if (idx >= 0) {
    notifs[idx].isRead = true;
    localStorage.setItem(ADMIN_NOTIF_KEY, JSON.stringify(notifs));
  }
}

export function markAllAdminNotificationsRead(): void {
  const notifs = getAdminNotifications();
  notifs.forEach((n) => (n.isRead = true));
  localStorage.setItem(ADMIN_NOTIF_KEY, JSON.stringify(notifs));
}

export function getUnreadAdminNotifCount(): number {
  return getAdminNotifications().filter((n) => !n.isRead).length;
}
