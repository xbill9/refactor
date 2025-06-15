'use client';

import React, { useEffect, useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useUser, useAuth, initiateAnonymousSignIn } from '@/firebase';
import FileUploadAndRefactorTab from '@/components/FileUploadAndRefactorTab';
import BucketScanTab from '@/components/BucketScanTab';
import { Loader2, FileUp, HardDriveDownload } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function HomePage() {
  const { user, isUserLoading } = useUser();
  const auth = useAuth();
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    if (!isUserLoading) {
      if (!user && auth) {
        // Only attempt anonymous sign-in if auth service is available and no user
        initiateAnonymousSignIn(auth); 
      }
      setAuthChecked(true); // Mark that auth check and potential anonymous sign-in attempt is done
    }
  }, [isUserLoading, user, auth]);

  if (isUserLoading || !authChecked) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center bg-background p-6 text-center">
        <Loader2 className="h-16 w-16 animate-spin text-primary mb-6" />
        <h1 className="text-2xl font-semibold text-primary">Loading PHP Refactor Pro...</h1>
        <p className="text-muted-foreground">Initializing services and checking authentication.</p>
      </div>
    );
  }
  
  if (!user) {
    // This state should ideally not be reached for long if anonymous sign-in is working.
    // It might show briefly or if anonymous sign-in fails.
     return (
      <div className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center bg-background p-6 text-center">
        <Card className="w-full max-w-lg shadow-xl">
            <CardHeader>
                <CardTitle className="text-3xl font-bold text-primary">Welcome to PHP Refactor Pro</CardTitle>
                <CardDescription>
                    Please log in or register to use the app. Anonymous sign-in is being attempted.
                </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col space-y-4 items-center">
                 <Loader2 className="h-12 w-12 animate-spin text-primary" />
                 <p className="text-muted-foreground">Attempting to sign you in anonymously...</p>
                 <p className="text-sm text-muted-foreground">If this persists, please check your connection or try logging in manually.</p>
                <div className="flex space-x-4">
                    <Button asChild>
                        <Link href="/login">Login</Link>
                    </Button>
                    <Button asChild variant="outline">
                        <Link href="/register">Register</Link>
                    </Button>
                </div>
            </CardContent>
        </Card>
      </div>
    );
  }


  return (
    <div className="container mx-auto py-8 px-4 md:px-6">
      <Tabs defaultValue="file-upload" className="w-full">
        <TabsList className="grid w-full grid-cols-1 md:grid-cols-2 mb-8 bg-primary/10 p-2 rounded-lg">
          <TabsTrigger value="file-upload" className="py-3 text-base data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md rounded-md">
            <FileUp className="mr-2 h-5 w-5" /> File Upload & Refactor
          </TabsTrigger>
          <TabsTrigger value="bucket-scan" className="py-3 text-base data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md rounded-md">
            <HardDriveDownload className="mr-2 h-5 w-5" /> Bucket Scan (Mock)
          </TabsTrigger>
        </TabsList>
        <TabsContent value="file-upload">
          <FileUploadAndRefactorTab />
        </TabsContent>
        <TabsContent value="bucket-scan">
          <BucketScanTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
