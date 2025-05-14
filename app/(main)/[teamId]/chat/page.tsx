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
import { io } from "socket.io-client";

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
  const socket = useRef<any>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const [replyTo, setReplyTo] = useState<MessageType | null>(null);
  const [isConnected, setIsConnected] = useState(false);

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

  // Initialize socket separately from fetching messages
  useEffect(() => {
    if (socket.current) {
      console.log("Cleaning up existing socket connection");
      socket.current.disconnect();
      socket.current = null;
    }
    
    console.log("Initializing new socket connection");
    
    // Connect to WebSocket with correct path
    socket.current = io({
      path: "/api/socket/io",
      addTrailingSlash: false,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      timeout: 10000,
      autoConnect: true,
      forceNew: true // Force a new connection
    });

    // Connection status
    socket.current.on('connect', () => {
      console.log('Connected to chat server with ID:', socket.current.id);
      setIsConnected(true);
      
      // Join team channel after connection is established
      socket.current.emit("join-team", teamId);
      console.log("Joined team room:", teamId);
      
      // Fetch messages after successful connection
      fetchMessages();
    });
    
    socket.current.on('connect_error', (error: Error) => {
      console.error('Connection error:', error);
      setIsConnected(false);
      toast.error("Connection error. Please refresh the page.");
    });
    
    socket.current.on('disconnect', (reason: string) => {
      console.log('Disconnected from chat server:', reason);
      setIsConnected(false);
    });

    // Listen for new messages
    socket.current.on("new-message", (message: MessageType) => {
      console.log("Received new message:", message);
      if (message.channel === currentChannel) {
        setMessages((prev) => [...prev, message]);
      }
    });
    
    // Listen for message confirmations
    socket.current.on("message-received", (confirmation: { id: string, status: string }) => {
      console.log("Message received confirmation:", confirmation);
    });

    socket.current.on("error", (error: string) => {
      console.error("Socket error:", error);
      toast.error(error);
    });

    return () => {
      if (socket.current) {
        console.log("Disconnecting socket on cleanup");
        socket.current.disconnect();
      }
    };
  }, [teamId]); // Only re-initialize when teamId changes
  
  // Fetch messages when channel changes
  useEffect(() => {
    if (isConnected) {
      fetchMessages();
    }
  }, [currentChannel, isConnected]);

  // Auto scroll to bottom when new messages come
  useEffect(() => {
    if (scrollAreaRef.current) {
      // scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
      scrollAreaRef.current.scrollIntoView({
        behavior: "smooth",
        block: "end",
      });
    }
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !session?.user) return;
    
    if (!isConnected) {
      toast.error("Not connected to chat server. Please wait or refresh the page.");
      return;
    }

    const msgPayload = {
      content: newMessage.trim(),
      channel: currentChannel,
      teamId: teamId,
      sender: {
        email: session?.user?.email || "",
        name: session?.user?.name || "",
        avatar: `https://ui-avatars.com/api/?name=${
          session?.user?.name || session?.user?.email
        }&background=random`,
        initials: session?.user?.name
          ? session.user.name
              .split(" ")
              .map((n: string) => n[0])
              .join("")
              .toUpperCase()
          : session?.user?.email?.[0]?.toUpperCase() || "U",
      },
      replyTo: replyTo
        ? {
            _id: replyTo._id,
            senderName: replyTo.sender.name || replyTo.sender.email,
            content: replyTo.content,
          }
        : undefined,
    };

    console.log("Sending message payload:", msgPayload);

    try {
      socket.current.emit("send-message", msgPayload);
      setNewMessage("");
      setReplyTo(null);
    } catch (error) {
      console.error("Error:", error);
      toast.error("Failed to send message");
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
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[500px] pr-4 relative">
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
                <Input
                  placeholder="Type your message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                />
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
