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
  BookOpen, Plus, LogOut, Edit, Trash2, ExternalLink, Award,
} from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Book } from "@shared/schema";

function BooksContent() {
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingBook, setEditingBook] = useState<Book | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    author: "Alis Cerrahyan",
    description: "",
    coverImageUrl: "",
    amazonUrl: "",
    isbn: "",
    genre: "",
    year: "",
    publisher: "",
    awards: "",
    featured: true,
    sortOrder: 0,
  });

  const { logout } = useAuth();
  const { toast } = useToast();

  const { data: books, isLoading } = useQuery<Book[]>({ queryKey: ["/api/books"] });

  const createMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        ...formData,
        year: formData.year ? parseInt(formData.year) : null,
        isbn: formData.isbn || null,
        publisher: formData.publisher || null,
        awards: formData.awards || null,
        coverImageUrl: formData.coverImageUrl || null,
        amazonUrl: formData.amazonUrl || null,
      };
      const res = await apiRequest("POST", "/api/books", payload);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/books"] });
      setShowAddDialog(false);
      resetForm();
      toast({ title: "Book added" });
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
        isbn: formData.isbn || null,
        publisher: formData.publisher || null,
        awards: formData.awards || null,
        coverImageUrl: formData.coverImageUrl || null,
        amazonUrl: formData.amazonUrl || null,
      };
      const res = await apiRequest("PATCH", `/api/books/${editingBook?.id}`, payload);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/books"] });
      setEditingBook(null);
      resetForm();
      toast({ title: "Book updated" });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/books/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/books"] });
      toast({ title: "Book removed" });
    },
  });

  const resetForm = () => {
    setFormData({
      title: "", author: "Alis Cerrahyan", description: "", coverImageUrl: "", amazonUrl: "",
      isbn: "", genre: "", year: "", publisher: "", awards: "", featured: true, sortOrder: 0,
    });
  };

  const openEdit = (book: Book) => {
    setEditingBook(book);
    setFormData({
      title: book.title,
      author: book.author,
      description: book.description || "",
      coverImageUrl: book.coverImageUrl || "",
      amazonUrl: book.amazonUrl || "",
      isbn: book.isbn || "",
      genre: book.genre || "",
      year: book.year ? String(book.year) : "",
      publisher: book.publisher || "",
      awards: book.awards || "",
      featured: book.featured,
      sortOrder: book.sortOrder,
    });
  };

  const BookForm = ({ isEditing }: { isEditing: boolean }) => (
    <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
      <div>
        <label className="text-sm font-medium text-foreground mb-1.5 block">Book Title</label>
        <Input value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} data-testid="input-book-title" />
      </div>
      <div>
        <label className="text-sm font-medium text-foreground mb-1.5 block">Author</label>
        <Input value={formData.author} onChange={(e) => setFormData({ ...formData, author: e.target.value })} data-testid="input-book-author" />
      </div>
      <div>
        <label className="text-sm font-medium text-foreground mb-1.5 block">Description</label>
        <Textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows={4} data-testid="input-book-desc" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-sm font-medium text-foreground mb-1.5 block">Genre</label>
          <Input value={formData.genre} onChange={(e) => setFormData({ ...formData, genre: e.target.value })} placeholder="e.g. Memoir / Spiritual" data-testid="input-book-genre" />
        </div>
        <div>
          <label className="text-sm font-medium text-foreground mb-1.5 block">Year Published</label>
          <Input type="number" value={formData.year} onChange={(e) => setFormData({ ...formData, year: e.target.value })} data-testid="input-book-year" />
        </div>
      </div>
      <div>
        <label className="text-sm font-medium text-foreground mb-1.5 block">Cover Image URL</label>
        <Input value={formData.coverImageUrl} onChange={(e) => setFormData({ ...formData, coverImageUrl: e.target.value })} data-testid="input-book-cover" />
      </div>
      <div>
        <label className="text-sm font-medium text-foreground mb-1.5 block">Amazon URL</label>
        <Input value={formData.amazonUrl} onChange={(e) => setFormData({ ...formData, amazonUrl: e.target.value })} placeholder="https://amazon.com/..." data-testid="input-book-amazon" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-sm font-medium text-foreground mb-1.5 block">ISBN</label>
          <Input value={formData.isbn} onChange={(e) => setFormData({ ...formData, isbn: e.target.value })} data-testid="input-book-isbn" />
        </div>
        <div>
          <label className="text-sm font-medium text-foreground mb-1.5 block">Publisher</label>
          <Input value={formData.publisher} onChange={(e) => setFormData({ ...formData, publisher: e.target.value })} data-testid="input-book-publisher" />
        </div>
      </div>
      <div>
        <label className="text-sm font-medium text-foreground mb-1.5 block">Awards</label>
        <Input value={formData.awards} onChange={(e) => setFormData({ ...formData, awards: e.target.value })} placeholder="e.g. Literary Titan Gold Book Award" data-testid="input-book-awards" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="flex items-center justify-between gap-2">
          <label className="text-sm font-medium text-foreground">Featured</label>
          <Switch checked={formData.featured} onCheckedChange={(v) => setFormData({ ...formData, featured: v })} data-testid="switch-book-featured" />
        </div>
        <div>
          <label className="text-sm font-medium text-foreground mb-1.5 block">Sort Order</label>
          <Input type="number" value={formData.sortOrder} onChange={(e) => setFormData({ ...formData, sortOrder: parseInt(e.target.value) || 0 })} data-testid="input-book-order" />
        </div>
      </div>
      <Button
        className="w-full"
        onClick={() => isEditing ? updateMutation.mutate() : createMutation.mutate()}
        disabled={!formData.title || !formData.author || createMutation.isPending || updateMutation.isPending}
        data-testid="button-save-book"
      >
        {(createMutation.isPending || updateMutation.isPending) ? "Saving..." : isEditing ? "Update Book" : "Add Book"}
      </Button>
    </div>
  );

  return (
    <div className="flex flex-col flex-1">
      <header className="h-14 flex items-center justify-between gap-4 px-4 border-b">
        <div className="flex items-center gap-2">
          <SidebarTrigger data-testid="button-sidebar-toggle" />
          <h1 className="font-serif text-lg text-foreground">Books</h1>
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
          <p className="text-muted-foreground text-sm">{books?.length || 0} books listed</p>
          <Dialog open={showAddDialog} onOpenChange={(o) => { setShowAddDialog(o); if (!o) resetForm(); }}>
            <DialogTrigger asChild>
              <Button data-testid="button-add-book"><Plus className="w-4 h-4 mr-1.5" /> Add Book</Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader><DialogTitle className="font-serif">Add New Book</DialogTitle></DialogHeader>
              <BookForm isEditing={false} />
            </DialogContent>
          </Dialog>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <Card key={i}><Skeleton className="h-40 rounded-md" /></Card>
            ))}
          </div>
        ) : !books?.length ? (
          <div className="text-center py-16">
            <BookOpen className="w-12 h-12 text-muted-foreground/50 mx-auto mb-3" />
            <p className="text-muted-foreground">No books listed yet</p>
          </div>
        ) : (
          <div className="space-y-4">
            {books.map((book) => (
              <Card key={book.id} className="overflow-visible" data-testid={`card-book-${book.id}`}>
                <div className="flex flex-col sm:flex-row">
                  {book.coverImageUrl && (
                    <div className="w-full sm:w-32 shrink-0 overflow-hidden rounded-t-md sm:rounded-l-md sm:rounded-tr-none">
                      <img src={book.coverImageUrl} alt={book.title} className="w-full h-full object-cover aspect-[3/4]" />
                    </div>
                  )}
                  <div className="p-4 flex-1">
                    <div className="flex items-start justify-between gap-2 mb-2 flex-wrap">
                      <div>
                        <h3 className="font-medium text-foreground">{book.title}</h3>
                        <p className="text-sm text-muted-foreground">{book.author} {book.year ? `(${book.year})` : ""}</p>
                      </div>
                      <div className="flex items-center gap-1">
                        {book.featured && <Badge>Featured</Badge>}
                        {book.genre && <Badge variant="secondary">{book.genre}</Badge>}
                      </div>
                    </div>
                    {book.awards && (
                      <div className="flex items-center gap-1.5 mb-2">
                        <Award className="w-3.5 h-3.5 text-primary shrink-0" />
                        <p className="text-xs text-primary">{book.awards}</p>
                      </div>
                    )}
                    <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{book.description}</p>
                    {book.amazonUrl && (
                      <a href={book.amazonUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-primary flex items-center gap-1 mb-3">
                        View on Amazon <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                    <div className="flex items-center gap-2">
                      <Dialog open={editingBook?.id === book.id} onOpenChange={(o) => { if (!o) { setEditingBook(null); resetForm(); } }}>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm" className="flex-1" onClick={() => openEdit(book)} data-testid={`button-edit-book-${book.id}`}>
                            <Edit className="w-3 h-3 mr-1" /> Edit
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-lg">
                          <DialogHeader><DialogTitle className="font-serif">Edit Book</DialogTitle></DialogHeader>
                          <BookForm isEditing={true} />
                        </DialogContent>
                      </Dialog>
                      <Button variant="outline" size="sm" onClick={() => deleteMutation.mutate(book.id)} data-testid={`button-delete-book-${book.id}`}>
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

export default function AdminBooks() {
  const style = {
    "--sidebar-width": "16rem",
    "--sidebar-width-icon": "3rem",
  };

  return (
    <SidebarProvider style={style as React.CSSProperties}>
      <div className="flex h-screen w-full">
        <AdminSidebar />
        <BooksContent />
      </div>
    </SidebarProvider>
  );
}
