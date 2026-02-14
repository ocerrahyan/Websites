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
          <h3 className="font-serif text-sm font-medium text-foreground">Chat with Alis'</h3>
          <Button size="icon" variant="ghost" onClick={() => setIsOpen(false)} data-testid="button-close-chat">
            <X className="w-4 h-4" />
          </Button>
        </div>

        {!nameSet ? (
          <div className="flex-1 flex flex-col items-center justify-center p-4 gap-3">
            <MessageCircle className="w-10 h-10 text-muted-foreground" />
            <p className="text-sm text-muted-foreground text-center">Enter your name to start chatting</p>
            <Input
              placeholder="Your name"
              value={senderName}
              onChange={(e) => setSenderName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSetName()}
              data-testid="input-chat-name"
            />
            <Button className="w-full" onClick={handleSetName} disabled={!senderName.trim()} data-testid="button-start-chat">
              Start Chat
            </Button>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto p-3 space-y-3">
              {!messages || messages.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-xs text-muted-foreground">Send a message to start the conversation</p>
                </div>
              ) : (
                messages.map((msg) => {
                  const isAdmin = msg.senderType === "admin";
                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${isAdmin ? "items-start" : "items-end"}`}
                      data-testid={`chat-message-${msg.id}`}
                    >
                      <div
                        className={`max-w-[80%] rounded-md px-3 py-2 ${
                          isAdmin ? "bg-muted text-foreground" : "bg-primary text-primary-foreground"
                        }`}
                      >
                        <p className="text-xs font-medium mb-0.5 opacity-70">{msg.senderName}</p>
                        <p className="text-sm">{msg.content}</p>
                      </div>
                      <span className="text-[10px] text-muted-foreground mt-0.5 px-1">
                        {formatTime(msg.createdAt)}
                      </span>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="p-3 border-t flex items-center gap-2">
              <Input
                placeholder="Type a message..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                data-testid="input-chat-message"
              />
              <Button size="icon" onClick={handleSend} disabled={!message.trim() || sendMutation.isPending} data-testid="button-send-chat">
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </>
        )}
      </Card>
    </div>
  );
}
