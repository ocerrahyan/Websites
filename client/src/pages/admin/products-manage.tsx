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
  ShoppingBag, Plus, LogOut, Edit, Trash2, ExternalLink,
} from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Product } from "@shared/schema";

function ProductsContent() {
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    imageUrl: "",
    category: "",
    amazonUrl: "",
    inStock: true,
    featured: false,
  });

  const { logout } = useAuth();
  const { toast } = useToast();

  const { data: products, isLoading } = useQuery<Product[]>({ queryKey: ["/api/products"] });

  const createMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/products", formData);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      setShowAddDialog(false);
      resetForm();
      toast({ title: "Product added" });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("PATCH", `/api/products/${editingProduct?.id}`, formData);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      setEditingProduct(null);
      resetForm();
      toast({ title: "Product updated" });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/products/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      toast({ title: "Product removed" });
    },
  });

  const resetForm = () => {
    setFormData({ name: "", description: "", price: "", imageUrl: "", category: "", amazonUrl: "", inStock: true, featured: false });
  };

  const openEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description || "",
      price: String(product.price),
      imageUrl: product.imageUrl || "",
      category: product.category,
      amazonUrl: product.amazonUrl || "",
      inStock: product.inStock,
      featured: product.featured,
    });
  };

  const ProductForm = ({ isEditing }: { isEditing: boolean }) => (
    <div className="space-y-4">
      <div>
        <label className="text-sm font-medium text-foreground mb-1.5 block">Product Name</label>
        <Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} data-testid="input-product-name" />
      </div>
      <div>
        <label className="text-sm font-medium text-foreground mb-1.5 block">Description</label>
        <Textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} data-testid="input-product-desc" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-sm font-medium text-foreground mb-1.5 block">Price ($)</label>
          <Input type="number" step="0.01" value={formData.price} onChange={(e) => setFormData({ ...formData, price: e.target.value })} data-testid="input-product-price" />
        </div>
        <div>
          <label className="text-sm font-medium text-foreground mb-1.5 block">Category</label>
          <Input value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} placeholder="e.g. Hair Care" data-testid="input-product-category" />
        </div>
      </div>
      <div>
        <label className="text-sm font-medium text-foreground mb-1.5 block">Image URL</label>
        <Input value={formData.imageUrl} onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })} data-testid="input-product-image" />
      </div>
      <div>
        <label className="text-sm font-medium text-foreground mb-1.5 block">Amazon URL</label>
        <Input value={formData.amazonUrl} onChange={(e) => setFormData({ ...formData, amazonUrl: e.target.value })} placeholder="https://amazon.com/..." data-testid="input-product-amazon" />
      </div>
      <div className="flex items-center justify-between gap-2">
        <label className="text-sm font-medium text-foreground">In Stock</label>
        <Switch checked={formData.inStock} onCheckedChange={(v) => setFormData({ ...formData, inStock: v })} data-testid="switch-product-stock" />
      </div>
      <div className="flex items-center justify-between gap-2">
        <label className="text-sm font-medium text-foreground">Featured</label>
        <Switch checked={formData.featured} onCheckedChange={(v) => setFormData({ ...formData, featured: v })} data-testid="switch-product-featured" />
      </div>
      <Button
        className="w-full"
        onClick={() => isEditing ? updateMutation.mutate() : createMutation.mutate()}
        disabled={!formData.name || !formData.price || !formData.category || createMutation.isPending || updateMutation.isPending}
        data-testid="button-save-product"
      >
        {(createMutation.isPending || updateMutation.isPending) ? "Saving..." : isEditing ? "Update Product" : "Add Product"}
      </Button>
    </div>
  );

  return (
    <div className="flex flex-col flex-1">
      <header className="h-14 flex items-center justify-between gap-4 px-4 border-b">
        <div className="flex items-center gap-2">
          <SidebarTrigger data-testid="button-sidebar-toggle" />
          <h1 className="font-serif text-lg text-foreground">Products</h1>
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
          <p className="text-muted-foreground text-sm">{products?.length || 0} products listed</p>
          <Dialog open={showAddDialog} onOpenChange={(o) => { setShowAddDialog(o); if (!o) resetForm(); }}>
            <DialogTrigger asChild>
              <Button data-testid="button-add-product"><Plus className="w-4 h-4 mr-1.5" /> Add Product</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle className="font-serif">Add New Product</DialogTitle></DialogHeader>
              <ProductForm isEditing={false} />
            </DialogContent>
          </Dialog>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i}><Skeleton className="h-48 rounded-md" /></Card>
            ))}
          </div>
        ) : !products?.length ? (
          <div className="text-center py-16">
            <ShoppingBag className="w-12 h-12 text-muted-foreground/50 mx-auto mb-3" />
            <p className="text-muted-foreground">No products listed yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {products.map((product) => (
              <Card key={product.id} className={`overflow-visible ${!product.inStock ? "opacity-60" : ""}`} data-testid={`card-product-${product.id}`}>
                {product.imageUrl && (
                  <div className="aspect-video overflow-hidden rounded-t-md">
                    <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
                  </div>
                )}
                <div className="p-4">
                  <div className="flex items-center justify-between gap-2 mb-2 flex-wrap">
                    <h3 className="font-medium text-foreground">{product.name}</h3>
                    <div className="flex items-center gap-1">
                      {product.featured && <Badge>Featured</Badge>}
                      <Badge variant={product.inStock ? "secondary" : "destructive"}>
                        {product.inStock ? "In Stock" : "Out of Stock"}
                      </Badge>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{product.description}</p>
                  <p className="font-semibold text-foreground mb-3">${Number(product.price).toFixed(2)}</p>
                  {product.amazonUrl && (
                    <a href={product.amazonUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-primary flex items-center gap-1 mb-3">
                      View on Amazon <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                  <div className="flex items-center gap-2">
                    <Dialog open={editingProduct?.id === product.id} onOpenChange={(o) => { if (!o) { setEditingProduct(null); resetForm(); } }}>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm" className="flex-1" onClick={() => openEdit(product)} data-testid={`button-edit-${product.id}`}>
                          <Edit className="w-3 h-3 mr-1" /> Edit
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader><DialogTitle className="font-serif">Edit Product</DialogTitle></DialogHeader>
                        <ProductForm isEditing={true} />
                      </DialogContent>
                    </Dialog>
                    <Button variant="outline" size="sm" onClick={() => deleteMutation.mutate(product.id)} data-testid={`button-delete-${product.id}`}>
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

export default function AdminProducts() {
  const style = {
    "--sidebar-width": "16rem",
    "--sidebar-width-icon": "3rem",
  };

  return (
    <SidebarProvider style={style as React.CSSProperties}>
      <div className="flex h-screen w-full">
        <AdminSidebar />
        <ProductsContent />
      </div>
    </SidebarProvider>
  );
}
