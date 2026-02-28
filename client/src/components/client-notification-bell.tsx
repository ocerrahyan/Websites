import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Popover, PopoverContent, PopoverTrigger,
} from "@/components/ui/popover";
import { Bell, Check, Trash2, Gift, Calendar, MessageSquare, Cake, Info } from "lucide-react";
import { useClientNotifications, type ClientNotification } from "@/lib/notifications";

const typeIcons: Record<ClientNotification["type"], typeof Bell> = {
  appointment: Calendar,
  offer: Gift,
  message: MessageSquare,
  birthday: Cake,
  general: Info,
};

const typeColors: Record<ClientNotification["type"], string> = {
  appointment: "bg-blue-500/10 text-blue-500",
  offer: "bg-amber-500/10 text-amber-500",
  message: "bg-green-500/10 text-green-500",
  birthday: "bg-pink-500/10 text-pink-500",
  general: "bg-purple-500/10 text-purple-500",
};

export function ClientNotificationBell() {
  const { notifications, unreadCount, markRead, markAllRead, clearAll } = useClientNotifications();
  const [open, setOpen] = useState(false);
  const [, setLocation] = useLocation();

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="w-4 h-4" />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-primary text-primary-foreground text-[10px] font-medium rounded-full flex items-center justify-center">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="p-3 border-b flex items-center justify-between">
          <h4 className="font-medium text-sm text-foreground">Notifications</h4>
          <div className="flex items-center gap-1">
            {unreadCount > 0 && (
              <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={markAllRead}>
                <Check className="w-3 h-3 mr-1" /> Read all
              </Button>
            )}
            {notifications.length > 0 && (
              <Button variant="ghost" size="sm" className="h-7 text-xs text-muted-foreground" onClick={clearAll}>
                <Trash2 className="w-3 h-3" />
              </Button>
            )}
          </div>
        </div>
        <div className="max-h-80 overflow-auto">
          {notifications.length === 0 ? (
            <div className="p-6 text-center">
              <Bell className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">No notifications</p>
            </div>
          ) : (
            notifications.slice(0, 10).map((notif) => {
              const Icon = typeIcons[notif.type] || Bell;
              return (
                <div
                  key={notif.id}
                  className={`p-3 border-b last:border-0 cursor-pointer hover:bg-muted/50 transition-colors ${
                    !notif.read ? "bg-primary/5" : ""
                  }`}
                  onClick={() => {
                    markRead(notif.id);
                    if (notif.link) {
                      setLocation(notif.link);
                      setOpen(false);
                    }
                  }}
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-7 h-7 rounded-md flex items-center justify-center shrink-0 ${typeColors[notif.type]}`}>
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className={`text-sm truncate ${!notif.read ? "font-medium text-foreground" : "text-muted-foreground"}`}>
                          {notif.title}
                        </p>
                        {!notif.read && <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />}
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">{notif.message}</p>
                      <p className="text-[10px] text-muted-foreground/70 mt-1">
                        {formatTimeAgo(notif.createdAt)}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}

function formatTimeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}
