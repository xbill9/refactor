import { z } from 'zod';

export const UserSchema = z.object({
  id: z.string(),
  username: z.string().optional(),
  email: z.string().email(),
});
export type User = z.infer<typeof UserSchema>;

export const PhpFileSchema = z.object({
  id: z.string(),
  userId: z.string(),
  fileName: z.string(),
  fileContent: z.string(),
  uploadTimestamp: z.string().datetime(), // or z.date() if using Firebase Timestamp objects directly
});
export type PhpFile = z.infer<typeof PhpFileSchema>;

export const RefactoringTaskSchema = z.object({
  id: z.string(),
  phpFileId: z.string(),
  originalCode: z.string(), // Added for diffing
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
  pdfUrl: z.string().nullable(), // Placeholder, actual PDF generation not implemented
  cloudStorageUrl: z.string().nullable(),
});
export type CompatibilityReport = z.infer<typeof CompatibilityReportSchema>;

export const CloudBucketScanSchema = z.object({
  id: z.string(),
  userId: z.string(),
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

export const LoginFormSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email." }),
  password: z.string().min(6, { message: "Password must be at least 6 characters." }),
});
export type LoginFormValues = z.infer<typeof LoginFormSchema>;

export const RegisterFormSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email." }),
  password: z.string().min(6, { message: "Password must be at least 6 characters." }),
  confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords do not match.",
  path: ["confirmPassword"],
});
export type RegisterFormValues = z.infer<typeof RegisterFormSchema>;

export const AdvancedConfigFormSchema = z.object({
  model: z.string().min(1, "Please select a model."),
  temperature: z.number().min(0).max(2).default(0.7), // Adjusted max to 2 as per some models
  topP: z.number().min(0).max(1).default(0.9),
  customInstructions: z.string().optional(),
});
export type AdvancedConfigFormValues = z.infer<typeof AdvancedConfigFormSchema>;
