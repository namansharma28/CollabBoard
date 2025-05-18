import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { code } = await request.json();
    const { db } = await connectToDatabase();

    const team = await db.collection("teams").findOne({ code });
    if (!team) {
      return NextResponse.json(
        { error: "Invalid team code" },
        { status: 404 }
      );
    }

    // Check if user is already a member
    const isMember = team.members.some(
      (member: any) => member.email === session.user?.email
    );
    if (isMember) {
      return NextResponse.json(
        { error: "Already a member of this team" },
        { status: 400 }
      );
    }

    // Add user to team
    await db.collection("teams").updateOne(
      { _id: team._id },
      {
        $push: {
          members: {
            email: session.user?.email,
            role: "member",
            joinedAt: new Date()
          }
        } as any,
        $set: { updatedAt: new Date() }
      }
    );

    return NextResponse.json({ id: team._id });
  } catch (error) {
    console.error("Error joining team:", error);
    return NextResponse.json(
      { error: "Failed to join team" },
      { status: 500 }
    );
  }
}