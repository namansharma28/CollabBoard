import { Loading } from "./loading";

export function LoadingPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="flex flex-col items-center space-y-4">
        <Loading size="lg" />
        <p className="text-muted-foreground animate-pulse">Loading...</p>
      </div>
    </div>
  );
} 