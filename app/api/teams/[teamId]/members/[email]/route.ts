import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { ObjectId } from 'mongodb';

// DELETE /api/teams/[teamId]/members/[email] - Remove a member from the team
export async function DELETE(
  request: Request,
  { params }: { params: { teamId: string; email: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Validate teamId
    if (!ObjectId.isValid(params.teamId)) {
      return NextResponse.json({ error: "Invalid team ID" }, { status: 400 });
    }

    const { db } = await connectToDatabase();
    
    // Check if user is a member of the team
    const team = await db.collection("teams").findOne({
      _id: new ObjectId(params.teamId),
      "members.email": session.user!.email
    });

    if (!team) {
      return NextResponse.json({ error: "Team not found or you're not a member" }, { status: 404 });
    }

    // Find the current user's role
    const currentUser = team.members.find((member: any) => member.email === session.user!.email);
    const isSelfRemoval = params.email === session.user!.email;
    
    // Allow self-removal or admin removal of others
    if (!isSelfRemoval && (!currentUser || currentUser.role !== 'admin')) {
      return NextResponse.json({ error: "Only admins can remove other members" }, { status: 403 });
    }

    // Check if trying to remove the last admin
    if (isSelfRemoval && currentUser.role === 'admin') {
      const adminCount = team.members.filter((member: any) => member.role === 'admin').length;
      if (adminCount <= 1) {
        return NextResponse.json({ error: "Cannot leave the team as you are the only admin. Please promote another member to admin first." }, { status: 400 });
      }
    }

    // Remove the member
    const result = await db.collection("teams").updateOne(
      { _id: new ObjectId(params.teamId) },
      { $pull: { members: { email: params.email } } as any }
    );

    if (result.modifiedCount === 0) {
      return NextResponse.json({ error: "Failed to remove member" }, { status: 500 });
    }

    return NextResponse.json({ 
      message: isSelfRemoval ? "You have left the team" : "Member removed successfully" 
    });
  } catch (error) {
    console.error("Error removing team member:", error);
    return NextResponse.json(
      { error: "Failed to remove team member" },
      { status: 500 }
    );
  }
} 