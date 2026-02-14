import { useState, useEffect, useMemo } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ThemeToggle } from "@/components/theme-toggle";
import { Clock, ArrowLeft, Calendar, Heart } from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Service, FavoriteService } from "@shared/schema";

function getSessionId(): string {
  let id = localStorage.getItem("alis-session-id");
  if (!id) {
    id = Math.random().toString(36).substring(2) + Date.now().toString(36) + Math.random().toString(36).substring(2);
    localStorage.setItem("alis-session-id", id);
  }
  return id;
}

export default function Services() {
  const { toast } = useToast();
  const sessionId = useMemo(() => getSessionId(), []);

  const { data: services, isLoading } = useQuery<Service[]>({ queryKey: ["/api/services"] });
  const { data: favorites } = useQuery<FavoriteService[]>({
    queryKey: ["/api/favorites", sessionId],
    queryFn: async () => {
      const res = await fetch(`/api/favorites/${sessionId}`);
      if (!res.ok) throw new Error("Failed to load favorites");
      return res.json();
    },
  });

  const addFavMutation = useMutation({
    mutationFn: async (serviceId: string) => {
      const res = await apiRequest("POST", "/api/favorites", { sessionId, serviceId });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/favorites", sessionId] });
    },
  });

  const removeFavMutation = useMutation({
    mutationFn: async (favId: string) => {
      await apiRequest("DELETE", `/api/favorites/${favId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/favorites", sessionId] });
    },
  });

  const isFavorited = (serviceId: string) => favorites?.some((f) => f.serviceId === serviceId) || false;
  const getFavoriteId = (serviceId: string) => favorites?.find((f) => f.serviceId === serviceId)?.id;

  const toggleFavorite = (serviceId: string) => {
    if (isFavorited(serviceId)) {
      const favId = getFavoriteId(serviceId);
      if (favId) removeFavMutation.mutate(favId);
    } else {
      addFavMutation.mutate(serviceId);
    }
  };

  const favoriteServices = services?.filter((s) => isFavorited(s.id)) || [];
  const categories = services ? Array.from(new Set(services.map((s) => s.category))) : [];

  const ServiceCard = ({ service, index }: { service: Service; index: number }) => (
    <motion.div
      key={service.id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <Card className="overflow-visible group hover-elevate relative" data-testid={`card-service-${service.id}`}>
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-2 right-2 z-10 bg-background/80 backdrop-blur-sm toggle-elevate"
          onClick={(e) => {
            e.preventDefault();
            toggleFavorite(service.id);
          }}
          data-testid={`button-favorite-${service.id}`}
        >
          <Heart className={`w-4 h-4 ${isFavorited(service.id) ? "fill-red-500 text-red-500" : "text-muted-foreground"}`} />
        </Button>
        <div className="aspect-[4/3] overflow-hidden rounded-t-md">
          <img
            src={service.imageUrl || "/images/service-hair.png"}
            alt={service.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </div>
        <div className="p-4">
          <h3 className="font-serif text-lg text-foreground mb-1">{service.name}</h3>
          <p className="text-muted-foreground text-sm mb-3 line-clamp-2">
            {service.description}
          </p>
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <span className="text-muted-foreground text-xs flex items-center gap-1">
              <Clock className="w-3 h-3" /> {service.duration} min
            </span>
          </div>
          <Link href="/booking">
            <Button variant="outline" className="w-full mt-3" size="sm" data-testid={`button-book-${service.id}`}>
              Book This Service
            </Button>
          </Link>
        </div>
      </Card>
    </motion.div>
  );

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
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Link href="/booking">
              <Button size="sm" data-testid="button-book-service">
                <Calendar className="w-3.5 h-3.5 mr-1.5" /> Book Now
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10"
        >
          <p className="text-primary text-sm tracking-[0.2em] uppercase mb-2">Our Expertise</p>
          <h1 className="font-serif text-3xl md:text-4xl text-foreground">All Services</h1>
        </motion.div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="p-0">
                <Skeleton className="aspect-[4/3] rounded-t-md" />
                <div className="p-4 space-y-2">
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <>
            {favoriteServices.length > 0 && (
              <div className="mb-12" data-testid="section-favorites">
                <h2 className="font-serif text-xl text-foreground mb-5 flex items-center gap-2">
                  <Heart className="w-5 h-5 fill-red-500 text-red-500" /> Your Favorites
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {favoriteServices.map((service, i) => (
                    <ServiceCard key={service.id} service={service} index={i} />
                  ))}
                </div>
              </div>
            )}

            {categories.map((category) => (
              <div key={category} className="mb-12">
                <h2 className="font-serif text-xl text-foreground mb-5 capitalize">{category}</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {services
                    ?.filter((s) => s.category === category)
                    .map((service, i) => (
                      <ServiceCard key={service.id} service={service} index={i} />
                    ))}
                </div>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
}
