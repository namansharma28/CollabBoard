"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { CreateTeamDialog } from "@/components/teams/create-team-dialog";
import { JoinTeamDialog } from "@/components/teams/join-team-dialog";
import { Users, Plus, ArrowRight } from "lucide-react";
import { toast } from "react-hot-toast";

interface Team {
  _id: string;
  name: string;
  description: string;
  members: Array<{
    email: string;
    role: 'admin' | 'member';
  }>;
}

export default function TeamSelectionPage() {
  const [createTeamOpen, setCreateTeamOpen] = useState(false);
  const [joinTeamOpen, setJoinTeamOpen] = useState(false);
  const [teams, setTeams] = useState<Team[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const { data: session } = useSession();

  useEffect(() => {
    fetchTeams();
  }, []);

  const fetchTeams = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers: HeadersInit = {
        'Content-Type': 'application/json'
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch('/api/teams', { headers });
      if (!response.ok) {
        throw new Error('Failed to fetch teams');
      }
      const data = await response.json();
      setTeams(data.teams || []);
    } catch (error) {
      console.error('Error fetching teams:', error);
      toast.error('Failed to load teams');
    } finally {
      setIsLoading(false);
    }
  };

  const getUserRole = (team: Team) => {
    const member = team.members.find(m => m.email === session?.user?.email);
    return member?.role || 'member';
  };

  const getMemberCount = (team: Team) => {
    return team.members.length;
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container py-10">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight">Select Team</h1>
            <p className="text-muted-foreground">
              Choose a team to collaborate with or create a new one
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Card className="border-dashed">
              <CardHeader>
                <CardTitle>Create New Team</CardTitle>
                <CardDescription>
                  Start a new workspace for your team
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  onClick={() => setCreateTeamOpen(true)}
                  className="w-full"
                  variant="outline"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Create Team
                </Button>
              </CardContent>
            </Card>

            <Card className="border-dashed">
              <CardHeader>
                <CardTitle>Join Existing Team</CardTitle>
                <CardDescription>
                  Join using an invite code
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  onClick={() => setJoinTeamOpen(true)}
                  className="w-full"
                  variant="outline"
                >
                  <Users className="mr-2 h-4 w-4" />
                  Join Team
                </Button>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Your Teams</h2>
            {isLoading ? (
              <div className="text-center py-4">Loading teams...</div>
            ) : teams.length === 0 ? (
              <div className="text-center py-4 text-muted-foreground">
                You are not a member of any teams yet
              </div>
            ) : (
              <div className="grid gap-4">
                {teams.map((team) => (
                  <Card key={team._id} className="hover:bg-muted/50 transition-colors">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle>{team.name}</CardTitle>
                          <CardDescription>{team.description}</CardDescription>
                        </div>
                        <Button onClick={() => router.push(`/${team._id}/dashboard`)}>
                          Select
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Users className="mr-2 h-4 w-4" />
                        {getMemberCount(team)} members
                        <span className="ml-4 inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold">
                          {getUserRole(team)}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <CreateTeamDialog 
        open={createTeamOpen} 
        onOpenChange={setCreateTeamOpen}
        onTeamCreated={fetchTeams}
      />
      <JoinTeamDialog 
        open={joinTeamOpen} 
        onOpenChange={setJoinTeamOpen}
        onTeamJoined={fetchTeams}
      />
    </div>
  );
}