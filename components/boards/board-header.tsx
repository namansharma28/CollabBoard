import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MoreHorizontal, Star, LayoutGrid, List } from "lucide-react";
import { BoardProps } from "./boards-list";
import { Progress } from "@/components/ui/progress";
import { useParams } from "next/navigation";

interface BoardHeaderProps {
  board: BoardProps;
  isAdmin: boolean;
  viewMode: 'board' | 'list' | null;
  onViewModeChange: (mode: 'board' | 'list') => void;
}

export function BoardHeader({ board, isAdmin, viewMode, onViewModeChange }: BoardHeaderProps) {
  const params = useParams() || {};
  
  const tasksCount = {
    total: board.tasks?.length || 0,
    completed: board.tasks?.filter(task => task.status === 'done').length || 0
  };

  const completionPercentage = tasksCount.total > 0 
    ? Math.round((tasksCount.completed / tasksCount.total) * 100) 
    : 0;

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">{board.title}</h1>
            {board.isStarred && (
              <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
            )}
          </div>
          <p className="text-muted-foreground mt-1 text-sm sm:text-base">{board.description}</p>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2">
            <Button 
              variant={viewMode === 'board' ? 'default' : 'outline'} 
              size="sm"
              onClick={() => onViewModeChange('board')}
              className="h-8"
            >
              <LayoutGrid className="h-4 w-4" />
              <span className="hidden sm:inline ml-2">Board</span>
            </Button>
            <Button 
              variant={viewMode === 'list' ? 'default' : 'outline'} 
              size="sm"
              onClick={() => onViewModeChange('list')}
              className="h-8"
            >
              <List className="h-4 w-4" />
              <span className="hidden sm:inline ml-2">List</span>
            </Button>
          </div>
          <Button variant="outline" size="icon" className="h-8 w-8">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      <div className="flex flex-col sm:flex-row flex-wrap items-start sm:items-center gap-4">
        <Badge variant="secondary">{board.category || "General"}</Badge>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1">
            <div className="text-sm font-medium">Progress:</div>
            <div className="text-sm font-medium text-muted-foreground">
              {completionPercentage}%
            </div>
          </div>
          
          <div className="w-32 sm:w-40 h-2">
            <Progress value={completionPercentage} className="h-2" />
          </div>
        </div>
        
        <div className="flex items-center gap-1 sm:ml-auto">
          <div className="text-sm font-medium">Team:</div>
          <div className="flex -space-x-2">
            {(board.members || []).slice(0, 3).map((member) => (
              <Avatar key={member.id} className="border-2 border-background h-7 w-7">
                <AvatarImage src={member.avatar} alt={member.name} />
                <AvatarFallback>{member.initials}</AvatarFallback>
              </Avatar>
            ))}
            {(board.members?.length || 0) > 3 && (
              <div className="flex items-center justify-center bg-muted text-muted-foreground border-2 border-background rounded-full h-7 w-7 text-xs">
                +{(board.members?.length || 0) - 3}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 