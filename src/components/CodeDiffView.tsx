'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';

interface CodeDiffViewProps {
  originalCode: string;
  refactoredCode: string;
}

// Simple diffing logic (line by line)
// This is a basic implementation and not as robust as dedicated diff libraries
const generateDiff = (original: string, refactored: string) => {
  const originalLines = original.split('\n');
  const refactoredLines = refactored.split('\n');
  const maxLength = Math.max(originalLines.length, refactoredLines.length);
  
  const diffResult = [];

  for (let i = 0; i < maxLength; i++) {
    const originalLine = originalLines[i];
    const refactoredLine = refactoredLines[i];

    if (originalLine !== undefined && refactoredLine !== undefined) {
      if (originalLine === refactoredLine) {
        diffResult.push({ type: 'common', original: originalLine, refactored: refactoredLine, lineNumber: i + 1 });
      } else {
        diffResult.push({ type: 'modified', original: originalLine, refactored: refactoredLine, lineNumber: i + 1 });
      }
    } else if (originalLine !== undefined) {
      diffResult.push({ type: 'removed', original: originalLine, refactored: '', lineNumber: i + 1 });
    } else if (refactoredLine !== undefined) {
      diffResult.push({ type: 'added', original: '', refactored: refactoredLine, lineNumber: i + 1 });
    }
  }
  return diffResult;
};


export default function CodeDiffView({ originalCode, refactoredCode }: CodeDiffViewProps) {
  const diff = React.useMemo(() => generateDiff(originalCode, refactoredCode), [originalCode, refactoredCode]);

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="text-2xl font-headline text-primary">Code Differences</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h3 className="text-lg font-semibold mb-2 text-muted-foreground">Original Code</h3>
            <ScrollArea className="h-[400px] border rounded-md p-2 bg-muted/20">
              <pre className="font-code text-sm whitespace-pre-wrap">
                {diff.map((line, index) => (
                  <div
                    key={`orig-${index}`}
                    className={cn(
                      "flex",
                      line.type === 'removed' && 'bg-red-500/20',
                      line.type === 'modified' && 'bg-yellow-500/20'
                    )}
                  >
                    <span className="w-10 text-right pr-2 text-muted-foreground select-none">{line.original !== undefined ? line.lineNumber : ''}</span>
                    <span className="flex-1">{line.original}</span>
                  </div>
                ))}
              </pre>
            </ScrollArea>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-2 text-muted-foreground">Refactored Code (PHP 8.0)</h3>
            <ScrollArea className="h-[400px] border rounded-md p-2 bg-muted/20">
              <pre className="font-code text-sm whitespace-pre-wrap">
                {diff.map((line, index) => (
                  <div
                    key={`ref-${index}`}
                    className={cn(
                      "flex",
                      line.type === 'added' && 'bg-green-500/20',
                      line.type === 'modified' && 'bg-yellow-500/20'
                    )}
                  >
                    <span className="w-10 text-right pr-2 text-muted-foreground select-none">{line.refactored !== undefined ? line.lineNumber : ''}</span>
                    <span className="flex-1">{line.refactored}</span>
                  </div>
                ))}
              </pre>
            </ScrollArea>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
