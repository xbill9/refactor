'use client';

import React from 'react'; // Removed useEffect, useState
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
// import { useUser, useAuth, initiateAnonymousSignIn } from '@/firebase'; // Auth related imports removed
import FileUploadAndRefactorTab from '@/components/FileUploadAndRefactorTab';
import BucketScanTab from '@/components/BucketScanTab';
import { FileUp, HardDriveDownload } from 'lucide-react'; // Loader2, Card, Button, Link removed as auth flow is gone

export default function HomePage() {
  // All auth related state and effects removed
  // const { user, isUserLoading } = useUser();
  // const auth = useAuth();
  // const [authChecked, setAuthChecked] = useState(false);

  // useEffect(() => {
  //   if (!isUserLoading) {
  //     if (!user && auth) {
  //       initiateAnonymousSignIn(auth); 
  //     }
  //     setAuthChecked(true);
  //   }
  // }, [isUserLoading, user, auth]);

  // if (isUserLoading || !authChecked) {
  //   return (
  //     <div className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center bg-background p-6 text-center">
  //       <Loader2 className="h-16 w-16 animate-spin text-primary mb-6" />
  //       <h1 className="text-2xl font-semibold text-primary">Loading PHP Refactor Pro...</h1>
  //       <p className="text-muted-foreground">Initializing services...</p>
  //     </div>
  //   );
  // }
  
  // if (!user) {
  //    return (
  //     <div className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center bg-background p-6 text-center">
  //       <Card className="w-full max-w-lg shadow-xl">
  //           <CardHeader>
  //               <CardTitle className="text-3xl font-bold text-primary">Welcome to PHP Refactor Pro</CardTitle>
  //               <CardDescription>
  //                   Loading application.
  //               </CardDescription>
  //           </CardHeader>
  //           <CardContent className="flex flex-col space-y-4 items-center">
  //                <Loader2 className="h-12 w-12 animate-spin text-primary" />
  //                <p className="text-muted-foreground">Initializing...</p>
  //           </CardContent>
  //       </Card>
  //     </div>
  //   );
  // }

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
