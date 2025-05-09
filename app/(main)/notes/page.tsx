"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default function NotesPage() {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex flex-col space-y-6">
      <div className="flex flex-col space-y-2">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">Notes</h1>
          <Button onClick={() => setOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Note
          </Button>
        </div>
        <p className="text-muted-foreground">
          Create and share notes with your team in real-time
        </p>
      </div>
      
      <div className="flex items-center justify-center h-[400px] border rounded-lg bg-muted/50">
        <p className="text-muted-foreground">Notes feature coming soon</p>
      </div>
    </div>
  );
}