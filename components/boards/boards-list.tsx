import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Star } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";

// Mock data will be used as fallback if no boards are provided
const mockBoards = [
  {
    _id: "1",
    title: "Website Redesign",
    description: "Tasks for the company website redesign project",
    category: "Development",
    totalTasks: 14,
    completedTasks: 8,
    members: [
      { id: "1", name: "John Doe", avatar: "/avatars/01.png", initials: "JD" },
      { id: "2", name: "Sarah Kim", avatar: "/avatars/02.png", initials: "SK" },
      { id: "3", name: "Michael Brown", avatar: "/avatars/03.png", initials: "MB" },
    ],
    lastUpdated: "2 hours ago",
    isStarred: true,
    teamId: "team1"
  },
  {
    _id: "2",
    title: "Marketing Campaign",
    description: "Planning and execution of Q2 marketing campaign",
    category: "Marketing",
    totalTasks: 18,
    completedTasks: 12,
    members: [
      { id: "2", name: "Sarah Kim", avatar: "/avatars/02.png", initials: "SK" },
      { id: "4", name: "Emily Chen", avatar: "/avatars/04.png", initials: "EC" },
    ],
    lastUpdated: "5 hours ago",
    isStarred: false,
    teamId: "team1"
  },
  {
    _id: "3",
    title: "Mobile App Development",
    description: "Building our new mobile application",
    category: "Development",
    totalTasks: 24,
    completedTasks: 10,
    members: [
      { id: "1", name: "John Doe", avatar: "/avatars/01.png", initials: "JD" },
      { id: "3", name: "Michael Brown", avatar: "/avatars/03.png", initials: "MB" },
      { id: "5", name: "James Wilson", avatar: "/avatars/05.png", initials: "JW" },
    ],
    lastUpdated: "Yesterday",
    isStarred: true,
    teamId: "team1"
  },
  {
    _id: "4",
    title: "Product Roadmap",
    description: "Strategic planning for product development",
    category: "Planning",
    totalTasks: 10,
    completedTasks: 5,
    members: [
      { id: "1", name: "John Doe", avatar: "/avatars/01.png", initials: "JD" },
      { id: "2", name: "Sarah Kim", avatar: "/avatars/02.png", initials: "SK" },
      { id: "4", name: "Emily Chen", avatar: "/avatars/04.png", initials: "EC" },
      { id: "5", name: "James Wilson", avatar: "/avatars/05.png", initials: "JW" },
    ],
    lastUpdated: "2 days ago",
    isStarred: false,
    teamId: "team1"
  },
  {
    _id: "5",
    title: "UI Components",
    description: "Design and develop reusable UI components",
    category: "Design",
    totalTasks: 16,
    completedTasks: 12,
    members: [
      { id: "4", name: "Emily Chen", avatar: "/avatars/04.png", initials: "EC" },
      { id: "5", name: "James Wilson", avatar: "/avatars/05.png", initials: "JW" },
    ],
    lastUpdated: "3 days ago",
    isStarred: false,
    teamId: "team1"
  },
  {
    _id: "6",
    title: "Content Calendar",
    description: "Blog and social media content planning",
    category: "Marketing",
    totalTasks: 20,
    completedTasks: 15,
    members: [
      { id: "2", name: "Sarah Kim", avatar: "/avatars/02.png", initials: "SK" },
    ],
    lastUpdated: "5 days ago",
    isStarred: false,
    teamId: "team1"
  },
];

export interface BoardProps {
  _id: string;
  title: string;
  description: string;
  category?: string;
  totalTasks?: number;
  completedTasks?: number;
  members?: Array<{
    id: string;
    name: string;
    avatar?: string;
    initials: string;
  }>;
  lastUpdated?: string;
  isStarred?: boolean;
  teamId: string;
}

interface BoardsListProps {
  boards?: BoardProps[];
}

export function BoardsList({ boards = mockBoards }: BoardsListProps) {
  const params = useParams() || {};
  const teamId = params.teamId as string || "default";

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pb-4">
      {boards.map((board) => (
        <Link href={`/${teamId}/boards/${board._id}`} key={board._id} className="block">
          <Card className="h-full hover:border-primary/50 transition-colors">
            <CardHeader className="relative pb-2">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    {board.title}
                    {board.isStarred && (
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    )}
                  </CardTitle>
                  <CardDescription className="mt-1">
                    {board.description}
                  </CardDescription>
                </div>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pb-2">
              <div className="flex items-center mb-4">
                <Badge variant="secondary">{board.category || "General"}</Badge>
                <div className="ml-auto text-sm text-muted-foreground">
                  {board.completedTasks || 0}/{board.totalTasks || 0} tasks
                </div>
              </div>
              <div className="w-full bg-secondary rounded-full h-2">
                <div
                  className="bg-primary rounded-full h-2"
                  style={{
                    width: `${(((board.completedTasks || 0) / (board.totalTasks || 1)) * 100)}%`,
                  }}
                ></div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <div className="flex -space-x-2">
                {(board.members || []).slice(0, 3).map((member) => (
                  <Avatar key={member.id} className="border-2 border-background h-8 w-8">
                    <AvatarImage src={member.avatar} alt={member.name} />
                    <AvatarFallback>{member.initials}</AvatarFallback>
                  </Avatar>
                ))}
                {(board.members?.length || 0) > 3 && (
                  <div className="flex items-center justify-center bg-muted text-muted-foreground border-2 border-background rounded-full h-8 w-8 text-xs">
                    +{(board.members?.length || 0) - 3}
                  </div>
                )}
              </div>
              <div className="text-xs text-muted-foreground">
                {board.lastUpdated ? `Updated ${board.lastUpdated}` : "New board"}
              </div>
            </CardFooter>
          </Card>
        </Link>
      ))}
    </div>
  );
}