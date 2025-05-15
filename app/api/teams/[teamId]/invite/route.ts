import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { ObjectId } from 'mongodb';

// POST /api/teams/[teamId]/invite - Invite a user to the team
export async function POST(
  request: Request,
  { params }: { params: { teamId: string } }
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
    
    // Check if user is an admin of the team
    const team = await db.collection("teams").findOne({
      _id: new ObjectId(params.teamId),
      "members.email": session.user.email
    });

    if (!team) {
      return NextResponse.json({ error: "Team not found or you're not a member" }, { status: 404 });
    }

    // Find the current user's role
    const currentUser = team.members.find((member: any) => member.email === session.user.email);
    if (!currentUser || currentUser.role !== 'admin') {
      return NextResponse.json({ error: "Only admins can invite members" }, { status: 403 });
    }

    // Get email from request body
    const { email } = await request.json();
    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return NextResponse.json({ error: "Valid email is required" }, { status: 400 });
    }

    // Check if user is already a member
    if (team.members.some((member: any) => member.email === email)) {
      return NextResponse.json({ error: "User is already a member of this team" }, { status: 400 });
    }

    // In a real application, you might want to send an email to the user
    // For now, we'll just add them to the team as a member

    // Add the user to the team
    const result = await db.collection("teams").updateOne(
      { _id: new ObjectId(params.teamId) },
      { 
        $push: { 
          members: {
            email,
            role: 'member',
            joinedAt: new Date().toISOString()
          }
        } as any
      }
    );

    if (result.modifiedCount === 0) {
      return NextResponse.json({ error: "Failed to add member" }, { status: 500 });
    }

    return NextResponse.json({ message: "Member invited successfully" });
  } catch (error) {
    console.error("Error inviting team member:", error);
    return NextResponse.json(
      { error: "Failed to invite team member" },
      { status: 500 }
    );
  }
} 