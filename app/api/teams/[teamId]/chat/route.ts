import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { ObjectId } from 'mongodb';
import { formatDistanceToNow } from 'date-fns';

interface MessageType {
  _id: string;
  teamId: string;
  channel: string;  // For different channels like 'general', 'development', etc.
  content: string;
  createdAt: string;
  sender: {
    email: string;
    name?: string;
    avatar?: string;
    initials: string;
  };
  recipient?: string; // For DMs: recipient's email
  replyTo?: {
    _id: string;
    senderName: string;
    content: string;
  };
}

interface MessageDocument {
  _id?: ObjectId;
  teamId: ObjectId;
  channel?: string;
  recipient?: string;
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

export async function GET(
  request: NextRequest,
  { params }: { params: { teamId: string } }
) {
  try {
    // Extract and validate teamId
    const teamId = params.teamId;
    
    if (!ObjectId.isValid(teamId)) {
      return NextResponse.json({ error: "Invalid team ID" }, { status: 400 });
    }
    
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const channel = searchParams.get('channel') || 'general';
    const recipient = searchParams.get('recipient');

    const { db } = await connectToDatabase();
    
    // Verify user is member of team
    const team = await db.collection("teams").findOne({
      _id: new ObjectId(teamId),
      "members.email": session.user.email
    });

    if (!team) {
      return NextResponse.json({ error: "Team not found" }, { status: 404 });
    }

    let query = {};
    
    // If DM, fetch messages between the user and recipient
    if (recipient) {
      query = {
        teamId: new ObjectId(teamId),
        $or: [
          // Messages sent by user to recipient
          { 
            "sender.email": session.user.email,
            recipient: recipient
          },
          // Messages sent by recipient to user
          {
            "sender.email": recipient,
            recipient: session.user.email
          }
        ]
      };
    } else {
      // Regular channel messages
      query = {
        teamId: new ObjectId(teamId),
        channel: channel,
        recipient: { $exists: false }  // Exclude DMs
      };
    }

    const messages = await db.collection("messages")
      .find(query)
      .sort({ createdAt: -1 })
      .limit(50)
      .toArray();
    
    // Format the messages for response
    const formattedMessages = messages.map(msg => ({
      ...msg,
      _id: msg._id.toString(),
      teamId: teamId, // Use the string version
    })).reverse(); // Reverse to get oldest first

    return NextResponse.json({ messages: formattedMessages });
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch messages" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: Request,
  { params }: { params: { teamId: string } }
) {
  try {
    // Extract and validate teamId
    const teamId = params.teamId;
    
    if (!ObjectId.isValid(teamId)) {
      return NextResponse.json({ error: "Invalid team ID" }, { status: 400 });
    }
    
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { content, channel, recipient } = await request.json();
    if (!content?.trim()) {
      return NextResponse.json({ error: "Message content is required" }, { status: 400 });
    }

    const { db } = await connectToDatabase();
    
    // Verify user is member of team
    const team = await db.collection("teams").findOne({
      _id: new ObjectId(teamId),
      "members.email": session.user.email
    });

    if (!team) {
      return NextResponse.json({ error: "Team not found" }, { status: 404 });
    }

    // Create message
    const message: MessageDocument = {
      teamId: new ObjectId(teamId),
      content: content.trim(),
      createdAt: new Date().toISOString(), // Make sure it's a string
      sender: {
        email: session.user.email,
        name: session.user.name || session.user.email,
        avatar: `https://ui-avatars.com/api/?name=${session.user.name || session.user.email}&background=random`,
        initials: session.user.name
          ? session.user.name
              .split(' ')
              .map((n: string) => n[0])
              .join('')
              .toUpperCase()
          : session.user.email[0].toUpperCase(),
      },
    };
    
    // Add channel or recipient but not both
    if (recipient) {
      message.recipient = recipient;
    } else {
      message.channel = channel || 'general';
    }

    const result = await db.collection("messages").insertOne(message);

    // Format response
    const responseMessage = {
      ...message,
      _id: result.insertedId.toString(),
      teamId: teamId
    };

    return NextResponse.json(responseMessage);
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json(
      { error: "Failed to send message" },
      { status: 500 }
    );
  }
}