"use client";

import { Button } from "@/components/ui/button";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { BoardsList } from "@/components/boards/boards-list";
import { CreateBoardDialog } from "@/components/boards/create-board-dialog";
import { Plus, Search, LayoutGrid } from "lucide-react";
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { BoardProps } from "@/components/boards/boards-list";
import { LoadingPage } from "@/components/ui/loading-page";
import { motion } from "framer-motion";

export default function BoardsPage() {
  const params = useParams() || {};
  const teamId = params.teamId as string;
  const [boards, setBoards] = useState<BoardProps[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Boards');

  useEffect(() => {
    const fetchBoards = async () => {
      try {
        const response = await fetch(`/api/teams/${teamId}/boards`);
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to fetch team data');
        }        
        const data = await response.json();
        setBoards(data.boards);
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBoards();
  }, [teamId]);

  const handleCreateBoard = async (newBoard: Omit<BoardProps, '_id'>) => {
    try {
      const response = await fetch(`/api/teams/${teamId}/boards`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newBoard),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create board');
      }
      
      const data = await response.json();
      setBoards([...boards, data.board]);
      setOpen(false);
    } catch (error) {
      console.error('Error creating board:', error);
    }
  };

  const filteredBoards = boards
    .filter(board => 
      board.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
      board.description.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .filter(board => 
      selectedCategory === 'All Boards' || 
      board.category === selectedCategory
    );

  // Count boards by category
  const categorySet = new Set(['All Boards']);
  boards.forEach(board => {
    if (board.category) {
      categorySet.add(board.category);
    } else {
      categorySet.add('General');
    }
  });
  const categories = Array.from(categorySet);
  
  const categoryCounts = categories.reduce((acc, category) => {
    acc[category] = category === 'All Boards' 
      ? boards.length
      : boards.filter(board => board.category === category).length;
    return acc;
  }, {} as Record<string, number>);

  if (loading) return <div>
    <LoadingPage />
  </div>;

  return (
    <div className="flex flex-col space-y-8 bg-gradient-to-br from-purple-50/30 via-transparent to-indigo-50/30 dark:from-purple-950/20 dark:via-transparent dark:to-indigo-950/20 min-h-screen">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="flex flex-col space-y-4"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center">
              <LayoutGrid className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                Boards
              </h1>
              <p className="text-muted-foreground text-lg">
                Manage and organize your tasks with Kanban boards
              </p>
            </div>
          </div>
          <Button 
            onClick={() => setOpen(true)}
            className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Board
          </Button>
        </div>
      </motion.div>
      
      <div className="flex flex-col lg:flex-row items-start gap-6">
        {/* Sidebar */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="w-full lg:w-80 flex flex-col gap-6"
        >
          {/* Search */}
          <div className="relative w-full">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <input
              type="search"
              placeholder="Search boards..."
              className="w-full rounded-xl border border-purple-200/50 dark:border-purple-800/50 bg-white/80 dark:bg-slate-950/80 backdrop-blur-sm py-3 pl-10 pr-4 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2 transition-all duration-300"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          {/* Categories */}
          <div className="bg-white/80 dark:bg-slate-950/80 backdrop-blur-sm border border-purple-200/50 dark:border-purple-800/50 rounded-xl p-6 shadow-lg">
            <h3 className="font-semibold mb-4 text-purple-700 dark:text-purple-300 flex items-center gap-2">
              <div className="w-2 h-2 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full"></div>
              Categories
            </h3>
            <div className="space-y-2">
              {categories.map(category => (
                <Button 
                  key={category}
                  variant={selectedCategory === category ? "default" : "ghost"} 
                  className={`w-full justify-start transition-all duration-300 ${
                    selectedCategory === category 
                      ? 'bg-gradient-to-r from-purple-500 to-indigo-500 text-white shadow-lg' 
                      : 'hover:bg-purple-50 dark:hover:bg-purple-950/50'
                  }`}
                  onClick={() => setSelectedCategory(category)}
                >
                  <span>{category}</span>
                  <span className={`ml-auto text-xs py-1 px-2 rounded-full ${
                    selectedCategory === category 
                      ? 'bg-white/20 text-white' 
                      : 'bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300'
                  }`}>
                    {categoryCounts[category] || 0}
                  </span>
                </Button>
              ))}
            </div>
          </div>
        </motion.div>
        
        {/* Main Content */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex-1 w-full"
        >
          <ScrollArea className="w-full">
            <div className="min-h-[400px]">
              {filteredBoards.length > 0 ? (
                <BoardsList boards={filteredBoards} />
              ) : (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-100 to-indigo-100 dark:from-purple-900/50 dark:to-indigo-900/50 flex items-center justify-center mb-6">
                    <LayoutGrid className="h-12 w-12 text-purple-500" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2 text-purple-700 dark:text-purple-300">
                    {searchTerm || selectedCategory !== 'All Boards' ? 'No boards found' : 'No boards yet'}
                  </h3>
                  <p className="text-muted-foreground mb-6 max-w-md">
                    {searchTerm || selectedCategory !== 'All Boards' 
                      ? 'Try adjusting your search or filter criteria'
                      : 'Create your first board to start organizing your team\'s tasks'
                    }
                  </p>
                  {!searchTerm && selectedCategory === 'All Boards' && (
                    <Button 
                      onClick={() => setOpen(true)}
                      className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Create Your First Board
                    </Button>
                  )}
                </div>
              )}
            </div>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        </motion.div>
      </div>
      
      <CreateBoardDialog 
        open={open} 
        onOpenChange={setOpen} 
        onCreateBoard={handleCreateBoard}
        teamId={teamId}
      />
    </div>
  );
}