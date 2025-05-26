import { ImageWithFallback } from "./image-with-fallback";

interface LoadingProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function Loading({ size = "md", className = "" }: LoadingProps) {
  const sizeClasses = {
    sm: "h-6 w-6",
    md: "h-8 w-8",
    lg: "h-12 w-12"
  };

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div className={`relative ${sizeClasses[size]}`}>
        <div className="absolute inset-0 animate-spin">
          <ImageWithFallback
            src="/teamlane.svg"
            fallbackSrc="/teamlane.png"
            alt="Loading..."
            className="h-full w-full"
          />
        </div>
        <div className="absolute inset-0">
          <div className="h-full w-full rounded-full" />
        </div>
      </div>
    </div>
  );
} 