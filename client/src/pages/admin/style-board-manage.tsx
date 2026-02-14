import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ThemeToggle } from "@/components/theme-toggle";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AdminSidebar } from "@/components/admin-sidebar";
import { LogOut, Mail, Phone, Calendar, CheckCircle, ExternalLink } from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { StyleInspiration } from "@shared/schema";

type ReviewFilter = "all" | "new" | "reviewed";

function StyleBoardContent() {
  const { logout } = useAuth();
  const { toast } = useToast();
  const [filter, setFilter] = useState<ReviewFilter>("all");

  const { data: inspirations, isLoading } = useQuery<StyleInspiration[]>({ queryKey: ["/api/style-inspirations"] });

  const reviewMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await apiRequest("PATCH", `/api/style-inspirations/${id}`, { isReviewed: true });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/style-inspirations"] });
      toast({ title: "Marked as reviewed" });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const filtered = inspirations?.filter((i) => {
    if (filter === "new") return !i.isReviewed;
    if (filter === "reviewed") return i.isReviewed;
    return true;
  }) || [];

  const filters: { label: string; value: ReviewFilter }[] = [
    { label: "All", value: "all" },
    { label: "New", value: "new" },
    { label: "Reviewed", value: "reviewed" },
  ];

  return (
    <div className="flex flex-col flex-1">
      <header className="h-14 flex items-center justify-between gap-4 px-4 border-b">
        <div className="flex items-center gap-2">
          <SidebarTrigger data-testid="button-sidebar-toggle" />
          <h1 className="font-serif text-lg text-foreground">Style Board</h1>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Button variant="ghost" size="icon" onClick={logout} data-testid="button-logout">
            <LogOut className="w-4 h-4" />
          </Button>
        </div>
      </header>
      <main className="flex-1 overflow-auto p-6">
        <div className="flex items-center gap-2 mb-6 flex-wrap">
          {filters.map((f) => (
            <Button
              key={f.value}
              variant={filter === f.value ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter(f.value)}
              data-testid={`button-filter-${f.value}`}
            >
              {f.label}
            </Button>
          ))}
          <span className="text-muted-foreground text-sm ml-auto">{filtered.length} inspirations</span>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Card key={i} className="p-4">
                <Skeleton className="h-32 w-full mb-3 rounded-md" />
                <Skeleton className="h-5 w-1/2 mb-2" />
                <Skeleton className="h-4 w-full" />
              </Card>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-muted-foreground">No style inspirations found.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filtered.map((insp) => (
              <Card key={insp.id} className="p-4" data-testid={`card-inspiration-${insp.id}`}>
                {insp.imageUrl && (
                  <div className="mb-3 rounded-md overflow-hidden border">
                    <img
                      src={insp.imageUrl}
                      alt="Style inspiration"
                      className="w-full h-40 object-cover"
                      onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                      data-testid={`img-inspiration-${insp.id}`}
                    />
                  </div>
                )}
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-medium text-foreground" data-testid={`text-name-${insp.id}`}>{insp.clientName}</h3>
                    {insp.isReviewed ? (
                      <Badge variant="secondary" data-testid={`badge-reviewed-${insp.id}`}>
                        <CheckCircle className="w-3 h-3 mr-1" /> Reviewed
                      </Badge>
                    ) : (
                      <Badge variant="outline" data-testid={`badge-new-${insp.id}`}>New</Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-3 text-sm text-muted-foreground flex-wrap">
                    <span className="flex items-center gap-1">
                      <Mail className="w-3 h-3" /> {insp.clientEmail}
                    </span>
                    {insp.clientPhone && (
                      <span className="flex items-center gap-1">
                        <Phone className="w-3 h-3" /> {insp.clientPhone}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-foreground" data-testid={`text-description-${insp.id}`}>{insp.description}</p>
                  {insp.appointmentDate && (
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <Calendar className="w-3 h-3" /> For appointment: {insp.appointmentDate}
                    </p>
                  )}
                  {insp.createdAt && (
                    <p className="text-xs text-muted-foreground">
                      Submitted: {new Date(insp.createdAt).toLocaleDateString()}
                    </p>
                  )}
                  {insp.imageUrl && (
                    <a href={insp.imageUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-primary flex items-center gap-1">
                      <ExternalLink className="w-3 h-3" /> View full image
                    </a>
                  )}
                </div>
                {!insp.isReviewed && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full mt-3"
                    onClick={() => reviewMutation.mutate(insp.id)}
                    disabled={reviewMutation.isPending}
                    data-testid={`button-review-${insp.id}`}
                  >
                    <CheckCircle className="w-3.5 h-3.5 mr-1.5" /> Mark as Reviewed
                  </Button>
                )}
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default function StyleBoardManage() {
  return (
    <SidebarProvider>
      <div className="flex h-screen w-full">
        <AdminSidebar />
        <StyleBoardContent />
      </div>
    </SidebarProvider>
  );
}
