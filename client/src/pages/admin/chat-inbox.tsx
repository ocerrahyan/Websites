import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ThemeToggle } from "@/components/theme-toggle";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AdminSidebar } from "@/components/admin-sidebar";
import { MessageCircle, Send, LogOut, User } from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { ChatMessage } from "@shared/schema";
import { AdminNotificationBell } from "@/components/admin-notification-bell";

type ChatSession = {
  sessionId: string;
  messages: ChatMessage[];
  lastMessage: ChatMessage;
  unreadCount: number;
};

function ChatInboxContent() {
  const [selectedSession, setSelectedSession] = useState<string | null>(null);
  const [reply, setReply] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { logout } = useAuth();
  const { toast } = useToast();

  const { data: sessions, isLoading: sessionsLoading } = useQuery<ChatSession[]>({
    queryKey: ["/api/chat/sessions/all"],
    refetchInterval: 10000,
  });

  const { data: messages } = useQuery<ChatMessage[]>({
    queryKey: ["/api/chat", selectedSession],
    enabled: !!selectedSession,
    refetchInterval: selectedSession ? 5000 : false,
  });

  const markReadMutation = useMutation({
    mutationFn: async (sessionId: string) => {
      await apiRequest("PATCH", `/api/chat/${sessionId}/read`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/chat/sessions/all"] });
    },
  });

  const sendMutation = useMutation({
    mutationFn: async (content: string) => {
      const res = await apiRequest("POST", "/api/chat", {
        senderName: "Alis",
        senderEmail: null,
        senderType: "admin",
        content,
        sessionId: selectedSession,
        isRead: true,
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/chat", selectedSession] });
      queryClient.invalidateQueries({ queryKey: ["/api/chat/sessions/all"] });
      setReply("");
    },
  });

  useEffect(() => {
    if (selectedSession && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, selectedSession]);

  const handleSelectSession = (sessionId: string) => {
    setSelectedSession(sessionId);
    markReadMutation.mutate(sessionId);
  };

  const handleSendReply = () => {
    if (reply.trim() && !sendMutation.isPending) {
      sendMutation.mutate(reply.trim());
    }
  };

  const formatTime = (date: string | Date | null) => {
    if (!date) return "";
    const d = new Date(date);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    if (diff < 60000) return "Just now";
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return d.toLocaleDateString();
  };

  const getClientName = (session: ChatSession) => {
    const clientMsg = session.messages.find((m) => m.senderType === "client");
    return clientMsg?.senderName || "Unknown";
  };

  return (
    <div className="flex flex-col flex-1">
      <header className="h-14 flex items-center justify-between gap-4 px-4 border-b">
        <div className="flex items-center gap-2">
          <SidebarTrigger data-testid="button-sidebar-toggle" />
          <h1 className="font-serif text-lg text-foreground">Chat Inbox</h1>
        </div>
        <div className="flex items-center gap-2">
          <AdminNotificationBell />
          <ThemeToggle />
          <Button variant="ghost" size="icon" onClick={logout} data-testid="button-logout">
            <LogOut className="w-4 h-4" />
          </Button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        <div className="w-72 border-r overflow-y-auto">
          {sessionsLoading ? (
            <div className="p-3 space-y-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-16 rounded-md" />
              ))}
            </div>
          ) : !sessions || sessions.length === 0 ? (
            <div className="p-6 text-center">
              <MessageCircle className="w-8 h-8 text-muted-foreground/50 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">No conversations yet</p>
            </div>
          ) : (
            <div className="p-2 space-y-1">
              {sessions.map((session) => (
                <button
                  key={session.sessionId}
                  className={`w-full text-left p-3 rounded-md hover-elevate transition-colors ${
                    selectedSession === session.sessionId ? "bg-muted" : ""
                  }`}
                  onClick={() => handleSelectSession(session.sessionId)}
                  data-testid={`chat-session-${session.sessionId}`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center shrink-0">
                        <User className="w-4 h-4 text-muted-foreground" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">{getClientName(session)}</p>
                        <p className="text-xs text-muted-foreground truncate">{session.lastMessage.content}</p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1 shrink-0">
                      <span className="text-[10px] text-muted-foreground">{formatTime(session.lastMessage.createdAt)}</span>
                      {session.unreadCount > 0 && (
                        <Badge className="text-[10px] px-1.5" data-testid={`badge-unread-${session.sessionId}`}>
                          {session.unreadCount}
                        </Badge>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex-1 flex flex-col">
          {!selectedSession ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <MessageCircle className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">Select a conversation to view messages</p>
              </div>
            </div>
          ) : (
            <>
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages?.map((msg) => {
                  const isAdmin = msg.senderType === "admin";
                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${isAdmin ? "items-end" : "items-start"}`}
                      data-testid={`inbox-message-${msg.id}`}
                    >
                      <div
                        className={`max-w-[70%] rounded-md px-3 py-2 ${
                          isAdmin ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"
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
                })}
                <div ref={messagesEndRef} />
              </div>

              <div className="p-3 border-t flex items-center gap-2">
                <Input
                  placeholder="Type a reply..."
                  value={reply}
                  onChange={(e) => setReply(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSendReply()}
                  data-testid="input-admin-chat-reply"
                />
                <Button size="icon" onClick={handleSendReply} disabled={!reply.trim() || sendMutation.isPending} data-testid="button-send-admin-reply">
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ChatInbox() {
  return (
    <SidebarProvider>
      <div className="flex h-screen w-full">
        <AdminSidebar />
        <ChatInboxContent />
      </div>
    </SidebarProvider>
  );
}
