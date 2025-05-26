'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "@/components/ui/use-toast";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { ArrowLeft } from "lucide-react";
import { LoadingPage } from "@/components/ui/loading-page";
interface UserSettings {
  name: string;
  email: string;
  image: string;
}

export default function UserSettingsPage() {
  const { data: session, update: updateSession } = useSession();
  const router = useRouter();

  const [userData, setUserData] = useState<UserSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [lastTeamId, setLastTeamId] = useState<string | null>(null);
  
  // Simplified form data - only name
  const [name, setName] = useState('');

  // Get last visited team ID from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedTeamId = localStorage.getItem('lastVisitedTeamId');
      setLastTeamId(savedTeamId);
    }
  }, []);

  useEffect(() => {
    const fetchUserData = async () => {
      if (!session?.user?.email) {
        setIsLoading(false);
        return;
      }
      
      try {
        const response = await fetch('/api/user/settings');
        if (!response.ok) {
          throw new Error('Failed to fetch user data');
        }
        const data = await response.json();
        setUserData(data);
        setName(data.name || session?.user?.name || '');
      } catch (error) {
        console.error('Error fetching user data:', error);
        toast({
          title: 'Error',
          description: 'Failed to load user settings',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, [session]);

  const handleSaveSettings = async () => {
    if (!name.trim()) {
      toast({
        title: 'Error',
        description: 'Name cannot be empty',
        variant: 'destructive',
      });
      return;
    }
    
    setIsSaving(true);
    try {
      const response = await fetch('/api/user/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      });

      if (!response.ok) {
        throw new Error('Failed to update user settings');
      }

      // Get the updated user data from the response
      const updatedData = await response.json();

      // Update the session with new user information
      await updateSession({
        ...session,
        user: {
          ...session?.user,
          name: updatedData.name || name,
        },
      });

      toast({
        title: 'Success',
        description: 'Your name has been updated',
      });
      
      // Update local state
      setUserData(updatedData);
      
      // Force a reload to update the UI everywhere
      router.refresh();
      
    } catch (error) {
      console.error('Error saving user settings:', error);
      toast({
        title: 'Error',
        description: 'Failed to update settings',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    try {
      const response = await fetch('/api/user', {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete account');
      }

      toast({
        title: 'Account Deleted',
        description: 'Your account has been permanently deleted',
      });
      
      // Sign out and redirect to home page
      router.push('/auth/signout?callbackUrl=/');
      
    } catch (error) {
      console.error('Error deleting account:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete account',
        variant: 'destructive',
      });
    } finally {
      setShowDeleteConfirm(false);
    }
  };

  const handleBackToTeam = () => {
    if (lastTeamId) {
      router.push(`/${lastTeamId}/dashboard`);
    } else {
      router.push('/team-selection');
    }
  };

  if (isLoading) {
    return <div className="flex items-center justify-center h-full">
      <LoadingPage />
    </div>;
  }

  if (!session?.user) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <p className="mb-4">Please sign in to view your settings</p>
        <Button onClick={() => router.push('/login')}>Sign In</Button>
      </div>
    );
  }

  return (
    <div className="container max-w-4xl py-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Profile Settings</h1>
        {lastTeamId && (
          <Button variant="outline" size="sm" onClick={handleBackToTeam}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Team
          </Button>
        )}
      </div>
      
      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="account">Account</TabsTrigger>
        </TabsList>
        
        <TabsContent value="profile" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>Update your personal details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-4 mb-6">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={session.user.image || ''} alt={session.user.name || 'User'} />
                  <AvatarFallback>{session.user.name?.split(' ').map(name => name[0]).join('').toUpperCase() || 'U'}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium">{session.user.name || 'User'}</p>
                  <p className="text-xs text-muted-foreground">{session.user.email || ''}</p>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input 
                  id="name" 
                  value={name} 
                  onChange={(e) => setName(e.target.value)} 
                  placeholder="Your name" 
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input 
                  id="email" 
                  value={session.user.email || ''} 
                  disabled 
                  placeholder="Your email address"
                />
                <p className="text-xs text-muted-foreground">
                  Email address cannot be changed
                </p>
              </div>
              
              <div className="flex justify-end">
                <Button onClick={handleSaveSettings} disabled={isSaving}>
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="account" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-red-500">Danger Zone</CardTitle>
              <CardDescription>
                Actions here cannot be undone. Be careful.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-red-500">Delete Account</h3>
                  <p className="text-sm text-muted-foreground">
                    This will permanently remove your account and all associated data
                  </p>
                </div>
                <Button 
                  variant="destructive" 
                  onClick={() => setShowDeleteConfirm(true)}
                >
                  Delete Account
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your account
              and remove all of your data from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteAccount} className="bg-red-500 hover:bg-red-600">
              Delete Account
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
} 