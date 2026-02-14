import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background p-6">
      <Card className="w-full max-w-sm p-8 text-center">
        <h1 className="font-serif text-2xl text-foreground mb-2">Page Not Found</h1>
        <p className="text-sm text-muted-foreground mb-6">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Link href="/">
          <Button className="w-full" data-testid="button-go-home">
            <ArrowLeft className="w-4 h-4 mr-1.5" /> Back to Home
          </Button>
        </Link>
      </Card>
    </div>
  );
}
