"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { signIn } from "next-auth/react";
import { toast } from "react-hot-toast";

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const from = searchParams?.get("from") || "/team-selection";
  const [isLoading, setIsLoading] = useState(false);
  
  // Check for error message in the URL
  const error = searchParams?.get("error");
  
  // Show error toast if error exists
  if (error) {
    toast.error(`Login error: ${error}`);
  }

  const handleGoogleLogin = async () => {
    try {
      setIsLoading(true);
      // Use redirect: true to let NextAuth handle the redirect flow natively
      await signIn("google", { 
        callbackUrl: from,
        redirect: true
      });
      // No need to handle redirect manually as NextAuth will do it
    } catch (error) {
      console.error("Google login failed:", error);
      toast.error("Google login failed. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl">Welcome back</CardTitle>
        <CardDescription>
          Sign in to your account using Google
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <Button
          className="w-full"
          variant="outline"
          onClick={handleGoogleLogin}
          disabled={isLoading}
        >
          {isLoading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
          )}
          Continue with Google
        </Button>

        <div className="text-center w-full text-sm">
          Don&apos;t have an account?{" "}
          <Link
            href="/register"
            className="text-primary underline-offset-4 hover:underline"
          >
            Sign up
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <Card className="w-full">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl">Loading...</CardTitle>
        </CardHeader>
      </Card>
    }>
      <LoginContent />
    </Suspense>
  );
}