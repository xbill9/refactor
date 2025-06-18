import { z } from 'zod';

// UserSchema removed

export const PhpFileSchema = z.object({
  id: z.string(),
  // userId: z.string(), // userId removed
  fileName: z.string(),
  fileContent: z.string(),
  uploadTimestamp: z.string().datetime(), 
});
export type PhpFile = z.infer<typeof PhpFileSchema>;

export const RefactoringTaskSchema = z.object({
  id: z.string(),
  phpFileId: z.string(),
  originalCode: z.string(), 
  refactoredCode: z.string(),
  compatibilityReportId: z.string().nullable(),
  refactoringTimestamp: z.string().datetime(),
  cloudStorageUrl: z.string().nullable(),
});
export type RefactoringTask = z.infer<typeof RefactoringTaskSchema>;

export const CompatibilityReportSchema = z.object({
  id: z.string(),
  refactoringTaskId: z.string(),
  reportContent: z.string(),
  generationTimestamp: z.string().datetime(),
  pdfUrl: z.string().nullable(), 
  cloudStorageUrl: z.string().nullable(),
});
export type CompatibilityReport = z.infer<typeof CompatibilityReportSchema>;

export const CloudBucketScanSchema = z.object({
  id: z.string(),
  // userId: z.string(), // userId removed
  bucketName: z.string(),
  directoryPath: z.string().optional(),
  scanTimestamp: z.string().datetime(),
  phpFileIds: z.array(z.string()),
  recursiveScan: z.boolean(),
});
export type CloudBucketScan = z.infer<typeof CloudBucketScanSchema>;

// Schemas for forms
export const PhpFileUploadSchema = z.object({
  phpFile: z.custom<File>(
    (val) => val instanceof File,
    "Please upload a PHP file."
  ).refine(
    (file) => file.name.endsWith(".php") || file.type === "text/php" || file.type === "application/x-php",
    "File must be a .php file."
  ).refine(
    (file) => file.size < 5 * 1024 * 1024, // 5MB limit
    "File size must be less than 5MB."
  ),
});
export type PhpFileUploadValues = z.infer<typeof PhpFileUploadSchema>;

export const BucketScanFormSchema = z.object({
  bucketName: z.string().min(3, "Bucket name must be at least 3 characters"),
  directoryPath: z.string().optional(),
  recursiveScan: z.boolean().default(false),
});
export type BucketScanFormValues = z.infer<typeof BucketScanFormSchema>;

// LoginFormSchema removed
// RegisterFormSchema removed

export const AdvancedConfigFormSchema = z.object({
  model: z.string().min(1, "Please select a model."),
  temperature: z.number().min(0).max(2).default(0.7),
  topP: z.number().min(0).max(1).default(0.9),
  customInstructions: z.string().optional(),
});
export type AdvancedConfigFormValues = z.infer<typeof AdvancedConfigFormSchema>;
