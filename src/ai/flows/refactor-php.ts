// src/ai/flows/refactor-php.ts
'use server';

/**
 * @fileOverview This file contains the Genkit flow for refactoring PHP files to be compatible with PHP 8.0.
 *
 * - refactorPhpFile - A function that accepts PHP code and refactors it to PHP 8.0.
 * - RefactorPhpInput - The input type for the refactorPhpFile function.
 * - RefactorPhpOutput - The return type for the refactorPhpFile function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const RefactorPhpInputSchema = z.object({
  phpCode: z.string().describe('The PHP code to be refactored.'),
});
export type RefactorPhpInput = z.infer<typeof RefactorPhpInputSchema>;

const RefactorPhpOutputSchema = z.object({
  refactoredCode: z.string().describe('The refactored PHP code compatible with PHP 8.0.'),
  compatibilityReport: z.string().describe('A report detailing the changes made and potential compatibility issues.'),
  reasoning: z.string().describe('Reasoning from the LLM why changes were made.'),
});
export type RefactorPhpOutput = z.infer<typeof RefactorPhpOutputSchema>;

export async function refactorPhpFile(input: RefactorPhpInput): Promise<RefactorPhpOutput> {
  return refactorPhpFileFlow(input);
}

const refactorPhpPrompt = ai.definePrompt({
  name: 'refactorPhpPrompt',
  input: {schema: RefactorPhpInputSchema},
  output: {schema: RefactorPhpOutputSchema},
  prompt: `You are a senior software architect specializing in PHP code modernization.

  Your task is to refactor the given PHP code to be fully compatible with PHP 8.0.
  You must provide a compatibility report, highlighting the changes made and potential issues.
  Explain the reasoning behind each change you make, including why the change improves compatibility with PHP 8.0.

  Original PHP Code:
  {{phpCode}}
  `,
});

const refactorPhpFileFlow = ai.defineFlow(
  {
    name: 'refactorPhpFileFlow',
    inputSchema: RefactorPhpInputSchema,
    outputSchema: RefactorPhpOutputSchema,
  },
  async input => {
    const {output} = await refactorPhpPrompt(input);
    return output!;
  }
);

