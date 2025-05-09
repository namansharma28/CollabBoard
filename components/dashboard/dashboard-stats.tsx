import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, CircleAlert, Clock, FileText, ListTodo, MessageSquare } from "lucide-react";

export function DashboardStats() {
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
          <div className="text-2xl font-bold">24</div>
          <p className="text-xs text-muted-foreground">
            Total tasks across all boards
          </p>
        </CardContent>
        <CardFooter className="p-2">
          <div className="w-full flex justify-between text-xs">
            <div className="flex items-center">
              <CheckCircle2 className="h-3.5 w-3.5 text-green-500 mr-1" />
              <span>12 completed</span>
            </div>
            <div className="flex items-center">
              <CircleAlert className="h-3.5 w-3.5 text-amber-500 mr-1" />
              <span>5 overdue</span>
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
          <div className="text-2xl font-bold">8</div>
          <p className="text-xs text-muted-foreground">
            Shared notes and documents
          </p>
        </CardContent>
        <CardFooter className="p-2">
          <div className="w-full flex justify-between text-xs">
            <div className="flex items-center">
              <Clock className="h-3.5 w-3.5 text-blue-500 mr-1" />
              <span>3 updated today</span>
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
          <div className="text-2xl font-bold">14</div>
          <p className="text-xs text-muted-foreground">
            Unread messages in chat
          </p>
        </CardContent>
        <CardFooter className="p-2">
          <div className="w-full flex justify-between text-xs text-muted-foreground">
            <span>Across 3 conversations</span>
          </div>
        </CardFooter>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Team Activity
          </CardTitle>
          <ListTodo className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">+18%</div>
          <p className="text-xs text-muted-foreground">
            Increased activity this week
          </p>
        </CardContent>
        <CardFooter className="p-2">
          <div className="w-full flex justify-between text-xs text-green-500">
            <span>↑ From previous week</span>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}