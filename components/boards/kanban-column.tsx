import React from "react";
import { Task } from "@/app/(main)/[teamId]/boards/[boardId]/page";
import { KanbanTask } from "./kanban-task";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useDroppable } from "@dnd-kit/core";

interface KanbanColumnProps {
  id: string;
  title: string;
  tasks: Task[];
  onTaskUpdate: (taskId: string, updatedTask: Partial<Task>) => void;
  onTaskDelete: (taskId: string) => void;
  isAdmin: boolean;
  isFocused?: boolean;
  focusedTaskIndex?: number;
  onFocus?: () => void;
}

export function KanbanColumn({
  id,
  title,
  tasks,
  onTaskUpdate,
  onTaskDelete,
  isAdmin,
  isFocused = false,
  focusedTaskIndex = -1,
  onFocus,
}: KanbanColumnProps) {
  const { setNodeRef } = useDroppable({
    id: id,
  });

  return (
    <div 
      ref={setNodeRef}
      className={`flex-1 min-w-[300px] bg-muted rounded-lg p-4 ${isFocused ? 'ring-2 ring-primary' : ''}`}
      onClick={onFocus}
    >
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-semibold text-sm">{title}</h3>
        <div className="text-muted-foreground text-sm">{tasks.length}</div>
      </div>
      
      <ScrollArea className="h-[calc(100vh-16rem)]">
        <div className="space-y-2 pr-2">
          {tasks.length === 0 ? (
            <div className="h-20 border border-dashed rounded-md flex items-center justify-center">
              <p className="text-sm text-muted-foreground">No tasks</p>
            </div>
          ) : (
            tasks.map((task, index) => (
              <KanbanTask
                key={task._id}
                task={task}
                onUpdate={(updatedTask) => onTaskUpdate(task._id, updatedTask)}
                onDelete={() => onTaskDelete(task._id)}
                isAdmin={isAdmin}
                isFocused={isFocused && focusedTaskIndex === index}
              />
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
} 