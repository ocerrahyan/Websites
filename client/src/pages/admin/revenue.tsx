import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ThemeToggle } from "@/components/theme-toggle";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AdminSidebar } from "@/components/admin-sidebar";
import { DollarSign, TrendingUp, Calendar, Clock, Plus, LogOut } from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { RevenueRecord, Appointment } from "@shared/schema";
import { AdminNotificationBell } from "@/components/admin-notification-bell";

const typeColors: Record<string, string> = {
  service: "bg-blue-500/10 text-blue-700 dark:text-blue-400",
  product: "bg-green-500/10 text-green-700 dark:text-green-400",
  book: "bg-purple-500/10 text-purple-700 dark:text-purple-400",
  painting: "bg-amber-500/10 text-amber-700 dark:text-amber-400",
  tip: "bg-pink-500/10 text-pink-700 dark:text-pink-400",
  membership: "bg-indigo-500/10 text-indigo-700 dark:text-indigo-400",
};

const barColors: Record<string, string> = {
  service: "bg-blue-500",
  product: "bg-green-500",
  book: "bg-purple-500",
  painting: "bg-amber-500",
  tip: "bg-pink-500",
  membership: "bg-indigo-500",
};

function RevenueContent() {
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [formData, setFormData] = useState({
    type: "service",
    description: "",
    amount: "",
    date: new Date().toISOString().split("T")[0],
  });
  const { logout } = useAuth();
  const { toast } = useToast();

  const { data: records, isLoading: recordsLoading } = useQuery<RevenueRecord[]>({ queryKey: ["/api/revenue"] });
  const { data: summary, isLoading: summaryLoading } = useQuery<{ byType: Record<string, number>; total: number }>({ queryKey: ["/api/revenue/summary"] });
  const { data: appointments } = useQuery<Appointment[]>({ queryKey: ["/api/appointments"] });

  const createMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/revenue", {
        type: formData.type,
        description: formData.description || null,
        amount: formData.amount,
        date: formData.date,
        referenceId: null,
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/revenue"] });
      queryClient.invalidateQueries({ queryKey: ["/api/revenue/summary"] });
      setShowAddDialog(false);
      setFormData({ type: "service", description: "", amount: "", date: new Date().toISOString().split("T")[0] });
      toast({ title: "Revenue record added" });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const thisMonth = new Date().toISOString().slice(0, 7);
  const monthRevenue = records?.filter((r) => r.date.startsWith(thisMonth)).reduce((sum, r) => sum + parseFloat(r.amount), 0) || 0;
  const tipsTotal = summary?.byType?.tip || 0;
  const pendingAppts = appointments?.filter((a) => a.status === "pending").length || 0;
  const maxTypeAmount = summary ? Math.max(...Object.values(summary.byType), 1) : 1;

  const stats = [
    { label: "Total Revenue", value: `$${(summary?.total || 0).toFixed(2)}`, icon: DollarSign, color: "text-green-500", bg: "bg-green-500/10" },
    { label: "This Month", value: `$${monthRevenue.toFixed(2)}`, icon: TrendingUp, color: "text-blue-500", bg: "bg-blue-500/10" },
    { label: "Tips Received", value: `$${tipsTotal.toFixed(2)}`, icon: DollarSign, color: "text-pink-500", bg: "bg-pink-500/10" },
    { label: "Pending Appointments", value: pendingAppts, icon: Clock, color: "text-amber-500", bg: "bg-amber-500/10" },
  ];

  return (
    <div className="flex flex-col flex-1">
      <header className="h-14 flex items-center justify-between gap-4 px-4 border-b">
        <div className="flex items-center gap-2">
          <SidebarTrigger data-testid="button-sidebar-toggle" />
          <h1 className="font-serif text-lg text-foreground">Revenue Dashboard</h1>
        </div>
        <div className="flex items-center gap-2">
          <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
            <DialogTrigger asChild>
              <Button size="sm" data-testid="button-add-revenue">
                <Plus className="w-4 h-4 mr-1" /> Add Revenue
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Revenue Record</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-foreground mb-1.5 block">Type</label>
                  <Select value={formData.type} onValueChange={(v) => setFormData({ ...formData, type: v })}>
                    <SelectTrigger data-testid="select-revenue-type">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="service">Service</SelectItem>
                      <SelectItem value="product">Product</SelectItem>
                      <SelectItem value="book">Book</SelectItem>
                      <SelectItem value="painting">Painting</SelectItem>
                      <SelectItem value="tip">Tip</SelectItem>
                      <SelectItem value="membership">Membership</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-1.5 block">Description</label>
                  <Input value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} data-testid="input-revenue-description" />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-1.5 block">Amount ($)</label>
                  <Input type="number" step="0.01" value={formData.amount} onChange={(e) => setFormData({ ...formData, amount: e.target.value })} data-testid="input-revenue-amount" />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-1.5 block">Date</label>
                  <Input type="date" value={formData.date} onChange={(e) => setFormData({ ...formData, date: e.target.value })} data-testid="input-revenue-date" />
                </div>
                <Button className="w-full" onClick={() => createMutation.mutate()} disabled={!formData.amount || createMutation.isPending} data-testid="button-save-revenue">
                  {createMutation.isPending ? "Saving..." : "Add Record"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
          <AdminNotificationBell />
          <ThemeToggle />
          <Button variant="ghost" size="icon" onClick={logout} data-testid="button-logout">
            <LogOut className="w-4 h-4" />
          </Button>
        </div>
      </header>

      <main className="flex-1 overflow-auto p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {stats.map((stat) => (
            <Card key={stat.label} className="p-4" data-testid={`stat-${stat.label.toLowerCase().replace(/\s/g, "-")}`}>
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="text-sm text-muted-foreground">{stat.label}</span>
                <div className={`w-8 h-8 rounded-md ${stat.bg} flex items-center justify-center`}>
                  <stat.icon className={`w-4 h-4 ${stat.color}`} />
                </div>
              </div>
              <p className="text-2xl font-semibold text-foreground">
                {summaryLoading ? <Skeleton className="h-7 w-20" /> : stat.value}
              </p>
            </Card>
          ))}
        </div>

        <Card className="p-5 mb-6">
          <h3 className="font-serif text-lg text-foreground mb-4">Revenue by Category</h3>
          {summaryLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-10 rounded-md" />)}
            </div>
          ) : (
            <div className="space-y-3">
              {["service", "product", "book", "painting", "tip", "membership"].map((type) => {
                const amount = summary?.byType?.[type] || 0;
                const width = maxTypeAmount > 0 ? (amount / maxTypeAmount) * 100 : 0;
                const count = records?.filter((r) => r.type === type).length || 0;
                return (
                  <div key={type} className="flex items-center gap-3" data-testid={`revenue-category-${type}`}>
                    <div className="w-24 shrink-0">
                      <Badge variant="secondary" className={`capitalize text-xs ${typeColors[type] || ""}`}>{type}</Badge>
                    </div>
                    <div className="flex-1 h-6 bg-muted rounded-md overflow-hidden">
                      <div className={`h-full rounded-md ${barColors[type] || "bg-primary"} transition-all`} style={{ width: `${Math.max(width, 2)}%` }} />
                    </div>
                    <div className="w-28 text-right shrink-0">
                      <span className="text-sm font-medium text-foreground">${amount.toFixed(2)}</span>
                      <span className="text-xs text-muted-foreground ml-1">({count})</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>

        <Card className="p-5">
          <h3 className="font-serif text-lg text-foreground mb-4">Recent Transactions</h3>
          {recordsLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-12 rounded-md" />)}
            </div>
          ) : !records || records.length === 0 ? (
            <div className="text-center py-8">
              <DollarSign className="w-10 h-10 text-muted-foreground/30 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">No revenue records yet</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {records.slice(0, 20).map((record) => (
                    <TableRow key={record.id} data-testid={`revenue-row-${record.id}`}>
                      <TableCell className="text-sm text-muted-foreground">{record.date}</TableCell>
                      <TableCell>
                        <Badge variant="secondary" className={`capitalize text-xs ${typeColors[record.type] || ""}`}>{record.type}</Badge>
                      </TableCell>
                      <TableCell className="text-sm text-foreground">{record.description || "-"}</TableCell>
                      <TableCell className="text-right text-sm font-medium text-foreground">${parseFloat(record.amount).toFixed(2)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </Card>
      </main>
    </div>
  );
}

export default function Revenue() {
  return (
    <SidebarProvider>
      <div className="flex h-screen w-full">
        <AdminSidebar />
        <RevenueContent />
      </div>
    </SidebarProvider>
  );
}
