'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { PhpFileUploadSchema, type PhpFileUploadValues, type PhpFile, type RefactoringTask, type CompatibilityReport } from '@/lib/schemas';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { useUser, useFirestore } from '@/firebase';
import { refactorPhpFile } from '@/ai/flows/refactor-php';
import { generateCompatibilityReport as generateAiCompatibilityReport } from '@/ai/flows/generate-compatibility-report';
import { addDocumentNonBlocking, updateDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { collection, doc, serverTimestamp } from 'firebase/firestore';
import CodeDiffView from './CodeDiffView';
import { Download, Save, FileText, Cloud, Loader2, UploadCloud } from 'lucide-react';
import { PhpIcon } from './icons/PhpIcon';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ScrollArea } from '@/components/ui/scroll-area';


export default function FileUploadAndRefactorTab() {
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();

  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentPhpFile, setCurrentPhpFile] = useState<PhpFile | null>(null);
  const [currentTask, setCurrentTask] = useState<RefactoringTask | null>(null);
  const [currentReport, setCurrentReport] = useState<CompatibilityReport | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);

  const form = useForm<PhpFileUploadValues>({
    resolver: zodResolver(PhpFileUploadSchema),
  });

  const resetState = () => {
    setIsProcessing(false);
    setProgress(0);
    setCurrentPhpFile(null);
    setCurrentTask(null);
    setCurrentReport(null);
    setFileName(null);
    form.reset();
  };

  const onSubmit = async (data: PhpFileUploadValues) => {
    if (!user) {
      toast({ variant: 'destructive', title: 'Authentication Error', description: 'You must be logged in to upload files.' });
      return;
    }
    if (!firestore) {
       toast({ variant: 'destructive', title: 'Firestore Error', description: 'Firestore service is not available.' });
       return;
    }

    resetState(); // Reset state before new submission
    setIsProcessing(true);
    setFileName(data.phpFile.name);

    try {
      const fileContent = await data.phpFile.text();
      setProgress(10);

      // 1. Create PhpFile document
      const phpFileId = doc(collection(firestore, 'phpFiles')).id;
      const newPhpFile: Omit<PhpFile, 'id'> = {
        userId: user.uid,
        fileName: data.phpFile.name,
        fileContent: fileContent,
        uploadTimestamp: new Date().toISOString(),
      };
      await addDocumentNonBlocking(collection(firestore, 'phpFiles'), { ...newPhpFile, id: phpFileId });
      setCurrentPhpFile({ ...newPhpFile, id: phpFileId });
      setProgress(20);
      toast({ title: 'File Uploaded', description: `${data.phpFile.name} uploaded successfully.` });

      // 2. Call refactorPhpFile AI flow
      toast({ title: 'Refactoring In Progress...', description: 'AI is working on your PHP code.' });
      const refactorResult = await refactorPhpFile({ phpCode: fileContent });
      setProgress(50);

      // 3. Create RefactoringTask document
      const taskId = doc(collection(firestore, 'refactoringTasks')).id;
      const newRefactoringTaskData: Omit<RefactoringTask, 'id' | 'compatibilityReportId' | 'cloudStorageUrl'> = {
        phpFileId: phpFileId,
        originalCode: fileContent,
        refactoredCode: refactorResult.refactoredCode,
        refactoringTimestamp: new Date().toISOString(),
      };
      await addDocumentNonBlocking(collection(firestore, 'refactoringTasks'), { ...newRefactoringTaskData, id: taskId, compatibilityReportId: null, cloudStorageUrl: null });
      setCurrentTask({ ...newRefactoringTaskData, id: taskId, compatibilityReportId: null, cloudStorageUrl: null });
      setProgress(60);
      toast({ title: 'Refactoring Complete', description: 'PHP code refactored.' });

      // 4. Call generateCompatibilityReport AI flow
      toast({ title: 'Generating Report...', description: 'AI is creating the compatibility report.' });
      const reportResult = await generateAiCompatibilityReport({ originalCode: fileContent, refactoredCode: refactorResult.refactoredCode });
      setProgress(80);

      // 5. Create CompatibilityReport document
      const reportId = doc(collection(firestore, 'compatibilityReports')).id;
      const newCompatibilityReportData: Omit<CompatibilityReport, 'id' | 'pdfUrl' | 'cloudStorageUrl'> = {
        refactoringTaskId: taskId,
        reportContent: `${refactorResult.compatibilityReport}\n\nReasoning:\n${refactorResult.reasoning}\n\nDetailed Report:\n${reportResult.report}`,
        generationTimestamp: new Date().toISOString(),
      };
      await addDocumentNonBlocking(collection(firestore, 'compatibilityReports'), { ...newCompatibilityReportData, id: reportId, pdfUrl: null, cloudStorageUrl: null });
      setCurrentReport({ ...newCompatibilityReportData, id: reportId, pdfUrl: null, cloudStorageUrl: null });
      setProgress(90);

      // 6. Update RefactoringTask with compatibilityReportId
      const taskDocRef = doc(firestore, 'refactoringTasks', taskId);
      await updateDocumentNonBlocking(taskDocRef, { compatibilityReportId: reportId });
      setCurrentTask(prev => prev ? { ...prev, compatibilityReportId: reportId } : null);
      setProgress(100);
      toast({ title: 'Report Generated', description: 'Compatibility report is ready.' });

    } catch (error: any) {
      console.error('Processing error:', error);
      toast({ variant: 'destructive', title: 'Processing Error', description: error.message || 'An unexpected error occurred.' });
      resetState(); // Reset on error
    } finally {
      // Do not set isProcessing to false here if you want to keep showing results.
      // Reset button will handle clearing results.
      // setIsProcessing(false); // only if you want to allow new uploads immediately
    }
  };

  const handleDownloadReport = () => {
    if (!currentReport || !fileName) return;
    const blob = new Blob([currentReport.reportContent], { type: 'text/plain;charset=utf-8' });
    const reportFileName = `${fileName.replace('.php', '')}_compatibility_report.txt`;
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = reportFileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast({ title: 'Report Downloaded', description: `${reportFileName} saved.` });
  };
  
  const handleSaveRefactoredToCloud = async () => {
    if (!currentTask || !firestore) return;
    // Mock GCS path
    const mockGcsPath = `gs://php-refactor-pro-bucket/refactored_files/${currentPhpFile?.fileName || 'unknown.php'}`;
    const taskDocRef = doc(firestore, 'refactoringTasks', currentTask.id);
    await updateDocumentNonBlocking(taskDocRef, { cloudStorageUrl: mockGcsPath });
    setCurrentTask(prev => prev ? { ...prev, cloudStorageUrl: mockGcsPath } : null);
    toast({ title: 'Saved to Cloud (Mock)', description: `Refactored file path: ${mockGcsPath}` });
  };

  const handleSaveReportToCloud = async () => {
    if (!currentReport || !firestore) return;
    // Mock GCS path
    const mockGcsPath = `gs://php-refactor-pro-bucket/reports/${currentPhpFile?.fileName?.replace('.php', '') || 'unknown_report'}.txt`;
    const reportDocRef = doc(firestore, 'compatibilityReports', currentReport.id);
    await updateDocumentNonBlocking(reportDocRef, { cloudStorageUrl: mockGcsPath });
    setCurrentReport(prev => prev ? { ...prev, cloudStorageUrl: mockGcsPath } : null);
    toast({ title: 'Report Saved to Cloud (Mock)', description: `Report path: ${mockGcsPath}` });
  };


  return (
    <div className="container mx-auto py-8 px-4 md:px-6">
      <Card className="w-full mb-8 shadow-xl">
        <CardHeader>
          <CardTitle className="text-3xl font-headline text-primary flex items-center">
            <UploadCloud className="mr-3 h-8 w-8" /> Upload & Refactor PHP File
          </CardTitle>
          <CardDescription>
            Upload your legacy PHP file to refactor it for PHP 8.0 compatibility.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!isProcessing && !currentTask && (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="phpFile"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-lg">PHP File</FormLabel>
                      <FormControl>
                        <Input 
                          type="file" 
                          accept=".php" 
                          onChange={(e) => field.onChange(e.target.files ? e.target.files[0] : null)} 
                          className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full md:w-auto bg-accent hover:bg-accent/90 text-accent-foreground" disabled={!user || isProcessing}>
                  {isProcessing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <UploadCloud className="mr-2 h-4 w-4" />}
                  Upload and Refactor
                </Button>
              </form>
            </Form>
          )}

          {isProcessing && !currentTask && (
            <div className="space-y-4">
              <p className="text-lg font-semibold text-primary">Processing: {fileName || 'your file'}...</p>
              <Progress value={progress} className="w-full" />
              <p className="text-sm text-muted-foreground text-center">{progress}% complete</p>
              <Loader2 className="mx-auto h-12 w-12 animate-spin text-primary" />
            </div>
          )}
        </CardContent>
      </Card>

      {currentTask && currentReport && (
        <div className="space-y-8 mt-8">
          <Alert variant="default" className="bg-green-500/10 border-green-500/50 text-green-700">
            <FileText className="h-5 w-5 text-green-700" />
            <AlertTitle className="font-semibold text-green-800">Processing Complete!</AlertTitle>
            <AlertDescription>
              Your file <span className="font-semibold">{currentPhpFile?.fileName}</span> has been refactored and a compatibility report generated.
            </AlertDescription>
          </Alert>

          <CodeDiffView originalCode={currentTask.originalCode} refactoredCode={currentTask.refactoredCode} />

          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="text-2xl font-headline text-primary flex items-center">
                <FileText className="mr-3 h-7 w-7" /> Compatibility Report
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[300px] border rounded-md p-4 bg-muted/20">
                <pre className="font-code text-sm whitespace-pre-wrap">{currentReport.reportContent}</pre>
              </ScrollArea>
              <div className="mt-6 flex flex-wrap gap-4">
                <Button onClick={handleDownloadReport} variant="outline">
                  <Download className="mr-2 h-4 w-4" /> Download Report (.txt)
                </Button>
                <Button onClick={handleSaveRefactoredToCloud} variant="outline" className="text-accent border-accent hover:bg-accent/10">
                  <Cloud className="mr-2 h-4 w-4" /> Save Refactored File to Cloud (Mock)
                </Button>
                <Button onClick={handleSaveReportToCloud} variant="outline" className="text-accent border-accent hover:bg-accent/10">
                  <Cloud className="mr-2 h-4 w-4" /> Save Report to Cloud (Mock)
                </Button>
              </div>
            </CardContent>
          </Card>
           <Button onClick={resetState} variant="destructive" className="mt-8">
            Start New Refactor
          </Button>
        </div>
      )}
    </div>
  );
}
