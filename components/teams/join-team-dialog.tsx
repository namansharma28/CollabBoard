"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2, Users, UserPlus } from "lucide-react";
import { toast } from "react-hot-toast";

const formSchema = z.object({
  code: z.string().length(6, {
    message: "Team code must be exactly 6 characters.",
  }),
});

export function JoinTeamDialog({
  open,
  onOpenChange,
  onTeamJoined,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onTeamJoined?: () => Promise<void>;
}) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      code: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    try {
      const response = await fetch("/api/teams/join", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        throw new Error("Invalid team code");
      }

      const data = await response.json();
      toast.success("Successfully joined team!");
      
      if (onTeamJoined) {
        await onTeamJoined();
      }
      
      router.push(`/${data.id}/dashboard`);
      onOpenChange(false);
      form.reset();
    } catch (error) {
      toast.error("Failed to join team. Please check the code and try again.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px] border-purple-200/50 dark:border-purple-800/50 bg-white/95 dark:bg-slate-950/95 backdrop-blur-sm">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
              <UserPlus className="h-5 w-5 text-white" />
            </div>
            <div>
              <DialogTitle className="text-xl bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Join Team
              </DialogTitle>
              <DialogDescription>
                Enter the team code to join an existing workspace
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="code"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Team Code</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Enter 6-character code"
                      {...field}
                      value={field.value.toUpperCase()}
                      onChange={e => field.onChange(e.target.value.toUpperCase())}
                      maxLength={6}
                      className="border-purple-200/50 dark:border-purple-800/50 focus:ring-purple-500 text-center text-lg font-mono tracking-widest"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="gap-3">
              <Button 
                variant="outline" 
                onClick={() => onOpenChange(false)} 
                type="button"
                className="border-purple-200 hover:bg-purple-50 dark:border-purple-800 dark:hover:bg-purple-950/50"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={isLoading}
                className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Joining...
                  </>
                ) : (
                  <>
                    <UserPlus className="mr-2 h-4 w-4" />
                    Join Team
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}