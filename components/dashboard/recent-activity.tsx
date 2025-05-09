import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const activities = [
  {
    id: 1,
    user: {
      name: "John Doe",
      avatar: "/avatars/01.png",
      initials: "JD",
    },
    action: "completed task",
    target: "Update user interface",
    time: "2 hours ago",
    board: "Website Redesign",
  },
  {
    id: 2,
    user: {
      name: "Sarah Kim",
      avatar: "/avatars/02.png",
      initials: "SK",
    },
    action: "created note",
    target: "Meeting Notes - Apr 15",
    time: "3 hours ago",
    board: "Project Planning",
  },
  {
    id: 3,
    user: {
      name: "Michael Brown",
      avatar: "/avatars/03.png",
      initials: "MB",
    },
    action: "commented on",
    target: "API Integration Plan",
    time: "5 hours ago",
    board: "Development",
  },
  {
    id: 4,
    user: {
      name: "Emily Chen",
      avatar: "/avatars/04.png",
      initials: "EC",
    },
    action: "moved task",
    target: "Create user onboarding flow",
    time: "Yesterday",
    board: "UX Improvements",
  },
  {
    id: 5,
    user: {
      name: "James Wilson",
      avatar: "/avatars/05.png",
      initials: "JW",
    },
    action: "added task",
    target: "Review copy for landing page",
    time: "Yesterday",
    board: "Marketing",
  },
];

export function RecentActivity() {
  return (
    <div className="space-y-8">
      {activities.map((activity) => (
        <div key={activity.id} className="flex">
          <Avatar className="h-9 w-9">
            <AvatarImage src={activity.user.avatar} alt={activity.user.name} />
            <AvatarFallback>{activity.user.initials}</AvatarFallback>
          </Avatar>
          <div className="ml-4 space-y-1">
            <p className="text-sm">
              <span className="font-medium">{activity.user.name}</span>{" "}
              {activity.action}{" "}
              <span className="font-medium">{activity.target}</span>
            </p>
            <p className="text-xs text-muted-foreground">
              {activity.time} • {activity.board}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}