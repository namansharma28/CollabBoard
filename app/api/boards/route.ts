import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const client = await clientPromise;
    const db = client.db();
    const boards = await db.collection('boards').find().toArray();

    return NextResponse.json(boards);
  } catch (error) {
    console.error('Error fetching boards:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const client = await clientPromise;
    const db = client.db();
    
    const result = await db.collection('boards').insertOne({
      ...body,
      createdAt: new Date(),
      createdBy: session.user?.email
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error creating board:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}