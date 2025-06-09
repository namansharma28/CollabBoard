// app/(main)/[teamId]/notes/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { CreateNoteDialog } from "@/components/CreateNoteDialog";
import { NoteModal } from "@/components/NoteModal";
import { formatDistanceToNow } from 'date-fns';
import { LoadingPage } from '@/components/ui/loading-page';
import { motion } from "framer-motion";
import { FileText, Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Note {
  _id: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  createdBy: {
    email: string;
    name?: string;
  };
}

export default function NotesPage() {
  const params = useParams();
  const teamId = params?.teamId as string;
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [teamRole, setTeamRole] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');

  // Add function to fetch team role
  const fetchTeamRole = async () => {
    if (!teamId) return;
    
    try {
      const response = await fetch(`/api/teams/${teamId}/role`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch team role');
      }
      const data = await response.json();
      setTeamRole(data.role);
    } catch (error) {
      console.error('Error fetching team role:', error);
    }
  };

  const fetchNotes = async () => {
    if (!teamId) return;
    
    try {
      const response = await fetch(`/api/teams/${teamId}/notes`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch notes');
      }
      const data = await response.json();
      setNotes(data);
    } catch (error) {
      console.error('Error:', error);
      setError(error instanceof Error ? error.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (teamId) {
      fetchNotes();
      fetchTeamRole();
    }
  }, [teamId]);

  // Add delete function
  const handleDeleteNote = async (noteId: string) => {
    if (!teamId) return;
    
    try {
      const response = await fetch(`/api/teams/${teamId}/notes/${noteId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete note');
      }

      // Close the modal first
      setSelectedNote(null);
      // Then refresh notes
      await fetchNotes();
    } catch (error) {
      console.error('Error:', error);
      // You might want to show this error to the user
      alert(error instanceof Error ? error.message : 'Failed to delete note');
    }
  };

  // Filter notes based on search term
  const filteredNotes = notes.filter(note =>
    note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    note.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!teamId) return <div>Invalid team ID</div>;
  if (loading) return <div>
    <LoadingPage />
  </div>;
  if (error) return <div className="text-red-500">Error: {error}</div>;

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
              <FileText className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                Team Notes
              </h1>
              <p className="text-muted-foreground text-lg">
                Collaborate on shared notes and documentation
              </p>
            </div>
          </div>
          <CreateNoteDialog teamId={teamId} onNoteCreated={fetchNotes} />
        </div>

        {/* Search Bar */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <input
            type="search"
            placeholder="Search notes..."
            className="w-full rounded-xl border border-purple-200/50 dark:border-purple-800/50 bg-white/80 dark:bg-slate-950/80 backdrop-blur-sm py-3 pl-10 pr-4 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2 transition-all duration-300"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </motion.div>

      {/* Notes Grid */}
      {filteredNotes.length > 0 ? (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {filteredNotes.map((note, index) => (
            <motion.div
              key={note._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
            >
              <Card 
                className="hover:shadow-xl transition-all duration-300 cursor-pointer h-[280px] flex flex-col hover:border-purple-300 dark:hover:border-purple-700 bg-white/80 dark:bg-slate-950/80 backdrop-blur-sm border-purple-200/50 dark:border-purple-800/50 group hover:-translate-y-1"
                onClick={() => setSelectedNote(note)}
              >
                <CardHeader className="flex-none pb-3">
                  <div className="flex justify-between items-start gap-3">
                    <h3 className="text-lg font-semibold truncate group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                      {note.title}
                    </h3>
                    <div className="flex flex-col items-end gap-1 flex-shrink-0">
                      <span className="text-xs text-muted-foreground bg-purple-50 dark:bg-purple-950/50 px-2 py-1 rounded-full">
                        {formatDistanceToNow(new Date(note.createdAt), { addSuffix: true })}
                      </span>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    By {note.createdBy.name || note.createdBy.email}
                  </p>
                </CardHeader>
                <CardContent className="flex-1 overflow-hidden">
                  <div className="relative h-full">
                    <p className="text-muted-foreground line-clamp-6 leading-relaxed">
                      {note.content}
                    </p>
                    <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-white dark:from-slate-950 to-transparent pointer-events-none"></div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      ) : (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex flex-col items-center justify-center py-16 text-center"
        >
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-100 to-indigo-100 dark:from-purple-900/50 dark:to-indigo-900/50 flex items-center justify-center mb-6">
            <FileText className="h-12 w-12 text-purple-500" />
          </div>
          <h3 className="text-xl font-semibold mb-2 text-purple-700 dark:text-purple-300">
            {searchTerm ? 'No notes found' : 'No notes yet'}
          </h3>
          <p className="text-muted-foreground mb-6 max-w-md">
            {searchTerm 
              ? 'Try adjusting your search criteria'
              : 'Create your first note to start documenting and sharing knowledge with your team'
            }
          </p>
          {!searchTerm && (
            <CreateNoteDialog teamId={teamId} onNoteCreated={fetchNotes} />
          )}
        </motion.div>
      )}

      <NoteModal 
        note={selectedNote} 
        isOpen={!!selectedNote} 
        onClose={() => setSelectedNote(null)}
        teamRole={teamRole}
        onDelete={handleDeleteNote}
      />
    </div>
  );
}