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
  const messageInputRef = useRef<HTMLInputElement>(null);

  // Add keyboard shortcut to focus message input
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Alt+M to focus message input
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

  // Initialize socket separately from fetching messages
  useEffect(() => {
    if (socket.current) {
      console.log("Cleaning up existing socket connection");
      socket.current.disconnect();
      socket.current = null;
    }
    
    if (!session?.user?.email) {
      console.log("No session, skipping socket connection");
      return;
    }
    
    console.log("Initializing new socket connection for user:", session.user.email);

    // Connect to WebSocket with auth data
    socket.current = io({
      path: "/api/socket/io",
      addTrailingSlash: false,
      auth: {
        userId: session.user.email,
        teamId: teamId
      },
      query: {
        userId: session.user.email,
        teamId: teamId
      },
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      timeout: 10000,
      autoConnect: true,
      forceNew: true
    });

    // Connection status
    socket.current.on('connect', () => {
      console.log('Connected to chat server with ID:', socket.current.id);
      setIsConnected(true);
      
      // Join team channel after connection is established
      if (session?.user?.email) {
        socket.current.emit("join-team", {
          teamId: teamId,
          userId: session.user.email
        });
        console.log("Joined team room:", teamId);
      }
      
      // Fetch messages after successful connection
      fetchMessages();
    });
    
    socket.current.on('connect_error', (error: Error) => {
      console.error('Connection error:', error);
      setIsConnected(false);
      toast.error("Connection error. Attempting to reconnect...");
    });
    
    socket.current.on('disconnect', (reason: string) => {
      console.log('Disconnected from chat server:', reason);
      setIsConnected(false);
      
      // Attempt to reconnect if it wasn't an intentional disconnect
      if (reason !== 'io client disconnect') {
        console.log('Attempting to reconnect...');
        socket.current.connect();
      }
    });

    // Reconnect event
    socket.current.on('reconnect', (attemptNumber: number) => {
      console.log('Reconnected after', attemptNumber, 'attempts');
      setIsConnected(true);
      
      // Rejoin the team room
      if (session?.user?.email) {
        socket.current.emit("join-team", {
          teamId: teamId,
          userId: session?.user?.email
        });
      }
    });

    // Listen for new messages
    socket.current.on("new-message", (message: MessageType) => {
      console.log("Received new message via socket:", message);
      console.log("Current channel:", currentChannel);
      console.log("Message channel:", message.channel);
      console.log("Current messages:", messages);

      if (message.channel === currentChannel) {
        setMessages((prev) => {
          // Check if message already exists to prevent duplicates
          const exists = prev.some(m => m._id === message._id);
          if (exists) {
            console.log("Message already exists, skipping");
            return prev;
          }
          console.log("Adding new message to state");
          return [...prev, message];
        });
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
        socket.current.off("new-message");
        socket.current.off("message-received");
        socket.current.off("error");
        socket.current.disconnect();
      }
    };
  }, [teamId, session, currentChannel, messages]); // Add messages to dependencies to track updates
  
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
    if (!newMessage.trim() || !session?.user?.email || !session?.user?.name) return;
    
    if (!isConnected) {
      toast.error("Not connected to chat server. Please wait or refresh the page.");
      return;
    }

    // Create a temporary ID for optimistic update
    const tempId = `temp-${Date.now()}`;
    
    const messageData = {
      _id: tempId,
      content: newMessage.trim(),
      channel: currentChannel,
      teamId: teamId,
      createdAt: new Date().toISOString(),
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

    // Optimistically update UI
    setMessages(prev => [...prev, messageData]);
    setNewMessage("");
    setReplyTo(null);

    try {
      // Send via socket for immediate broadcast
      socket.current.emit("send-message", messageData);

      // Save to database in background
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

      // Get the permanent ID from server
      const { data: savedMessage } = await response.json();
      
      // Update the temporary message with the permanent one
      setMessages(prev => 
        prev.map(msg => 
          msg._id === tempId ? savedMessage : msg
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
