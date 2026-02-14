import { Link } from "wouter";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ThemeToggle } from "@/components/theme-toggle";
import { ShoppingBag, ArrowLeft, ExternalLink } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import type { Product } from "@shared/schema";

export default function Shop() {
  const { data: products, isLoading } = useQuery<Product[]>({ queryKey: ["/api/products"] });

  const categories = products ? [...new Set(products.map((p) => p.category))] : [];

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

      <div className="relative h-48 overflow-hidden">
        <img
          src="/images/products-banner.png"
          alt="Products"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-black/30" />
        <div className="absolute inset-0 flex items-center px-6">
          <div className="max-w-7xl mx-auto w-full">
            <p className="text-white/80 text-sm tracking-[0.2em] uppercase mb-1">Curated by Alis</p>
            <h1 className="font-serif text-3xl md:text-4xl text-white">Shop Products</h1>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-10">
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {Array.from({ length: 8 }).map((_, i) => (
              <Card key={i} className="p-0">
                <Skeleton className="aspect-square rounded-t-md" />
                <div className="p-4 space-y-2">
                  <Skeleton className="h-4 w-1/3" />
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              </Card>
            ))}
          </div>
        ) : (
          categories.map((category) => (
            <div key={category} className="mb-12">
              <h2 className="font-serif text-xl text-foreground mb-5 capitalize">{category}</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                {products
                  ?.filter((p) => p.category === category)
                  .map((product, i) => (
                    <motion.div
                      key={product.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                    >
                      <Card className="overflow-visible group hover-elevate" data-testid={`card-product-${product.id}`}>
                        <div className="aspect-square overflow-hidden rounded-t-md relative">
                          <img
                            src={product.imageUrl || "/images/products-banner.png"}
                            alt={product.name}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                          {product.featured && (
                            <Badge className="absolute top-2 right-2">Featured</Badge>
                          )}
                          {!product.inStock && (
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                              <Badge variant="destructive">Out of Stock</Badge>
                            </div>
                          )}
                        </div>
                        <div className="p-4">
                          <Badge variant="secondary" className="mb-2">{product.category}</Badge>
                          <h3 className="font-serif text-lg text-foreground mb-1">{product.name}</h3>
                          <p className="text-muted-foreground text-sm mb-3 line-clamp-2">
                            {product.description}
                          </p>
                          <div className="flex items-center justify-end gap-2 flex-wrap">
                            {product.amazonUrl && product.inStock && (
                              <a href={product.amazonUrl} target="_blank" rel="noopener noreferrer">
                                <Button size="sm" data-testid={`button-buy-${product.id}`}>
                                  <ShoppingBag className="w-3 h-3 mr-1" /> Buy
                                  <ExternalLink className="w-3 h-3 ml-1" />
                                </Button>
                              </a>
                            )}
                          </div>
                        </div>
                      </Card>
                    </motion.div>
                  ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
