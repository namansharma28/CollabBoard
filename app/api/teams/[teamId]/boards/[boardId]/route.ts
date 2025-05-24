import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { ObjectId } from "mongodb";

interface RouteContext {
  params: Promise<{
    teamId: string;
    boardId: string;
  }>;
}

export async function GET(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const params = await context.params;
    console.log('Fetching board with params:', { teamId: params.teamId, boardId: params.boardId });
    
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      console.log('No session found');
      return NextResponse.json({ error: "Unauthorized - No session" }, { status: 401 });
    }

    console.log('Session user:', session.user.email);

    const { db } = await connectToDatabase();

    // Validate ObjectId
    if (!ObjectId.isValid(params.teamId) || !ObjectId.isValid(params.boardId)) {
      console.log('Invalid ObjectId:', { teamId: params.teamId, boardId: params.boardId });
      return NextResponse.json({ error: "Invalid team or board ID" }, { status: 400 });
    }

    // First check if the board exists at all
    const boardExists = await db.collection("boards").findOne({
      _id: new ObjectId(params.boardId)
    });

    if (!boardExists) {
      console.log('Board does not exist:', { boardId: params.boardId });
      return NextResponse.json({ error: "Board not found" }, { status: 404 });
    }

    // Log the board's teamId for debugging
    console.log('Board exists with teamId:', {
      boardId: params.boardId,
      boardTeamId: boardExists.teamId?.toString(),
      requestedTeamId: params.teamId
    });

    // Then check if user has access to the team
    const team = await db.collection("teams").findOne({
      _id: new ObjectId(params.teamId),
      "members.email": session.user.email,
    });

    if (!team) {
      console.log('Team not found or user not a member:', { teamId: params.teamId, email: session.user.email });
      return NextResponse.json({ error: "Team not found or access denied" }, { status: 404 });
    }

    // Finally check if board belongs to team
    const board = await db.collection("boards").findOne({
      _id: new ObjectId(params.boardId),
      $or: [
        { teamId: new ObjectId(params.teamId) },
        { teamId: params.teamId }
      ]
    });

    if (!board) {
      console.log('Board does not belong to team:', { 
        boardId: params.boardId, 
        boardTeamId: boardExists.teamId?.toString(),
        requestedTeamId: params.teamId 
      });
      return NextResponse.json({ 
        error: "Board not found in this team",
        details: {
          boardTeamId: boardExists.teamId?.toString(),
          requestedTeamId: params.teamId
        }
      }, { status: 404 });
    }

    const boardWithStringId = {
      ...board,
      _id: board._id.toString(),
      teamId: board.teamId.toString(),
    };

    console.log('Successfully found board:', { boardId: params.boardId });
    return NextResponse.json({ board: boardWithStringId });
  } catch (error) {
    console.error("Error fetching board:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch board" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const params = await context.params;
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { db } = await connectToDatabase();

    const team = await db.collection("teams").findOne({
      _id: new ObjectId(params.teamId),
      "members.email": session.user.email,
    });

    if (!team) {
      return NextResponse.json({ error: "Team not found" }, { status: 404 });
    }

    const body = await request.json();

    const result = await db.collection("boards").findOneAndUpdate(
      {
        _id: new ObjectId(params.boardId),
        teamId: new ObjectId(params.teamId),
      },
      { $set: body },
      { returnDocument: "after" }
    );

    if (!result?.value) {
      return NextResponse.json({ error: "Board not found" }, { status: 404 });
    }

    const boardWithStringId = {
      ...result.value,
      _id: result.value._id.toString(),
    };

    return NextResponse.json({
      message: "Board updated successfully",
      board: boardWithStringId,
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
  request: NextRequest,
  context: RouteContext
) {
  try {
    const params = await context.params;
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { db } = await connectToDatabase();

    const team = await db.collection("teams").findOne({
      _id: new ObjectId(params.teamId),
      "members.email": session.user.email,
    });

    if (!team) {
      return NextResponse.json({ error: "Team not found" }, { status: 404 });
    }

    const result = await db.collection("boards").deleteOne({
      _id: new ObjectId(params.boardId),
      teamId: new ObjectId(params.teamId),
    });

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: "Board not found" }, { status: 404 });
    }

    await db.collection("tasks").deleteMany({
      boardId: params.boardId,
    });

    return NextResponse.json({
      message: "Board and its tasks deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting board:", error);
    return NextResponse.json(
      { error: "Failed to delete board" },
      { status: 500 }
    );
  }
}
