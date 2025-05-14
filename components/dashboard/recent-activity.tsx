import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatDistanceToNow } from "date-fns";

interface ActivityItem {
  id: string;
  user: {
    name: string;
    avatar?: string;
    initials: string;
  };
  action: string;
  target: string;
  time: string;
  board: string;
}

interface RecentActivityProps {
  activities: ActivityItem[];
}

export function RecentActivity({ activities }: RecentActivityProps) {
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
              {typeof activity.time === "string" 
                ? formatDistanceToNow(new Date(activity.time), { addSuffix: true }) 
                : "Recently"} • {activity.board}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}