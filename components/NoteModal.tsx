// components/NoteModal.tsx
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react"; // Import trash icon
import { formatDistanceToNow } from 'date-fns';
import { useSession } from "next-auth/react"; // For checking current user

// Define the Note interface
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

// Update interface to include team role
interface NoteModalProps {
  note: Note | null;
  isOpen: boolean;
  onClose: () => void;
  teamRole?: string; // Add this for checking admin status
  onDelete: (noteId: string) => Promise<void>;
}

export function NoteModal({ note, isOpen, onClose, teamRole, onDelete }: NoteModalProps) {
  const { data: session } = useSession();
  if (!note) return null;

  const canDelete = 
    session?.user?.email === note.createdBy.email || // Note creator
    teamRole === 'admin'; // Team admin

  const handleDelete = async () => {
    if (!note._id) return;
    try {
      await onDelete(note._id);
      onClose();
    } catch (error) {
      console.error('Error deleting note:', error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader className="flex flex-row items-start justify-between">
          <div>
            <DialogTitle>{note.title}</DialogTitle>
            <div className="flex flex-col space-y-1 text-sm text-gray-500">
              <p>By {note.createdBy.name || note.createdBy.email}</p>
              <p>{formatDistanceToNow(new Date(note.createdAt), { addSuffix: true })}</p>
            </div>
          </div>
          {canDelete && (
            <Button 
              variant="destructive" 
              size="icon"
              onClick={handleDelete}
              className="h-8 w-8"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </DialogHeader>
        <div className="mt-4">
          <p className="whitespace-pre-wrap">{note.content}</p>
        </div>
      </DialogContent>
    </Dialog>
  );
}