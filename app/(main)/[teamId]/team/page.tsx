'use client';

import { useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { TeamMembersDialog } from "@/components/TeamMembersDialog";
import { Users } from "lucide-react";
import { LoadingPage } from '@/components/ui/loading-page';
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

// ... existing imports ...

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
  

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold">{team.name}</h2>
        <Button onClick={() => setIsTeamMembersOpen(true)} variant="outline">
          <Users className="mr-2 h-4 w-4" />
          Manage Team
        </Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 ">
        {team.members.map((member, index) => (
          <Card key={member._id || index} className='hover:border-primary/50 transition-colors cursor-pointer'>
            <CardHeader className="flex flex-row items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarImage 
                  src={member.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(member.name || member.email || '')}`} 
                  alt={member.name || member.email || 'User'} 
                />
                <AvatarFallback>
                  {(member.name || member.email || '?').toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="text-xl font-semibold">
                  {(member.email ? member.email.split('@')[0] : 'Unknown User')}
                </h3>
                <p className="text-blue-600 font-medium capitalize">{member.role}</p> 
                
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 text-sm">
                Joined: {new Date(member.joinedAt).toLocaleDateString()}
              </p>
            </CardContent>
          </Card>
        ))}
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