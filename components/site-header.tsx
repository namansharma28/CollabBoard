"use client";

import Link from "next/link";
import { MainNav } from "@/components/main-nav";
import { ThemeToggle } from "@/components/theme-toggle";
import { UserNav } from "@/components/user-nav";
import { useRouter, useParams } from "next/navigation";
import { ImageWithFallback } from "@/components/ui/image-with-fallback";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";

export function SiteHeader() {
  const router = useRouter();
  const params = useParams() || {};
  const teamId = params.teamId as string;
  const { theme } = useTheme();
  
  return (
    <header className="sticky top-0 z-40 w-full border-b border-purple-200/50 dark:border-purple-800/50 bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl">
      <div className="container flex h-16 items-center space-x-4 sm:justify-between sm:space-x-0">
        <div className="flex items-center gap-6 md:gap-10">
          <Link href="/" className="flex items-center space-x-2 group">
            <div className="relative">
              <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center transition-transform duration-300 group-hover:scale-110">
                <ImageWithFallback 
                  src="/teamlane.svg" 
                  fallbackSrc="/teamlane.png" 
                  alt="TeamLane Logo" 
                  className="h-5 w-auto"
                />
              </div>
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-indigo-600 opacity-0 group-hover:opacity-20 rounded-full blur-xl transition-opacity"></div>
            </div>
            <span className="hidden font-bold sm:inline-block bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
              TeamLane
            </span>
          </Link>
          <MainNav />
        </div>
        <div className="flex flex-1 items-center justify-end space-x-4">
          <nav className="flex items-center space-x-1">
            <ThemeToggle />
            <UserNav />
          </nav>
        </div>
      </div>
    </header>
  );
}