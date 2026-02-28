import { useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { logActivity } from "./activity-logger";
import { useClientAuth } from "./client-auth";

/**
 * Tracks page views — logs every navigation to the activity log.
 * Must be rendered inside ClientAuthProvider and wouter Router.
 */
export function usePageTracker() {
  const [location] = useLocation();
  const { client } = useClientAuth();
  const lastPage = useRef<string>("");

  useEffect(() => {
    // Don't double-log the same page
    if (location === lastPage.current) return;
    lastPage.current = location;

    // Determine user type
    const adminSession = localStorage.getItem("alis-admin-session");
    const adminUsername = localStorage.getItem("alis-admin-username");

    if (adminSession === "true" && adminUsername) {
      logActivity({
        userId: adminUsername,
        userName: adminUsername,
        userType: "admin",
        action: "page_view",
        category: "navigation",
        page: location,
      });
    } else if (client) {
      logActivity({
        userId: client.id,
        userName: `${client.firstName} ${client.lastName}`,
        userType: "client",
        action: "page_view",
        category: "navigation",
        page: location,
      });
    } else {
      logActivity({
        userType: "visitor",
        action: "page_view",
        category: "navigation",
        page: location,
      });
    }
  }, [location, client]);
}
