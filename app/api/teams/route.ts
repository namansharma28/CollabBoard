import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { verifyJwt } from "@/lib/jwt";

export async function GET(request: Request) {
  try {
    // Get token from Authorization header
    const token = request.headers.get("Authorization")?.split(" ")[1];
    let userEmail;

    // Try to get user from NextAuth session
    const session = await getServerSession(authOptions);
    if (session?.user?.email) {
      userEmail = session.user.email;
    }
    // If no session, try to get user from JWT
    else if (token) {
      const decoded = verifyJwt(token);
      userEmail = decoded.email;
    }

    if (!userEmail) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { db } = await connectToDatabase();
    
    // Find all teams where user is a member
    const teams = await db.collection("teams")
      .find({
        "members.email": userEmail
      })
      .toArray();

    return NextResponse.json({ teams });
    
  } catch (error) {
    console.error("Error fetching teams:", error);
    return NextResponse.json(
      { error: "Error fetching teams" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    // Get token from Authorization header
    const token = request.headers.get("Authorization")?.split(" ")[1];
    let userEmail;

    // Try to get user from NextAuth session
    const session = await getServerSession(authOptions);
    if (session?.user?.email) {
      userEmail = session.user.email;
    }
    // If no session, try to get user from JWT
    else if (token) {
      const decoded = verifyJwt(token);
      userEmail = decoded.email;
    }

    if (!userEmail) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { name, description } = await request.json();
    const { db } = await connectToDatabase();

    const team = {
      name,
      description,
      members: [{
        email: userEmail,
        role: "admin",
        joinedAt: new Date()
      }],
      createdBy: userEmail,
      createdAt: new Date(),
      updatedAt: new Date(),
      code: Math.random().toString(36).substring(2, 8).toUpperCase()
    };

    const result = await db.collection("teams").insertOne(team);

    return NextResponse.json({
      id: result.insertedId,
      ...team
    }, { status: 201 });
  } catch (error) {
    console.error("Error creating team:", error);
    return NextResponse.json(
      { error: "Failed to create team" },
      { status: 500 }
    );
  }
}