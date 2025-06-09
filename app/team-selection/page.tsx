"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Plus, Users, ArrowLeft, Crown, Calendar } from "lucide-react";
import { CreateTeamDialog } from "@/components/teams/create-team-dialog";
import { JoinTeamDialog } from "@/components/teams/join-team-dialog";
import { LoadingOverlay } from "@/components/ui/loading-overlay";
import { motion } from "framer-motion";

interface Team {
  _id: string;
  name: string;
  description?: string;
  members: Array<{
    email: string;
    role: string;
    joinedAt: string;
  }>;
  createdAt: string;
}

export default function TeamSelectionPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateTeamOpen, setIsCreateTeamOpen] = useState(false);
  const [isJoinTeamOpen, setIsJoinTeamOpen] = useState(false);

  useEffect(() => {
    const fetchTeams = async () => {
      try {
        const response = await fetch('/api/teams');
        if (!response.ok) {
          throw new Error('Failed to fetch teams');
        }
        const data = await response.json();
        setTeams(data);
      } catch (error) {
        console.error('Error fetching teams:', error);
        toast({
          title: "Error",
          description: "Failed to load teams. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchTeams();
  }, [toast]);

  const handleTeamClick = (teamId: string) => {
    router.push(`/${teamId}/dashboard`);
  };

  const getUserRole = (team: Team, userEmail?: string) => {
    if (!userEmail) return 'member';
    const member = team.members.find(m => m.email === userEmail);
    return member?.role || 'member';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50/30 via-transparent to-indigo-50/30 dark:from-purple-950/20 dark:via-transparent dark:to-indigo-950/20">
      {/* Animated background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-indigo-400/20 to-purple-400/20 rounded-full blur-3xl animate-pulse animation-delay-2000"></div>
      </div>

      <div className="container mx-auto px-4 py-12 relative">
        <div className="flex flex-col gap-8 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Button
              variant="ghost"
              className="w-fit hover:bg-purple-50 dark:hover:bg-purple-950/50"
              onClick={() => router.push('/home')}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Landing Page
            </Button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6"
          >
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center">
                <Users className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                  Your Teams
                </h1>
                <p className="text-muted-foreground text-lg">
                  Choose a workspace to continue collaborating
                </p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button 
                onClick={() => setIsJoinTeamOpen(true)} 
                variant="outline"
                className="border-purple-200 hover:bg-purple-50 dark:border-purple-800 dark:hover:bg-purple-950/50"
              >
                <Users className="mr-2 h-4 w-4" />
                Join Team
              </Button>
              <Button 
                onClick={() => setIsCreateTeamOpen(true)}
                className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
              >
                <Plus className="mr-2 h-4 w-4" />
                Create Team
              </Button>
            </div>
          </motion.div>
        </div>

        <div className="relative">
          <LoadingOverlay isLoading={loading} />
          
          {!loading && teams.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="flex flex-col items-center justify-center py-16 text-center"
            >
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-100 to-indigo-100 dark:from-purple-900/50 dark:to-indigo-900/50 flex items-center justify-center mb-6">
                <Users className="h-12 w-12 text-purple-500" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-purple-700 dark:text-purple-300">
                No teams yet
              </h3>
              <p className="text-muted-foreground mb-6 max-w-md">
                Create your first team to start collaborating with your colleagues, or join an existing team with an invite code.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <Button 
                  onClick={() => setIsCreateTeamOpen(true)}
                  className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Create Your First Team
                </Button>
                <Button 
                  onClick={() => setIsJoinTeamOpen(true)} 
                  variant="outline"
                  className="border-purple-200 hover:bg-purple-50 dark:border-purple-800 dark:hover:bg-purple-950/50"
                >
                  <Users className="mr-2 h-4 w-4" />
                  Join Existing Team
                </Button>
              </div>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {teams.map((team, index) => (
                <motion.div
                  key={team._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                >
                  <Card 
                    className="cursor-pointer hover:shadow-xl transition-all duration-300 hover:-translate-y-2 bg-white/80 dark:bg-slate-950/80 backdrop-blur-sm border-purple-200/50 dark:border-purple-800/50 group hover:border-purple-300 dark:hover:border-purple-700"
                    onClick={() => handleTeamClick(team._id)}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-xl group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                            {team.name}
                          </CardTitle>
                          {team.description && (
                            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                              {team.description}
                            </p>
                          )}
                        </div>
                        {getUserRole(team) === 'admin' && (
                          <div className="flex items-center gap-1 bg-gradient-to-r from-yellow-100 to-orange-100 dark:from-yellow-900/50 dark:to-orange-900/50 px-2 py-1 rounded-full">
                            <Crown className="h-3 w-3 text-yellow-600 dark:text-yellow-400" />
                            <span className="text-xs font-medium text-yellow-700 dark:text-yellow-300">Admin</span>
                          </div>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4" />
                          <span>{team.members.length} member{team.members.length !== 1 ? 's' : ''}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          <span>Created {new Date(team.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                      
                      <div className="mt-4 flex -space-x-2">
                        {team.members.slice(0, 4).map((member, idx) => (
                          <div
                            key={idx}
                            className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-400 to-indigo-400 border-2 border-white dark:border-slate-950 flex items-center justify-center text-white text-xs font-semibold"
                          >
                            {member.email[0].toUpperCase()}
                          </div>
                        ))}
                        {team.members.length > 4 && (
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-slate-400 to-slate-500 border-2 border-white dark:border-slate-950 flex items-center justify-center text-white text-xs font-semibold">
                            +{team.members.length - 4}
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        <CreateTeamDialog 
          open={isCreateTeamOpen}
          onOpenChange={setIsCreateTeamOpen}
        />

        <JoinTeamDialog
          open={isJoinTeamOpen}
          onOpenChange={setIsJoinTeamOpen}
        />
      </div>
    </div>
  );
}