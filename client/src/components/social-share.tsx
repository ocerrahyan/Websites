import { Button } from "@/components/ui/button";
import { Facebook, Instagram, Twitter, Link2, Share2 } from "lucide-react";
import {
  Popover, PopoverContent, PopoverTrigger,
} from "@/components/ui/popover";
import { useToast } from "@/hooks/use-toast";

interface SocialShareProps {
  url?: string;
  title?: string;
  description?: string;
  compact?: boolean;
}

export function SocialShare({ url, title = "Alis' Salon", description = "Check this out!", compact = false }: SocialShareProps) {
  const { toast } = useToast();
  const shareUrl = url || (typeof window !== "undefined" ? window.location.href : "https://alissimplyelegant.com");
  const encodedUrl = encodeURIComponent(shareUrl);
  const encodedTitle = encodeURIComponent(title);
  const encodedDesc = encodeURIComponent(description);

  const links = [
    { name: "Facebook", icon: Facebook, url: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`, color: "hover:text-blue-600" },
    { name: "Instagram", icon: Instagram, url: `https://www.instagram.com/`, color: "hover:text-pink-500" },
    { name: "Twitter/X", icon: Twitter, url: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`, color: "hover:text-sky-500" },
  ];

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    toast({ title: "Link Copied!", description: "The link has been copied to your clipboard." });
  };

  if (compact) {
    return (
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="ghost" size="icon"><Share2 className="w-4 h-4" /></Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-2" align="end">
          <div className="flex items-center gap-1">
            {links.map((link) => (
              <a key={link.name} href={link.url} target="_blank" rel="noopener noreferrer">
                <Button variant="ghost" size="icon" className={link.color}>
                  <link.icon className="w-4 h-4" />
                </Button>
              </a>
            ))}
            <Button variant="ghost" size="icon" onClick={handleCopyLink}>
              <Link2 className="w-4 h-4" />
            </Button>
          </div>
        </PopoverContent>
      </Popover>
    );
  }

  return (
    <div className="flex items-center gap-2">
      {links.map((link) => (
        <a key={link.name} href={link.url} target="_blank" rel="noopener noreferrer">
          <Button variant="outline" size="sm" className={link.color}>
            <link.icon className="w-4 h-4 mr-1.5" /> {link.name}
          </Button>
        </a>
      ))}
      <Button variant="outline" size="sm" onClick={handleCopyLink}>
        <Link2 className="w-4 h-4 mr-1.5" /> Copy Link
      </Button>
    </div>
  );
}

export function SocialLinks({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <a href="https://www.facebook.com/" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-blue-600 transition-colors">
        <Facebook className="w-5 h-5" />
      </a>
      <a href="https://www.instagram.com/" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-pink-500 transition-colors">
        <Instagram className="w-5 h-5" />
      </a>
      <a href="https://twitter.com/" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-sky-500 transition-colors">
        <Twitter className="w-5 h-5" />
      </a>
    </div>
  );
}
