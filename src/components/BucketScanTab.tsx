'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { BucketScanFormSchema, type BucketScanFormValues } from '@/lib/schemas'; // CloudBucketScan type removed as it's not persisted
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
// Firestore related imports (useFirestore, useCollection, addDocumentNonBlocking, collection, doc, query, orderBy) removed
import { HardDriveDownload, Search, Loader2, ListChecks } from 'lucide-react'; // FolderGit2 removed
// ScrollArea and format removed as history is gone

export default function BucketScanTab() {
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
  
  // Scan history and related query/loading state removed

  const onSubmit = async (data: BucketScanFormValues) => {
    setIsScanning(true);
    try {
      // Simulate scan initiation
      // const scanId = crypto.randomUUID(); // No longer need to generate ID for Firestore
      // const newScan: Omit<CloudBucketScan, 'id'> = { // No longer creating CloudBucketScan object
      //   bucketName: data.bucketName,
      //   directoryPath: data.directoryPath || '',
      //   scanTimestamp: new Date().toISOString(),
      //   phpFileIds: [], 
      //   recursiveScan: data.recursiveScan,
      // };
      
      // Removed: addDocumentNonBlocking(collection(firestore, 'cloudBucketScans'), { ...newScan, id: scanId });

      // Simulate API call delay for mock scan
      await new Promise(resolve => setTimeout(resolve, 1500));

      toast({
        title: 'Bucket Scan Initiated (Mock)',
        description: `Mock scan for bucket '${data.bucketName}' has been queued. This is a mock process; no actual scanning will occur and no history is saved.`,
      });
      form.reset();
    } catch (error: any) {
      console.error('Mock Scan initiation error:', error);
      toast({ variant: 'destructive', title: 'Scan Error (Mock)', description: error.message || 'Failed to initiate mock scan.' });
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
            (Note: Actual scanning, refactoring, and history from bucket is a mock feature.)
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
                        Scan all subdirectories within the specified path (mock).
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full md:w-auto bg-accent hover:bg-accent/90 text-accent-foreground" disabled={isScanning}>
                {isScanning ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Search className="mr-2 h-4 w-4" />}
                Start Scan (Mock)
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* Scan History Card Removed */}
      <Card className="w-full shadow-xl">
        <CardHeader>
            <CardTitle className="text-2xl font-headline text-primary flex items-center">
                <ListChecks className="mr-3 h-7 w-7" /> Scan History
            </CardTitle>
            <CardDescription>
                Scan history is unavailable as database integration has been removed.
            </CardDescription>
        </CardHeader>
        <CardContent>
            <p className="text-muted-foreground text-center py-4">
                Persistent scan history is not available in this version.
            </p>
        </CardContent>
      </Card>
    </div>
  );
}
