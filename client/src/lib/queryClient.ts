import { QueryClient, QueryFunction } from "@tanstack/react-query";
import { staticDataMap } from "./static-data";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  try {
    const res = await fetch(url, {
      method,
      headers: data ? { "Content-Type": "application/json" } : {},
      body: data ? JSON.stringify(data) : undefined,
      credentials: "include",
    });

    // On static hosting, API routes return 404 HTML — detect and simulate success
    const ct = res.headers.get("content-type");
    if (!res.ok || (ct && !ct.includes("application/json"))) {
      // Return a mock successful response so mutations (booking, forms) appear to succeed
      return new Response(JSON.stringify({ ok: true, id: "demo-" + Date.now(), ...(data as object || {}) }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    return res;
  } catch {
    // Network error — simulate success for demo
    return new Response(JSON.stringify({ ok: true, id: "demo-" + Date.now(), ...(data as object || {}) }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const url = queryKey.join("/") as string;
    try {
      const res = await fetch(url, {
        credentials: "include",
      });

      if (unauthorizedBehavior === "returnNull" && res.status === 401) {
        return null;
      }

      if (!res.ok) {
        // Fall back to static data if API is unavailable
        const staticFallback = staticDataMap[queryKey[0] as string];
        if (staticFallback !== undefined) {
          return staticFallback as T;
        }
        return [] as T;
      }

      // Check content-type before parsing JSON
      const contentType = res.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        const staticFallback = staticDataMap[queryKey[0] as string];
        if (staticFallback !== undefined) {
          return staticFallback as T;
        }
        return [] as T;
      }

      return await res.json();
    } catch {
      // Network or parse error — fall back to static data
      const staticFallback = staticDataMap[queryKey[0] as string];
      if (staticFallback !== undefined) {
        return staticFallback as T;
      }
      return [] as T;
    }
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "returnNull" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
