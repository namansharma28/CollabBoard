import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { ThemeProvider } from '@/components/theme-provider';
import { Toaster } from '@/components/ui/toaster';
import { NextAuthProvider } from '@/components/providers';
import { Toaster as HotToaster } from "react-hot-toast";
import { ToastProvider } from '@/components/ui/use-toast';

const inter = Inter({ subsets: ['latin'], weight: ['400', '500', '700'] });

export const metadata: Metadata = {
  title: 'TeamLane | Collaborative Workspace',
  description: 'A collaborative workspace for teams to organize, track progress, and communicate efficiently',
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