import { useState } from "react";
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
  Palette, Plus, LogOut, Edit, Trash2, ExternalLink,
} from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Painting } from "@shared/schema";

function PaintingsContent() {
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingPainting, setEditingPainting] = useState<Painting | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    imageUrl: "",
    size: "",
    medium: "Oil on Canvas",
    year: "",
    price: "",
    externalUrl: "https://alis.webador.com/page-2",
    isSold: false,
    featured: false,
    sortOrder: 0,
  });

  const { logout } = useAuth();
  const { toast } = useToast();

  const { data: paintings, isLoading } = useQuery<Painting[]>({ queryKey: ["/api/paintings"] });

  const createMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        ...formData,
        year: formData.year ? parseInt(formData.year) : null,
        price: formData.price || null,
        imageUrl: formData.imageUrl || null,
        description: formData.description || null,
        size: formData.size || null,
        medium: formData.medium || null,
        externalUrl: formData.externalUrl || null,
      };
      const res = await apiRequest("POST", "/api/paintings", payload);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/paintings"] });
      setShowAddDialog(false);
      resetForm();
      toast({ title: "Painting added" });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        ...formData,
        year: formData.year ? parseInt(formData.year) : null,
        price: formData.price || null,
        imageUrl: formData.imageUrl || null,
        description: formData.description || null,
        size: formData.size || null,
        medium: formData.medium || null,
        externalUrl: formData.externalUrl || null,
      };
      const res = await apiRequest("PATCH", `/api/paintings/${editingPainting?.id}`, payload);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/paintings"] });
      setEditingPainting(null);
      resetForm();
      toast({ title: "Painting updated" });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/paintings/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/paintings"] });
      toast({ title: "Painting removed" });
    },
  });

  const resetForm = () => {
    setFormData({
      title: "", description: "", imageUrl: "", size: "", medium: "Oil on Canvas",
      year: "", price: "", externalUrl: "https://alis.webador.com/page-2",
      isSold: false, featured: false, sortOrder: 0,
    });
  };

  const openEdit = (painting: Painting) => {
    setEditingPainting(painting);
    setFormData({
      title: painting.title,
      description: painting.description || "",
      imageUrl: painting.imageUrl || "",
      size: painting.size || "",
      medium: painting.medium || "",
      year: painting.year ? String(painting.year) : "",
      price: painting.price || "",
      externalUrl: painting.externalUrl || "",
      isSold: painting.isSold,
      featured: painting.featured,
      sortOrder: painting.sortOrder,
    });
  };

  const PaintingForm = ({ isEditing }: { isEditing: boolean }) => (
    <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
      <div>
        <label className="text-sm font-medium text-foreground mb-1.5 block">Title</label>
        <Input value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} data-testid="input-painting-title" />
      </div>
      <div>
        <label className="text-sm font-medium text-foreground mb-1.5 block">Description</label>
        <Textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows={4} data-testid="input-painting-desc" />
      </div>
      <div>
        <label className="text-sm font-medium text-foreground mb-1.5 block">Image URL</label>
        <Input value={formData.imageUrl} onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })} data-testid="input-painting-image" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-sm font-medium text-foreground mb-1.5 block">Size</label>
          <Input value={formData.size} onChange={(e) => setFormData({ ...formData, size: e.target.value })} placeholder='e.g. 16" x 20"' data-testid="input-painting-size" />
        </div>
        <div>
          <label className="text-sm font-medium text-foreground mb-1.5 block">Medium</label>
          <Input value={formData.medium} onChange={(e) => setFormData({ ...formData, medium: e.target.value })} placeholder="e.g. Oil on Canvas" data-testid="input-painting-medium" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-sm font-medium text-foreground mb-1.5 block">Year</label>
          <Input type="number" value={formData.year} onChange={(e) => setFormData({ ...formData, year: e.target.value })} data-testid="input-painting-year" />
        </div>
        <div>
          <label className="text-sm font-medium text-foreground mb-1.5 block">Price</label>
          <Input type="number" value={formData.price} onChange={(e) => setFormData({ ...formData, price: e.target.value })} placeholder="e.g. 250.00" data-testid="input-painting-price" />
        </div>
      </div>
      <div>
        <label className="text-sm font-medium text-foreground mb-1.5 block">External URL</label>
        <Input value={formData.externalUrl} onChange={(e) => setFormData({ ...formData, externalUrl: e.target.value })} data-testid="input-painting-url" />
      </div>
      <div className="grid grid-cols-3 gap-3">
        <div className="flex items-center justify-between gap-2">
          <label className="text-sm font-medium text-foreground">Sold</label>
          <Switch checked={formData.isSold} onCheckedChange={(v) => setFormData({ ...formData, isSold: v })} data-testid="switch-painting-sold" />
        </div>
        <div className="flex items-center justify-between gap-2">
          <label className="text-sm font-medium text-foreground">Featured</label>
          <Switch checked={formData.featured} onCheckedChange={(v) => setFormData({ ...formData, featured: v })} data-testid="switch-painting-featured" />
        </div>
        <div>
          <label className="text-sm font-medium text-foreground mb-1.5 block">Sort Order</label>
          <Input type="number" value={formData.sortOrder} onChange={(e) => setFormData({ ...formData, sortOrder: parseInt(e.target.value) || 0 })} data-testid="input-painting-order" />
        </div>
      </div>
      <Button
        className="w-full"
        onClick={() => isEditing ? updateMutation.mutate() : createMutation.mutate()}
        disabled={!formData.title || createMutation.isPending || updateMutation.isPending}
        data-testid="button-save-painting"
      >
        {(createMutation.isPending || updateMutation.isPending) ? "Saving..." : isEditing ? "Update Painting" : "Add Painting"}
      </Button>
    </div>
  );

  return (
    <div className="flex flex-col flex-1">
      <header className="h-14 flex items-center justify-between gap-4 px-4 border-b">
        <div className="flex items-center gap-2">
          <SidebarTrigger data-testid="button-sidebar-toggle" />
          <h1 className="font-serif text-lg text-foreground">Paintings</h1>
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
          <p className="text-muted-foreground text-sm">{paintings?.length || 0} paintings listed</p>
          <Dialog open={showAddDialog} onOpenChange={(o) => { setShowAddDialog(o); if (!o) resetForm(); }}>
            <DialogTrigger asChild>
              <Button data-testid="button-add-painting"><Plus className="w-4 h-4 mr-1.5" /> Add Painting</Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader><DialogTitle className="font-serif">Add New Painting</DialogTitle></DialogHeader>
              <PaintingForm isEditing={false} />
            </DialogContent>
          </Dialog>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <Card key={i}><Skeleton className="h-40 rounded-md" /></Card>
            ))}
          </div>
        ) : !paintings?.length ? (
          <div className="text-center py-16">
            <Palette className="w-12 h-12 text-muted-foreground/50 mx-auto mb-3" />
            <p className="text-muted-foreground">No paintings listed yet</p>
          </div>
        ) : (
          <div className="space-y-4">
            {paintings.map((painting) => (
              <Card key={painting.id} className="overflow-visible" data-testid={`card-painting-${painting.id}`}>
                <div className="flex flex-col sm:flex-row">
                  {painting.imageUrl && (
                    <div className="w-full sm:w-32 shrink-0 overflow-hidden rounded-t-md sm:rounded-l-md sm:rounded-tr-none">
                      <img src={painting.imageUrl} alt={painting.title} className="w-full h-full object-cover aspect-[4/3]" />
                    </div>
                  )}
                  <div className="p-4 flex-1">
                    <div className="flex items-start justify-between gap-2 mb-2 flex-wrap">
                      <div>
                        <h3 className="font-medium text-foreground" data-testid={`text-painting-title-${painting.id}`}>{painting.title}</h3>
                        <p className="text-sm text-muted-foreground">
                          {painting.size && `${painting.size}`}{painting.medium && ` \u00B7 ${painting.medium}`}
                        </p>
                      </div>
                      <div className="flex items-center gap-1 flex-wrap">
                        {painting.isSold && <Badge variant="destructive">SOLD</Badge>}
                        {painting.featured && <Badge>Featured</Badge>}
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{painting.description}</p>
                    {painting.externalUrl && (
                      <a href={painting.externalUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-primary flex items-center gap-1 mb-3">
                        View on Gallery <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                    <div className="flex items-center gap-2">
                      <Dialog open={editingPainting?.id === painting.id} onOpenChange={(o) => { if (!o) { setEditingPainting(null); resetForm(); } }}>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm" className="flex-1" onClick={() => openEdit(painting)} data-testid={`button-edit-painting-${painting.id}`}>
                            <Edit className="w-3 h-3 mr-1" /> Edit
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-lg">
                          <DialogHeader><DialogTitle className="font-serif">Edit Painting</DialogTitle></DialogHeader>
                          <PaintingForm isEditing={true} />
                        </DialogContent>
                      </Dialog>
                      <Button variant="outline" size="sm" onClick={() => deleteMutation.mutate(painting.id)} data-testid={`button-delete-painting-${painting.id}`}>
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
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

export default function AdminPaintings() {
  const style = {
    "--sidebar-width": "16rem",
    "--sidebar-width-icon": "3rem",
  };

  return (
    <SidebarProvider style={style as React.CSSProperties}>
      <div className="flex h-screen w-full">
        <AdminSidebar />
        <PaintingsContent />
      </div>
    </SidebarProvider>
  );
}
