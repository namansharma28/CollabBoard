import { Server as NetServer } from "http";
import { NextApiRequest } from "next";
import { Server as SocketIOServer } from "socket.io";
import { connectToDatabase } from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export const config = {
  api: {
    bodyParser: false,
  },
};

// Socket event types - should match client-side events
export const SOCKET_EVENTS = {
  TASK_CREATED: 'task-created',
  TASK_UPDATED: 'task-updated',
  TASK_DELETED: 'task-deleted',
  BOARD_UPDATED: 'board-updated'
};

export default async function handler(req: NextApiRequest, res: any) {
  if (!res.socket.server.io) {
    console.log("Setting up Socket.io server...");
    const httpServer: NetServer = res.socket.server as any;
    
    const io = new SocketIOServer(httpServer, {
      path: "/api/socket/io",
      addTrailingSlash: false,
      cors: {
        origin: "*",
        methods: ["GET", "POST"]
      }
    });

    io.on("connection", (socket) => {
      console.log("Client connected:", socket.id);
      
      // Handle joining board-specific rooms
      socket.on('join-board', (boardId: string) => {
        socket.join(`board-${boardId}`);
        console.log(`Socket ${socket.id} joined board-${boardId}`);
      });
      
      // Handle leaving board-specific rooms
      socket.on('leave-board', (boardId: string) => {
        socket.leave(`board-${boardId}`);
        console.log(`Socket ${socket.id} left board-${boardId}`);
      });
      
      // Handle team rooms for chat functionality
      socket.on("join-team", (teamId: string) => {
        socket.join(`team-${teamId}`);
        console.log(`Socket ${socket.id} joined team-${teamId}`);
      });

      socket.on("send-message", async (data) => {
        console.log("Received message from client:", data);
        
        try {
          // Broadcast to everyone in the room EXCEPT the sender
          socket.to(`team-${data.teamId}`).emit("new-message", data);
          
          // Send confirmation to sender
          socket.emit("message-received", { 
            id: data._id,
            status: "success" 
          });
        } catch (err) {
          console.error("Error broadcasting message:", err);
          socket.emit("error", "Failed to broadcast message");
        }
      });
      
      // Handle disconnect
      socket.on("disconnect", () => {
        console.log("Client disconnected:", socket.id);
      });
    });

    res.socket.server.io = io;
    console.log("Socket.io server initialized");
  } else {
    console.log("Using existing Socket.io server");
  }
  
  res.end();
}