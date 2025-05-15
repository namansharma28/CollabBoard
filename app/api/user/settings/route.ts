import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { connectToDatabase } from "@/lib/mongodb";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

// GET /api/user/settings - Get current user settings
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    const { db } = await connectToDatabase();
    
    const user = await db.collection("users").findOne({ email: session.user.email });
    
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    
    // Return simplified user data
    return NextResponse.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      image: user.image
    });
    
  } catch (error) {
    console.error("Error getting user settings:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// PATCH /api/user/settings - Update current user settings
export async function PATCH(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    const { db } = await connectToDatabase();
    
    // Check if user exists
    const existingUser = await db.collection("users").findOne({ email: session.user.email });
    
    if (!existingUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    
    // Parse request body
    const data = await request.json();
    
    // Validate name
    if (!data.name || typeof data.name !== "string") {
      return NextResponse.json({ error: "Invalid or missing name" }, { status: 400 });
    }
    
    // Prepare update data - only name
    const updateData = { name: data.name };
    
    // Update user in database
    const result = await db.collection("users").updateOne(
      { email: session.user.email },
      { $set: updateData }
    );
    
    if (result.modifiedCount === 0) {
      return NextResponse.json({ message: "No changes made" }, { status: 200 });
    }
    
    // Get updated user data
    const updatedUser = await db.collection("users").findOne({ email: session.user.email });
    
    if (!updatedUser) {
      return NextResponse.json({ error: "User not found after update" }, { status: 404 });
    }
    
    return NextResponse.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      image: updatedUser.image
    });
    
  } catch (error) {
    console.error("Error updating user settings:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
} 