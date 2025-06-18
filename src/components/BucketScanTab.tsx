'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { BucketScanFormSchema, type BucketScanFormValues, type CloudBucketScan } from '@/lib/schemas';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { useUser, useFirestore, useCollection } from '@/firebase';
import { addDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { collection, doc, serverTimestamp, query, where, orderBy } from 'firebase/firestore';
import { HardDriveDownload, Search, Loader2, ListChecks, FolderGit2 } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { format } from 'date-fns';

export default function BucketScanTab() {
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  const [isScanning, setIsScanning] = useState(false);

  const form = useForm<BucketScanFormValues>({
    resolver: zodResolver(BucketScanFormSchema),
    defaultValues: {
      bucketName: '',
      directoryPath: '',
      recursiveScan: false,
    },
  });
  
  const userScansQuery = React.useMemo(() => {
    if (!firestore || !user) return null;
    return query(
        collection(firestore, 'cloudBucketScans'),
        where('userId', '==', user.uid),
        orderBy('scanTimestamp', 'desc')
    );
  }, [firestore, user]);

  const { data: scans, isLoading: isLoadingScans } = useCollection<CloudBucketScan>(userScansQuery);

  const onSubmit = async (data: BucketScanFormValues) => {
    if (!user) {
      toast({ variant: 'destructive', title: 'Authentication Error', description: 'You must be logged in.' });
      return;
    }
     if (!firestore) {
       toast({ variant: 'destructive', title: 'Firestore Error', description: 'Firestore service is not available.' });
       return;
    }

    setIsScanning(true);
    try {
      const scanId = doc(collection(firestore, 'cloudBucketScans')).id;
      const newScan: Omit<CloudBucketScan, 'id'> = {
        userId: user.uid,
        bucketName: data.bucketName,
        directoryPath: data.directoryPath || '',
        scanTimestamp: new Date().toISOString(),
        phpFileIds: [], // This would be populated by a backend process
        recursiveScan: data.recursiveScan,
      };
      
      addDocumentNonBlocking(collection(firestore, 'cloudBucketScans'), { ...newScan, id: scanId });

      toast({
        title: 'Bucket Scan Initiated (Mock)',
        description: `Scan for bucket '${data.bucketName}' has been queued. This is a mock process; no actual scanning will occur.`,
      });
      form.reset();
    } catch (error: any) {
      console.error('Scan initiation error:', error);
      toast({ variant: 'destructive', title: 'Scan Error', description: error.message || 'Failed to initiate scan.' });
    } finally {
      setIsScanning(false);
    }
  };

  return (
    <div className="container mx-auto py-8 px-4 md:px-6">
      <Card className="w-full mb-8 shadow-xl">
        <CardHeader>
          <CardTitle className="text-3xl font-headline text-primary flex items-center">
            <HardDriveDownload className="mr-3 h-8 w-8" /> Cloud Bucket Scan
          </CardTitle>
          <CardDescription>
            Specify a Google Cloud Storage bucket to scan for PHP files. 
            (Note: Actual scanning and refactoring from bucket is a mock feature.)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="bucketName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-lg">Bucket Name</FormLabel>
                    <FormControl>
                      <Input placeholder="your-gcs-bucket-name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="directoryPath"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-lg">Directory Path (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="path/to/your/php_files/" {...field} />
                    </FormControl>
                    <FormDescription>
                      Leave empty to scan the entire bucket.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="recursiveScan"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 shadow-sm">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>
                        Recursive Scan
                      </FormLabel>
                      <FormDescription>
                        Scan all subdirectories within the specified path.
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full md:w-auto bg-accent hover:bg-accent/90 text-accent-foreground" disabled={!user || isScanning}>
                {isScanning ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Search className="mr-2 h-4 w-4" />}
                Start Scan (Mock)
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      <Card className="w-full shadow-xl">
        <CardHeader>
            <CardTitle className="text-2xl font-headline text-primary flex items-center">
                <ListChecks className="mr-3 h-7 w-7" /> Scan History
            </CardTitle>
            <CardDescription>
                Previous bucket scan requests.
            </CardDescription>
        </CardHeader>
        <CardContent>
            {isLoadingScans && (
                 <div className="flex justify-center items-center h-32">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                 </div>
            )}
            {!isLoadingScans && scans && scans.length === 0 && (
                <p className="text-muted-foreground text-center py-4">No scan history found.</p>
            )}
            {!isLoadingScans && scans && scans.length > 0 && (
                <ScrollArea className="h-[300px] border rounded-md">
                    <ul className="divide-y divide-border">
                        {scans.map(scan => (
                            <li key={scan.id} className="p-4 hover:bg-muted/50 transition-colors">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="font-semibold text-primary flex items-center">
                                            <FolderGit2 className="mr-2 h-5 w-5 text-accent"/>
                                            {scan.bucketName}
                                            {scan.directoryPath && <span className="text-sm text-muted-foreground ml-1">/{scan.directoryPath}</span>}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            ID: {scan.id}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm text-muted-foreground">
                                            {format(new Date(scan.scanTimestamp), "MMM d, yyyy 'at' h:mm a")}
                                        </p>
                                        <p className={`text-xs font-medium ${scan.recursiveScan ? 'text-green-600' : 'text-orange-600'}`}>
                                            {scan.recursiveScan ? 'Recursive' : 'Non-Recursive'}
                                        </p>
                                    </div>
                                </div>
                                <p className="text-xs text-muted-foreground mt-1">
                                    Files found (mock): {scan.phpFileIds.length}
                                </p>
                            </li>
                        ))}
                    </ul>
                </ScrollArea>
            )}
        </CardContent>
      </Card>
    </div>
  );
}
