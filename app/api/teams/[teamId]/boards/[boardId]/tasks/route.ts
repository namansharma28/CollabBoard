import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { ObjectId } from 'mongodb';
import { SOCKET_EVENTS } from '@/lib/socket';

// This helper function emits a socket event via the API
async function emitSocketEvent(req: Request, event: string, data: any, room: string) {
  try {
    const socketEmitUrl = new URL('/api/socket/emit', req.url).toString();
    await fetch(socketEmitUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        event,
        data,
        room
      }),
    });
  } catch (error) {
    console.error('Failed to emit socket event:', error);
  }
}

interface RouteContext {
  params: Promise<{
    teamId: string;
    boardId: string;
  }>;
}

export async function GET(
  request: Request,
  context: RouteContext
) {
  try {
    const params = await context.params;
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { db } = await connectToDatabase();
    
    // Verify user is member of team
    const team = await db.collection("teams").findOne({
      _id: new ObjectId(params.teamId),
      "members.email": session.user.email
    });

    if (!team) {
      return NextResponse.json({ error: "Team not found" }, { status: 404 });
    }

    // Verify board exists and belongs to the team
    const board = await db.collection("boards").findOne({
      _id: new ObjectId(params.boardId),
      teamId: params.teamId
    });

    if (!board) {
      return NextResponse.json({ error: "Board not found" }, { status: 404 });
    }

    // Fetch tasks for the board
    const tasks = await db.collection("tasks")
      .find({ boardId: params.boardId })
      .toArray();

    // Convert MongoDB _id to string for each task
    const tasksWithStringIds = tasks.map(task => ({
      ...task,
      _id: task._id.toString()
    }));

    return NextResponse.json({ tasks: tasksWithStringIds });
  } catch (error) {
    console.error("Error fetching tasks:", error);
    return NextResponse.json(
      { error: "Failed to fetch tasks" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: Request,
  context: RouteContext
) {
  try {
    const params = await context.params;
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { db } = await connectToDatabase();
    
    // Verify user is member of team
    const team = await db.collection("teams").findOne({
      _id: new ObjectId(params.teamId),
      "members.email": session.user.email
    });

    if (!team) {
      return NextResponse.json({ error: "Team not found" }, { status: 404 });
    }

    // Verify board exists and belongs to the team
    const board = await db.collection("boards").findOne({
      _id: new ObjectId(params.boardId),
      teamId: params.teamId
    });

    if (!board) {
      return NextResponse.json({ error: "Board not found" }, { status: 404 });
    }

    // Get task data from request
    const taskData = await request.json();
    
    // Create new task
    const newTask = {
      ...taskData,
      boardId: params.boardId,
      createdAt: new Date().toISOString(),
      createdBy: {
        email: session.user.email,
        name: session.user.name || session.user.email
      }
    };
    
    const result = await db.collection("tasks").insertOne(newTask);
    
    // Return the created task with its generated _id
    const createdTask = {
      ...newTask,
      _id: result.insertedId.toString()
    };

    // Update the board's task count
    await db.collection("boards").updateOne(
      { _id: new ObjectId(params.boardId) },
      { $inc: { totalTasks: 1 } }
    );

    // If the task is created with "done" status, update completedTasks count
    if (taskData.status === "done") {
      await db.collection("boards").updateOne(
        { _id: new ObjectId(params.boardId) },
        { $inc: { completedTasks: 1 } }
      );
    }

    // Emit socket event for real-time updates
    await emitSocketEvent(
      request,
      SOCKET_EVENTS.TASK_CREATED,
      { task: createdTask, boardId: params.boardId },
      `board-${params.boardId}`
    );

    return NextResponse.json({ 
      message: "Task created successfully", 
      task: createdTask 
    }, { status: 201 });
  } catch (error) {
    console.error("Error creating task:", error);
    return NextResponse.json(
      { error: "Failed to create task" },
      { status: 500 }
    );
  }
} 