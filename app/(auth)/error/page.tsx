'use client';

import { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { AlertCircle } from 'lucide-react';

function ErrorContent() {
  const router = useRouter();
  const searchParams = useSearchParams() || new URLSearchParams();
  
  const error = searchParams.get('error') || 'An unknown error occurred';
  
  // Automatically redirect to login after 5 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      router.push('/login');
    }, 5000);
    
    return () => clearTimeout(timer);
  }, [router]);
  
  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <div className="flex items-center space-x-2">
          <AlertCircle className="h-6 w-6 text-red-500" />
          <CardTitle>Authentication Error</CardTitle>
        </div>
        <CardDescription>
          There was a problem signing you in
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="p-4 bg-red-50 rounded-md border border-red-200 text-red-800">
          {error}
        </div>
        <p className="mt-4 text-sm text-gray-600">
          You'll be redirected to the login page in 5 seconds, or you can click the button below.
        </p>
      </CardContent>
      <CardFooter>
        <Button onClick={() => router.push('/login')} className="w-full">
          Return to Login
        </Button>
      </CardFooter>
    </Card>
  );
}

export default function AuthErrorPage() {
  return (
    <Suspense fallback={
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Loading...</CardTitle>
        </CardHeader>
      </Card>
    }>
      <ErrorContent />
    </Suspense>
  );
} 