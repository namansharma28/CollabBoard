'use client';

import { useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { TeamMembersDialog } from "@/components/TeamMembersDialog";
import { Users, Crown, UserCheck, Calendar } from "lucide-react";
import { LoadingPage } from '@/components/ui/loading-page';
import { motion } from "framer-motion";

interface TeamMember {
  email: string;
  role: string;
  joinedAt: string;
  _id: string;
  name?: string;
  image?: string;
}

interface Team {
  _id: string;
  name: string;
  members: TeamMember[];
  code?: string;
}

export default function TeamPage() {
  const params = useParams();
  const teamId = params?.teamId as string;
  const [team, setTeam] = useState<Team | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isTeamMembersOpen, setIsTeamMembersOpen] = useState(false);

  useEffect(() => {
    const fetchTeam = async () => {
      if (!teamId) return;
      
      try {
        const response = await fetch(`/api/teams/${teamId}/team`);
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to fetch team data');
        }
        const data = await response.json();
        setTeam(data);
      } catch (error) {
        console.error('Error:', error);
        setError(error instanceof Error ? error.message : 'Something went wrong');
      } finally {
        setLoading(false);
      }
    };

    fetchTeam();
  }, [teamId]);

  if (!teamId) return <div>Invalid team ID</div>;
  if (loading) return <div>
    <LoadingPage />
  </div>;
  if (error) return <div className="text-red-500">Error: {error}</div>;
  if (!team) return <div>Team not found</div>;
  if (!team.members || team.members.length === 0) return <div>No members found</div>;

  const adminMembers = team.members.filter(member => member.role === 'admin');
  const regularMembers = team.members.filter(member => member.role === 'member');

  return (
    <div className="flex flex-col space-y-8 bg-gradient-to-br from-purple-50/30 via-transparent to-indigo-50/30 dark:from-purple-950/20 dark:via-transparent dark:to-indigo-950/20 min-h-screen">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="flex flex-col space-y-4"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center">
              <Users className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                {team.name}
              </h1>
              <p className="text-muted-foreground text-lg">
                {team.members.length} team member{team.members.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
          <Button 
            onClick={() => setIsTeamMembersOpen(true)} 
            className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
          >
            <Users className="mr-2 h-4 w-4" />
            Manage Team
          </Button>
        </div>
      </motion.div>

      {/* Team Stats */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-6"
      >
        <Card className="border-purple-200/50 dark:border-purple-800/50 bg-gradient-to-br from-white/80 to-purple-50/50 dark:from-slate-950/80 dark:to-purple-950/50 backdrop-blur-sm shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center">
                <Users className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-purple-700 dark:text-purple-300">{team.members.length}</p>
                <p className="text-sm text-muted-foreground">Total Members</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-purple-200/50 dark:border-purple-800/50 bg-gradient-to-br from-white/80 to-indigo-50/50 dark:from-slate-950/80 dark:to-indigo-950/50 backdrop-blur-sm shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
                <Crown className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-indigo-700 dark:text-indigo-300">{adminMembers.length}</p>
                <p className="text-sm text-muted-foreground">Administrators</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-purple-200/50 dark:border-purple-800/50 bg-gradient-to-br from-white/80 to-pink-50/50 dark:from-slate-950/80 dark:to-pink-950/50 backdrop-blur-sm shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-pink-500 to-purple-500 flex items-center justify-center">
                <UserCheck className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-pink-700 dark:text-pink-300">{regularMembers.length}</p>
                <p className="text-sm text-muted-foreground">Members</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Team Members */}
      <div className="space-y-6">
        {/* Administrators */}
        {adminMembers.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="flex items-center gap-3 mb-4">
              <Crown className="h-5 w-5 text-purple-600" />
              <h2 className="text-xl font-semibold text-purple-700 dark:text-purple-300">
                Administrators ({adminMembers.length})
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {adminMembers.map((member, index) => (
                <motion.div
                  key={member._id || index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                >
                  <Card className="hover:border-purple-300 dark:hover:border-purple-700 transition-all duration-300 cursor-pointer bg-gradient-to-br from-white/90 to-purple-50/70 dark:from-slate-950/90 dark:to-purple-950/70 backdrop-blur-sm border-purple-200/50 dark:border-purple-800/50 hover:shadow-xl hover:-translate-y-1">
                    <CardHeader className="flex flex-row items-center gap-4 pb-3">
                      <div className="relative">
                        <Avatar className="h-16 w-16 border-2 border-purple-200 dark:border-purple-800">
                          <AvatarImage 
                            src={member.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(member.name || member.email || '')}&background=random`} 
                            alt={member.name || member.email || 'User'} 
                          />
                          <AvatarFallback className="bg-gradient-to-br from-purple-500 to-indigo-500 text-white text-lg">
                            {(member.name || member.email || '?')[0].toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="absolute -top-1 -right-1 h-6 w-6 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                          <Crown className="h-3 w-3 text-white" />
                        </div>
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-purple-700 dark:text-purple-300">
                          {member.name || member.email?.split('@')[0] || 'Unknown User'}
                        </h3>
                        <p className="text-sm text-muted-foreground">{member.email}</p>
                        <div className="flex items-center gap-1 mt-1">
                          <div className="px-2 py-1 bg-gradient-to-r from-purple-500 to-indigo-500 text-white text-xs rounded-full font-medium">
                            Administrator
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        <span>Joined {new Date(member.joinedAt).toLocaleDateString()}</span>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Regular Members */}
        {regularMembers.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <div className="flex items-center gap-3 mb-4">
              <UserCheck className="h-5 w-5 text-indigo-600" />
              <h2 className="text-xl font-semibold text-indigo-700 dark:text-indigo-300">
                Members ({regularMembers.length})
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {regularMembers.map((member, index) => (
                <motion.div
                  key={member._id || index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                >
                  <Card className="hover:border-indigo-300 dark:hover:border-indigo-700 transition-all duration-300 cursor-pointer bg-gradient-to-br from-white/90 to-indigo-50/70 dark:from-slate-950/90 dark:to-indigo-950/70 backdrop-blur-sm border-indigo-200/50 dark:border-indigo-800/50 hover:shadow-xl hover:-translate-y-1">
                    <CardHeader className="flex flex-row items-center gap-4 pb-3">
                      <Avatar className="h-16 w-16 border-2 border-indigo-200 dark:border-indigo-800">
                        <AvatarImage 
                          src={member.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(member.name || member.email || '')}&background=random`} 
                          alt={member.name || member.email || 'User'} 
                        />
                        <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-purple-500 text-white text-lg">
                          {(member.name || member.email || '?')[0].toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-indigo-700 dark:text-indigo-300">
                          {member.name || member.email?.split('@')[0] || 'Unknown User'}
                        </h3>
                        <p className="text-sm text-muted-foreground">{member.email}</p>
                        <div className="flex items-center gap-1 mt-1">
                          <div className="px-2 py-1 bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-xs rounded-full font-medium">
                            Member
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        <span>Joined {new Date(member.joinedAt).toLocaleDateString()}</span>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
      
      {/* Team Members Dialog */}
      <TeamMembersDialog 
        open={isTeamMembersOpen}
        onOpenChange={setIsTeamMembersOpen}
        teamId={teamId}
        teamCode={team.code}
      />
    </div>
  );
}