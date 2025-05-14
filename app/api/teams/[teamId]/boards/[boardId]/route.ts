import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { ObjectId } from 'mongodb';

export async function GET(
  request: Request,
  { params }: { params: { teamId: string; boardId: string } }
) {
  try {
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

    // Fetch the specific board
    const board = await db.collection("boards").findOne({
      _id: new ObjectId(params.boardId),
      teamId: params.teamId
    });

    if (!board) {
      return NextResponse.json({ error: "Board not found" }, { status: 404 });
    }

    // Convert MongoDB _id to string
    const boardWithStringId = {
      ...board,
      _id: board._id.toString()
    };

    return NextResponse.json({ board: boardWithStringId });
  } catch (error) {
    console.error("Error fetching board:", error);
    return NextResponse.json(
      { error: "Failed to fetch board" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { teamId: string; boardId: string } }
) {
  try {
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

    // Get update data from request
    const updateData = await request.json();
    
    // Update the board
    const result = await db.collection("boards").updateOne(
      { _id: new ObjectId(params.boardId), teamId: params.teamId },
      { $set: updateData }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "Board not found" }, { status: 404 });
    }

    // Fetch the updated board
    const updatedBoard = await db.collection("boards").findOne({
      _id: new ObjectId(params.boardId)
    });

    // Convert MongoDB _id to string
    const boardWithStringId = {
      ...updatedBoard,
      _id: updatedBoard?._id.toString()
    };

    return NextResponse.json({ 
      message: "Board updated successfully", 
      board: boardWithStringId 
    });
  } catch (error) {
    console.error("Error updating board:", error);
    return NextResponse.json(
      { error: "Failed to update board" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { teamId: string; boardId: string } }
) {
  try {
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

    // Delete the board
    const result = await db.collection("boards").deleteOne({
      _id: new ObjectId(params.boardId),
      teamId: params.teamId
    });

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: "Board not found" }, { status: 404 });
    }

    // Also delete all tasks associated with this board
    await db.collection("tasks").deleteMany({
      boardId: params.boardId
    });

    return NextResponse.json({ 
      message: "Board and its tasks deleted successfully" 
    });
  } catch (error) {
    console.error("Error deleting board:", error);
    return NextResponse.json(
      { error: "Failed to delete board" },
      { status: 500 }
    );
  }
} 