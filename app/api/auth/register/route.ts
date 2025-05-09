import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import bcrypt from "bcryptjs";
import { sign } from "jsonwebtoken";

export async function POST(req: Request) {
  try {
    const { firstName, lastName, email, password } = await req.json();
    
    // Connect to MongoDB
    const { db } = await connectToDatabase();
    
    // Check if user already exists
    const existingUser = await db.collection("users").findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { error: "User already exists" },
        { status: 400 }
      );
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Create user
    const result = await db.collection("users").insertOne({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      createdAt: new Date(),
    });

    // Create JWT token
    const token = sign(
      { 
        userId: result.insertedId,
        email,
        name: `${firstName} ${lastName}`
      },
      process.env.JWT_SECRET!,
      { expiresIn: "7d" }
    );
    
    return NextResponse.json(
      { 
        message: "User created successfully",
        token,
        user: {
          email,
          name: `${firstName} ${lastName}`
        }
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Error creating user" },
      { status: 500 }
    );
  }
}