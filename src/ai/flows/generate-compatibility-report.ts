// use server'
'use server';
/**
 * @fileOverview Generates a compatibility report for PHP code refactored to PHP 8.0.
 *
 * - generateCompatibilityReport - A function that generates the compatibility report.
 * - GenerateCompatibilityReportInput - The input type for the generateCompatibilityReport function.
 * - GenerateCompatibilityReportOutput - The return type for the generateCompatibilityReport function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateCompatibilityReportInputSchema = z.object({
  originalCode: z
    .string()
    .describe('The original PHP code before refactoring.'),
  refactoredCode: z
    .string()
    .describe('The refactored PHP code.'),
});
export type GenerateCompatibilityReportInput = z.infer<
  typeof GenerateCompatibilityReportInputSchema
>;

const GenerateCompatibilityReportOutputSchema = z.object({
  report: z
    .string()
    .describe(
      'A detailed compatibility report, highlighting potential issues, changes made, and reasoning behind the changes.'
    ),
});
export type GenerateCompatibilityReportOutput = z.infer<
  typeof GenerateCompatibilityReportOutputSchema
>;

export async function generateCompatibilityReport(
  input: GenerateCompatibilityReportInput
): Promise<GenerateCompatibilityReportOutput> {
  return generateCompatibilityReportFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateCompatibilityReportPrompt',
  input: {schema: GenerateCompatibilityReportInputSchema},
  output: {schema: GenerateCompatibilityReportOutputSchema},
  prompt: `You are a software modernization expert specializing in PHP code.

You will generate a compatibility report comparing the original PHP code to the refactored PHP code.

The report should highlight potential compatibility issues, explain the changes made during refactoring, and provide reasoning for each change.

Original Code: {{{originalCode}}}
Refactored Code: {{{refactoredCode}}}

Report Format: Describe each issue in the format:
"Issue: <description of the issue>. Change: <the fix that was applied>. Reasoning: <why the change was made>".
`,
});

const generateCompatibilityReportFlow = ai.defineFlow(
  {
    name: 'generateCompatibilityReportFlow',
    inputSchema: GenerateCompatibilityReportInputSchema,
    outputSchema: GenerateCompatibilityReportOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
