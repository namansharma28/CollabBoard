import { SiteHeader } from "@/components/site-header";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex min-h-screen flex-col px-2 md:px-4 lg:px-6">
      <SiteHeader />
      <div className="flex-1 container py-1 md:py-3">
        {children}
      </div>
      <footer className="border-t py-6 md:py-0">
        <div className="container flex flex-col items-center justify-between gap-4 md:h-14 md:flex-row">
          <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
            © 2025 TeamLane. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}