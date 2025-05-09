import { NextResponse } from "next/server";

export async function POST() {
  try {
    return NextResponse.json(
      { message: "Logged out successfully" },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Error during logout" },
      { status: 500 }
    );
  }
}
