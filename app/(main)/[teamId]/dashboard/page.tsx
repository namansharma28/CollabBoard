'use client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RecentActivity } from "@/components/dashboard/recent-activity";
import { DashboardStats } from "@/components/dashboard/dashboard-stats";
import { useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { LoadingPage } from "@/components/ui/loading-page";
import { motion } from "framer-motion";
import { TrendingUp, Activity, Target, Users } from "lucide-react";

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
    <div className="flex flex-col space-y-8 bg-gradient-to-br from-purple-50/30 via-transparent to-indigo-50/30 dark:from-purple-950/20 dark:via-transparent dark:to-indigo-950/20 min-h-screen">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="flex flex-col space-y-2"
      >
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center">
            <Activity className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
              Dashboard
            </h1>
            <p className="text-muted-foreground text-lg">
              Welcome back! Here&apos;s an overview of your workspace.
            </p>
          </div>
        </div>
      </motion.div>
      
      <div className="space-y-8">
        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <DashboardStats stats={teamData.stats} />
        </motion.div>

        {/* Main Content Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
          {/* Task Insights */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="lg:col-span-4"
          >
            <Card className="border-purple-200/50 dark:border-purple-800/50 bg-gradient-to-br from-white/80 to-purple-50/50 dark:from-slate-950/80 dark:to-purple-950/50 backdrop-blur-sm shadow-xl">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center">
                    <Target className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-xl bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                      Task Insights
                    </CardTitle>
                    <CardDescription>
                      Task distribution and status breakdown
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-8">
                  {/* Task Distribution by Status */}
                  <div>
                    <h4 className="text-sm font-medium mb-3 text-purple-700 dark:text-purple-300">Status Distribution</h4>
                    <div className="flex h-4 w-full overflow-hidden rounded-full bg-gradient-to-r from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700">
                      {teamData.stats.tasks.total > 0 ? (
                        <>
                          <div 
                            className="h-full bg-gradient-to-r from-green-400 to-green-500" 
                            style={{ 
                              width: `${(teamData.stats.tasks.completed / teamData.stats.tasks.total) * 100}%` 
                            }}
                            title={`Completed: ${teamData.stats.tasks.completed}`}
                          />
                          <div 
                            className="h-full bg-gradient-to-r from-purple-400 to-purple-500" 
                            style={{ 
                              width: `${(teamData.stats.tasks.inProgress / teamData.stats.tasks.total) * 100}%` 
                            }}
                            title={`In Progress: ${teamData.stats.tasks.inProgress}`}
                          />
                          <div 
                            className="h-full bg-gradient-to-r from-slate-400 to-slate-500" 
                            style={{ 
                              width: `${(teamData.stats.tasks.todo / teamData.stats.tasks.total) * 100}%` 
                            }}
                            title={`Todo: ${teamData.stats.tasks.todo}`}
                          />
                        </>
                      ) : <div className="text-xs text-center w-full">No tasks</div>}
                    </div>
                    <div className="flex justify-between mt-3 text-xs">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-gradient-to-r from-green-400 to-green-500 rounded-full"></div>
                        <span>Completed ({teamData.stats.tasks.completed})</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-gradient-to-r from-purple-400 to-purple-500 rounded-full"></div>
                        <span>In Progress ({teamData.stats.tasks.inProgress})</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-gradient-to-r from-slate-400 to-slate-500 rounded-full"></div>
                        <span>Todo ({teamData.stats.tasks.todo})</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Overdue Tasks */}
                  <div>
                    <h4 className="text-sm font-medium mb-3 text-purple-700 dark:text-purple-300">Overdue Tasks</h4>
                    <div className="flex items-center gap-3">
                      <div className="w-full bg-gradient-to-r from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 h-4 rounded-full overflow-hidden">
                        {teamData.stats.tasks.total > 0 ? (
                          <div 
                            className="h-full bg-gradient-to-r from-amber-400 to-orange-500" 
                            style={{ 
                              width: `${(teamData.stats.tasks.overdue / teamData.stats.tasks.total) * 100}%` 
                            }}
                          />
                        ) : null}
                      </div>
                      <div className="text-sm font-medium min-w-20 text-right">
                        {teamData.stats.tasks.overdue} / {teamData.stats.tasks.total}
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      {teamData.stats.tasks.overdue === 0 
                        ? "No overdue tasks - great job! 🎉" 
                        : `${teamData.stats.tasks.overdue} tasks past their due date`}
                    </p>
                  </div>
                  
                  {/* Productivity Trend */}
                  <div>
                    <h4 className="text-sm font-medium mb-3 text-purple-700 dark:text-purple-300">Completion Trend (Last 7 Days)</h4>
                    <div className="flex items-end h-24 w-full gap-2">
                      {teamData.overview.map((day, index) => (
                        <div key={index} className="flex-1 flex flex-col items-center gap-2">
                          <div className="relative w-full flex justify-center">
                            <div 
                              className="w-full bg-gradient-to-t from-purple-400 to-purple-500 rounded-t-lg transition-all duration-500 hover:from-purple-500 hover:to-purple-600"
                              style={{ 
                                height: `${Math.max(day.completed * 4, 4)}px` 
                              }}
                            ></div>
                          </div>
                          <span className="text-xs font-medium text-purple-600 dark:text-purple-400">{day.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {/* Most Active Boards */}
                  <div>
                    <h4 className="text-sm font-medium mb-3 text-purple-700 dark:text-purple-300">Most Active Boards</h4>
                    <div className="space-y-3">
                      {teamData.boardStats.slice(0, 3).map((board, index) => (
                        <div key={board.id} className="flex items-center justify-between p-3 rounded-xl bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-950/50 dark:to-indigo-950/50 border border-purple-200/50 dark:border-purple-800/50">
                          <div className="flex items-center gap-3">
                            <div className="w-2 h-2 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full"></div>
                            <span className="text-sm font-medium truncate">{board.title}</span>
                          </div>
                          <span className="text-xs text-muted-foreground bg-white/50 dark:bg-slate-900/50 px-2 py-1 rounded-full">
                            {board.totalTasks} tasks
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Recent Activity */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="lg:col-span-3"
          >
            <Card className="border-purple-200/50 dark:border-purple-800/50 bg-gradient-to-br from-white/80 to-indigo-50/50 dark:from-slate-950/80 dark:to-indigo-950/50 backdrop-blur-sm shadow-xl">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
                    <TrendingUp className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-xl bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                      Recent Activity
                    </CardTitle>
                    <CardDescription>
                      Latest updates from your team
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <RecentActivity activities={teamData.recentActivity} />
              </CardContent>
            </Card>
          </motion.div>
        </div>
        
        {/* Board-specific task breakdown */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <Card className="border-purple-200/50 dark:border-purple-800/50 bg-gradient-to-br from-white/80 to-purple-50/50 dark:from-slate-950/80 dark:to-purple-950/50 backdrop-blur-sm shadow-xl">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                  <Users className="h-5 w-5 text-white" />
                </div>
                <div>
                  <CardTitle className="text-xl bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                    Task Breakdown by Board
                  </CardTitle>
                  <CardDescription>
                    Task completion status for each board
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {teamData.boardStats.map((board, index) => (
                  <motion.div 
                    key={board.id} 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                    className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-950/30 dark:to-indigo-950/30 border border-purple-200/50 dark:border-purple-800/50 hover:shadow-lg transition-all duration-300"
                  >
                    <div>
                      <p className="font-medium text-purple-700 dark:text-purple-300">{board.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {board.completedTasks} of {board.totalTasks} tasks completed
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="w-32 h-3 bg-gradient-to-r from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-purple-400 to-indigo-500 rounded-full transition-all duration-500" 
                          style={{ 
                            width: `${board.totalTasks ? (board.completedTasks / board.totalTasks) * 100 : 0}%` 
                          }}
                        />
                      </div>
                      <div className="w-16 text-right font-semibold text-purple-600 dark:text-purple-400">
                        {board.totalTasks ? 
                          `${Math.round((board.completedTasks / board.totalTasks) * 100)}%` : 
                          '0%'
                        }
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}