import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
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
  Scissors, Plus, LogOut, Edit, Trash2, Clock, DollarSign,
} from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Service } from "@shared/schema";

function ServicesContent() {
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    duration: 30,
    price: "",
    category: "",
    imageUrl: "",
    isActive: true,
  });

  const { logout } = useAuth();
  const { toast } = useToast();

  const { data: services, isLoading } = useQuery<Service[]>({ queryKey: ["/api/services"] });

  const createMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/services", formData);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/services"] });
      setShowAddDialog(false);
      resetForm();
      toast({ title: "Service created" });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("PATCH", `/api/services/${editingService?.id}`, formData);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/services"] });
      setEditingService(null);
      resetForm();
      toast({ title: "Service updated" });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/services/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/services"] });
      toast({ title: "Service removed" });
    },
  });

  const resetForm = () => {
    setFormData({ name: "", description: "", duration: 30, price: "", category: "", imageUrl: "", isActive: true });
  };

  const openEdit = (service: Service) => {
    setEditingService(service);
    setFormData({
      name: service.name,
      description: service.description || "",
      duration: service.duration,
      price: String(service.price),
      category: service.category,
      imageUrl: service.imageUrl || "",
      isActive: service.isActive,
    });
  };

  const ServiceForm = ({ isEditing }: { isEditing: boolean }) => (
    <div className="space-y-4">
      <div>
        <label className="text-sm font-medium text-foreground mb-1.5 block">Service Name</label>
        <Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="e.g. Haircut & Style" data-testid="input-service-name" />
      </div>
      <div>
        <label className="text-sm font-medium text-foreground mb-1.5 block">Description</label>
        <Textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} placeholder="Describe this service..." data-testid="input-service-desc" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-sm font-medium text-foreground mb-1.5 block">Price ($)</label>
          <Input type="number" step="0.01" value={formData.price} onChange={(e) => setFormData({ ...formData, price: e.target.value })} data-testid="input-service-price" />
        </div>
        <div>
          <label className="text-sm font-medium text-foreground mb-1.5 block">Duration (min)</label>
          <Input type="number" value={formData.duration} onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) || 30 })} data-testid="input-service-duration" />
        </div>
      </div>
      <div>
        <label className="text-sm font-medium text-foreground mb-1.5 block">Category</label>
        <Input value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} placeholder="e.g. Hair, Nails, Facial" data-testid="input-service-category" />
      </div>
      <div>
        <label className="text-sm font-medium text-foreground mb-1.5 block">Image URL</label>
        <Input value={formData.imageUrl} onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })} placeholder="https://..." data-testid="input-service-image" />
      </div>
      <div className="flex items-center justify-between gap-2">
        <label className="text-sm font-medium text-foreground">Active</label>
        <Switch checked={formData.isActive} onCheckedChange={(v) => setFormData({ ...formData, isActive: v })} data-testid="switch-service-active" />
      </div>
      <Button
        className="w-full"
        onClick={() => isEditing ? updateMutation.mutate() : createMutation.mutate()}
        disabled={!formData.name || !formData.price || !formData.category || createMutation.isPending || updateMutation.isPending}
        data-testid="button-save-service"
      >
        {(createMutation.isPending || updateMutation.isPending) ? "Saving..." : isEditing ? "Update Service" : "Add Service"}
      </Button>
    </div>
  );

  return (
    <div className="flex flex-col flex-1">
      <header className="h-14 flex items-center justify-between gap-4 px-4 border-b">
        <div className="flex items-center gap-2">
          <SidebarTrigger data-testid="button-sidebar-toggle" />
          <h1 className="font-serif text-lg text-foreground">Services</h1>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Button variant="ghost" size="icon" onClick={logout} data-testid="button-logout">
            <LogOut className="w-4 h-4" />
          </Button>
        </div>
      </header>
      <main className="flex-1 overflow-auto p-6">
        <div className="flex items-center justify-between gap-3 mb-6 flex-wrap">
          <p className="text-muted-foreground text-sm">{services?.length || 0} services total</p>
          <Dialog open={showAddDialog} onOpenChange={(o) => { setShowAddDialog(o); if (!o) resetForm(); }}>
            <DialogTrigger asChild>
              <Button data-testid="button-add-service"><Plus className="w-4 h-4 mr-1.5" /> Add Service</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle className="font-serif">Add New Service</DialogTitle></DialogHeader>
              <ServiceForm isEditing={false} />
            </DialogContent>
          </Dialog>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i}><Skeleton className="h-48 rounded-md" /></Card>
            ))}
          </div>
        ) : !services?.length ? (
          <div className="text-center py-16">
            <Scissors className="w-12 h-12 text-muted-foreground/50 mx-auto mb-3" />
            <p className="text-muted-foreground">No services created yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {services.map((service) => (
              <Card key={service.id} className={`overflow-visible ${!service.isActive ? "opacity-60" : ""}`} data-testid={`card-service-${service.id}`}>
                {service.imageUrl && (
                  <div className="aspect-video overflow-hidden rounded-t-md">
                    <img src={service.imageUrl} alt={service.name} className="w-full h-full object-cover" />
                  </div>
                )}
                <div className="p-4">
                  <div className="flex items-center justify-between gap-2 mb-2 flex-wrap">
                    <h3 className="font-medium text-foreground">{service.name}</h3>
                    <Badge variant={service.isActive ? "secondary" : "destructive"}>
                      {service.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{service.description}</p>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                    <span className="flex items-center gap-1"><DollarSign className="w-3 h-3" />{Number(service.price).toFixed(2)}</span>
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{service.duration} min</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Dialog open={editingService?.id === service.id} onOpenChange={(o) => { if (!o) { setEditingService(null); resetForm(); } }}>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm" className="flex-1" onClick={() => openEdit(service)} data-testid={`button-edit-${service.id}`}>
                          <Edit className="w-3 h-3 mr-1" /> Edit
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader><DialogTitle className="font-serif">Edit Service</DialogTitle></DialogHeader>
                        <ServiceForm isEditing={true} />
                      </DialogContent>
                    </Dialog>
                    <Button variant="outline" size="sm" onClick={() => deleteMutation.mutate(service.id)} data-testid={`button-delete-${service.id}`}>
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default function AdminServices() {
  const style = {
    "--sidebar-width": "16rem",
    "--sidebar-width-icon": "3rem",
  };

  return (
    <SidebarProvider style={style as React.CSSProperties}>
      <div className="flex h-screen w-full">
        <AdminSidebar />
        <ServicesContent />
      </div>
    </SidebarProvider>
  );
}
