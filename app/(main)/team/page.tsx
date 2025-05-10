'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface TeamMember {
  email: string;
  role: string;
  joinedAt: string;
  name?: string;
  image?: string;
}

interface Team {
  _id: string;
  name: string;
  members: TeamMember[];
}

export default function TeamPage() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTeams = async () => {
      try {
        const response = await fetch('/api/teams');
        if (!response.ok) {
          throw new Error('Failed to fetch teams');
        }
        const data = await response.json();
        setTeams(data.teams);
      } catch (error) {
        console.error('Error fetching teams:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTeams();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      {teams.map((team) => (
        <div key={team._id} className="mb-12">
          <h2 className="text-3xl font-bold mb-6">{team.name}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {team.members.map((member, index) => (
              <Card key={index}>
                <CardHeader className="flex flex-row items-center gap-4">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src={member.image} alt={member.name || member.email} />
                    <AvatarFallback>
                      {(member.name || member.email)[0].toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="text-xl font-semibold">
                      {member.name || member.email}
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
        </div>
      ))}
    </div>
  );
}