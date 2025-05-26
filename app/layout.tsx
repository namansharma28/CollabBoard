import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { ThemeProvider } from '@/components/theme-provider';
import { Toaster } from '@/components/ui/toaster';
import { NextAuthProvider } from '@/components/providers';
import { Toaster as HotToaster } from "react-hot-toast";
import { ToastProvider } from '@/components/ui/use-toast';

const inter = Inter({ subsets: ['latin'], weight: ['400', '500', '700'] });


export const metadata = {
  title: "TeamLane – All-in-One Collaborative Workspace",
  description: "Manage tasks, notes, and team communication in real-time. Streamline your team's workflow with TeamLane.",
  keywords: ["team collaboration", "kanban app", "project management", "real-time tasks", "TeamLane", "team notes", "workspace tool"],
  openGraph: {
    title: "TeamLane",
    description: "Collaborate with your team, all in one space.",
    url: "https://teamlane.vercel.app", // replace with your real URL
    siteName: "TeamLane",
    images: [
      {
        url: "/teamlane-screenshot.png", // Make a nice banner for social sharing
        width: 1200,
        height: 630,
        alt: "TeamLane Screenshot",
      },
    ],
    type: "website",
  },
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#6f42c1" />
        <meta name="google-site-verification" content="4qgP4ffjaHbqpkY0w9tzvZ6_jN0X-Y39XxCuL2kztgY" />
      </head>
      <body className={inter.className}>
        <NextAuthProvider>
          <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
            <ToastProvider>
              {children}
              <Toaster />
              <HotToaster position="top-center" />
            </ToastProvider>
          </ThemeProvider>
        </NextAuthProvider>
      </body>
    </html>
  );
}