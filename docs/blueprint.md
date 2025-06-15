# **App Name**: PHP Refactor Pro

## Core Features:

- File Upload: Upload a PHP file for refactoring.
- Automated Refactoring: Automatically refactor uploaded PHP code to be compatible with PHP 8.0 using an AI tool.
- Compatibility Report: Generate a compatibility report highlighting potential issues and changes made. Report provides reasoning from the LLM why changes where made.
- Visual Diff: Display a visual diff showing the differences between the original and refactored code.
- PDF Export: Allow the compatibility report to be downloaded as a PDF.
- Cloud Storage Integration: Allow the refactored file and/or compatibility report to be saved to a Google Cloud Storage bucket. Authentication is handled through environment variables
- Cloud Bucket Recursion: Allow a Google Cloud Bucket to be used for the source files and have the option to recurse though the whole directory tree and convert each file

## Style Guidelines:

- Primary color: Deep Indigo (#663399) to convey a sense of sophistication and professionalism.
- Background color: Light gray (#F0F0F0) for a clean and modern look.
- Accent color: Teal (#008080) to highlight important information and CTAs.
- Body and headline font: 'Inter' (sans-serif) for a modern and readable experience.
- Code font: 'Source Code Pro' (monospace) for displaying code snippets and the visual diff.
- Use simple, clear icons to represent file types, actions, and status indicators.
- A clean, tabbed interface to separate code upload, diff viewing, and compatibility reports.
- Subtle animations to indicate loading states and successful actions.