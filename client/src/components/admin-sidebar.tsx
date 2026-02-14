import { Link, useLocation } from "wouter";
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
import { useAuth } from "@/lib/auth";
import {
  LayoutDashboard, Users, Calendar, Scissors, ShoppingBag,
  MessageSquare, BookOpen, Palette, LogOut, Home, Heart, HandHeart, Star,
  ClipboardList, Sparkles, MessageCircle, DollarSign, FileText,
} from "lucide-react";

const menuItems = [
  { title: "Dashboard", url: "/admin", icon: LayoutDashboard },
  { title: "Clients", url: "/admin/clients", icon: Users },
  { title: "Calendar", url: "/admin/calendar", icon: Calendar },
  { title: "Services", url: "/admin/services", icon: Scissors },
  { title: "Products", url: "/admin/products", icon: ShoppingBag },
  { title: "Books", url: "/admin/books", icon: BookOpen },
  { title: "Paintings", url: "/admin/paintings", icon: Palette },
  { title: "Messages", url: "/admin/messages", icon: MessageSquare },
  { title: "Inspirational", url: "/admin/inspirational", icon: Heart },
  { title: "Prayer Requests", url: "/admin/prayer-requests", icon: HandHeart },
  { title: "Reviews", url: "/admin/reviews", icon: Star },
  { title: "Waitlist", url: "/admin/waitlist", icon: ClipboardList },
  { title: "Style Board", url: "/admin/style-board", icon: Sparkles },
  { title: "Chat Inbox", url: "/admin/chat", icon: MessageCircle },
  { title: "Revenue", url: "/admin/revenue", icon: DollarSign },
  { title: "Daily Summary", url: "/admin/daily-summary", icon: FileText },
];

export function AdminSidebar() {
  const [location] = useLocation();
  const { logout } = useAuth();

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
