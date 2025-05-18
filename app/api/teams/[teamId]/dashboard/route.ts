import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { ObjectId } from 'mongodb';

interface RouteContext {
  params: Promise<{
    teamId: string;
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

    // Validate teamId
    if (!ObjectId.isValid(params.teamId)) {
      return NextResponse.json({ error: "Invalid team ID" }, { status: 400 });
    }

    const { db } = await connectToDatabase();
    
    // Convert string ID to ObjectId
    const teamId = new ObjectId(params.teamId);
    
    // Fetch team data
    const team = await db.collection("teams").findOne({
      _id: teamId,
      "members.email": session.user.email
    });

    if (!team) {
      return NextResponse.json({ error: "Team not found" }, { status: 404 });
    }

    // 1. First get all boards for this team
    const boards = await db.collection("boards")
      .find({ teamId: params.teamId })
      .toArray();
    
    const boardIds = boards.map(board => board._id.toString());
    
    // 2. Get all tasks from all boards in this team
    const tasks = await db.collection("tasks")
      .find({ boardId: { $in: boardIds } })
      .toArray();
    
    // Count tasks by status
    const completedTasks = tasks.filter(task => task.status === "done").length;
    const inProgressTasks = tasks.filter(task => task.status === "in-progress").length;
    const todoTasks = tasks.filter(task => task.status === "todo").length;
    const totalTasks = tasks.length;
    
    // Count overdue tasks separately (these could be either todo or in-progress)
    const overdueTasks = tasks.filter(task => {
      if (task.dueDate && task.status !== "done") {
        const dueDate = new Date(task.dueDate);
        return dueDate < new Date();
      }
      return false;
    }).length;

    // 3. Get notes count and recently updated notes
    const notes = await db.collection("notes")
      .find({ teamId: new ObjectId(params.teamId) })
      .sort({ updatedAt: -1 })
      .limit(10)
      .toArray();
    
    const notesCount = notes.length;
    const updatedTodayCount = notes.filter(note => {
      const updatedAt = new Date(note.updatedAt);
      const today = new Date();
      return updatedAt.toDateString() === today.toDateString();
    }).length;

    // 4. Get unread messages count
    const messages = await db.collection("messages")
      .find({ teamId: new ObjectId(params.teamId) })
      .sort({ createdAt: -1 })
      .limit(50)
      .toArray();
    
    const messageCount = messages.length;
    const conversationCount = Array.from(new Set(messages.map(msg => msg.channel))).length;

    // 5. Get recent activity
    // Combine recent tasks, notes, and messages
    const recentActivity = [];

    // Add recent task updates
    const recentTasks = tasks
      .sort((a, b) => new Date(b.updatedAt || b.createdAt).getTime() - new Date(a.updatedAt || a.createdAt).getTime())
      .slice(0, 5)
      .map(task => {
        // Find board name for this task
        const board = boards.find(b => b._id.toString() === task.boardId);
        return {
          id: task._id.toString(),
          user: {
            name: task.createdBy?.name || "Team member",
            initials: task.createdBy?.name?.split(' ').map((n: string) => n[0]).join('') || "TM",
          },
          action: task.updatedAt ? "updated task" : "created task",
          target: task.title,
          time: task.updatedAt || task.createdAt,
          board: board?.title || "Task Board"
        };
      });
    
    // Add recent notes
    const recentNotes = notes.slice(0, 5).map(note => ({
      id: note._id.toString(),
      user: {
        name: note.createdBy?.name || "Team member",
        initials: note.createdBy?.name?.split(' ').map((n: string) => n[0]).join('') || "TM",
      },
      action: note.updatedAt ? "updated note" : "created note",
      target: note.title,
      time: note.updatedAt || note.createdAt,
      board: "Notes"
    }));
    
    // Add recent messages
    const recentMessages = messages.slice(0, 5).map(message => ({
      id: message._id.toString(),
      user: {
        name: message.sender?.name || "Team member",
        initials: message.sender?.name?.split(' ').map((n: string) => n[0]).join('') || "TM",
      },
      action: "sent message",
      target: message.content.length > 30 ? message.content.substring(0, 30) + "..." : message.content,
      time: message.createdAt,
      board: `Chat: ${message.channel}`
    }));
    
    // Combine and sort by time
    recentActivity.push(...recentTasks, ...recentNotes, ...recentMessages);
    recentActivity.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());
    
    // Calculate task completion data for chart
    // Group task completion status by day of week for the last 7 days
    const taskOverviewData = [];
    const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const today = new Date();
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(today.getDate() - i);
      const dayName = daysOfWeek[date.getDay()];
      
      // Filter tasks created/completed on this day
      const dayTasks = tasks.filter(task => {
        const taskDate = new Date(task.createdAt);
        return taskDate.toDateString() === date.toDateString();
      });
      
      const completed = dayTasks.filter(task => task.status === "done").length;
      const inProgress = dayTasks.filter(task => task.status === "in-progress").length;
      const pending = dayTasks.filter(task => task.status === "todo").length;
      
      taskOverviewData.push({
        name: dayName,
        completed,
        inProgress,
        pending
      });
    }

    // Calculate board level stats
    const boardStats = boards.map(board => ({
      id: board._id.toString(),
      title: board.title,
      totalTasks: board.totalTasks || 0,
      completedTasks: board.completedTasks || 0
    }));

    // Return dashboard data
    return NextResponse.json({
      stats: {
        tasks: {
          total: totalTasks,
          completed: completedTasks,
          todo: todoTasks,
          inProgress: inProgressTasks,
          overdue: overdueTasks
        },
        notes: {
          total: notesCount,
          updatedToday: updatedTodayCount
        },
        messages: {
          total: messageCount,
          conversations: conversationCount
        }
      },
      overview: taskOverviewData,
      recentActivity: recentActivity.slice(0, 5),
      boardStats: boardStats,
      team
    });
  } catch (error) {
    console.error("Error fetching team:", error);
    return NextResponse.json(
      { error: "Failed to fetch team data" },
      { status: 500 }
    );
  }
}