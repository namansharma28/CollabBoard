import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { ObjectId } from 'mongodb';

export async function GET(
  request: Request,
  { params }: { params: { teamId: string } }
) {
  try {
    // Validate teamId
    if (!params.teamId || !ObjectId.isValid(params.teamId)) {
      return NextResponse.json({ error: "Invalid team ID" }, { status: 400 });
    }

    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { db } = await connectToDatabase();
    
    // Verify user is part of the team
    const team = await db.collection("teams").findOne({
      _id: new ObjectId(params.teamId),
      "members.email": session.user.email
    });

    if (!team) {
      return NextResponse.json({ error: "Team not found" }, { status: 404 });
    }

    // Fetch notes for the team
    const notes = await db.collection("notes")
      .find({ teamId: new ObjectId(params.teamId) })
      .sort({ createdAt: -1 })
      .toArray();

    return NextResponse.json(notes);
  } catch (error) {
    console.error("Error fetching notes:", error);
    return NextResponse.json(
      { error: "Failed to fetch notes" },
      { status: 500 }
    );
  }
}

// app/api/teams/[teamId]/notes/route.ts
// Add this to your existing file

export async function POST(
  request: Request,
  context: { params: { teamId: string } }
) {
  try {
    const { teamId } = context.params;
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { title, content } = await request.json();
    if (!title || !content) {
      return NextResponse.json({ error: "Title and content are required" }, { status: 400 });
    }

    const { db } = await connectToDatabase();
    
    // Verify user is part of the team
    const team = await db.collection("teams").findOne({
      _id: new ObjectId(teamId),
      "members.email": session.user.email
    });

    if (!team) {
      return NextResponse.json({ error: "Team not found" }, { status: 404 });
    }

    const note = {
      teamId: new ObjectId(teamId),
      title,
      content,
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: {
        email: session.user.email,
        name: session.user.name
      }
    };

    const result = await db.collection("notes").insertOne(note);
    return NextResponse.json({ ...note, _id: result.insertedId });
  } catch (error) {
    console.error("Error creating note:", error);
    return NextResponse.json(
      { error: "Failed to create note" },
      { status: 500 }
    );
  }
}