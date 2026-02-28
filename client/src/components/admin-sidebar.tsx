import { Link, useLocation } from "wouter";
import { useState, useEffect } from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/lib/auth";
import {
  LayoutDashboard, Users, Calendar, Scissors, ShoppingBag,
  MessageSquare, BookOpen, Palette, LogOut, Home, Heart, HandHeart, Star,
  ClipboardList, Sparkles, MessageCircle, DollarSign, FileText,
  Mail, Video, Activity,
} from "lucide-react";
import { getUnreadPrayerCount } from "@/lib/prayer-storage";
import { getPendingAppointmentCount } from "@/lib/appointment-storage";

const menuItems = [
  { title: "Dashboard", url: "/admin", icon: LayoutDashboard },
  { title: "Clients", url: "/admin/clients", icon: Users },
  { title: "Calendar", url: "/admin/calendar", icon: Calendar },
  { title: "Services", url: "/admin/services", icon: Scissors },
  { title: "Products", url: "/admin/products", icon: ShoppingBag },
  { title: "Books", url: "/admin/books", icon: BookOpen },
  { title: "Paintings", url: "/admin/paintings", icon: Palette },
  { title: "Messages", url: "/admin/messages", icon: MessageSquare },
  { title: "Email Marketing", url: "/admin/email-marketing", icon: Mail },
  { title: "Inspirational", url: "/admin/inspirational", icon: Heart },
  { title: "Prayer Requests", url: "/admin/prayer-requests", icon: HandHeart },
  { title: "Reviews", url: "/admin/reviews", icon: Star },
  { title: "Waitlist", url: "/admin/waitlist", icon: ClipboardList },
  { title: "Style Board", url: "/admin/style-board", icon: Sparkles },
  { title: "Consultations", url: "/admin/consultations", icon: Video },
  { title: "Chat Inbox", url: "/admin/chat", icon: MessageCircle },
  { title: "Revenue", url: "/admin/revenue", icon: DollarSign },
  { title: "Daily Summary", url: "/admin/daily-summary", icon: FileText },
  { title: "Activity Log", url: "/admin/activity-log", icon: Activity },
];

export function AdminSidebar() {
  const [location] = useLocation();
  const { logout } = useAuth();
  const [prayerUnread, setPrayerUnread] = useState(0);
  const [pendingAppts, setPendingAppts] = useState(0);

  useEffect(() => {
    setPrayerUnread(getUnreadPrayerCount());
    setPendingAppts(getPendingAppointmentCount());
    const interval = setInterval(() => {
      setPrayerUnread(getUnreadPrayerCount());
      setPendingAppts(getPendingAppointmentCount());
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <Sidebar>
      <SidebarHeader className="p-4">
        <Link href="/admin" className="flex items-center gap-2" data-testid="link-admin-home">
          <span className="font-serif text-lg text-sidebar-foreground">Alis' Admin</span>
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Management</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={location === item.url || (item.url !== "/admin" && location.startsWith(item.url))}>
                    <Link href={item.url} data-testid={`link-admin-${item.title.toLowerCase()}`}>
                      <item.icon className="w-4 h-4" />
                      <span>{item.title}</span>
                      {item.title === "Prayer Requests" && prayerUnread > 0 && (
                        <Badge variant="destructive" className="ml-auto text-[10px] h-5 min-w-[20px] flex items-center justify-center">
                          {prayerUnread}
                        </Badge>
                      )}
                      {item.title === "Calendar" && pendingAppts > 0 && (
                        <Badge variant="destructive" className="ml-auto text-[10px] h-5 min-w-[20px] flex items-center justify-center">
                          {pendingAppts}
                        </Badge>
                      )}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="p-3">
        <Link href="/">
          <Button variant="ghost" className="w-full justify-start" size="sm" data-testid="button-view-site">
            <Home className="w-4 h-4 mr-2" /> View Site
          </Button>
        </Link>
        <Button variant="ghost" className="w-full justify-start text-destructive" size="sm" onClick={logout} data-testid="button-sidebar-logout">
          <LogOut className="w-4 h-4 mr-2" /> Sign Out
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}
