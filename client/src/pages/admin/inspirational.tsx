import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import {
  SidebarProvider,
  SidebarTrigger,
  SidebarInset,
} from "@/components/ui/sidebar";
import { AdminSidebar } from "@/components/admin-sidebar";
import { ThemeToggle } from "@/components/theme-toggle";
import {
  Sparkles, Send, Trash2, Plus, Users, FileText,
  BookOpen, Church, Wand2, Eye, Clock, CheckCircle2,
  Mail, MessageCircle,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import type { Subscriber, InspirationalMessage } from "@shared/schema";

function ComposeTab() {
  const { toast } = useToast();
  const [subject, setSubject] = useState("");
  const [content, setContent] = useState("");
  const [aiType, setAiType] = useState("inspirational");
  const [aiTopic, setAiTopic] = useState("");
  const [generating, setGenerating] = useState(false);

  const saveMutation = useMutation({
    mutationFn: async (status: string) => {
      const res = await apiRequest("POST", "/api/inspirational-messages", {
        subject,
        content,
        type: aiType,
        status,
      });
      return res.json();
    },
    onSuccess: (_, status) => {
      queryClient.invalidateQueries({ queryKey: ["/api/inspirational-messages"] });
      toast({
        title: status === "sent" ? "Message Sent" : "Draft Saved",
        description: status === "sent"
          ? "Message has been sent to all active subscribers."
          : "Your message has been saved as a draft.",
      });
      setSubject("");
      setContent("");
      setAiTopic("");
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const generateAI = async () => {
    if (!aiType) return;
    setGenerating(true);
    try {
      const res = await apiRequest("POST", "/api/ai/generate-message", {
        topic: aiTopic,
        type: aiType,
      });
      const data = await res.json();
      setContent(data.content);
      if (!subject) setSubject(data.subject);
      toast({ title: "Generated", description: "AI-generated content is ready for your review." });
    } catch (error: any) {
      toast({ title: "Generation Failed", description: error.message, variant: "destructive" });
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="grid lg:grid-cols-5 gap-6">
      <div className="lg:col-span-3 space-y-4">
        <Card className="p-5">
          <h3 className="font-serif text-lg text-foreground mb-4">Compose Message</h3>
          <div className="space-y-4">
            <div>
              <Label htmlFor="subject" className="text-sm">Subject</Label>
              <Input
                id="subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Message subject..."
                data-testid="input-message-subject"
              />
            </div>
            <div>
              <Label htmlFor="content" className="text-sm">Message Content</Label>
              <Textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Write your inspirational message here..."
                className="min-h-[200px]"
                data-testid="input-message-content"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                onClick={() => saveMutation.mutate("draft")}
                variant="outline"
                disabled={!subject || !content || saveMutation.isPending}
                data-testid="button-save-draft"
              >
                <FileText className="w-4 h-4 mr-2" /> Save Draft
              </Button>
              <Button
                onClick={() => saveMutation.mutate("sent")}
                disabled={!subject || !content || saveMutation.isPending}
                data-testid="button-send-message"
              >
                <Send className="w-4 h-4 mr-2" /> Send to Subscribers
              </Button>
            </div>
          </div>
        </Card>
      </div>

      <div className="lg:col-span-2 space-y-4">
        <Card className="p-5">
          <h3 className="font-medium text-foreground mb-3 flex items-center gap-2">
            <Wand2 className="w-4 h-4 text-primary" /> AI Content Assistant
          </h3>
          <div className="space-y-3">
            <div>
              <Label className="text-sm">Message Type</Label>
              <Select value={aiType} onValueChange={setAiType}>
                <SelectTrigger data-testid="select-ai-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="inspirational">
                    <span className="flex items-center gap-2"><Sparkles className="w-3.5 h-3.5" /> Inspirational</span>
                  </SelectItem>
                  <SelectItem value="gospel">
                    <span className="flex items-center gap-2"><Church className="w-3.5 h-3.5" /> Gospel Message</span>
                  </SelectItem>
                  <SelectItem value="sermon">
                    <span className="flex items-center gap-2"><Church className="w-3.5 h-3.5" /> Sermon Style</span>
                  </SelectItem>
                  <SelectItem value="book-inspired">
                    <span className="flex items-center gap-2"><BookOpen className="w-3.5 h-3.5" /> From My Books</span>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-sm">Topic (optional)</Label>
              <Input
                value={aiTopic}
                onChange={(e) => setAiTopic(e.target.value)}
                placeholder="e.g., inner beauty, gratitude, faith..."
                data-testid="input-ai-topic"
              />
            </div>
            <Button
              onClick={generateAI}
              disabled={generating}
              className="w-full"
              data-testid="button-generate-ai"
            >
              {generating ? (
                "Generating..."
              ) : (
                <>
                  <Wand2 className="w-4 h-4 mr-2" /> Generate with AI
                </>
              )}
            </Button>
            <p className="text-xs text-muted-foreground">
              AI writes as Alis Cerrahyan, drawing from her 45+ years of wisdom and published works.
              Review and edit before sending.
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}

function HistoryTab() {
  const { toast } = useToast();
  const { data: messages, isLoading } = useQuery<InspirationalMessage[]>({
    queryKey: ["/api/inspirational-messages"],
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/inspirational-messages/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/inspirational-messages"] });
      toast({ title: "Deleted", description: "Message has been removed." });
    },
  });

  const sendMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await apiRequest("POST", `/api/inspirational-messages/${id}/send`);
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/inspirational-messages"] });
      toast({
        title: "Sent",
        description: `Message sent to ${data.recipientCount} active subscriber(s).`,
      });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-24 w-full" />
        ))}
      </div>
    );
  }

  if (!messages?.length) {
    return (
      <Card className="p-8 text-center">
        <FileText className="w-10 h-10 text-muted-foreground/50 mx-auto mb-3" />
        <p className="text-muted-foreground">No messages yet. Start composing!</p>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {messages.map((msg) => (
        <Card key={msg.id} className="p-4" data-testid={`card-message-${msg.id}`}>
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <h4 className="font-medium text-foreground truncate" data-testid={`text-message-subject-${msg.id}`}>{msg.subject}</h4>
                <Badge
                  variant={msg.status === "sent" ? "default" : "secondary"}
                  className="text-xs"
                >
                  {msg.status === "sent" ? (
                    <><CheckCircle2 className="w-3 h-3 mr-1" /> Sent</>
                  ) : (
                    <><Clock className="w-3 h-3 mr-1" /> Draft</>
                  )}
                </Badge>
                <Badge variant="outline" className="text-xs">{msg.type}</Badge>
              </div>
              <p className="text-sm text-muted-foreground line-clamp-2">{msg.content}</p>
              {msg.sentAt && (
                <p className="text-xs text-muted-foreground mt-1">
                  Sent {new Date(msg.sentAt).toLocaleDateString()}
                </p>
              )}
            </div>
            <div className="flex items-center gap-1 flex-shrink-0">
              {msg.status === "draft" && (
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => sendMutation.mutate(msg.id)}
                  disabled={sendMutation.isPending}
                  data-testid={`button-send-${msg.id}`}
                >
                  <Send className="w-4 h-4" />
                </Button>
              )}
              <Dialog>
                <DialogTrigger asChild>
                  <Button size="icon" variant="ghost" data-testid={`button-preview-${msg.id}`}>
                    <Eye className="w-4 h-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-lg">
                  <DialogHeader>
                    <DialogTitle className="font-serif">{msg.subject}</DialogTitle>
                  </DialogHeader>
                  <div className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap">
                    {msg.content}
                  </div>
                </DialogContent>
              </Dialog>
              <Button
                size="icon"
                variant="ghost"
                onClick={() => deleteMutation.mutate(msg.id)}
                disabled={deleteMutation.isPending}
                data-testid={`button-delete-${msg.id}`}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}

function SubscribersTab() {
  const { toast } = useToast();
  const { data: subscribers, isLoading } = useQuery<Subscriber[]>({
    queryKey: ["/api/subscribers"],
  });

  const toggleMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
      await apiRequest("PATCH", `/api/subscribers/${id}`, { isActive });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/subscribers"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/subscribers/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/subscribers"] });
      toast({ title: "Removed", description: "Subscriber has been removed." });
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    );
  }

  const active = subscribers?.filter((s) => s.isActive) || [];
  const inactive = subscribers?.filter((s) => !s.isActive) || [];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <Card className="p-4 text-center">
          <p className="text-2xl font-serif text-foreground" data-testid="text-total-subscribers">{subscribers?.length || 0}</p>
          <p className="text-xs text-muted-foreground">Total</p>
        </Card>
        <Card className="p-4 text-center">
          <p className="text-2xl font-serif text-primary" data-testid="text-active-subscribers">{active.length}</p>
          <p className="text-xs text-muted-foreground">Active</p>
        </Card>
        <Card className="p-4 text-center">
          <p className="text-2xl font-serif text-muted-foreground">{inactive.length}</p>
          <p className="text-xs text-muted-foreground">Inactive</p>
        </Card>
      </div>

      {!subscribers?.length ? (
        <Card className="p-8 text-center">
          <Users className="w-10 h-10 text-muted-foreground/50 mx-auto mb-3" />
          <p className="text-muted-foreground">No subscribers yet. Share your subscribe page!</p>
        </Card>
      ) : (
        <div className="space-y-2">
          {subscribers.map((sub) => (
            <Card key={sub.id} className="p-3" data-testid={`card-subscriber-${sub.id}`}>
              <div className="flex items-center justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium text-foreground text-sm" data-testid={`text-subscriber-name-${sub.id}`}>
                      {sub.firstName} {sub.lastName}
                    </span>
                    <Badge variant={sub.isActive ? "default" : "secondary"} className="text-xs">
                      {sub.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5 flex-wrap">
                    <span className="flex items-center gap-1">
                      <Mail className="w-3 h-3" /> {sub.email}
                    </span>
                    {sub.phone && (
                      <span className="flex items-center gap-1">
                        <MessageCircle className="w-3 h-3" /> {sub.phone}
                      </span>
                    )}
                    <span>{sub.frequency}</span>
                    <span>{sub.channel}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => toggleMutation.mutate({ id: sub.id, isActive: !sub.isActive })}
                    data-testid={`button-toggle-${sub.id}`}
                  >
                    {sub.isActive ? "Deactivate" : "Activate"}
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => deleteMutation.mutate(sub.id)}
                    data-testid={`button-delete-sub-${sub.id}`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

export default function AdminInspirational() {
  return (
    <SidebarProvider>
      <div className="flex h-screen w-full">
        <AdminSidebar />
        <SidebarInset className="flex flex-col flex-1 overflow-hidden">
          <header className="flex items-center justify-between gap-2 p-3 border-b flex-wrap">
            <div className="flex items-center gap-2">
              <SidebarTrigger data-testid="button-sidebar-toggle" />
              <h1 className="font-serif text-lg text-foreground">Inspirational Messages</h1>
            </div>
            <ThemeToggle />
          </header>
          <main className="flex-1 overflow-y-auto p-4 md:p-6">
            <Tabs defaultValue="compose">
              <TabsList className="mb-6" data-testid="tabs-inspirational">
                <TabsTrigger value="compose" data-testid="tab-compose">
                  <Plus className="w-3.5 h-3.5 mr-1.5" /> Compose
                </TabsTrigger>
                <TabsTrigger value="history" data-testid="tab-history">
                  <FileText className="w-3.5 h-3.5 mr-1.5" /> History
                </TabsTrigger>
                <TabsTrigger value="subscribers" data-testid="tab-subscribers">
                  <Users className="w-3.5 h-3.5 mr-1.5" /> Subscribers
                </TabsTrigger>
              </TabsList>
              <TabsContent value="compose">
                <ComposeTab />
              </TabsContent>
              <TabsContent value="history">
                <HistoryTab />
              </TabsContent>
              <TabsContent value="subscribers">
                <SubscribersTab />
              </TabsContent>
            </Tabs>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
