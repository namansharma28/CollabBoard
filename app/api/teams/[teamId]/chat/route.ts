import { NextResponse } from 'next/server';
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
  replyTo?: {
    _id: string;
    senderName: string;
    content: string;
  };
}

export async function GET(
  request: Request,
  { params }: { params: { teamId: string } }
) {
  try {
    const { searchParams } = new URL(request.url);
    const channel = searchParams.get('channel') || 'general';

    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { db } = await connectToDatabase();
    
    // Verify user is member of team
    const team = await db.collection("teams").findOne({
      _id: new ObjectId(params.teamId),
      "members.email": session.user.email
    });

    if (!team) {
      return NextResponse.json({ error: "Team not found" }, { status: 404 });
    }

    // Fetch channel messages
    const messages = await db.collection("messages")
      .find({ 
        teamId: new ObjectId(params.teamId),
        channel: channel
      })
      .sort({ createdAt: -1 })
      .limit(50)
      .toArray();

    return NextResponse.json({ messages: messages.reverse() }); // Show oldest first
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
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { content, channel } = await request.json();
    if (!content?.trim()) {
      return NextResponse.json({ error: "Message content is required" }, { status: 400 });
    }

    const { db } = await connectToDatabase();
    
    // Verify user is member of team
    const team = await db.collection("teams").findOne({
      _id: new ObjectId(params.teamId),
      "members.email": session.user.email
    });

    if (!team) {
      return NextResponse.json({ error: "Team not found" }, { status: 404 });
    }

    // Create message
    const message = {
      teamId: new ObjectId(params.teamId),
      channel: channel || 'general',
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
      replyTo: undefined,
    };

    await db.collection("messages").insertOne(message);

    return NextResponse.json(message);
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json(
      { error: "Failed to send message" },
      { status: 500 }
    );
  }
}