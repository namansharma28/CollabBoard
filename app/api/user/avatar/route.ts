import { NextResponse } from 'next/server';

// This functionality has been removed
export async function POST(request: Request) {
  return NextResponse.json(
    { error: 'This functionality has been removed' },
    { status: 410 }  // 410 Gone
  );
} 