"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle,
  DialogFooter,
  DialogClose
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "react-hot-toast";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Copy, UserMinus, UserPlus, LogOut } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface TeamMember {
  userId?: string;
  email: string;
  name?: string;
  role: 'admin' | 'member';
  joinedAt: string;
}

interface TeamMembersDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  teamId: string;
  teamCode?: string;
}

export function TeamMembersDialog({
  open,
  onOpenChange,
  teamId,
  teamCode = ""
}: TeamMembersDialogProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [inviteEmail, setInviteEmail] = useState("");
  const [joinCode, setJoinCode] = useState(teamCode);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [leaveConfirmOpen, setLeaveConfirmOpen] = useState(false);

  useEffect(() => {
    if (open) {
      fetchMembers();
    }
  }, [open, teamId]);

  const fetchMembers = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/teams/${teamId}/members`);
      if (!response.ok) {
        throw new Error("Failed to fetch team members");
      }
      const data = await response.json();
      setMembers(data.members);
      
      // Check if current user is admin
      const currentUserEmail = session?.user?.email;
      const currentUser = data.members.find((member: TeamMember) => member.email === currentUserEmail);
      setIsAdmin(currentUser?.role === 'admin');
      
      // Get join code if admin
      if (currentUser?.role === 'admin' && !joinCode) {
        const codeResponse = await fetch(`/api/teams/${teamId}/code`);
        if (codeResponse.ok) {
          const codeData = await codeResponse.json();
          setJoinCode(codeData.code);
        }
      }
    } catch (error) {
      console.error("Error fetching team members:", error);
      toast.error("Failed to load team members");
    } finally {
      setIsLoading(false);
    }
  };

  const handleInvite = async () => {
    if (!inviteEmail.trim() || !inviteEmail.includes('@')) {
      toast.error("Please enter a valid email address");
      return;
    }

    try {
      const response = await fetch(`/api/teams/${teamId}/invite`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: inviteEmail.trim() }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to invite member");
      }

      toast.success(`Invitation sent to ${inviteEmail}`);
      setInviteEmail("");
      fetchMembers();
    } catch (error) {
      console.error("Error inviting member:", error);
      toast.error(error instanceof Error ? error.message : "Failed to invite member");
    }
  };

  const handleRemoveMember = async (email: string) => {
    if (!isAdmin) {
      toast.error("Only admins can remove members");
      return;
    }

    // Cannot remove yourself if you're the only admin
    if (email === session?.user?.email) {
      const adminCount = members.filter(m => m.role === 'admin').length;
      if (adminCount <= 1) {
        toast.error("Cannot remove yourself as you are the only admin");
        return;
      }
    }

    try {
      const response = await fetch(`/api/teams/${teamId}/members/${encodeURIComponent(email)}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to remove member");
      }

      toast.success("Member removed successfully");
      fetchMembers();
    } catch (error) {
      console.error("Error removing member:", error);
      toast.error(error instanceof Error ? error.message : "Failed to remove member");
    }
  };

  const handleCopyCode = () => {
    if (joinCode) {
      navigator.clipboard.writeText(joinCode);
      setIsCopied(true);
      toast.success("Team code copied to clipboard");
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  const getInitials = (name?: string) => {
    if (!name) return "?";
    return name
      .split(" ")
      .map(n => n[0])
      .join("")
      .toUpperCase();
  };

  const handleLeaveTeam = async () => {
    if (!session?.user?.email) return;
    
    // Check if user is the only admin
    if (isAdmin) {
      const adminCount = members.filter(m => m.role === 'admin').length;
      if (adminCount <= 1) {
        toast.error("Cannot leave the team as you are the only admin. Please promote another member to admin first.");
        return;
      }
    }

    try {
      const response = await fetch(`/api/teams/${teamId}/members/${encodeURIComponent(session.user.email)}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to leave team");
      }

      toast.success("You have left the team");
      onOpenChange(false);
      // Redirect to team selection page
      router.push('/team-selection');
    } catch (error) {
      console.error("Error leaving team:", error);
      toast.error(error instanceof Error ? error.message : "Failed to leave team");
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Team Members</DialogTitle>
            <DialogDescription>
              Manage your team members and invitations.
            </DialogDescription>
          </DialogHeader>

          {isAdmin && (
            <div className="space-y-4 py-2 pb-4">
              <div className="space-y-2">
                <Label htmlFor="teamCode">Team Join Code</Label>
                <div className="flex items-center space-x-2">
                  <Input
                    id="teamCode"
                    value={joinCode}
                    readOnly
                    className="flex-1"
                  />
                  <Button 
                    type="button" 
                    size="icon" 
                    variant="outline" 
                    onClick={handleCopyCode}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Share this code with others to let them join your team
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="inviteEmail">Add by Email</Label>
                <div className="flex items-center space-x-2">
                  <Input
                    id="inviteEmail"
                    type="email"
                    placeholder="colleague@example.com"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    className="flex-1"
                  />
                  <Button 
                    type="button" 
                    size="icon" 
                    onClick={handleInvite}
                  >
                    <UserPlus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-4 max-h-[300px] overflow-y-auto">
            <h3 className="text-sm font-medium">Current Members</h3>
            {isLoading ? (
              <div className="text-center py-2">Loading members...</div>
            ) : (
              <div className="space-y-2">
                {members.map((member) => (
                  <div
                    key={member.email}
                    className="flex items-center justify-between p-2 rounded-md border"
                  >
                    <div className="flex items-center space-x-2">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback>{getInitials(member.name)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium">{member.name || member.email}</p>
                        <p className="text-xs text-muted-foreground">
                          {member.role} • {new Date(member.joinedAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    {isAdmin && member.email !== session?.user?.email && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveMember(member.email)}
                      >
                        <UserMinus className="h-4 w-4 text-red-500" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          <DialogFooter className="flex justify-between items-center">
            <Button 
              type="button" 
              variant="destructive" 
              onClick={() => setLeaveConfirmOpen(true)}
              size="sm"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Leave Team
            </Button>
            <Button type="button" onClick={() => onOpenChange(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={leaveConfirmOpen} onOpenChange={setLeaveConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to leave this team?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. You will need to be invited back to rejoin the team.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleLeaveTeam} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Leave Team
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
} 