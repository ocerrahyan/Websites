import { Link } from "wouter";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ThemeToggle } from "@/components/theme-toggle";
import { BookOpen, ArrowLeft, ExternalLink, Award } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import type { Book } from "@shared/schema";

export default function Books() {
  const { data: books, isLoading } = useQuery<Book[]>({ queryKey: ["/api/books"] });

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
            <p className="text-primary text-sm tracking-[0.2em] uppercase mb-1 font-sans">Written by Alis Cerrahyan</p>
            <h1 className="font-serif text-3xl md:text-4xl text-foreground">Published Books</h1>
            <p className="text-muted-foreground mt-2 max-w-xl">
              Discover Alis' published works on faith, healing, resilience, and personal transformation.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-10">
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {Array.from({ length: 4 }).map((_, i) => (
              <Card key={i} className="p-0">
                <div className="flex flex-col sm:flex-row">
                  <Skeleton className="w-full sm:w-48 aspect-[3/4] sm:aspect-auto sm:h-72 rounded-t-md sm:rounded-l-md sm:rounded-tr-none" />
                  <div className="p-5 flex-1 space-y-3">
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-2/3" />
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : !books?.length ? (
          <div className="text-center py-20">
            <BookOpen className="w-12 h-12 text-muted-foreground/50 mx-auto mb-3" />
            <p className="text-muted-foreground">No books listed yet</p>
          </div>
        ) : (
          <div className="space-y-8">
            {books.map((book, i) => (
              <motion.div
                key={book.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <Card className="overflow-visible hover-elevate" data-testid={`card-book-${book.id}`}>
                  <div className="flex flex-col sm:flex-row">
                    <div className="w-full sm:w-56 shrink-0 overflow-hidden rounded-t-md sm:rounded-l-md sm:rounded-tr-none">
                      <img
                        src={book.coverImageUrl || "/images/book-placeholder.png"}
                        alt={book.title}
                        className="w-full h-full object-cover aspect-[3/4]"
                      />
                    </div>
                    <div className="p-5 flex-1 flex flex-col">
                      <div className="flex items-start justify-between gap-3 flex-wrap mb-2">
                        <div>
                          <h2 className="font-serif text-xl text-foreground" data-testid={`text-book-title-${book.id}`}>{book.title}</h2>
                          <p className="text-sm text-muted-foreground">by {book.author}</p>
                        </div>
                        <div className="flex items-center gap-2 flex-wrap">
                          {book.genre && <Badge variant="secondary">{book.genre}</Badge>}
                          {book.year && <Badge variant="outline">{book.year}</Badge>}
                        </div>
                      </div>

                      {book.awards && (
                        <div className="flex items-start gap-2 mb-3 p-2.5 rounded-md bg-primary/5">
                          <Award className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                          <p className="text-xs text-primary font-medium" data-testid={`text-book-awards-${book.id}`}>{book.awards}</p>
                        </div>
                      )}

                      <p className="text-muted-foreground text-sm leading-relaxed mb-4 flex-1">
                        {book.description}
                      </p>

                      <div className="flex items-center justify-between gap-3 flex-wrap">
                        <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
                          {book.publisher && <span>Publisher: {book.publisher}</span>}
                          {book.isbn && <span>ISBN: {book.isbn}</span>}
                        </div>
                        {book.amazonUrl && (
                          <a href={book.amazonUrl} target="_blank" rel="noopener noreferrer">
                            <Button data-testid={`button-buy-book-${book.id}`}>
                              <BookOpen className="w-4 h-4 mr-1.5" />
                              Buy on Amazon
                              <ExternalLink className="w-3 h-3 ml-1.5" />
                            </Button>
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        )}

        <div className="text-center mt-14 p-8 rounded-md bg-card">
          <h3 className="font-serif text-xl text-foreground mb-2">About the Author</h3>
          <p className="text-muted-foreground text-sm max-w-xl mx-auto leading-relaxed">
            Alis Cerrahyan is a spiritual writer, salon owner with 45+ years of experience, 
            and a voice for healing and personal transformation. Her writing focuses on God's 
            unconditional love and offers hope to those seeking encouragement, faith, and resilience 
            in their own journeys.
          </p>
        </div>
      </div>
    </div>
  );
}
