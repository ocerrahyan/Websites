import { Link } from "wouter";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ThemeToggle } from "@/components/theme-toggle";
import { Palette, ArrowLeft, ExternalLink } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import type { Painting } from "@shared/schema";

export default function Paintings() {
  const { data: paintings, isLoading } = useQuery<Painting[]>({ queryKey: ["/api/paintings"] });

  return (
    <div className="min-h-screen bg-background">
      <nav className="sticky top-0 z-50 bg-background/95 backdrop-blur-md border-b">
        <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link href="/">
              <Button variant="ghost" size="icon" data-testid="button-back-home">
                <ArrowLeft className="w-4 h-4" />
              </Button>
            </Link>
            <Link href="/" className="flex items-center gap-2">
              <span className="font-serif text-lg text-foreground">Alis'</span>
            </Link>
          </div>
          <ThemeToggle />
        </div>
      </nav>

      <div className="relative h-48 overflow-hidden bg-gradient-to-r from-primary/20 via-primary/10 to-background">
        <div className="absolute inset-0 flex items-center px-6">
          <div className="max-w-7xl mx-auto w-full">
            <p className="text-primary text-sm tracking-[0.2em] uppercase mb-1 font-sans">Oils & More with Alis</p>
            <h1 className="font-serif text-3xl md:text-4xl text-foreground">Original Paintings</h1>
            <p className="text-muted-foreground mt-2 max-w-xl">
              I had never been interested in painting landscape until my daughter Iris made the suggestion. She bought me my first set of oil paints and I fell in love with it.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-10">
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="p-0">
                <Skeleton className="w-full aspect-[4/3] rounded-t-md" />
                <div className="p-5 space-y-3">
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-2/3" />
                </div>
              </Card>
            ))}
          </div>
        ) : !paintings?.length ? (
          <div className="text-center py-20">
            <Palette className="w-12 h-12 text-muted-foreground/50 mx-auto mb-3" />
            <p className="text-muted-foreground">No paintings listed yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {paintings.map((painting, i) => (
              <motion.div
                key={painting.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
              >
                <Card className="overflow-visible hover-elevate" data-testid={`card-painting-${painting.id}`}>
                  <div className="aspect-[4/3] overflow-hidden rounded-t-md">
                    <img
                      src={painting.imageUrl || ""}
                      alt={painting.title}
                      className="w-full h-full object-cover"
                      data-testid={`img-painting-${painting.id}`}
                    />
                  </div>
                  <div className="p-4">
                    <div className="flex items-start justify-between gap-2 flex-wrap mb-2">
                      <h2 className="font-serif text-lg text-foreground" data-testid={`text-painting-title-${painting.id}`}>
                        {painting.title}
                      </h2>
                      {painting.isSold && (
                        <Badge variant="destructive" data-testid={`badge-sold-${painting.id}`}>SOLD</Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2 flex-wrap mb-3">
                      {painting.size && <Badge variant="secondary" data-testid={`badge-size-${painting.id}`}>{painting.size}</Badge>}
                      {painting.medium && <Badge variant="outline" data-testid={`badge-medium-${painting.id}`}>{painting.medium}</Badge>}
                    </div>
                    <p className="text-muted-foreground text-sm leading-relaxed mb-4 line-clamp-3" data-testid={`text-painting-desc-${painting.id}`}>
                      {painting.description}
                    </p>
                    {painting.externalUrl && (
                      <a href={painting.externalUrl} target="_blank" rel="noopener noreferrer">
                        <Button className="w-full" data-testid={`button-view-painting-${painting.id}`}>
                          <Palette className="w-4 h-4 mr-1.5" />
                          View on Gallery
                          <ExternalLink className="w-3 h-3 ml-1.5" />
                        </Button>
                      </a>
                    )}
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        )}

        <div className="text-center mt-14 p-8 rounded-md bg-card">
          <h3 className="font-serif text-xl text-foreground mb-2">About the Artist</h3>
          <p className="text-muted-foreground text-sm max-w-xl mx-auto leading-relaxed">
            Alis Cerrahyan is a multi-talented artist, author, and salon owner with over 45 years of experience
            in the beauty industry. Her oil paintings capture the beauty of nature through vivid landscapes,
            serene waterscapes, and vibrant wildlife scenes. Each piece reflects her deep appreciation for the
            world around her and her journey of creative discovery.
          </p>
        </div>
      </div>
    </div>
  );
}
