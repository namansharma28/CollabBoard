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

export default async function handler(req: NextApiRequest, res: any) {
  if (!res.socket.server.io) {
    const httpServer: NetServer = res.socket.server as any;
    const io = new SocketIOServer(httpServer, {
      path: "/api/socket/io",
      addTrailingSlash: false,
    });

    io.on("connection", (socket) => {
        console.log("Client connected");
      socket.on("join-team", (teamId: string) => {
        socket.join(`team-${teamId}`);
      });

      socket.on("send-message", async (data) => {
        try {
          const { db } = await connectToDatabase();
          const message = {
            teamId: new ObjectId(data.teamId),
            channel: data.channel,
            content: data.content,
            createdAt: new Date().toISOString(),
            sender: data.sender,
            replyTo: data.replyTo || undefined, // Add this line
          };
          const result = await db.collection("messages").insertOne(message);
          const savedMessage = { ...message, _id: result.insertedId };
          io.to(`team-${data.teamId}`).emit("new-message", savedMessage);
        } catch (err) {
          socket.emit("error", "Failed to save message");
        }
      });
    });

    res.socket.server.io = io;
  }
  res.end();
}