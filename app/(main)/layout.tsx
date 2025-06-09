import { SiteHeader } from "@/components/site-header";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex min-h-screen flex-col bg-gradient-to-br from-purple-50/30 via-transparent to-indigo-50/30 dark:from-purple-950/20 dark:via-transparent dark:to-indigo-950/20">
      {/* Animated background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-indigo-400/20 to-purple-400/20 rounded-full blur-3xl animate-pulse animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-purple-300/10 to-indigo-300/10 rounded-full blur-3xl animate-pulse animation-delay-4000"></div>
      </div>

      <SiteHeader />
      <div className="flex-1 container py-1 md:py-3 relative z-10">
        {children}
      </div>
      <footer className="border-t border-purple-200/50 dark:border-purple-800/50 py-6 md:py-0 bg-white/80 dark:bg-slate-950/80 backdrop-blur-sm relative z-10">
        <div className="container flex flex-col items-center justify-between gap-4 md:h-14 md:flex-row">
          <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
            © 2025 TeamLane. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}