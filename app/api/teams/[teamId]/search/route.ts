import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { ObjectId, Document, WithId } from "mongodb";
import { connectToDatabase } from "@/lib/mongodb";

export async function GET(
  req: NextRequest,
  { params }: { params: { teamId: string } }
) {
  try {
    // Get the search query
    const searchQuery = req.nextUrl.searchParams.get("q");
    const { teamId } = params;

    if (!searchQuery || searchQuery.length < 3) {
      return NextResponse.json(
        { error: "Search query must be at least 3 characters" },
        { status: 400 }
      );
    }

    // Get user session
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // Connect to MongoDB
    const { db } = await connectToDatabase();

    // Verify user is member of team
    const team = await db.collection("teams").findOne({
      _id: new ObjectId(teamId),
      "members.email": session.user.email,
    });

    if (!team) {
      return NextResponse.json(
        { error: "Team not found or access denied" },
        { status: 403 }
      );
    }

    // Search query regex (case insensitive)
    const query = { $regex: searchQuery, $options: "i" };

    // First get all board IDs belonging to this team
    const teamBoards = await db
      .collection("boards")
      .find({ teamId: teamId })
      .project({ _id: 1 })
      .toArray();
      
    const boardIds = teamBoards.map(board => board._id.toString());

    // Search in boards
    const boards = await db
      .collection("boards")
      .find({
        teamId: teamId,
        $or: [{ title: query }, { description: query }],
      })
      .limit(5)
      .toArray();

    // Search in tasks across all team boards
    const tasks = await db
      .collection("tasks")
      .find({
        boardId: { $in: boardIds },
        $or: [{ title: query }, { description: query }],
      })
      .limit(10)
      .toArray();

    // Search in notes (if notes collection exists)
    let notes: WithId<Document>[] = [];
    try {
      notes = await db
        .collection("notes")
        .find({
          teamId: teamId,
          $or: [{ title: query }, { content: query }],
        })
        .limit(5)
        .toArray();
    } catch (error) {
      console.log("Notes collection might not exist yet");
    }

    // Format and combine results
    const results = [
      ...boards.map((board) => ({
        id: board._id.toString(),
        title: board.title,
        type: "board",
      })),
      ...tasks.map((task) => ({
        id: task._id.toString(),
        title: task.title,
        type: "task",
        boardId: task.boardId,
      })),
      ...notes.map((note) => ({
        id: note._id.toString(),
        title: note.title || "Untitled Note",
        type: "note",
      })),
    ];

    return NextResponse.json({ results });
  } catch (error) {
    console.error("Search error:", error);
    return NextResponse.json(
      { error: "Failed to perform search" },
      { status: 500 }
    );
  }
} 