import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen grid grid-cols-1 md:grid-cols-2">
      <div className="hidden md:flex bg-muted h-full flex-col justify-between p-10 bg-gradient-to-b from-indigo-500 to-purple-600">
        <div>
          <Link href="/" className="flex items-center">
            <span className="text-2xl font-bold text-white">TeamSpace</span>
          </Link>
        </div>
        <div className="space-y-6 text-white">
          <h1 className="text-3xl font-bold">
            Collaborate with your team, all in one space
          </h1>
          <p className="text-lg opacity-90">
            Manage tasks, take notes, and communicate with your team in real-time.
            Boost productivity and streamline your workflow.
          </p>
          <div className="flex flex-col space-y-4">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 rounded-full bg-white/20 flex items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-6 w-6"
                >
                  <rect width="18" height="18" x="3" y="3" rx="2" />
                  <path d="M7 7h10" />
                  <path d="M7 12h10" />
                  <path d="M7 17h10" />
                </svg>
              </div>
              <div className="font-medium">Kanban boards for visual task management</div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 rounded-full bg-white/20 flex items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-6 w-6"
                >
                  <path d="M14 4v10.54a4 4 0 1 1-4 0V4a2 2 0 0 1 4 0Z" />
                </svg>
              </div>
              <div className="font-medium">Real-time collaborative notes</div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 rounded-full bg-white/20 flex items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-6 w-6"
                >
                  <path d="M14 9a2 2 0 0 1-2 2H6l-4 4V4c0-1.1.9-2 2-2h8a2 2 0 0 1 2 2v5Z" />
                  <path d="M18 9h2a2 2 0 0 1 2 2v11l-4-4h-6a2 2 0 0 1-2-2v-1" />
                </svg>
              </div>
              <div className="font-medium">Team chat for instant communication</div>
            </div>
          </div>
        </div>
        <div className="text-white/80 text-sm">
          © 2025 TeamSpace. All rights reserved.
        </div>
      </div>
      <div className="flex items-center justify-center p-6 md:p-8">
        <div className="w-full max-w-md space-y-6">{children}</div>
      </div>
    </div>
  );
}