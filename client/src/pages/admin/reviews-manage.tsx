import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ThemeToggle } from "@/components/theme-toggle";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import {
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { AdminSidebar } from "@/components/admin-sidebar";
import {
  Star, LogOut, CheckCircle2, XCircle, Sparkles,
} from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Review } from "@shared/schema";

type FilterTab = "all" | "pending" | "approved";

function StarDisplay({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`w-4 h-4 ${rating >= star ? "fill-primary text-primary" : "text-muted-foreground/30"}`}
        />
      ))}
    </div>
  );
}

function ReviewsContent() {
  const [filter, setFilter] = useState<FilterTab>("all");
  const { logout } = useAuth();
  const { toast } = useToast();

  const { data: reviews, isLoading } = useQuery<Review[]>({
    queryKey: ["/api/reviews/all"],
  });

  const updateReviewMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Review> }) => {
      const res = await apiRequest("PATCH", `/api/reviews/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/reviews/all"] });
      queryClient.invalidateQueries({ queryKey: ["/api/reviews"] });
      toast({ title: "Review updated" });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const filteredReviews = reviews?.filter((r) => {
    if (filter === "pending") return !r.isApproved;
    if (filter === "approved") return r.isApproved;
    return true;
  }) || [];

  const pendingCount = reviews?.filter((r) => !r.isApproved).length || 0;
  const approvedCount = reviews?.filter((r) => r.isApproved).length || 0;

  return (
    <div className="flex flex-col flex-1">
      <header className="h-14 flex items-center justify-between gap-4 px-4 border-b">
        <div className="flex items-center gap-2">
          <SidebarTrigger data-testid="button-sidebar-toggle" />
          <h1 className="font-serif text-lg text-foreground">Reviews</h1>
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
          <p className="text-muted-foreground text-sm" data-testid="text-review-count">
            {reviews?.length || 0} reviews total
          </p>
          <div className="flex gap-2">
            <Button
              variant={filter === "all" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter("all")}
              data-testid="button-filter-all"
            >
              All ({reviews?.length || 0})
            </Button>
            <Button
              variant={filter === "pending" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter("pending")}
              data-testid="button-filter-pending"
            >
              Pending ({pendingCount})
            </Button>
            <Button
              variant={filter === "approved" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter("approved")}
              data-testid="button-filter-approved"
            >
              Approved ({approvedCount})
            </Button>
          </div>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <Card key={i} className="p-5">
                <Skeleton className="h-24 w-full" />
              </Card>
            ))}
          </div>
        ) : !filteredReviews.length ? (
          <div className="text-center py-16">
            <Star className="w-12 h-12 text-muted-foreground/50 mx-auto mb-3" />
            <p className="text-muted-foreground" data-testid="text-no-reviews">
              {filter === "pending" ? "No pending reviews" : filter === "approved" ? "No approved reviews" : "No reviews yet"}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredReviews.map((review) => (
              <Card key={review.id} className="overflow-visible p-5" data-testid={`card-review-${review.id}`}>
                <div className="flex items-start justify-between gap-3 mb-3 flex-wrap">
                  <div>
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <h3 className="font-medium text-foreground" data-testid={`text-review-name-${review.id}`}>
                        {review.clientName}
                      </h3>
                      {review.isApproved ? (
                        <Badge variant="secondary" data-testid={`badge-approved-${review.id}`}>Approved</Badge>
                      ) : (
                        <Badge variant="outline" data-testid={`badge-pending-${review.id}`}>Pending</Badge>
                      )}
                      {review.featured && (
                        <Badge data-testid={`badge-featured-${review.id}`}>Featured</Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-3 flex-wrap">
                      <StarDisplay rating={review.rating} />
                      <span className="text-xs text-muted-foreground" data-testid={`text-review-date-${review.id}`}>
                        {review.createdAt ? new Date(review.createdAt).toLocaleDateString("en-US", {
                          year: "numeric", month: "short", day: "numeric",
                        }) : ""}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    {!review.isApproved ? (
                      <Button
                        size="sm"
                        onClick={() => updateReviewMutation.mutate({ id: review.id, data: { isApproved: true } })}
                        disabled={updateReviewMutation.isPending}
                        data-testid={`button-approve-${review.id}`}
                      >
                        <CheckCircle2 className="w-4 h-4 mr-1" /> Approve
                      </Button>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => updateReviewMutation.mutate({ id: review.id, data: { isApproved: false } })}
                        disabled={updateReviewMutation.isPending}
                        data-testid={`button-unapprove-${review.id}`}
                      >
                        <XCircle className="w-4 h-4 mr-1" /> Unapprove
                      </Button>
                    )}
                    <Button
                      variant={review.featured ? "default" : "outline"}
                      size="sm"
                      onClick={() => updateReviewMutation.mutate({ id: review.id, data: { featured: !review.featured } })}
                      disabled={updateReviewMutation.isPending}
                      data-testid={`button-feature-${review.id}`}
                    >
                      <Sparkles className="w-4 h-4 mr-1" /> {review.featured ? "Unfeature" : "Feature"}
                    </Button>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed" data-testid={`text-review-content-${review.id}`}>
                  {review.content}
                </p>
                {review.clientEmail && (
                  <p className="text-xs text-muted-foreground mt-2">
                    {review.clientEmail}
                  </p>
                )}
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default function AdminReviewsManage() {
  return (
    <SidebarProvider>
      <div className="flex h-screen w-full">
        <AdminSidebar />
        <ReviewsContent />
      </div>
    </SidebarProvider>
  );
}
