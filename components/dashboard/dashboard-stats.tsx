import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, CircleAlert, Clock, FileText, ListTodo, MessageSquare } from "lucide-react";

interface DashboardStatsProps {
  stats: {
    tasks: {
      total: number;
      completed: number;
      todo: number;
      inProgress: number;
      overdue: number;
    };
    notes: {
      total: number;
      updatedToday: number;
    };
    messages: {
      total: number;
      conversations: number;
    };
  };
}

export function DashboardStats({ stats }: DashboardStatsProps) {
  // Calculate task completion percentage
  const completionPercentage = stats.tasks.total > 0 
    ? Math.round((stats.tasks.completed / stats.tasks.total) * 100) 
    : 0;
    
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Tasks
          </CardTitle>
          <ListTodo className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.tasks.total}</div>
          <p className="text-xs text-muted-foreground">
            Total tasks across all boards
          </p>
        </CardContent>
        <CardFooter className="p-2">
          <div className="w-full flex justify-between text-xs">
            <div className="flex items-center">
              <CheckCircle2 className="h-3.5 w-3.5 text-green-500 mr-1" />
              <span>{stats.tasks.completed} completed</span>
            </div>
            <div className="flex items-center">
              <CircleAlert className="h-3.5 w-3.5 text-amber-500 mr-1" />
              <span>{stats.tasks.overdue} overdue</span>
            </div>
          </div>
        </CardFooter>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Notes
          </CardTitle>
          <FileText className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.notes.total}</div>
          <p className="text-xs text-muted-foreground">
            Shared notes and documents
          </p>
        </CardContent>
        <CardFooter className="p-2">
          <div className="w-full flex justify-between text-xs">
            <div className="flex items-center">
              <Clock className="h-3.5 w-3.5 text-blue-500 mr-1" />
              <span>{stats.notes.updatedToday} updated today</span>
            </div>
          </div>
        </CardFooter>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Messages
          </CardTitle>
          <MessageSquare className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.messages.total}</div>
          <p className="text-xs text-muted-foreground">
            Messages in chat
          </p>
        </CardContent>
        <CardFooter className="p-2">
          <div className="w-full flex justify-between text-xs text-muted-foreground">
            <span>Across {stats.messages.conversations} conversations</span>
          </div>
        </CardFooter>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Task Completion
          </CardTitle>
          <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{completionPercentage}%</div>
          <p className="text-xs text-muted-foreground">
            Overall completion rate
          </p>
        </CardContent>
        <CardFooter className="p-2">
          <div className="w-full flex justify-between items-center">
            <div className="bg-slate-100 dark:bg-slate-800 h-2 rounded-full w-full overflow-hidden">
              <div 
                className="bg-green-500 h-full rounded-full" 
                style={{ width: `${completionPercentage}%` }}
              />
            </div>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}