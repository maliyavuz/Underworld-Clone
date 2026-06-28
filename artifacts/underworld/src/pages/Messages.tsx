import { useState } from "react";
import { Layout } from "@/components/Layout";
import {
  useGetInbox,
  useSendMessage,
  useMarkMessageRead,
  getGetInboxQueryKey,
} from "@workspace/api-client-react";
import type { Message } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { MessageSquare, Send, User, Clock, Mail } from "lucide-react";

export default function Messages() {
  const { data: inbox, isLoading } = useGetInbox();
  const sendMessage = useSendMessage();
  const markRead = useMarkMessageRead();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [selectedMessageId, setSelectedMessageId] = useState<number | null>(null);
  const [toUsername, setToUsername] = useState("");
  const [content, setContent] = useState("");

  const unreadCount = inbox?.filter((m: Message) => !m.read).length || 0;
  const selectedMessage = inbox?.find((m: Message) => m.id === selectedMessageId);

  const handleSelectMessage = (messageId: number) => {
    setSelectedMessageId(messageId);
    const msg = inbox?.find((m: Message) => m.id === messageId);
    if (msg && !msg.read) {
      markRead.mutate(
        { messageId },
        {
          onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: getGetInboxQueryKey() });
          },
        },
      );
    }
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!toUsername || !content) return;

    sendMessage.mutate(
      { data: { toUsername, content } },
      {
        onSuccess: (res: any) => {
          if (res.success) {
            toast({
              title: "Message Sent",
              description: `Your message to ${toUsername} has been delivered.`,
            });
            setToUsername("");
            setContent("");
            queryClient.invalidateQueries({ queryKey: getGetInboxQueryKey() });
          } else {
            toast({
              variant: "destructive",
              title: "Failed to Send",
              description: res.message,
            });
          }
        },
        onError: (err: any) => {
          toast({
            variant: "destructive",
            title: "Error",
            description: err.message || "Something went wrong.",
          });
        },
      },
    );
  };

  return (
    <Layout>
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <MessageSquare className="w-8 h-8 text-primary" />
            <h1 className="text-3xl font-black tracking-widest text-primary uppercase">
              Messages
            </h1>
          </div>
          {unreadCount > 0 && (
            <div className="bg-primary text-primary-foreground px-3 py-1 rounded-full text-xs font-bold animate-pulse">
              {unreadCount} NEW
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Message List */}
          <Card className="lg:col-span-1 border-border bg-card overflow-hidden">
            <CardHeader className="border-b border-border/50 bg-muted/30">
              <CardTitle className="text-sm font-bold tracking-widest uppercase flex items-center gap-2">
                <Mail className="w-4 h-4" /> Inbox
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0 max-h-[600px] overflow-y-auto">
              {isLoading ? (
                <div className="p-4 space-y-4">
                  {[1, 2, 3, 4].map((i) => (
                    <Skeleton key={i} className="h-16" />
                  ))}
                </div>
              ) : inbox?.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground italic">
                  No messages yet.
                </div>
              ) : (
                <div className="divide-y divide-border/50">
                  {inbox?.map((msg: Message) => (
                    <div
                      key={msg.id}
                      className={`p-4 cursor-pointer transition-colors hover:bg-muted/50 relative ${
                        selectedMessageId === msg.id
                          ? "bg-muted border-l-4 border-l-primary"
                          : ""
                      } ${!msg.read ? "bg-primary/5" : ""}`}
                      onClick={() => handleSelectMessage(msg.id)}
                      data-testid={`message-item-${msg.id}`}
                    >
                      {!msg.read && (
                        <div className="absolute top-4 right-4 w-2 h-2 bg-primary rounded-full" />
                      )}
                      <div className="flex justify-between items-start mb-1">
                        <span className="font-bold text-sm text-primary uppercase tracking-wider">
                          {msg.senderUsername}
                        </span>
                        <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {msg.timeAgo}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground truncate pr-4">
                        {msg.content}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Message Content & Compose */}
          <div className="lg:col-span-2 space-y-6">
            {/* Full Message View */}
            {selectedMessage && (
              <Card className="border-border bg-card border-l-4 border-l-primary">
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-lg font-bold uppercase tracking-widest text-primary">
                      From: {selectedMessage.senderUsername}
                    </CardTitle>
                    <span className="text-xs text-muted-foreground">
                      {selectedMessage.timeAgo}
                    </span>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="p-4 bg-muted/30 rounded-md border border-border/50 whitespace-pre-wrap text-sm leading-relaxed">
                    {selectedMessage.content}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Compose Form */}
            <Card className="border-border bg-card">
              <CardHeader>
                <CardTitle className="text-sm font-bold tracking-widest uppercase flex items-center gap-2">
                  <Send className="w-4 h-4" /> New Message
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSend} className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                      To:
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Username"
                        className="pl-9"
                        value={toUsername}
                        onChange={(e) => setToUsername(e.target.value)}
                        data-testid="input-to-username"
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                      Message:
                    </label>
                    <Textarea
                      placeholder="Type your message here..."
                      className="min-h-[120px] resize-none"
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      data-testid="input-message-content"
                      required
                    />
                  </div>
                  <Button
                    type="submit"
                    className="w-full font-bold tracking-widest"
                    disabled={sendMessage.isPending || !toUsername || !content}
                    data-testid="button-send-message"
                  >
                    SEND MESSAGE
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
}
