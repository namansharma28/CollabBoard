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
import { KanbanBoard } from '@/components/boards/kanban-board';
import { LoadingPage } from "@/components/ui/loading-page";
import { Task } from "@/lib/models/task";

export default function BoardPage() {
  const params = useParams() || {};
  const teamId = params.teamId as string;
  const boardId = params.boardId as string;
  const { data: session } = useSession();
  const { socket, status: socketStatus, emitEvent, EVENTS } = useSocket(boardId);
  
  const [board, setBoard] = useState<{
    title: string;
    description?: string;
    isStarred?: boolean;
    category?: string;
    members?: Array<{
      id: string;
      name: string;
      avatar?: string;
      initials: string;
    }>;
    tasks?: Task[];
    completedTasks?: number;
    totalTasks?: number;
  } | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [createTaskOpen, setCreateTaskOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("all");
  const [isAdmin, setIsAdmin] = useState(false);
  const [viewMode, setViewMode] = useState<'board' | 'list' | null>(null);

  // Function to fetch board and tasks
  const fetchBoardAndTasks = async () => {
    try {
      if (!session?.user?.email) {
        console.log('No session found, waiting for session...');
        return;
      }

      setLoading(true);
      console.log('Fetching board with session:', session.user.email);
      
      // Fetch board details
      const boardResponse = await fetch(`/api/teams/${teamId}/boards/${boardId}`, {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      if (!boardResponse.ok) {
        const errorData = await boardResponse.json();
        console.error('Board fetch error:', {
          status: boardResponse.status,
          statusText: boardResponse.statusText,
          error: errorData,
          url: `/api/teams/${teamId}/boards/${boardId}`
        });
        
        // Show more specific error message
        let errorMessage = 'Failed to load board';
        if (boardResponse.status === 404) {
          if (errorData.details) {
            errorMessage = `Board not found in this team. Board belongs to team ${errorData.details.boardTeamId} but you're trying to access it from team ${errorData.details.requestedTeamId}`;
          } else {
            errorMessage = 'Board not found. It may have been deleted or you may not have access.';
          }
        } else if (boardResponse.status === 401) {
          errorMessage = 'Please sign in to view this board';
        } else if (boardResponse.status === 403) {
          errorMessage = 'You do not have permission to view this board';
        }
        
        throw new Error(errorData.error || errorMessage);
      }
      
      const boardData = await boardResponse.json();
      console.log('Board data received:', boardData);
      
      if (!boardData.board) {
        throw new Error('Invalid board data received from server');
      }
      
      setBoard(boardData.board);
      
      // Check if user is admin (simplified - in a real app you'd check against team roles)
      setIsAdmin(boardData.board.createdBy?.email === session.user.email);
      
      // Fetch tasks
      const tasksResponse = await fetch(`/api/teams/${teamId}/boards/${boardId}/tasks`, {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      if (!tasksResponse.ok) {
        const errorData = await tasksResponse.json();
        console.error('Tasks fetch error:', {
          status: tasksResponse.status,
          statusText: tasksResponse.statusText,
          error: errorData
        });
        throw new Error(errorData.error || `Failed to fetch tasks (${tasksResponse.status})`);
      }
      
      const tasksData = await tasksResponse.json();
      setTasks(tasksData.tasks);
    } catch (error) {
      console.error('Error in fetchBoardAndTasks:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to load board data",
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

  // Setup keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Alt+N to create a new task
      if (e.altKey && e.key === 'n') {
        e.preventDefault();
        setCreateTaskOpen(true);
      }
      
      // Alt+V to toggle between board and list views
      if (e.altKey && e.key === 'v') {
        e.preventDefault();
        handleToggleView(viewMode === 'board' ? 'list' : 'board');
      }
      
      // Alt+1-4 to switch between task filters
      if (e.altKey && e.key === '1') {
        e.preventDefault();
        setActiveTab('all');
      } else if (e.altKey && e.key === '2') {
        e.preventDefault();
        setActiveTab('todo');
      } else if (e.altKey && e.key === '3') {
        e.preventDefault();
        setActiveTab('in-progress');
      } else if (e.altKey && e.key === '4') {
        e.preventDefault();
        setActiveTab('done');
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [viewMode]);

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

  // Fetch team settings for defaultBoardView
  useEffect(() => {
    const fetchDefaultView = async () => {
      if (!teamId) return;
      // Check localStorage first
      const saved = typeof window !== 'undefined' && localStorage.getItem(`boardView_${teamId}`);
      if (saved === 'board' || saved === 'list') {
        setViewMode(saved);
        return;
      }
      
      // Default to board view if no preference is saved
      setViewMode('board');
    };
    fetchDefaultView();
  }, [teamId]);

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

  // Add toggle handler
  const handleToggleView = (mode: 'board' | 'list') => {
    setViewMode(mode);
    if (typeof window !== 'undefined') {
      localStorage.setItem(`boardView_${teamId}`, mode);
    }
  };

  if (loading) return <div>
    <LoadingPage />
  </div>;
  if (!board) return <div>Board not found</div>;
  if (!viewMode) return <div>Loading board view...</div>;

  return (
    <div className="flex flex-col space-y-6">
      <BoardHeader 
        board={board} 
        isAdmin={isAdmin}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        onUpdate={(updatedBoard) => setBoard(updatedBoard)}
      />

      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          {viewMode === 'list' && (
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full sm:w-auto">
              <TabsList className="w-full sm:w-auto grid grid-cols-4 sm:flex">
                <TabsTrigger value="all" className="text-xs sm:text-sm">All Tasks</TabsTrigger>
                <TabsTrigger value="todo" className="text-xs sm:text-sm">To Do</TabsTrigger>
                <TabsTrigger value="in-progress" className="text-xs sm:text-sm">In Progress</TabsTrigger>
                <TabsTrigger value="done" className="text-xs sm:text-sm">Done</TabsTrigger>
              </TabsList>
            </Tabs>
          )}

          <Button 
            onClick={() => setCreateTaskOpen(true)}
            className={`${viewMode === 'list' ? 'w-full sm:w-auto' : 'ml-auto'}`}
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Task
          </Button>
        </div>

        {viewMode === 'board' ? (
          <KanbanBoard 
            tasks={tasks}
            onTaskUpdate={handleTaskUpdate}
            onTaskDelete={handleTaskDelete}
            activeTab={activeTab}
            isAdmin={isAdmin}
          />
        ) : (
          <TaskList 
            tasks={tasks}
            onTaskUpdate={handleTaskUpdate}
            onTaskDelete={handleTaskDelete}
            activeTab={activeTab}
            isAdmin={isAdmin}
          />
        )}
      </div>

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