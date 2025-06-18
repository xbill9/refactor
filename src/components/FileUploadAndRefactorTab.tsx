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
// Firestore related imports (useFirestore, addDocumentNonBlocking, updateDocumentNonBlocking, collection, doc) removed
import { refactorPhpFile } from '@/ai/flows/refactor-php';
import { generateCompatibilityReport as generateAiCompatibilityReport } from '@/ai/flows/generate-compatibility-report';
import CodeDiffView from './CodeDiffView';
import { Download, Save, FileText, Cloud, Loader2, UploadCloud, FileCode } from 'lucide-react'; 
import { PhpIcon } from './icons/PhpIcon';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ScrollArea } from '@/components/ui/scroll-area';


export default function FileUploadAndRefactorTab() {
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
    resetState(); 
    setIsProcessing(true);
    setFileName(data.phpFile.name);

    try {
      const fileContent = await data.phpFile.text();
      setProgress(10);

      // 1. Create PhpFile object (in memory)
      const phpFileId = crypto.randomUUID(); // Simple ID for in-memory object
      const newPhpFile: PhpFile = {
        id: phpFileId,
        fileName: data.phpFile.name,
        fileContent: fileContent,
        uploadTimestamp: new Date().toISOString(),
      };
      setCurrentPhpFile(newPhpFile);
      setProgress(20);
      toast({ title: 'File Processed Locally', description: `${data.phpFile.name} ready for refactoring.` });

      // 2. Call refactorPhpFile AI flow
      toast({ title: 'Refactoring In Progress...', description: 'AI is working on your PHP code.' });
      const refactorResult = await refactorPhpFile({ phpCode: fileContent });
      setProgress(50);

      // 3. Create RefactoringTask object (in memory)
      const taskId = crypto.randomUUID();
      const newRefactoringTaskData: RefactoringTask = {
        id: taskId,
        phpFileId: phpFileId,
        originalCode: fileContent,
        refactoredCode: refactorResult.refactoredCode,
        refactoringTimestamp: new Date().toISOString(),
        compatibilityReportId: null, // Will be set after report generation
        cloudStorageUrl: null, // Mock
      };
      setCurrentTask(newRefactoringTaskData);
      setProgress(60);
      toast({ title: 'Refactoring Complete', description: 'PHP code refactored.' });

      // 4. Call generateCompatibilityReport AI flow
      toast({ title: 'Generating Report...', description: 'AI is creating the compatibility report.' });
      const reportResult = await generateAiCompatibilityReport({ originalCode: fileContent, refactoredCode: refactorResult.refactoredCode });
      setProgress(80);

      // 5. Create CompatibilityReport object (in memory)
      const reportId = crypto.randomUUID();
      const newCompatibilityReportData: CompatibilityReport = {
        id: reportId,
        refactoringTaskId: taskId,
        reportContent: `${refactorResult.compatibilityReport}\n\nReasoning:\n${refactorResult.reasoning}\n\nDetailed Report:\n${reportResult.report}`,
        generationTimestamp: new Date().toISOString(),
        pdfUrl: null, // Mock
        cloudStorageUrl: null, // Mock
      };
      setCurrentReport(newCompatibilityReportData);
      setProgress(90);
      
      // Update RefactoringTask with compatibilityReportId (in memory)
      setCurrentTask(prev => prev ? { ...prev, compatibilityReportId: reportId } : null);
      setProgress(100);
      toast({ title: 'Report Generated', description: 'Compatibility report is ready.' });

    } catch (error: any) {
      console.error('Processing error:', error);
      toast({ variant: 'destructive', title: 'Processing Error', description: error.message || 'An unexpected error occurred.' });
      resetState(); 
    }
    // setIsProcessing should remain true until resetState is called by starting a new refactor
    // to keep the results visible.
  };

  const handleDownloadRefactoredFile = () => {
    if (!currentTask || !currentPhpFile) return;
    const blob = new Blob([currentTask.refactoredCode], { type: 'text/php;charset=utf-8' });
    const refactoredFileName = currentPhpFile.fileName.replace('.php', '_refactored.php');
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = refactoredFileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast({ title: 'Refactored File Downloaded', description: `${refactoredFileName} saved.` });
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
    if (!currentTask || !currentPhpFile) return;
    const mockGcsPath = `gs://php-refactor-pro-bucket/refactored_files/${currentPhpFile.fileName}`;
    setCurrentTask(prev => prev ? { ...prev, cloudStorageUrl: mockGcsPath } : null);
    toast({ title: 'Saved to Cloud (Mock)', description: `Mock save to: ${mockGcsPath}. No actual cloud write occurred.` });
  };

  const handleSaveReportToCloud = async () => {
    if (!currentReport || !currentPhpFile) return;
    const mockGcsPath = `gs://php-refactor-pro-bucket/reports/${currentPhpFile.fileName.replace('.php', '')}_report.txt`;
    setCurrentReport(prev => prev ? { ...prev, cloudStorageUrl: mockGcsPath } : null);
    toast({ title: 'Report Saved to Cloud (Mock)', description: `Mock save to: ${mockGcsPath}. No actual cloud write occurred.` });
  };


  return (
    <div className="container mx-auto py-8 px-4 md:px-6">
      <Card className="w-full mb-8 shadow-xl">
        <CardHeader>
          <CardTitle className="text-3xl font-headline text-primary flex items-center">
            <UploadCloud className="mr-3 h-8 w-8" /> Upload & Refactor PHP File
          </CardTitle>
          <CardDescription>
            Upload your legacy PHP file to refactor it for PHP 8.0 compatibility. Results are processed in your browser.
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
                <Button type="submit" className="w-full md:w-auto bg-accent hover:bg-accent/90 text-accent-foreground" disabled={isProcessing}>
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
                <Button onClick={handleDownloadRefactoredFile} variant="outline">
                  <FileCode className="mr-2 h-4 w-4" /> Download Refactored File (.php)
                </Button>
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
