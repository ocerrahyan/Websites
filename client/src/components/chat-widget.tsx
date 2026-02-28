import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { MessageCircle, X, Send } from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { ChatMessage } from "@shared/schema";

function getSessionId(): string {
  let sessionId = localStorage.getItem("alis-chat-session-id");
  if (!sessionId) {
    sessionId = crypto.randomUUID();
    localStorage.setItem("alis-chat-session-id", sessionId);
  }
  return sessionId;
}

export function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [senderName, setSenderName] = useState(() => localStorage.getItem("alis-chat-name") || "");
  const [nameSet, setNameSet] = useState(() => !!localStorage.getItem("alis-chat-name"));
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const sessionId = getSessionId();

  const { data: messages } = useQuery<ChatMessage[]>({
    queryKey: ["/api/chat", sessionId],
    refetchInterval: isOpen ? 5000 : false,
    enabled: isOpen,
  });

  const sendMutation = useMutation({
    mutationFn: async (content: string) => {
      const res = await apiRequest("POST", "/api/chat", {
        senderName,
        senderEmail: null,
        senderType: "client",
        content,
        sessionId,
        isRead: false,
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/chat", sessionId] });
      setMessage("");
    },
  });

  useEffect(() => {
    if (isOpen && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen]);

  const handleSetName = () => {
    if (senderName.trim()) {
      localStorage.setItem("alis-chat-name", senderName.trim());
      setNameSet(true);
    }
  };

  const handleSend = () => {
    if (message.trim() && !sendMutation.isPending) {
      sendMutation.mutate(message.trim());
    }
  };

  const formatTime = (date: string | Date | null) => {
    if (!date) return "";
    const d = new Date(date);
    return d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
  };

  if (!isOpen) {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          size="icon"
          className="h-14 w-14 rounded-full shadow-lg animate-pulse"
          onClick={() => setIsOpen(true)}
          data-testid="button-open-chat"
        >
          <MessageCircle className="w-6 h-6" />
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <Card className="w-80 sm:w-96 flex flex-col shadow-xl" style={{ height: "28rem" }}>
        <div className="flex items-center justify-between gap-2 p-3 border-b">
          <h3 className="font-serif text-sm font-medium text-foreground">Contact Alis'</h3>
          <Button size="icon" variant="ghost" onClick={() => setIsOpen(false)} data-testid="button-close-chat">
            <X className="w-4 h-4" />
          </Button>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center p-6 gap-4 text-center">
          <MessageCircle className="w-12 h-12 text-primary" />
          <h4 className="font-serif text-lg text-foreground">We'd love to hear from you!</h4>
          <p className="text-sm text-muted-foreground leading-relaxed">
            For appointments, questions, or just to say hello — reach out to Alis' directly.
          </p>
          <div className="space-y-3 w-full">
            <a href="tel:+1234567890" className="block">
              <Button variant="outline" className="w-full" data-testid="button-call">
                📞 Call the Salon
              </Button>
            </a>
            <a href="mailto:ocerrahyan@alissimplyelegant.com" className="block">
              <Button variant="outline" className="w-full" data-testid="button-email">
                ✉️ Send an Email
              </Button>
            </a>
            <a href="/booking" className="block">
              <Button className="w-full" data-testid="button-book-now">
                📅 Book an Appointment
              </Button>
            </a>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Live chat coming soon!
          </p>
        </div>
      </Card>
    </div>
  );
}
