"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { Plus, Users, ArrowLeft } from "lucide-react";
import { CreateTeamDialog } from "@/components/teams/create-team-dialog";
import { JoinTeamDialog } from "@/components/teams/join-team-dialog";
import { LoadingOverlay } from "@/components/ui/loading-overlay";

interface Team {
  _id: string;
  name: string;
  members: Array<{
    email: string;
    role: string;
  }>;
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

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="flex flex-col gap-6 mb-8">
        <Button
          variant="ghost"
          className="w-fit"
          onClick={() => router.push('/home')}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Landing Page
        </Button>
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Your Teams</h1>
          <div className="space-x-4">
            <Button onClick={() => setIsJoinTeamOpen(true)} variant="outline">
              <Users className="mr-2 h-4 w-4" />
              Join Team
            </Button>
            <Button onClick={() => setIsCreateTeamOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Create Team
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative">
        <LoadingOverlay isLoading={loading} />
        {teams.map((team) => (
          <Card 
            key={team._id} 
            className="cursor-pointer hover:border-primary/50 transition-colors"
            onClick={() => handleTeamClick(team._id)}
          >
            <CardHeader>
              <CardTitle>{team.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-500">
                {team.members.length} member{team.members.length !== 1 ? 's' : ''}
              </p>
            </CardContent>
          </Card>
        ))}
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
  );
}