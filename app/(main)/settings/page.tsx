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
import { ArrowLeft, User, Trash2, Save, AlertTriangle } from "lucide-react";
import { LoadingPage } from "@/components/ui/loading-page";
import { motion } from "framer-motion";

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
      <div className="min-h-screen bg-gradient-to-br from-purple-50/30 via-transparent to-indigo-50/30 dark:from-purple-950/20 dark:via-transparent dark:to-indigo-950/20 flex flex-col items-center justify-center">
        <div className="text-center">
          <p className="mb-4 text-lg">Please sign in to view your settings</p>
          <Button 
            onClick={() => router.push('/login')}
            className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white"
          >
            Sign In
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50/30 via-transparent to-indigo-50/30 dark:from-purple-950/20 dark:via-transparent dark:to-indigo-950/20">
      {/* Animated background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-indigo-400/20 to-purple-400/20 rounded-full blur-3xl animate-pulse animation-delay-2000"></div>
      </div>

      <div className="container max-w-4xl py-6 space-y-6 relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
        >
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center">
              <User className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                Profile Settings
              </h1>
              <p className="text-muted-foreground">
                Manage your personal account settings
              </p>
            </div>
          </div>
          {lastTeamId && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleBackToTeam}
              className="border-purple-200 hover:bg-purple-50 dark:border-purple-800 dark:hover:bg-purple-950/50"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Team
            </Button>
          )}
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <Tabs defaultValue="profile" className="w-full">
            <TabsList className="mb-6 bg-white/80 dark:bg-slate-950/80 backdrop-blur-sm border border-purple-200/50 dark:border-purple-800/50">
              <TabsTrigger value="profile" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-indigo-500 data-[state=active]:text-white">
                Profile
              </TabsTrigger>
              <TabsTrigger value="account" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-red-500 data-[state=active]:to-red-600 data-[state=active]:text-white">
                Account
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="profile" className="space-y-6">
              <Card className="border-purple-200/50 dark:border-purple-800/50 bg-white/80 dark:bg-slate-950/80 backdrop-blur-sm shadow-lg">
                <CardHeader>
                  <CardTitle className="text-xl bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                    Personal Information
                  </CardTitle>
                  <CardDescription>Update your personal details</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center space-x-6 p-4 bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-950/50 dark:to-indigo-950/50 rounded-lg border border-purple-200/50 dark:border-purple-800/50">
                    <Avatar className="h-20 w-20 border-4 border-white dark:border-slate-950 shadow-lg">
                      <AvatarImage src={session.user.image || ''} alt={session.user.name || 'User'} />
                      <AvatarFallback className="bg-gradient-to-br from-purple-500 to-indigo-500 text-white text-xl font-semibold">
                        {session.user.name?.split(' ').map(name => name[0]).join('').toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-lg font-semibold text-purple-700 dark:text-purple-300">
                        {session.user.name || 'User'}
                      </p>
                      <p className="text-sm text-muted-foreground">{session.user.email || ''}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Profile picture is managed by your Google account
                      </p>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input 
                      id="name" 
                      value={name} 
                      onChange={(e) => setName(e.target.value)} 
                      placeholder="Your name"
                      className="border-purple-200/50 dark:border-purple-800/50 focus:ring-purple-500"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input 
                      id="email" 
                      value={session.user.email || ''} 
                      disabled 
                      placeholder="Your email address"
                      className="border-purple-200/50 dark:border-purple-800/50 bg-purple-50/50 dark:bg-purple-950/20"
                    />
                    <p className="text-xs text-muted-foreground">
                      Email address cannot be changed as it's linked to your Google account
                    </p>
                  </div>
                  
                  <div className="flex justify-end pt-4">
                    <Button 
                      onClick={handleSaveSettings} 
                      disabled={isSaving}
                      className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                    >
                      {isSaving ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="mr-2 h-4 w-4" />
                          Save Changes
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="account" className="space-y-6">
              <Card className="border-red-200/50 dark:border-red-800/50 bg-gradient-to-br from-red-50/50 to-orange-50/50 dark:from-red-950/20 dark:to-orange-950/20 backdrop-blur-sm shadow-lg">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <AlertTriangle className="h-6 w-6 text-red-500" />
                    <div>
                      <CardTitle className="text-red-600 dark:text-red-400">Danger Zone</CardTitle>
                      <CardDescription>
                        Actions here cannot be undone. Be careful.
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between p-4 border border-red-200 dark:border-red-800 rounded-lg bg-white/50 dark:bg-slate-950/50">
                    <div>
                      <h3 className="font-medium text-red-600 dark:text-red-400 flex items-center gap-2">
                        <Trash2 className="h-4 w-4" />
                        Delete Account
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        This will permanently remove your account and all associated data
                      </p>
                    </div>
                    <Button 
                      variant="destructive" 
                      onClick={() => setShowDeleteConfirm(true)}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete Account
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </motion.div>
        
        <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
          <AlertDialogContent className="border-red-200/50 dark:border-red-800/50 bg-white/95 dark:bg-slate-950/95 backdrop-blur-sm">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-red-600 dark:text-red-400 flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Are you absolutely sure?
              </AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete your account
                and remove all of your data from our servers.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="border-purple-200 hover:bg-purple-50 dark:border-purple-800 dark:hover:bg-purple-950/50">
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction 
                onClick={handleDeleteAccount} 
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Account
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}