import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { connectToDatabase } from "@/lib/mongodb";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { ObjectId } from "mongodb";

// DELETE /api/user - Delete current user account
export async function DELETE(request: Request) {
  try {
    const authSession = await getServerSession(authOptions);
    
    if (!authSession?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    const { db } = await connectToDatabase();
    
    // Fetch the user to get their ID
    const user = await db.collection("users").findOne({ email: authSession.user.email });
    
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    
    // Find teams where user is the only admin
    const teamsAsOnlyAdmin = await db.collection("teams").find({
      $and: [
        {
          "members": {
            $elemMatch: { 
              email: authSession.user.email,
              role: "admin"
            }
          }
        },
        {
          "members": {
            $not: {
              $elemMatch: {
                email: { $ne: authSession.user.email },
                role: "admin"
              }
            }
          }
        }
      ]
    }).toArray();
    
    // If user is the only admin in any team, prevent deletion
    if (teamsAsOnlyAdmin.length > 0) {
      return NextResponse.json({ 
        error: "You are the only admin in one or more teams. Please transfer admin rights before deleting your account.",
        teams: teamsAsOnlyAdmin.map(team => ({ id: team._id, name: team.name }))
      }, { status: 400 });
    }
    
    // Remove user from all teams they are part of
    await db.collection("teams").updateMany(
      { "members.email": authSession.user.email },
      { $pull: { members: { email: authSession.user.email } } as any }
    );
    
    // Delete user account
    await db.collection("users").deleteOne({ email: authSession.user.email });
    
    return NextResponse.json({ 
      message: "Account deleted successfully" 
    });
    
  } catch (error) {
    console.error("Error deleting user account:", error);
    return NextResponse.json({ error: "Failed to delete account" }, { status: 500 });
  }
} 