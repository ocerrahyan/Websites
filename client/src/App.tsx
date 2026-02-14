import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider, useAuth } from "@/lib/auth";
import NotFound from "@/pages/not-found";
import Landing from "@/pages/landing";
import Services from "@/pages/services";
import Shop from "@/pages/shop";
import Booking from "@/pages/booking";
import Membership from "@/pages/membership";
import AdminLogin from "@/pages/admin-login";
import AdminDashboard from "@/pages/admin/dashboard";
import AdminClients from "@/pages/admin/clients";
import AdminCalendar from "@/pages/admin/calendar-view";
import AdminServices from "@/pages/admin/services-manage";
import AdminProducts from "@/pages/admin/products-manage";
import AdminMessages from "@/pages/admin/messages";
import AdminBooks from "@/pages/admin/books-manage";
import AdminPaintings from "@/pages/admin/paintings-manage";
import AdminInspirational from "@/pages/admin/inspirational";
import AdminClientDetail from "@/pages/admin/client-detail";
import Books from "@/pages/books";
import Paintings from "@/pages/paintings";
import Subscribe from "@/pages/subscribe";
import PrayerRequest from "@/pages/prayer-request";
import AdminPrayerRequests from "@/pages/admin/prayer-requests";
import AdminReviews from "@/pages/admin/reviews-manage";
import AdminWaitlist from "@/pages/admin/waitlist-manage";
import AdminStyleBoard from "@/pages/admin/style-board-manage";
import TipPage from "@/pages/tip";
import ReviewsPage from "@/pages/reviews";
import Waitlist from "@/pages/waitlist";
import StyleBoard from "@/pages/style-board";
import AdminChatInbox from "@/pages/admin/chat-inbox";
import AdminRevenue from "@/pages/admin/revenue";
import AdminDailySummary from "@/pages/admin/daily-summary";
import { ChatWidget } from "@/components/chat-widget";
import { Skeleton } from "@/components/ui/skeleton";

function AdminRoute({ component: Component }: { component: React.ComponentType }) {
  const { isAdmin, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="space-y-3 w-full max-w-sm p-6">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-8 w-1/2" />
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return <AdminLogin />;
  }

  return <Component />;
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={Landing} />
      <Route path="/services" component={Services} />
      <Route path="/shop" component={Shop} />
      <Route path="/booking" component={Booking} />
      <Route path="/books" component={Books} />
      <Route path="/paintings" component={Paintings} />
      <Route path="/membership" component={Membership} />
      <Route path="/subscribe" component={Subscribe} />
      <Route path="/prayer-request" component={PrayerRequest} />
      <Route path="/tip" component={TipPage} />
      <Route path="/reviews" component={ReviewsPage} />
      <Route path="/waitlist" component={Waitlist} />
      <Route path="/style-board" component={StyleBoard} />
      <Route path="/admin/login" component={AdminLogin} />
      <Route path="/admin">{() => <AdminRoute component={AdminDashboard} />}</Route>
      <Route path="/admin/clients/:id">{() => <AdminRoute component={AdminClientDetail} />}</Route>
      <Route path="/admin/clients">{() => <AdminRoute component={AdminClients} />}</Route>
      <Route path="/admin/calendar">{() => <AdminRoute component={AdminCalendar} />}</Route>
      <Route path="/admin/services">{() => <AdminRoute component={AdminServices} />}</Route>
      <Route path="/admin/products">{() => <AdminRoute component={AdminProducts} />}</Route>
      <Route path="/admin/books">{() => <AdminRoute component={AdminBooks} />}</Route>
      <Route path="/admin/paintings">{() => <AdminRoute component={AdminPaintings} />}</Route>
      <Route path="/admin/messages">{() => <AdminRoute component={AdminMessages} />}</Route>
      <Route path="/admin/inspirational">{() => <AdminRoute component={AdminInspirational} />}</Route>
      <Route path="/admin/prayer-requests">{() => <AdminRoute component={AdminPrayerRequests} />}</Route>
      <Route path="/admin/reviews">{() => <AdminRoute component={AdminReviews} />}</Route>
      <Route path="/admin/waitlist">{() => <AdminRoute component={AdminWaitlist} />}</Route>
      <Route path="/admin/style-board">{() => <AdminRoute component={AdminStyleBoard} />}</Route>
      <Route path="/admin/chat">{() => <AdminRoute component={AdminChatInbox} />}</Route>
      <Route path="/admin/revenue">{() => <AdminRoute component={AdminRevenue} />}</Route>
      <Route path="/admin/daily-summary">{() => <AdminRoute component={AdminDailySummary} />}</Route>
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <TooltipProvider>
            <Router />
            <ChatWidget />
            <Toaster />
          </TooltipProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
