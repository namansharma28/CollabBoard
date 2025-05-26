// app/(main)/[teamId]/notes/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { CreateNoteDialog } from "@/components/CreateNoteDialog";
import { NoteModal } from "@/components/NoteModal";
import { formatDistanceToNow } from 'date-fns';
import { LoadingPage } from '@/components/ui/loading-page';

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
  const [teamRole, setTeamRole] = useState<string>(''); // Add this for storing user's team role

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

  if (!teamId) return <div>Invalid team ID</div>;
  if (loading) return <div>
  <LoadingPage />
</div>;
  if (error) return <div className="text-red-500">Error: {error}</div>;


  return (
    <div className="container mx-auto px-4 py-12">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-bold">Team Notes</h2>
        <CreateNoteDialog teamId={teamId} onNoteCreated={fetchNotes} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {notes.map((note) => (
          <Card 
            key={note._id} 
            className="hover:shadow-lg transition-shadow cursor-pointer h-[250px] flex flex-col hover:border-primary/50"
            onClick={() => setSelectedNote(note)}
          >
            <CardHeader className="flex-none">
              <div className="flex justify-between items-start">
                <h3 className="text-xl font-semibold truncate">{note.title}</h3>
                <span className="text-xs text-gray-500 flex-shrink-0">
                  {formatDistanceToNow(new Date(note.createdAt), { addSuffix: true })}
                </span>
              </div>
              <p className="text-sm text-gray-500">
                By {note.createdBy.name || note.createdBy.email}
              </p>
            </CardHeader>
            <CardContent className="flex-1 overflow-hidden">
              <p className="text-gray-600 line-clamp-3">
                {note.content}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

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