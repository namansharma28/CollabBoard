'use client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RecentActivity } from "@/components/dashboard/recent-activity";
import { DashboardStats } from "@/components/dashboard/dashboard-stats";
import { useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { LoadingPage } from "@/components/ui/loading-page";

interface DashboardData {
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
  overview: {
    name: string;
    completed: number;
    inProgress: number;
    pending: number;
  }[];
  recentActivity: {
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
  }[];
  boardStats: {
    id: string;
    title: string;
    totalTasks: number;
    completedTasks: number;
  }[];
  team: any;
}

export default function DashboardPage() {
  const params = useParams();
  const teamId = params?.teamId as string;
  const [teamData, setTeamData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTeamData = async () => {
      try {
        const response = await fetch(`/api/teams/${teamId}/dashboard`);
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to fetch team data');
        }
        const data = await response.json();
        setTeamData(data);
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTeamData();
  }, [teamId]);

  if (loading) return <div>
    <LoadingPage />
  </div>;

  // If no data is available, display a message
  if (!teamData) return <div>No dashboard data available.</div>;

  return (
    <div className="flex flex-col space-y-6">
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back! Here is an overview of your workspace.
        </p>
      </div>
      
      <div className="space-y-6">
        <DashboardStats stats={teamData.stats} />
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="lg:col-span-4">
              <CardHeader>
              <CardTitle>Tasks Insights</CardTitle>
                <CardDescription>
                Task distribution and status breakdown
                </CardDescription>
              </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Task Distribution by Status */}
                <div>
                  <h4 className="text-sm font-medium mb-2">Status Distribution</h4>
                  <div className="flex h-4 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                    {teamData.stats.tasks.total > 0 ? (
                      <>
                        <div 
                          className="h-full bg-green-500" 
                          style={{ 
                            width: `${(teamData.stats.tasks.completed / teamData.stats.tasks.total) * 100}%` 
                          }}
                          title={`Completed: ${teamData.stats.tasks.completed}`}
                        />
                        <div 
                          className="h-full bg-blue-500" 
                          style={{ 
                            width: `${(teamData.stats.tasks.inProgress / teamData.stats.tasks.total) * 100}%` 
                          }}
                          title={`In Progress: ${teamData.stats.tasks.inProgress}`}
                        />
                        <div 
                          className="h-full bg-slate-400" 
                          style={{ 
                            width: `${(teamData.stats.tasks.todo / teamData.stats.tasks.total) * 100}%` 
                          }}
                          title={`Todo: ${teamData.stats.tasks.todo}`}
                        />
                      </>
                    ) : <div className="text-xs text-center w-full">No tasks</div>}
                  </div>
                  <div className="flex justify-between mt-2 text-xs">
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-1"></div>
                      <span>Completed ({teamData.stats.tasks.completed})</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mr-1"></div>
                      <span>In Progress ({teamData.stats.tasks.inProgress})</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-slate-400 rounded-full mr-1"></div>
                      <span>Todo ({teamData.stats.tasks.todo})</span>
                    </div>
                  </div>
                </div>
                
                {/* Overdue Tasks */}
                <div>
                  <h4 className="text-sm font-medium mb-2">Overdue Tasks</h4>
                  <div className="flex items-center">
                    <div className="w-full bg-slate-100 dark:bg-slate-800 h-4 rounded-full overflow-hidden">
                      {teamData.stats.tasks.total > 0 ? (
                        <div 
                          className="h-full bg-amber-500" 
                          style={{ 
                            width: `${(teamData.stats.tasks.overdue / teamData.stats.tasks.total) * 100}%` 
                          }}
                        />
                      ) : null}
                    </div>
                    <div className="ml-2 text-sm font-medium min-w-14 text-right">
                      {teamData.stats.tasks.overdue} / {teamData.stats.tasks.total}
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {teamData.stats.tasks.overdue === 0 
                      ? "No overdue tasks - great job!" 
                      : `${teamData.stats.tasks.overdue} tasks past their due date`}
                  </p>
                </div>
                
                {/* Productivity Trend */}
                <div>
                  <h4 className="text-sm font-medium mb-2">Completion Trend (Last 7 Days)</h4>
                  <div className="flex items-end h-20 w-full">
                    {teamData.overview.map((day, index) => (
                      <div key={index} className="flex-1 flex flex-col items-center">
                        <div className="relative w-full flex justify-center">
                          <div 
                            className="w-5/6 bg-primary/20 rounded-t"
                            style={{ 
                              height: `${Math.max(day.completed * 5, 5)}px` 
                            }}
                          ></div>
                        </div>
                        <span className="text-xs mt-1">{day.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Most Active Boards */}
                <div>
                  <h4 className="text-sm font-medium mb-2">Most Active Boards</h4>
                  <div className="space-y-2">
                    {teamData.boardStats.slice(0, 3).map((board) => (
                      <div key={board.id} className="flex items-center">
                        <div className="flex-1 text-sm font-medium truncate">{board.title}</div>
                        <div className="text-xs text-muted-foreground">{board.totalTasks} tasks</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              </CardContent>
            </Card>
            <Card className="lg:col-span-3">
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>
                  Latest updates from your team
                </CardDescription>
              </CardHeader>
              <CardContent>
              <RecentActivity activities={teamData.recentActivity} />
            </CardContent>
          </Card>
        </div>
        
        {/* Board-specific task breakdown */}
          <Card>
            <CardHeader>
            <CardTitle>Task Breakdown by Board</CardTitle>
              <CardDescription>
              Task completion status for each board
              </CardDescription>
            </CardHeader>
            <CardContent>
            <div className="space-y-4">
              {teamData.boardStats.map(board => (
                <div key={board.id} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{board.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {board.completedTasks} of {board.totalTasks} tasks completed
                    </p>
                  </div>
                  <div className="w-40 h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-primary" 
                      style={{ 
                        width: `${board.totalTasks ? (board.completedTasks / board.totalTasks) * 100 : 0}%` 
                      }}
                    />
                  </div>
                  <div className="w-16 text-right">
                    {board.totalTasks ? 
                      `${Math.round((board.completedTasks / board.totalTasks) * 100)}%` : 
                      '0%'
                    }
                  </div>
                </div>
              ))}
              </div>
            </CardContent>
          </Card>
      </div>
    </div>
  );
}