import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { format } from "date-fns";
import { MoreHorizontal, Calendar, Clock, Trash, Flag, Clock as ClockIcon } from "lucide-react";
import { Task } from "@/app/(main)/[teamId]/boards/[boardId]/page";
import { useState } from "react";
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { CalendarIcon } from "lucide-react";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";

interface TaskListProps {
  tasks: Task[];
  onTaskUpdate?: (taskId: string, updates: Partial<Task>) => void;
  onTaskDelete?: (taskId: string) => void;
  isAdmin?: boolean;
}

const PRIORITY_COLORS = {
  low: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
  medium: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
  high: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
};

const STATUS_COLORS = {
  "todo": "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300",
  "in-progress": "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
  "done": "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
};

export function TaskList({ tasks, onTaskUpdate, onTaskDelete, isAdmin = false }: TaskListProps) {
  const params = useParams() || {};
  const teamId = params.teamId as string;
  const boardId = params.boardId as string;
  const { data: session } = useSession();
  const currentUserEmail = session?.user?.email;
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [priorityDialogOpen, setPriorityDialogOpen] = useState(false);
  const [deadlineDialogOpen, setDeadlineDialogOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedPriority, setSelectedPriority] = useState<string>("");

  const handleCheckboxChange = async (task: Task) => {
    const newStatus = task.status === "done" ? "todo" : "done";
    
    try {
      const response = await fetch(`/api/teams/${teamId}/boards/${boardId}/tasks/${task._id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          status: newStatus,
          statusChangeNote: newStatus === "done" 
            ? `${session?.user?.name || "User"} marked this task as complete`
            : `${session?.user?.name || "User"} reopened this task`
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update task status');
      }
      
      const data = await response.json();
      
      // Update the local state through the callback
      if (onTaskUpdate) {
        onTaskUpdate(task._id, data.task);
      }
    } catch (error) {
      console.error('Error updating task status:', error);
    }
  };

  const handleStartProgress = async (task: Task) => {
    try {
      const response = await fetch(`/api/teams/${teamId}/boards/${boardId}/tasks/${task._id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          status: "in-progress",
          statusChangeNote: `${session?.user?.name || "User"} has started working on this task`
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update task status');
      }
      
      const data = await response.json();
      
      // Update the local state through the callback
      if (onTaskUpdate) {
        onTaskUpdate(task._id, data.task);
      }
    } catch (error) {
      console.error('Error updating task status:', error);
    }
  };

  const handleDeleteTask = async () => {
    if (!selectedTask) return;
    
    try {
      const response = await fetch(`/api/teams/${teamId}/boards/${boardId}/tasks/${selectedTask._id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete task');
      }
      
      // Close the confirm dialog
      setDeleteConfirmOpen(false);
      
      // Update the parent component's state
      if (onTaskDelete) {
        onTaskDelete(selectedTask._id);
      }
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  const handleChangePriority = async () => {
    if (!selectedTask || !selectedPriority) return;
    
    try {
      const response = await fetch(`/api/teams/${teamId}/boards/${boardId}/tasks/${selectedTask._id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          priority: selectedPriority,
          statusChangeNote: `${session?.user?.name || "User"} changed priority to ${selectedPriority}`
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update task priority');
      }
      
      const data = await response.json();
      
      // Update the local state through the callback
      if (onTaskUpdate) {
        onTaskUpdate(selectedTask._id, data.task);
      }
      
      // Close the dialog
      setPriorityDialogOpen(false);
    } catch (error) {
      console.error('Error updating task priority:', error);
    }
  };

  const handleChangeDeadline = async () => {
    if (!selectedTask || !selectedDate) return;
    
    try {
      const response = await fetch(`/api/teams/${teamId}/boards/${boardId}/tasks/${selectedTask._id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          dueDate: selectedDate.toISOString(),
          statusChangeNote: `${session?.user?.name || "User"} set a deadline: ${format(selectedDate, "PPP")}`
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update task deadline');
      }
      
      const data = await response.json();
      
      // Update the local state through the callback
      if (onTaskUpdate) {
        onTaskUpdate(selectedTask._id, data.task);
      }
      
      // Close the dialog
      setDeadlineDialogOpen(false);
    } catch (error) {
      console.error('Error updating task deadline:', error);
    }
  };

  const canDelete = (task: Task) => {
    if (isAdmin) return true;
    if (task.createdBy?.email === currentUserEmail) return true;
    return false;
  };

  if (tasks.length === 0) {
    return (
      <div className="text-center p-12 border rounded-lg bg-muted/20">
        <h3 className="text-lg font-medium mb-2">No tasks yet</h3>
        <p className="text-muted-foreground mb-4">Create your first task to get started.</p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
        {tasks.map((task) => (
          <Card key={task._id} className="overflow-hidden">
            <CardHeader className="p-4 pb-0 flex justify-between items-start">
              <div className="flex items-start gap-2">
                <Checkbox 
                  id={`task-${task._id}`} 
                  checked={task.status === "done"} 
                  onCheckedChange={() => handleCheckboxChange(task)}
                />
                <div>
                  <label
                    htmlFor={`task-${task._id}`}
                    className={`font-medium text-base ${task.status === "done" ? "line-through text-muted-foreground" : ""}`}
                  >
                    {task.title}
                  </label>
                  {task.description && (
                    <p className="text-sm text-muted-foreground mt-1">{task.description}</p>
                  )}
                  {task.statusChangeNote && (
                    <p className="text-xs text-muted-foreground mt-1 italic">{task.statusChangeNote}</p>
                  )}
                </div>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Task Actions</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  
                  {task.status === "todo" && (
                    <DropdownMenuItem onClick={() => {
                      setSelectedTask(task);
                      handleStartProgress(task);
                    }}>
                      <Clock className="mr-2 h-4 w-4" />
                      <span>Start Progress</span>
                    </DropdownMenuItem>
                  )}
                  
                  <DropdownMenuItem onClick={() => {
                    setSelectedTask(task);
                    setSelectedPriority(task.priority || "medium");
                    setPriorityDialogOpen(true);
                  }}>
                    <Flag className="mr-2 h-4 w-4" />
                    <span>Change Priority</span>
                  </DropdownMenuItem>
                  
                  <DropdownMenuItem onClick={() => {
                    setSelectedTask(task);
                    setSelectedDate(task.dueDate ? new Date(task.dueDate) : undefined);
                    setDeadlineDialogOpen(true);
                  }}>
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    <span>{task.dueDate ? "Change Deadline" : "Add Deadline"}</span>
                  </DropdownMenuItem>
                  
                  {canDelete(task) && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem 
                        className="text-red-600"
                        onClick={() => {
                          setSelectedTask(task);
                          setDeleteConfirmOpen(true);
                        }}
                      >
                        <Trash className="mr-2 h-4 w-4" />
                        <span>Delete Task</span>
                      </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </CardHeader>
            <CardContent className="p-4 pt-3">
              <div className="flex flex-wrap gap-2 mb-3">
                <Badge className={STATUS_COLORS[task.status]}>
                  {task.status === "todo" ? "To Do" : 
                  task.status === "in-progress" ? "In Progress" : "Done"}
                </Badge>
                {task.priority && (
                  <Badge variant="outline" className={PRIORITY_COLORS[task.priority]}>
                    {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)} Priority
                  </Badge>
                )}
              </div>
            </CardContent>
            <CardFooter className="p-4 pt-0 flex justify-between items-center">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                {task.dueDate && (
                  <div className="flex items-center">
                    <Calendar className="h-3 w-3 mr-1" />
                    {format(new Date(task.dueDate), "MMM d")}
                  </div>
                )}
                <div className="flex items-center">
                  <Clock className="h-3 w-3 mr-1" />
                  {format(new Date(task.createdAt), "MMM d")}
                </div>
              </div>
              
              {task.assignee && (
                <Avatar className="h-6 w-6">
                  <AvatarImage src={task.assignee.avatar} alt={task.assignee.name} />
                  <AvatarFallback className="text-xs">{task.assignee.initials}</AvatarFallback>
                </Avatar>
              )}
            </CardFooter>
          </Card>
        ))}
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Delete Task</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this task? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirmOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteTask}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Change Priority Dialog */}
      <Dialog open={priorityDialogOpen} onOpenChange={setPriorityDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Change Priority</DialogTitle>
            <DialogDescription>
              Set the priority level for this task.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Select
              value={selectedPriority}
              onValueChange={setSelectedPriority}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPriorityDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleChangePriority}>
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Change Deadline Dialog */}
      <Dialog open={deadlineDialogOpen} onOpenChange={setDeadlineDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Set Deadline</DialogTitle>
            <DialogDescription>
              Choose a deadline for this task.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !selectedDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {selectedDate ? format(selectedDate, "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <CalendarComponent
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeadlineDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleChangeDeadline}>
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
} 