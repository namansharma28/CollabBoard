"use client";

import { Button } from "@/components/ui/button";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { BoardsList } from "@/components/boards/boards-list";
import { CreateBoardDialog } from "@/components/boards/create-board-dialog";
import { Plus, Search } from "lucide-react";
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function BoardsPage() {
  const params = useParams();
  const teamId = params.teamId as string;
  const [boards, setBoards] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBoards = async () => {
      try {
        const response = await fetch(`/api/teams/${teamId}/boards`);
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to fetch team data');
        }        const data = await response.json();
        setBoards(data.boards);
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBoards();
  }, [teamId]);
  const [open, setOpen] = useState(false);

  if (loading) return <div>Loading...</div>;

  return (
    <div className="flex flex-col space-y-6">
      <div className="flex flex-col space-y-2">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">Boards</h1>
          <Button onClick={() => setOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Board
          </Button>
        </div>
        <p className="text-muted-foreground">
          Manage and organize your tasks with Kanban boards
        </p>
      </div>
      
      <div className="flex flex-col md:flex-row items-start gap-4">
        <div className="w-full md:w-72 flex flex-col gap-4">
          <div className="relative w-full">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <input
              type="search"
              placeholder="Search boards..."
              className="w-full rounded-md border border-input bg-background py-2 pl-8 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            />
          </div>
          
          <div className="bg-card border rounded-md p-4">
            <h3 className="font-medium mb-2">Categories</h3>
            <div className="space-y-1">
              <Button variant="ghost" className="w-full justify-start">
                <span>All Boards</span>
                <span className="ml-auto bg-secondary text-secondary-foreground text-xs py-0.5 px-1.5 rounded-md">
                  10
                </span>
              </Button>
              <Button variant="ghost" className="w-full justify-start">
                <span>Development</span>
                <span className="ml-auto bg-secondary text-secondary-foreground text-xs py-0.5 px-1.5 rounded-md">
                  4
                </span>
              </Button>
              <Button variant="ghost" className="w-full justify-start">
                <span>Marketing</span>
                <span className="ml-auto bg-secondary text-secondary-foreground text-xs py-0.5 px-1.5 rounded-md">
                  3
                </span>
              </Button>
              <Button variant="ghost" className="w-full justify-start">
                <span>Design</span>
                <span className="ml-auto bg-secondary text-secondary-foreground text-xs py-0.5 px-1.5 rounded-md">
                  2
                </span>
              </Button>
              <Button variant="ghost" className="w-full justify-start">
                <span>Personal</span>
                <span className="ml-auto bg-secondary text-secondary-foreground text-xs py-0.5 px-1.5 rounded-md">
                  1
                </span>
              </Button>
            </div>
          </div>
        </div>
        
        <div className="flex-1 w-full">
          <ScrollArea className="w-full">
            <BoardsList />
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        </div>
      </div>
      
      <CreateBoardDialog open={open} onOpenChange={setOpen} />
    </div>
  );
}