// Activity Logger — logs every user action to PHP backend
const LOG_API = "/api/activity-log.php";

type UserType = "visitor" | "client" | "admin";

interface LogEntry {
  userId?: string;
  userName?: string;
  userType?: UserType;
  action: string;
  category?: string;
  details?: string | Record<string, unknown>;
  page?: string;
}

// Fire-and-forget log — never blocks UI
export function logActivity(entry: LogEntry): void {
  try {
    const page = entry.page || window.location.pathname;
    fetch(LOG_API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: entry.userId || "anonymous",
        userName: entry.userName || "Anonymous Visitor",
        userType: entry.userType || "visitor",
        action: entry.action,
        category: entry.category || "general",
        details: typeof entry.details === "object" ? JSON.stringify(entry.details) : entry.details || null,
        page,
      }),
    }).catch(() => {});
  } catch {
    // Never fail — logging is best-effort
  }
}

// Convenience helpers
export function logClientAction(
  clientId: string,
  clientName: string,
  action: string,
  details?: string | Record<string, unknown>,
  category?: string,
): void {
  logActivity({
    userId: clientId,
    userName: clientName,
    userType: "client",
    action,
    category: category || "client",
    details,
  });
}

export function logAdminAction(
  adminUsername: string,
  action: string,
  details?: string | Record<string, unknown>,
  category?: string,
): void {
  logActivity({
    userId: adminUsername,
    userName: adminUsername,
    userType: "admin",
    action,
    category: category || "admin",
    details,
  });
}

export function logVisitorAction(
  action: string,
  details?: string | Record<string, unknown>,
  category?: string,
): void {
  logActivity({
    userType: "visitor",
    action,
    category: category || "visitor",
    details,
  });
}

// Fetch logs (osheenadmin only)
export interface ActivityLogResponse {
  entries: Array<{
    id: string;
    timestamp: string;
    userId: string;
    userName: string;
    userType: string;
    action: string;
    category: string;
    details: string | null;
    page: string | null;
    ip: string | null;
    userAgent: string | null;
  }>;
  total: number;
  page: number;
  perPage: number;
  totalPages: number;
  date: string;
  availableDates: string[];
}

export async function fetchActivityLogs(params: {
  adminAuth: string;
  date?: string;
  page?: number;
  perPage?: number;
  user?: string;
  action?: string;
  search?: string;
}): Promise<ActivityLogResponse | null> {
  try {
    const searchParams = new URLSearchParams();
    if (params.date) searchParams.set("date", params.date);
    if (params.page) searchParams.set("page", String(params.page));
    if (params.perPage) searchParams.set("perPage", String(params.perPage));
    if (params.user) searchParams.set("user", params.user);
    if (params.action) searchParams.set("action", params.action);
    if (params.search) searchParams.set("search", params.search);

    const res = await fetch(`${LOG_API}?${searchParams.toString()}`, {
      headers: { "X-Admin-Auth": params.adminAuth },
    });
    const ct = res.headers.get("content-type");
    if (res.ok && ct?.includes("application/json")) {
      return await res.json();
    }
    return null;
  } catch {
    return null;
  }
}
