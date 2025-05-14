import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { ObjectId } from 'mongodb';

export async function DELETE(
  request: Request,
  { params }: { params: { teamId: string; noteId: string } }
) {
  try {
    const { teamId, noteId } = params;

    // Validate IDs
    if (!ObjectId.isValid(teamId) || !ObjectId.isValid(noteId)) {
      return NextResponse.json({ error: "Invalid ID format" }, { status: 400 });
    }

    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { db } = await connectToDatabase();
    
    // Get the team and user's role
    const team = await db.collection("teams").findOne({
      _id: new ObjectId(teamId),
      "members.email": session.user.email
    });

    if (!team) {
      return NextResponse.json({ error: "Team not found" }, { status: 404 });
    }

    // Find the user's role in the team
    const memberInfo = team.members.find((m: any) => m.email === session.user.email);
    const isAdmin = memberInfo?.role === 'admin';

    // Get the note
    const note = await db.collection("notes").findOne({
      _id: new ObjectId(noteId),
      teamId: new ObjectId(teamId)
    });

    if (!note) {
      return NextResponse.json({ error: "Note not found" }, { status: 404 });
    }

    // Check if user has permission to delete
    if (!isAdmin && note.createdBy.email !== session.user.email) {
      return NextResponse.json({ error: "Not authorized to delete this note" }, { status: 403 });
    }

    // Delete the note
    const result = await db.collection("notes").deleteOne({
      _id: new ObjectId(noteId),
      teamId: new ObjectId(teamId)
    });

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: "Failed to delete note" }, { status: 500 });
    }

    return NextResponse.json({ message: "Note deleted successfully" });
  } catch (error) {
    console.error("Error deleting note:", error);
    return NextResponse.json(
      { error: "Failed to delete note" },
      { status: 500 }
    );
  }
}
