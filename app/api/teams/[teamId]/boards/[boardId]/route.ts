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

    const board = await db.collection("boards").findOne({
      _id: new ObjectId(params.boardId),
      teamId: new ObjectId(params.teamId),
    });

    if (!board) {
      return NextResponse.json({ error: "Board not found" }, { status: 404 });
    }

    const boardWithStringId = {
      ...board,
      _id: board._id.toString(),
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
