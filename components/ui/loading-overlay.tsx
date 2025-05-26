import { Loading } from "./loading";

interface LoadingOverlayProps {
  isLoading: boolean;
  className?: string;
}

export function LoadingOverlay({ isLoading, className = "" }: LoadingOverlayProps) {
  if (!isLoading) return null;

  return (
    <div className={`absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm z-50 ${className}`}>
      <div className="flex flex-col items-center space-y-2">
        <Loading size="md" />
        <p className="text-sm text-muted-foreground">Loading...</p>
      </div>
    </div>
  );
} 