// components/NoteModal.tsx
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Trash2, FileText, User, Calendar } from "lucide-react"; // Import trash icon
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
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto border-purple-200/50 dark:border-purple-800/50 bg-white/95 dark:bg-slate-950/95 backdrop-blur-sm">
        <DialogHeader className="flex flex-row items-start justify-between space-y-0 pb-4 border-b border-purple-200/50 dark:border-purple-800/50">
          <div className="flex items-start gap-4 flex-1">
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center flex-shrink-0">
              <FileText className="h-6 w-6 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent mb-3">
                {note.title}
              </DialogTitle>
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  <span>By {note.createdBy.name || note.createdBy.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span>Created {formatDistanceToNow(new Date(note.createdAt), { addSuffix: true })}</span>
                </div>
                {note.updatedAt !== note.createdAt && (
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>Updated {formatDistanceToNow(new Date(note.updatedAt), { addSuffix: true })}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
          {canDelete && (
            <Button 
              variant="outline" 
              size="icon"
              onClick={handleDelete}
              className="h-10 w-10 border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-950/50 flex-shrink-0"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </DialogHeader>
        <div className="mt-6 p-6 bg-gradient-to-br from-purple-50/50 to-indigo-50/50 dark:from-purple-950/20 dark:to-indigo-950/20 rounded-lg border border-purple-200/50 dark:border-purple-800/50">
          <div className="prose prose-gray dark:prose-invert max-w-none">
            <p className="whitespace-pre-wrap leading-relaxed text-base">
              {note.content}
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}