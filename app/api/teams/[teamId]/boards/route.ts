import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { ObjectId } from 'mongodb';

interface RouteContext {
  params: Promise<{
    teamId: string;
  }>;
}

export async function GET(
  request: Request,
  context: RouteContext
) {
  try {
    const params = await context.params;
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

    // Fetch team specific boards
    const boards = await db.collection("boards")
      .find({ teamId: params.teamId })
      .toArray();

    return NextResponse.json({ boards });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch boards" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: Request,
  context: RouteContext
) {
  try {
    const params = await context.params;
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

    // Get board data from request
    const boardData = await request.json();
    
    // Create new board
    const newBoard = {
      ...boardData,
      teamId: params.teamId,
      createdAt: new Date(),
      createdBy: {
        email: session.user.email,
        name: session.user.name || session.user.email
      }
    };
    
    const result = await db.collection("boards").insertOne(newBoard);
    
    // Return the created board with its generated _id
    const createdBoard = {
      ...newBoard,
      _id: result.insertedId.toString()
    };

    return NextResponse.json({ 
      message: "Board created successfully", 
      board: createdBoard 
    }, { status: 201 });
  } catch (error) {
    console.error("Error creating board:", error);
    return NextResponse.json(
      { error: "Failed to create board" },
      { status: 500 }
    );
  }
}