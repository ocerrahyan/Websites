import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ThemeToggle } from "@/components/theme-toggle";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import {
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { AdminSidebar } from "@/components/admin-sidebar";
import {
  MessageSquare, Send, LogOut, Mail, Phone,
} from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Message, Client } from "@shared/schema";
import { format } from "date-fns";

function MessagesContent() {
  const [showComposeDialog, setShowComposeDialog] = useState(false);
  const [composeData, setComposeData] = useState({
    clientId: "",
    type: "email",
    subject: "",
    content: "",
  });

  const { logout } = useAuth();
  const { toast } = useToast();

  const { data: messages, isLoading } = useQuery<Message[]>({ queryKey: ["/api/messages"] });
  const { data: clients } = useQuery<Client[]>({ queryKey: ["/api/clients"] });

  const sendMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/messages", composeData);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/messages"] });
      setShowComposeDialog(false);
      setComposeData({ clientId: "", type: "email", subject: "", content: "" });
      toast({ title: "Message queued for sending" });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  return (
    <div className="flex flex-col flex-1">
      <header className="h-14 flex items-center justify-between gap-4 px-4 border-b">
        <div className="flex items-center gap-2">
          <SidebarTrigger data-testid="button-sidebar-toggle" />
          <h1 className="font-serif text-lg text-foreground">Messages</h1>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Button variant="ghost" size="icon" onClick={logout} data-testid="button-logout">
            <LogOut className="w-4 h-4" />
          </Button>
        </div>
      </header>
      <main className="flex-1 overflow-auto p-6">
        <div className="flex items-center justify-between gap-3 mb-6 flex-wrap">
          <p className="text-muted-foreground text-sm">{messages?.length || 0} messages sent</p>
          <Dialog open={showComposeDialog} onOpenChange={setShowComposeDialog}>
            <DialogTrigger asChild>
              <Button data-testid="button-compose"><Send className="w-4 h-4 mr-1.5" /> Compose</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle className="font-serif">Send Message</DialogTitle></DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-foreground mb-1.5 block">Recipient</label>
                  <Select value={composeData.clientId} onValueChange={(v) => setComposeData({ ...composeData, clientId: v })}>
                    <SelectTrigger data-testid="select-recipient"><SelectValue placeholder="Select a client" /></SelectTrigger>
                    <SelectContent>
                      {clients?.map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.firstName} {c.lastName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-1.5 block">Type</label>
                  <Select value={composeData.type} onValueChange={(v) => setComposeData({ ...composeData, type: v })}>
                    <SelectTrigger data-testid="select-type"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="email">Email</SelectItem>
                      <SelectItem value="sms">SMS</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {composeData.type === "email" && (
                  <div>
                    <label className="text-sm font-medium text-foreground mb-1.5 block">Subject</label>
                    <Input value={composeData.subject} onChange={(e) => setComposeData({ ...composeData, subject: e.target.value })} data-testid="input-subject" />
                  </div>
                )}
                <div>
                  <label className="text-sm font-medium text-foreground mb-1.5 block">Message</label>
                  <Textarea
                    value={composeData.content}
                    onChange={(e) => setComposeData({ ...composeData, content: e.target.value })}
                    placeholder="Type your message..."
                    className="min-h-[120px]"
                    data-testid="input-message-content"
                  />
                </div>
                <Button
                  className="w-full"
                  onClick={() => sendMutation.mutate()}
                  disabled={!composeData.clientId || !composeData.content || sendMutation.isPending}
                  data-testid="button-send-message"
                >
                  {sendMutation.isPending ? "Sending..." : "Send Message"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-20 rounded-md" />)}
          </div>
        ) : !messages?.length ? (
          <div className="text-center py-16">
            <MessageSquare className="w-12 h-12 text-muted-foreground/50 mx-auto mb-3" />
            <p className="text-muted-foreground">No messages sent yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {messages.map((msg) => {
              const client = clients?.find((c) => c.id === msg.clientId);
              return (
                <Card key={msg.id} className="p-4" data-testid={`card-message-${msg.id}`}>
                  <div className="flex items-center justify-between gap-3 flex-wrap mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                        {msg.type === "email" ? <Mail className="w-4 h-4 text-primary" /> : <Phone className="w-4 h-4 text-primary" />}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">
                          To: {client ? `${client.firstName} ${client.lastName}` : "Unknown"}
                        </p>
                        {msg.subject && <p className="text-xs text-muted-foreground">{msg.subject}</p>}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="capitalize">{msg.type}</Badge>
                      <Badge variant={msg.status === "sent" ? "default" : "outline"} className="capitalize">
                        {msg.status}
                      </Badge>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2">{msg.content}</p>
                  <p className="text-xs text-muted-foreground mt-2">
                    {msg.sentAt && format(new Date(msg.sentAt), "MMM d, yyyy 'at' h:mm a")}
                  </p>
                </Card>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}

export default function AdminMessages() {
  const style = {
    "--sidebar-width": "16rem",
    "--sidebar-width-icon": "3rem",
  };

  return (
    <SidebarProvider style={style as React.CSSProperties}>
      <div className="flex h-screen w-full">
        <AdminSidebar />
        <MessagesContent />
      </div>
    </SidebarProvider>
  );
}
