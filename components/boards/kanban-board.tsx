import React, { useState, useEffect } from "react";
import { Task } from "@/app/(main)/[teamId]/boards/[boardId]/page";
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  horizontalListSortingStrategy,
} from "@dnd-kit/sortable";
import { KanbanColumn } from "./kanban-column";
import { KanbanTask } from "./kanban-task";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/components/ui/use-toast";

const COLUMNS = [
  { id: "todo" as const, title: "To Do" },
  { id: "in-progress" as const, title: "In Progress" },
  { id: "done" as const, title: "Done" },
] as const;

type ColumnId = typeof COLUMNS[number]["id"];

interface KanbanBoardProps {
  tasks: Task[];
  onTaskUpdate: (taskId: string, updatedTask: Partial<Task>) => void;
  onTaskDelete: (taskId: string) => void;
  isAdmin?: boolean;
}

export function KanbanBoard({ tasks, onTaskUpdate, onTaskDelete, isAdmin = false }: KanbanBoardProps) {
  const [activeId, setActiveId] = React.useState<string | null>(null);
  const [activeTask, setActiveTask] = React.useState<Task | null>(null);
  const [focusedColumn, setFocusedColumn] = useState<string | null>(null);
  const [focusedTaskIndex, setFocusedTaskIndex] = useState<number>(0);
  const { toast } = useToast();

  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: {
        distance: 10,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 250,
        tolerance: 5,
      },
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    setActiveId(active.id as string);
    const task = tasks.find((t) => t._id === active.id);
    if (task) {
      setActiveTask(task);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const newStatus = over.id as ColumnId;

      if (COLUMNS.some((col) => col.id === newStatus)) {
        onTaskUpdate(active.id as string, { status: newStatus });
      }
    }

    setActiveId(null);
    setActiveTask(null);
  };

  const handleDragCancel = () => {
    setActiveId(null);
    setActiveTask(null);
  };

  // Set up keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Focus columns with number keys
      if (e.altKey) {
        if (e.key === '1') {
          e.preventDefault();
          setFocusedColumn("todo");
          setFocusedTaskIndex(0);
        } else if (e.key === '2') {
          e.preventDefault();
          setFocusedColumn("in-progress");
          setFocusedTaskIndex(0);
        } else if (e.key === '3') {
          e.preventDefault();
          setFocusedColumn("done");
          setFocusedTaskIndex(0);
        }
      }

      if (focusedColumn) {
        const currentColumnTasks = 
          focusedColumn === "todo" ? tasks.filter(task => task.status === "todo") : 
          focusedColumn === "in-progress" ? tasks.filter(task => task.status === "in-progress") : 
          tasks.filter(task => task.status === "done");
        
        // Navigate tasks vertically
        if (e.key === 'j' || e.key === 'ArrowDown') {
          e.preventDefault();
          setFocusedTaskIndex(prev => Math.min(prev + 1, currentColumnTasks.length - 1));
        } else if (e.key === 'k' || e.key === 'ArrowUp') {
          e.preventDefault();
          setFocusedTaskIndex(prev => Math.max(prev - 1, 0));
        }
        
        // Move tasks horizontally
        if (currentColumnTasks.length > 0 && focusedTaskIndex < currentColumnTasks.length) {
          const currentTask = currentColumnTasks[focusedTaskIndex];
          
          if (e.key === 'h' || e.key === 'ArrowLeft') {
            e.preventDefault();
            // Move left
            if (focusedColumn === "in-progress") {
              onTaskUpdate(currentTask._id, { status: "todo" });
              setFocusedColumn("todo");
              toast({ title: "Task moved to To Do" });
            } else if (focusedColumn === "done") {
              onTaskUpdate(currentTask._id, { status: "in-progress" });
              setFocusedColumn("in-progress");
              toast({ title: "Task moved to In Progress" });
            }
          } else if (e.key === 'l' || e.key === 'ArrowRight') {
            e.preventDefault();
            // Move right
            if (focusedColumn === "todo") {
              onTaskUpdate(currentTask._id, { status: "in-progress" });
              setFocusedColumn("in-progress");
              toast({ title: "Task moved to In Progress" });
            } else if (focusedColumn === "in-progress") {
              onTaskUpdate(currentTask._id, { status: "done" });
              setFocusedColumn("done");
              toast({ title: "Task marked as Done" });
            }
          }
          
          // Delete with 'd'
          if (e.key === 'd' && isAdmin) {
            e.preventDefault();
            if (window.confirm(`Are you sure you want to delete task: ${currentTask.title}?`)) {
              onTaskDelete(currentTask._id);
              toast({ title: "Task deleted" });
            }
          }
        }
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [tasks, focusedColumn, focusedTaskIndex, onTaskUpdate, onTaskDelete, isAdmin, toast]);

  return (
    <div className="h-[calc(100vh-12rem)]">
      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragCancel={handleDragCancel}
      >
        <div className="flex h-full gap-4">
          {COLUMNS.map((column) => {
            const columnTasks = tasks.filter((task) => task.status === column.id);
            return (
              <KanbanColumn
                key={column.id}
                id={column.id}
                title={column.title}
                tasks={columnTasks}
                onTaskUpdate={onTaskUpdate}
                onTaskDelete={onTaskDelete}
                isAdmin={isAdmin}
                isFocused={focusedColumn === column.id}
                focusedTaskIndex={focusedColumn === column.id ? focusedTaskIndex : -1}
                onFocus={() => setFocusedColumn(column.id)}
              />
            );
          })}
        </div>

        <DragOverlay>
          {activeTask ? (
            <KanbanTask
              task={activeTask}
              isDragging
              onTaskUpdate={onTaskUpdate}
              onTaskDelete={onTaskDelete}
              isAdmin={isAdmin}
            />
          ) : null}
        </DragOverlay>
      </DndContext>

      <div className="col-span-1 md:col-span-3 mt-4 text-xs text-muted-foreground border-t pt-2">
        <p className="mb-1">Keyboard shortcuts:</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <p className="font-semibold">Navigation:</p>
            <ul className="list-disc list-inside">
              <li>Alt+1: Focus To Do column</li>
              <li>Alt+2: Focus In Progress column</li>
              <li>Alt+3: Focus Done column</li>
              <li>↑/k, ↓/j: Navigate tasks in column</li>
            </ul>
          </div>
          <div>
            <p className="font-semibold">Task Actions:</p>
            <ul className="list-disc list-inside">
              <li>←/h, →/l: Move task between columns</li>
              {isAdmin && <li>d: Delete task</li>}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
