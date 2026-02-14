import { useState, useEffect } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { ThemeToggle } from "@/components/theme-toggle";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Star, Send, CheckCircle2 } from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Review } from "@shared/schema";

function ReviewsNavbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      scrolled ? "bg-background/95 backdrop-blur-md border-b" : "bg-background border-b"
    }`}>
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link href="/" data-testid="link-back-home">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <Link href="/" className="flex items-center gap-2" data-testid="link-home">
            <span className="font-serif text-xl text-foreground">Alis'</span>
          </Link>
        </div>
        <ThemeToggle />
      </div>
    </nav>
  );
}

function StarRating({ rating, interactive, onRate }: {
  rating: number;
  interactive?: boolean;
  onRate?: (r: number) => void;
}) {
  const [hovered, setHovered] = useState(0);

  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={!interactive}
          className={`${interactive ? "cursor-pointer" : "cursor-default"} transition-colors`}
          onMouseEnter={() => interactive && setHovered(star)}
          onMouseLeave={() => interactive && setHovered(0)}
          onClick={() => interactive && onRate?.(star)}
          data-testid={interactive ? `button-star-${star}` : `icon-star-${star}`}
        >
          <Star
            className={`w-5 h-5 ${
              (hovered || rating) >= star
                ? "fill-primary text-primary"
                : "text-muted-foreground/30"
            }`}
          />
        </button>
      ))}
    </div>
  );
}

function ReviewCard({ review }: { review: Review }) {
  return (
    <Card className="p-5" data-testid={`card-review-${review.id}`}>
      <div className="flex items-start justify-between gap-2 mb-3 flex-wrap">
        <div>
          <h4 className="font-medium text-foreground text-sm" data-testid={`text-review-name-${review.id}`}>
            {review.clientName}
          </h4>
          <p className="text-xs text-muted-foreground" data-testid={`text-review-date-${review.id}`}>
            {review.createdAt ? new Date(review.createdAt).toLocaleDateString("en-US", {
              year: "numeric", month: "long", day: "numeric",
            }) : ""}
          </p>
        </div>
        <StarRating rating={review.rating} />
      </div>
      <p className="text-sm text-muted-foreground leading-relaxed" data-testid={`text-review-content-${review.id}`}>
        {review.content}
      </p>
    </Card>
  );
}

export default function ReviewsPage() {
  const { toast } = useToast();
  const [reviewName, setReviewName] = useState("");
  const [reviewEmail, setReviewEmail] = useState("");
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewContent, setReviewContent] = useState("");
  const [formSubmitted, setFormSubmitted] = useState(false);

  const { data: reviews, isLoading } = useQuery<Review[]>({
    queryKey: ["/api/reviews"],
  });

  const submitReviewMutation = useMutation({
    mutationFn: async () => {
      if (!reviewName.trim()) throw new Error("Please enter your name");
      if (reviewRating === 0) throw new Error("Please select a rating");
      if (!reviewContent.trim()) throw new Error("Please write your review");

      const res = await apiRequest("POST", "/api/reviews", {
        clientName: reviewName.trim(),
        clientEmail: reviewEmail.trim() || null,
        rating: reviewRating,
        content: reviewContent.trim(),
        isApproved: false,
        featured: false,
      });
      return res.json();
    },
    onSuccess: () => {
      setFormSubmitted(true);
      queryClient.invalidateQueries({ queryKey: ["/api/reviews"] });
      toast({ title: "Review Submitted!", description: "Thank you! Your review will appear after approval." });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  return (
    <div className="min-h-screen bg-background">
      <ReviewsNavbar />
      <div className="pt-24 pb-20 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <Link href="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors" data-testid="link-back">
              <ArrowLeft className="w-4 h-4 mr-1" /> Back
            </Link>
          </div>

          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-10"
          >
            <p className="text-primary text-sm tracking-[0.2em] uppercase mb-2 font-sans">Client Testimonials</p>
            <h1 className="font-serif text-4xl md:text-5xl text-foreground mb-3">Reviews</h1>
            <p className="text-muted-foreground max-w-md mx-auto">
              See what our clients say about their experience at Alis' Salon.
            </p>
          </motion.div>

          {isLoading ? (
            <div className="grid sm:grid-cols-2 gap-4 mb-12">
              {Array.from({ length: 4 }).map((_, i) => (
                <Card key={i} className="p-5">
                  <div className="space-y-3">
                    <Skeleton className="h-4 w-1/3" />
                    <Skeleton className="h-4 w-1/2" />
                    <Skeleton className="h-16 w-full" />
                  </div>
                </Card>
              ))}
            </div>
          ) : reviews && reviews.length > 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="grid sm:grid-cols-2 gap-4 mb-12"
            >
              {reviews.map((review) => (
                <ReviewCard key={review.id} review={review} />
              ))}
            </motion.div>
          ) : (
            <div className="text-center py-12 mb-12">
              <Star className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-muted-foreground" data-testid="text-no-reviews">No reviews yet. Be the first to share your experience!</p>
            </div>
          )}

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <Card className="p-6 max-w-lg mx-auto">
              {formSubmitted ? (
                <div className="text-center py-6">
                  <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <CheckCircle2 className="w-7 h-7 text-primary" />
                  </div>
                  <h3 className="font-serif text-xl text-foreground mb-2" data-testid="text-review-success">Thank You!</h3>
                  <p className="text-muted-foreground text-sm mb-4">
                    Your review will appear after approval.
                  </p>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setFormSubmitted(false);
                      setReviewName("");
                      setReviewEmail("");
                      setReviewRating(0);
                      setReviewContent("");
                    }}
                    data-testid="button-write-another"
                  >
                    Write Another Review
                  </Button>
                </div>
              ) : (
                <>
                  <h3 className="font-serif text-xl text-foreground mb-5">Leave a Review</h3>
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      submitReviewMutation.mutate();
                    }}
                    className="space-y-4"
                  >
                    <div>
                      <Label htmlFor="review-name" className="text-sm">Name</Label>
                      <Input
                        id="review-name"
                        value={reviewName}
                        onChange={(e) => setReviewName(e.target.value)}
                        placeholder="Your name"
                        required
                        data-testid="input-review-name"
                      />
                    </div>

                    <div>
                      <Label htmlFor="review-email" className="text-sm">Email (optional)</Label>
                      <Input
                        id="review-email"
                        type="email"
                        value={reviewEmail}
                        onChange={(e) => setReviewEmail(e.target.value)}
                        placeholder="you@example.com"
                        data-testid="input-review-email"
                      />
                    </div>

                    <div>
                      <Label className="text-sm mb-2 block">Rating</Label>
                      <StarRating rating={reviewRating} interactive onRate={setReviewRating} />
                    </div>

                    <div>
                      <Label htmlFor="review-content" className="text-sm">Your Review</Label>
                      <Textarea
                        id="review-content"
                        value={reviewContent}
                        onChange={(e) => setReviewContent(e.target.value)}
                        placeholder="Share your experience at Alis' Salon..."
                        rows={4}
                        required
                        data-testid="input-review-content"
                      />
                    </div>

                    <Button
                      type="submit"
                      className="w-full"
                      disabled={submitReviewMutation.isPending}
                      data-testid="button-submit-review"
                    >
                      {submitReviewMutation.isPending ? "Submitting..." : (
                        <>
                          <Send className="w-4 h-4 mr-2" /> Submit Review
                        </>
                      )}
                    </Button>
                  </form>
                </>
              )}
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
