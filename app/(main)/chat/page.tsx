"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useState } from "react";
import { Send } from "lucide-react";

const messages = [
  {
    id: 1,
    sender: {
      name: "John Doe",
      avatar: "/avatars/01.png",
      initials: "JD",
    },
    message: "Hey team! How's everyone doing today?",
    timestamp: "10:30 AM",
  },
  {
    id: 2,
    sender: {
      name: "Sarah Kim",
      avatar: "/avatars/02.png",
      initials: "SK",
    },
    message: "Good morning! Just finished reviewing the latest designs.",
    timestamp: "10:32 AM",
  },
  {
    id: 3,
    sender: {
      name: "Michael Brown",
      avatar: "/avatars/03.png",
      initials: "MB",
    },
    message: "The new UI looks great! I especially like the dashboard improvements.",
    timestamp: "10:35 AM",
  },
  {
    id: 4,
    sender: {
      name: "Emily Chen",
      avatar: "/avatars/04.png",
      initials: "EC",
    },
    message: "Thanks! I've also added some animations to make it more engaging.",
    timestamp: "10:37 AM",
  },
  {
    id: 5,
    sender: {
      name: "John Doe",
      avatar: "/avatars/01.png",
      initials: "JD",
    },
    message: "Perfect timing! We have a client demo tomorrow.",
    timestamp: "10:38 AM",
  },
];

export default function ChatPage() {
  const [newMessage, setNewMessage] = useState("");

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim()) {
      // Handle sending message
      setNewMessage("");
    }
  };

  return (
    <div className="flex flex-col space-y-6">
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Team Chat</h1>
        <p className="text-muted-foreground">
          Communicate with your team in real-time
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-[280px_1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Channels</CardTitle>
            <CardDescription>Your team's chat channels</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Button variant="ghost" className="w-full justify-start font-normal">
                # general
              </Button>
              <Button variant="ghost" className="w-full justify-start font-normal">
                # development
              </Button>
              <Button variant="ghost" className="w-full justify-start font-normal">
                # design
              </Button>
              <Button variant="ghost" className="w-full justify-start font-normal">
                # marketing
              </Button>
            </div>
            <div className="mt-6">
              <CardTitle className="text-sm mb-2">Direct Messages</CardTitle>
              <div className="space-y-2">
                <Button variant="ghost" className="w-full justify-start font-normal">
                  <Avatar className="h-5 w-5 mr-2">
                    <AvatarImage src="/avatars/02.png" />
                    <AvatarFallback>SK</AvatarFallback>
                  </Avatar>
                  Sarah Kim
                </Button>
                <Button variant="ghost" className="w-full justify-start font-normal">
                  <Avatar className="h-5 w-5 mr-2">
                    <AvatarImage src="/avatars/03.png" />
                    <AvatarFallback>MB</AvatarFallback>
                  </Avatar>
                  Michael Brown
                </Button>
                <Button variant="ghost" className="w-full justify-start font-normal">
                  <Avatar className="h-5 w-5 mr-2">
                    <AvatarImage src="/avatars/04.png" />
                    <AvatarFallback>EC</AvatarFallback>
                  </Avatar>
                  Emily Chen
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              # general
            </CardTitle>
            <CardDescription>
              Channel for general team discussion
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[500px] pr-4">
              <div className="space-y-6">
                {messages.map((message) => (
                  <div key={message.id} className="flex items-start gap-4">
                    <Avatar>
                      <AvatarImage src={message.sender.avatar} />
                      <AvatarFallback>{message.sender.initials}</AvatarFallback>
                    </Avatar>
                    <div className="grid gap-1.5">
                      <div className="flex items-center gap-2">
                        <div className="font-semibold">{message.sender.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {message.timestamp}
                        </div>
                      </div>
                      <div>{message.message}</div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
            <div className="pt-6">
              <form onSubmit={handleSendMessage} className="flex gap-2">
                <Input
                  placeholder="Type your message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                />
                <Button type="submit" size="icon">
                  <Send className="h-4 w-4" />
                </Button>
              </form>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )}