import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import bcrypt from "bcryptjs";
import { sign } from "jsonwebtoken";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();
    
    // Connect to MongoDB
    const { db } = await connectToDatabase();
    
    // Find user by email
    const user = await db.collection("users").findOne({ email });
    
    // If user doesn't exist
    if (!user) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }
    
    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);
    
    if (!isValidPassword) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }
    
    // Create JWT token
    const token = sign(
      { 
        userId: user._id,
        email: user.email,
        name: `${user.firstName} ${user.lastName}`
      },
      process.env.JWT_SECRET!,
      { expiresIn: "7d" }
    );
    
    return NextResponse.json({ 
      token,
      user: {
        email: user.email,
        name: `${user.firstName} ${user.lastName}`
      }
    });
    
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "Error during login" },
      { status: 500 }
    );
  }
}