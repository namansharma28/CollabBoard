"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send } from "lucide-react";
import { useParams } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { pusherClient } from "@/lib/pusher";

interface MessageType {
  _id: string;
  teamId: string;
  channel: string;
  content: string;
  createdAt: string;
  sender: {
    email: string;
    name?: string;
    avatar?: string;
    initials: string;
  };
  replyTo?: {
    _id: string;
    senderName: string;
    content: string;
  };
}

export default function ChatPage() {
  const { data: session } = useSession();
  const params = useParams();
  const teamId = params?.teamId as string;
  const [messages, setMessages] = useState<MessageType[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentChannel, setCurrentChannel] = useState("general");
  const [newMessage, setNewMessage] = useState("");
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const [replyTo, setReplyTo] = useState<MessageType | null>(null);
  const messageInputRef = useRef<HTMLInputElement>(null);
  const [isConnected, setIsConnected] = useState(false);

  // Add keyboard shortcut to focus message input
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.altKey && e.key === 'm') {
        e.preventDefault();
        if (messageInputRef.current) {
          messageInputRef.current.focus();
        }
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Fetch messages for current channel
  const fetchMessages = async () => {
    try {
      const response = await fetch(
        `/api/teams/${teamId}/chat?channel=${currentChannel}`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch messages");
      }
      const data = await response.json();
      setMessages(data.messages);
    } catch (error) {
      console.error("Error:", error);
      toast.error("Failed to load messages");
    } finally {
      setLoading(false);
    }
  };

  // Initialize Pusher and fetch messages
  useEffect(() => {
    if (!session?.user?.email || !teamId) return;

    // Subscribe to the team channel
    const channelName = `team-${teamId}`;
    const channel = pusherClient.subscribe(channelName);
    setIsConnected(true);

    // Handle new messages
    channel.bind('new-message', (message: MessageType) => {
      console.log("Received new message:", message);
      if (message.channel === currentChannel) {
        setMessages((prev) => {
          // More thorough duplicate check
          const exists = prev.some(m => 
            m._id === message._id || // Check permanent ID
            (m.content === message.content && // Or check content and timestamp
             m.sender.email === message.sender.email &&
             Math.abs(new Date(m.createdAt).getTime() - new Date(message.createdAt).getTime()) < 1000)
          );
          if (exists) {
            console.log("Duplicate message detected, skipping");
            return prev;
          }
          return [...prev, message];
        });
      }
    });

    // Fetch initial messages
    fetchMessages();

    return () => {
      channel.unbind_all();
      pusherClient.unsubscribe(channelName);
    };
  }, [teamId, session, currentChannel]);

  // Auto scroll to bottom when new messages come
  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollIntoView({
        behavior: "smooth",
        block: "end",
      });
    }
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !session?.user?.email || !session?.user?.name) return;
    
    if (!isConnected) {
      toast.error("Not connected to chat server. Please wait or refresh the page.");
      return;
    }

    // Create a temporary ID for optimistic update
    const tempId = `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const timestamp = new Date().toISOString();
    
    const messageData = {
      _id: tempId,
      content: newMessage.trim(),
      channel: currentChannel,
      teamId: teamId,
      createdAt: timestamp,
      sender: {
        email: session.user.email,
        name: session.user.name || session.user.email,
        avatar: `https://ui-avatars.com/api/?name=${
          session.user.name || session.user.email
        }&background=random`,
        initials: session.user.name
          ? session.user.name
              .split(" ")
              .map((n: string) => n[0])
              .join("")
              .toUpperCase()
          : session.user.email[0].toUpperCase(),
      },
      replyTo: replyTo
        ? {
            _id: replyTo._id,
            senderName: replyTo.sender.name || replyTo.sender.email,
            content: replyTo.content,
          }
        : undefined,
    };

    // Clear input immediately for better UX
    setNewMessage("");
    setReplyTo(null);

    // Optimistically update UI
    setMessages(prev => {
      // Check for duplicates before adding
      const isDuplicate = prev.some(m => 
        m.content === messageData.content &&
        m.sender.email === messageData.sender.email &&
        Math.abs(new Date(m.createdAt).getTime() - new Date(timestamp).getTime()) < 1000
      );
      if (isDuplicate) return prev;
      return [...prev, messageData];
    });

    try {
      // Send message to server
      const response = await fetch(`/api/teams/${teamId}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          content: messageData.content,
          channel: currentChannel,
          replyTo: messageData.replyTo
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to send message');
      }

      const { data: savedMessage } = await response.json();
      
      // Update the temporary message with the permanent one
      setMessages(prev => 
        prev.map(msg => 
          msg._id === tempId || // Match by temp ID
          (msg.content === messageData.content && // Or match by content and timestamp
           msg.sender.email === messageData.sender.email &&
           Math.abs(new Date(msg.createdAt).getTime() - new Date(timestamp).getTime()) < 1000)
            ? savedMessage 
            : msg
        )
      );

    } catch (error) {
      console.error("Error:", error);
      // Remove the temporary message on error
      setMessages(prev => prev.filter(msg => msg._id !== tempId));
      toast.error(error instanceof Error ? error.message : "Failed to send message");
    }
  };

  const channels = [
    { id: "general", name: "General" },
    { id: "development", name: "Development" },
    { id: "design", name: "Design" },
    { id: "marketing", name: "Marketing" },
  ];

  const formatMessageTime = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch (error) {
      return "Just now";
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex flex-col space-y-6">
      <div className="grid gap-4 mb-2 w-full max-w-full overflow-hidden">
        <Card className="max-w-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              # {currentChannel}
              {isConnected && (
                <div className="h-2 w-2 bg-green-500 rounded-full" title="Connected to chat server"></div>
              )}
              {!isConnected && (
                <div className="h-2 w-2 bg-red-500 rounded-full" title="Disconnected from chat server"></div>
              )}
            </CardTitle>
            <CardDescription>
              Channel for {currentChannel} team discussion
              {!isConnected && (
                <span className="text-red-500 text-xs ml-2">(Connecting to chat server...)</span>
              )}
            </CardDescription>
            <div className="text-xs mt-1 text-muted-foreground">
              Press <kbd className="px-1 py-0.5 text-xs rounded border bg-muted font-mono">Alt+M</kbd> to quickly focus the message input
            </div>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[450px] pr-4 relative">
              <div className="space-y-6 pb-16" ref={scrollAreaRef}>
                {messages.map((msg) => (
                  <div
                    key={msg._id}
                    className={`flex items-start gap-4 ${
                      msg.sender.email === session?.user?.email
                        ? "justify-end"
                        : ""
                    }`}
                  >
                    {msg.sender.email !== session?.user?.email && (
                      <Avatar>
                        <AvatarImage src={msg.sender.avatar} />
                        <AvatarFallback>{msg.sender.initials}</AvatarFallback>
                      </Avatar>
                    )}
                    <div className={`grid gap-1.5 ${
                      msg.sender.email === session?.user?.email ? 'text-right' : ''
                    }`}>
                      <div className="flex items-center gap-2">
                        <div className="font-semibold">{msg.sender.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {formatMessageTime(msg.createdAt)}
                        </div>
                      </div>
                      
                      {/* Reply content if exists */}
                      {msg.replyTo && (
                        <div className="mb-1 p-2 border-l-4 border-primary bg-muted rounded text-xs text-left">
                          <span className="font-semibold">{msg.replyTo.senderName}:</span> {msg.replyTo.content}
                        </div>
                      )}
                      
                      {/* Actual message */}
                      <div className={`px-4 py-2 rounded-lg ${
                        msg.sender.email === session?.user?.email 
                          ? 'bg-primary text-primary-foreground ml-auto'
                          : 'bg-muted'
                      }`}>
                        {msg.content}
                      </div>
                      
                      {/* Reply button */}
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-xs self-start"
                        onClick={() => setReplyTo(msg)}
                      >
                        Reply
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Fixed position reply box inside ScrollArea */}
              {replyTo && (
                <div className="absolute bottom-0 left-0 right-4 bg-background p-2 border-t">
                  <div className="p-2 border-l-4 border-primary bg-muted/80 rounded-sm relative">
                    <div className="flex justify-between items-start">
                      <div className="pr-10 max-w-full">
                        <div className="text-xs text-muted-foreground mb-1">
                          Replying to <b>{replyTo.sender.name || replyTo.sender.email}</b>
                        </div>
                        <div className="text-sm truncate">{replyTo.content}</div>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="absolute top-1 right-1 h-6 w-6 p-0"
                        onClick={() => setReplyTo(null)}
                      >
                        &times;
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </ScrollArea>
            <div className="pt-6">
              <form onSubmit={handleSendMessage} className="flex gap-2">
                <div className="relative flex-1">
                  <Input
                    placeholder="Type your message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    ref={messageInputRef}
                    className="pr-16"
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded border">
                    Alt+M
                  </div>
                </div>
                <Button type="submit" size="icon" disabled={!newMessage.trim() || !isConnected}>
                  <Send className="h-4 w-4" />
                </Button>
              </form>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
