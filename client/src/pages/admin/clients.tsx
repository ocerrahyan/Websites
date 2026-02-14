import { useState } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ThemeToggle } from "@/components/theme-toggle";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import {
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { AdminSidebar } from "@/components/admin-sidebar";
import {
  Users, Search, Plus, Mail, Phone, LogOut, Edit, Trash2, Tag,
} from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Client } from "@shared/schema";

const TAG_COLORS: Record<string, string> = {
  VIP: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20",
  Regular: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
  New: "bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20",
  "Color Client": "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20",
  Loyal: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
};
const FALLBACK_PALETTE = [
  "bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-500/20",
  "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20",
  "bg-pink-500/10 text-pink-600 dark:text-pink-400 border-pink-500/20",
  "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20",
];
function getTagColor(tag: string) {
  if (TAG_COLORS[tag]) return TAG_COLORS[tag];
  let hash = 0;
  for (let i = 0; i < tag.length; i++) hash = tag.charCodeAt(i) + ((hash << 5) - hash);
  return FALLBACK_PALETTE[Math.abs(hash) % FALLBACK_PALETTE.length];
}

function ClientsContent() {
  const [search, setSearch] = useState("");
  const [filterTier, setFilterTier] = useState("all");
  const [filterTag, setFilterTag] = useState("all");
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    membershipTier: "bronze" as string,
    notes: "",
    allergies: "",
    preferredServices: "",
    birthdate: "",
  });

  const { logout } = useAuth();
  const { toast } = useToast();

  const { data: clients, isLoading } = useQuery<Client[]>({ queryKey: ["/api/clients"] });

  const createMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/clients", formData);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/clients"] });
      setShowAddDialog(false);
      resetForm();
      toast({ title: "Client added successfully" });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("PATCH", `/api/clients/${editingClient?.id}`, formData);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/clients"] });
      setEditingClient(null);
      resetForm();
      toast({ title: "Client updated successfully" });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/clients/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/clients"] });
      toast({ title: "Client removed" });
    },
  });

  const resetForm = () => {
    setFormData({
      firstName: "", lastName: "", email: "", phone: "",
      membershipTier: "bronze", notes: "", allergies: "", preferredServices: "", birthdate: "",
    });
  };

  const openEdit = (client: Client) => {
    setEditingClient(client);
    setFormData({
      firstName: client.firstName,
      lastName: client.lastName,
      email: client.email,
      phone: client.phone || "",
      membershipTier: client.membershipTier || "bronze",
      notes: client.notes || "",
      allergies: client.allergies || "",
      preferredServices: client.preferredServices || "",
      birthdate: client.birthdate || "",
    });
  };

  const allTags = Array.from(new Set(clients?.flatMap((c) => c.tags || []) || []));

  const filtered = clients?.filter((c) => {
    const matchesSearch = `${c.firstName} ${c.lastName} ${c.email}`.toLowerCase().includes(search.toLowerCase());
    const matchesTier = filterTier === "all" || c.membershipTier === filterTier;
    const matchesTag = filterTag === "all" || (c.tags && c.tags.includes(filterTag));
    return matchesSearch && matchesTier && matchesTag;
  });

  const ClientForm = ({ isEditing }: { isEditing: boolean }) => (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-sm font-medium text-foreground mb-1.5 block">First Name</label>
          <Input value={formData.firstName} onChange={(e) => setFormData({ ...formData, firstName: e.target.value })} data-testid="input-client-first-name" />
        </div>
        <div>
          <label className="text-sm font-medium text-foreground mb-1.5 block">Last Name</label>
          <Input value={formData.lastName} onChange={(e) => setFormData({ ...formData, lastName: e.target.value })} data-testid="input-client-last-name" />
        </div>
      </div>
      <div>
        <label className="text-sm font-medium text-foreground mb-1.5 block">Email</label>
        <Input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} data-testid="input-client-email" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-sm font-medium text-foreground mb-1.5 block">Phone</label>
          <Input value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} data-testid="input-client-phone" />
        </div>
        <div>
          <label className="text-sm font-medium text-foreground mb-1.5 block">Membership</label>
          <Select value={formData.membershipTier} onValueChange={(v) => setFormData({ ...formData, membershipTier: v })}>
            <SelectTrigger data-testid="select-client-tier"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="bronze">Bronze</SelectItem>
              <SelectItem value="silver">Silver</SelectItem>
              <SelectItem value="gold">Gold</SelectItem>
              <SelectItem value="platinum">Platinum</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div>
        <label className="text-sm font-medium text-foreground mb-1.5 block">Birthday</label>
        <Input type="date" value={formData.birthdate} onChange={(e) => setFormData({ ...formData, birthdate: e.target.value })} data-testid="input-client-birthday" />
      </div>
      <div>
        <label className="text-sm font-medium text-foreground mb-1.5 block">Allergies</label>
        <Input value={formData.allergies} onChange={(e) => setFormData({ ...formData, allergies: e.target.value })} placeholder="Any product allergies?" data-testid="input-client-allergies" />
      </div>
      <div>
        <label className="text-sm font-medium text-foreground mb-1.5 block">Notes</label>
        <Textarea value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} placeholder="Client preferences, history notes..." data-testid="input-client-notes" />
      </div>
      <Button
        className="w-full"
        onClick={() => isEditing ? updateMutation.mutate() : createMutation.mutate()}
        disabled={!formData.firstName || !formData.lastName || !formData.email || createMutation.isPending || updateMutation.isPending}
        data-testid="button-save-client"
      >
        {(createMutation.isPending || updateMutation.isPending) ? "Saving..." : isEditing ? "Update Client" : "Add Client"}
      </Button>
    </div>
  );

  return (
    <div className="flex flex-col flex-1">
      <header className="h-14 flex items-center justify-between gap-4 px-4 border-b">
        <div className="flex items-center gap-2">
          <SidebarTrigger data-testid="button-sidebar-toggle" />
          <h1 className="font-serif text-lg text-foreground">Clients</h1>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Button variant="ghost" size="icon" onClick={logout} data-testid="button-logout">
            <LogOut className="w-4 h-4" />
          </Button>
        </div>
      </header>
      <main className="flex-1 overflow-auto p-6">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
          <div className="flex items-center gap-3 flex-wrap flex-1">
            <div className="relative flex-1 min-w-[200px] max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search clients..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
                data-testid="input-search-clients"
              />
            </div>
            <Select value={filterTier} onValueChange={setFilterTier}>
              <SelectTrigger className="w-[140px]" data-testid="select-filter-tier">
                <SelectValue placeholder="All Tiers" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Tiers</SelectItem>
                <SelectItem value="bronze">Bronze</SelectItem>
                <SelectItem value="silver">Silver</SelectItem>
                <SelectItem value="gold">Gold</SelectItem>
                <SelectItem value="platinum">Platinum</SelectItem>
              </SelectContent>
            </Select>
            {allTags.length > 0 && (
              <Select value={filterTag} onValueChange={setFilterTag}>
                <SelectTrigger className="w-[140px]" data-testid="select-filter-tag">
                  <Tag className="w-3 h-3 mr-1" />
                  <SelectValue placeholder="All Tags" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Tags</SelectItem>
                  {allTags.map((tag) => (
                    <SelectItem key={tag} value={tag}>{tag}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
          <Dialog open={showAddDialog} onOpenChange={(o) => { setShowAddDialog(o); if (!o) resetForm(); }}>
            <DialogTrigger asChild>
              <Button data-testid="button-add-client"><Plus className="w-4 h-4 mr-1.5" /> Add Client</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle className="font-serif">Add New Client</DialogTitle></DialogHeader>
              <ClientForm isEditing={false} />
            </DialogContent>
          </Dialog>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-20 rounded-md" />)}
          </div>
        ) : !filtered?.length ? (
          <div className="text-center py-16">
            <Users className="w-12 h-12 text-muted-foreground/50 mx-auto mb-3" />
            <p className="text-muted-foreground">No clients found</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((client) => (
              <Card key={client.id} className="p-4" data-testid={`card-client-${client.id}`}>
                <div className="flex items-center justify-between gap-3 flex-wrap">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <span className="text-sm font-medium text-primary">
                        {client.firstName[0]}{client.lastName[0]}
                      </span>
                    </div>
                    <div>
                      <Link href={`/admin/clients/${client.id}`} className="font-medium text-foreground hover:underline" data-testid={`link-client-${client.id}`}>{client.firstName} {client.lastName}</Link>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
                        <span className="flex items-center gap-1"><Mail className="w-3 h-3" />{client.email}</span>
                        {client.phone && <span className="flex items-center gap-1"><Phone className="w-3 h-3" />{client.phone}</span>}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="capitalize">{client.membershipTier}</Badge>
                    <Dialog open={editingClient?.id === client.id} onOpenChange={(o) => { if (!o) { setEditingClient(null); resetForm(); } }}>
                      <DialogTrigger asChild>
                        <Button variant="ghost" size="icon" onClick={() => openEdit(client)} data-testid={`button-edit-${client.id}`}>
                          <Edit className="w-4 h-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader><DialogTitle className="font-serif">Edit Client</DialogTitle></DialogHeader>
                        <ClientForm isEditing={true} />
                      </DialogContent>
                    </Dialog>
                    <Button variant="ghost" size="icon" onClick={() => deleteMutation.mutate(client.id)} data-testid={`button-delete-${client.id}`}>
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                </div>
                {(client.tags && client.tags.length > 0) && (
                  <div className="flex items-center gap-1.5 mt-2 pl-13 flex-wrap">
                    {client.tags.map((tag) => (
                      <span key={tag} className={`inline-flex items-center text-[10px] font-medium px-2 py-0.5 rounded-full border ${getTagColor(tag)}`} data-testid={`tag-${client.id}-${tag}`}>
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
                {client.notes && (
                  <p className="text-xs text-muted-foreground mt-2 pl-13">{client.notes}</p>
                )}
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default function AdminClients() {
  const style = {
    "--sidebar-width": "16rem",
    "--sidebar-width-icon": "3rem",
  };

  return (
    <SidebarProvider style={style as React.CSSProperties}>
      <div className="flex h-screen w-full">
        <AdminSidebar />
        <ClientsContent />
      </div>
    </SidebarProvider>
  );
}
