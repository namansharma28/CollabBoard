"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BoardHeader } from "@/components/boards/board-header";
import { BoardProps } from "@/components/boards/boards-list";
import { TaskList } from "@/components/boards/task-list";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { CreateTaskDialog } from "@/components/boards/create-task-dialog";
import { useSession } from "next-auth/react";
import { useSocket } from "@/hooks/useSocket";
import { toast } from "@/components/ui/use-toast";

export interface Task {
  _id: string;
  title: string;
  description?: string;
  status: "todo" | "in-progress" | "done";
  priority?: "low" | "medium" | "high";
  assignee?: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
    initials: string;
  };
  dueDate?: string;
  createdAt: string;
  boardId: string;
  createdBy?: {
    email: string;
    name: string;
  };
  updatedAt?: string;
  updatedBy?: {
    email: string;
    name: string;
  };
  statusChangeNote?: string;
}

export default function BoardPage() {
  const params = useParams() || {};
  const teamId = params.teamId as string;
  const boardId = params.boardId as string;
  const { data: session } = useSession();
  const { socket, status: socketStatus, emitEvent, EVENTS } = useSocket(boardId);
  
  const [board, setBoard] = useState<BoardProps | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [createTaskOpen, setCreateTaskOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("all");
  const [isAdmin, setIsAdmin] = useState(false);

  // Function to fetch board and tasks
  const fetchBoardAndTasks = async () => {
    try {
      setLoading(true);
      
      // Fetch board details
      const boardResponse = await fetch(`/api/teams/${teamId}/boards/${boardId}`);
      if (!boardResponse.ok) {
        throw new Error('Failed to fetch board details');
      }
      const boardData = await boardResponse.json();
      setBoard(boardData.board);
      
      // Check if user is admin (simplified - in a real app you'd check against team roles)
      setIsAdmin(boardData.board.createdBy?.email === session?.user?.email);
      
      // Fetch tasks
      const tasksResponse = await fetch(`/api/teams/${teamId}/boards/${boardId}/tasks`);
      if (!tasksResponse.ok) {
        throw new Error('Failed to fetch tasks');
      }
      const tasksData = await tasksResponse.json();
      setTasks(tasksData.tasks);
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: "Failed to load board data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Initial data load
  useEffect(() => {
    if (session) {
      fetchBoardAndTasks();
    }
  }, [teamId, boardId, session]);

  // Setup socket event listeners
  useEffect(() => {
    if (!socket) return;

    // Handle new task created by another user
    const handleTaskCreated = (data: { task: Task, boardId: string }) => {
      if (data.boardId === boardId) {
        // Make sure we don't duplicate tasks
        setTasks(current => {
          if (current.some(task => task._id === data.task._id)) {
            return current;
          }
          return [...current, data.task];
        });
        
        toast({
          title: "New Task Added",
          description: `${data.task.createdBy?.name || 'Someone'} added a new task: ${data.task.title}`,
        });
      }
    };

    // Handle task updated by another user
    const handleTaskUpdated = (data: { task: Task, boardId: string }) => {
      if (data.boardId === boardId) {
        setTasks(current => 
          current.map(task => task._id === data.task._id ? data.task : task)
        );
        
        // Show toast notification
        if (data.task.updatedBy?.email !== session?.user?.email) {
          toast({
            title: "Task Updated",
            description: `${data.task.updatedBy?.name || 'Someone'} updated a task: ${data.task.title}`,
          });
        }
      }
    };

    // Handle task deleted by another user
    const handleTaskDeleted = (data: { taskId: string, boardId: string, task: Task }) => {
      if (data.boardId === boardId) {
        setTasks(current => current.filter(task => task._id !== data.taskId));
        
        // Show toast notification
        if (data.task.updatedBy?.email !== session?.user?.email) {
          toast({
            title: "Task Deleted",
            description: `A task was removed: ${data.task.title}`,
          });
        }
      }
    };

    // Handle board updates
    const handleBoardUpdated = (data: { board: BoardProps }) => {
      setBoard(data.board);
    };

    // Register event listeners
    socket.on(EVENTS.TASK_CREATED, handleTaskCreated);
    socket.on(EVENTS.TASK_UPDATED, handleTaskUpdated);
    socket.on(EVENTS.TASK_DELETED, handleTaskDeleted);
    socket.on(EVENTS.BOARD_UPDATED, handleBoardUpdated);

    // Cleanup
    return () => {
      socket.off(EVENTS.TASK_CREATED, handleTaskCreated);
      socket.off(EVENTS.TASK_UPDATED, handleTaskUpdated);
      socket.off(EVENTS.TASK_DELETED, handleTaskDeleted);
      socket.off(EVENTS.BOARD_UPDATED, handleBoardUpdated);
    };
  }, [socket, boardId, EVENTS, session?.user?.email]);

  const handleCreateTask = async (newTask: Omit<Task, '_id' | 'createdAt'>) => {
    try {
      const response = await fetch(`/api/teams/${teamId}/boards/${boardId}/tasks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newTask),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create task');
      }
      
      const data = await response.json();
      
      // Update local state (the socket event will handle real-time updates for other users)
      setTasks([...tasks, data.task]);
      setCreateTaskOpen(false);
    } catch (error) {
      console.error('Error creating task:', error);
      toast({
        title: "Error",
        description: "Failed to create task",
        variant: "destructive"
      });
    }
  };

  const handleTaskUpdate = (taskId: string, updatedTask: Partial<Task>) => {
    // Update local state immediately for better UX
    setTasks(tasks.map(task => 
      task._id === taskId 
        ? { ...task, ...updatedTask } 
        : task
    ));
    
    // Update board stats if necessary
    if (board && updatedTask.status) {
      const taskStatusChanged = tasks.find(t => t._id === taskId)?.status !== updatedTask.status;
      if (taskStatusChanged) {
        const updatedBoard = { ...board };
        
        // Update completed count if status changes to/from "done"
        if (updatedTask.status === "done") {
          updatedBoard.completedTasks = (updatedBoard.completedTasks || 0) + 1;
        } else if (tasks.find(t => t._id === taskId)?.status === "done") {
          updatedBoard.completedTasks = Math.max(0, (updatedBoard.completedTasks || 0) - 1);
        }
        
        setBoard(updatedBoard);
      }
    }
  };

  const handleTaskDelete = (taskId: string) => {
    // Update local state immediately for better UX
    const deletedTask = tasks.find(task => task._id === taskId);
    
    // Remove task from state
    setTasks(tasks.filter(task => task._id !== taskId));
    
    // Update board stats
    if (board && deletedTask) {
      const updatedBoard = { ...board };
      updatedBoard.totalTasks = Math.max(0, (updatedBoard.totalTasks || 0) - 1);
      
      if (deletedTask.status === "done") {
        updatedBoard.completedTasks = Math.max(0, (updatedBoard.completedTasks || 0) - 1);
      }
      
      setBoard(updatedBoard);
    }
  };

  const filteredTasks = activeTab === 'all' 
    ? tasks 
    : tasks.filter(task => task.status === activeTab);

  if (loading) return <div>Loading...</div>;
  if (!board) return <div>Board not found</div>;

  return (
    <div className="container mx-auto px-4 py-6">
      <BoardHeader 
        board={board} 
        tasksCount={{
          total: tasks.length,
          completed: tasks.filter(task => task.status === 'done').length
        }}
      />
      
      <div className="flex justify-between items-center mt-8 mb-4">
        <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList>
            <TabsTrigger value="all">All Tasks</TabsTrigger>
            <TabsTrigger value="todo">To Do</TabsTrigger>
            <TabsTrigger value="in-progress">In Progress</TabsTrigger>
            <TabsTrigger value="done">Completed</TabsTrigger>
          </TabsList>
        </Tabs>
        
        <Button onClick={() => setCreateTaskOpen(true)} className="ml-4">
          <Plus className="h-4 w-4 mr-2" />
          Add Task
        </Button>
      </div>
      
      {socketStatus === 'connected' && (
        <div className="text-xs text-green-600 mb-2 flex items-center">
          <div className="h-2 w-2 bg-green-600 rounded-full mr-1"></div>
          Real-time updates active
        </div>
      )}
      
      <TaskList 
        tasks={filteredTasks} 
        onTaskUpdate={handleTaskUpdate}
        onTaskDelete={handleTaskDelete}
        isAdmin={isAdmin}
      />
      
      <CreateTaskDialog 
        open={createTaskOpen} 
        onOpenChange={setCreateTaskOpen} 
        onCreateTask={handleCreateTask}
        boardId={boardId}
        teamId={teamId}
      />
    </div>
  );
} 