
'use client';

import React, { useEffect, useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import FileUploadAndRefactorTab from '@/components/FileUploadAndRefactorTab';
import BucketScanTab from '@/components/BucketScanTab';

import { FileUp, HardDriveDownload } from 'lucide-react';
import { AVAILABLE_MODELS, LOCAL_STORAGE_KEY } from '@/app/advanced-config/page';
import type { AdvancedConfigFormValues } from '@/lib/schemas';

export default function HomePage() {
  const [selectedModelName, setSelectedModelName] = useState<string>('Default Model');

  useEffect(() => {
    const savedConfigRaw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (savedConfigRaw) {
      try {
        const savedConfig = JSON.parse(savedConfigRaw) as AdvancedConfigFormValues;
        if (savedConfig && savedConfig.model) {
          const modelDetails = AVAILABLE_MODELS.find(m => m.id === savedConfig.model);
          if (modelDetails) {
            setSelectedModelName(modelDetails.name);
          } else {
            setSelectedModelName(`Default: ${AVAILABLE_MODELS[0]?.name || 'Unknown Model'}`);
          }
        } else {
          setSelectedModelName(`Default: ${AVAILABLE_MODELS[0]?.name || 'Unknown Model'}`);
        }
      } catch (error) {
        console.error('Failed to parse saved AI config:', error);
        setSelectedModelName(`Default: ${AVAILABLE_MODELS[0]?.name || 'Unknown Model'}`);
      }
    } else {
      setSelectedModelName(`Default: ${AVAILABLE_MODELS[0]?.name || 'Unknown Model'}`);
    }
  }, []);


  // Removed isUserLoading, authChecked, and related loading state.
  // The page now renders content directly.

  return (
    <div className="container mx-auto py-8 px-4 md:px-6">
      <p className="text-sm text-muted-foreground mb-4 text-center">
        Current AI Model: {selectedModelName}
      </p>
      <Tabs defaultValue="file-upload" className="w-full">
        <TabsList className="grid w-full grid-cols-1 md:grid-cols-2 mb-8 bg-primary/10 p-2 rounded-lg">
          <TabsTrigger value="file-upload" className="py-3 text-base data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md rounded-md">
            <FileUp className="mr-2 h-5 w-5" /> File Upload & Refactor
          </TabsTrigger>
          <TabsTrigger value="bucket-scan" className="py-3 text-base data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md rounded-md">
            <HardDriveDownload className="mr-2 h-5 w-5" /> Bucket Scan (Mock)
          </TabsTrigger>
        </TabsList>
        <TabsContent value="file-upload">
          <FileUploadAndRefactorTab />
        </TabsContent>
        <TabsContent value="bucket-scan">
          <BucketScanTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
