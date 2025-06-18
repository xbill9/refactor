
'use client';

import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { AdvancedConfigFormSchema, type AdvancedConfigFormValues } from '@/lib/schemas';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input'; // Not used for sliders, but keep for consistency
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Cog } from 'lucide-react';

const AVAILABLE_MODELS = [
  { id: 'googleai/gemini-2.5-flash-lite-preview-06-17', name: 'Gemini 2.5 Flash Lite Preview' },
  { id: 'googleai/gemini-2.0-flash', name: 'Gemini 2.0 Flash' },
  { id: 'googleai/gemini-1.5-flash-latest', name: 'Gemini 1.5 Flash Latest' },
  { id: 'googleai/gemini-pro', name: 'Gemini Pro' },
  // Add other models as needed
];

const LOCAL_STORAGE_KEY = 'advancedAiConfig';

export default function AdvancedConfigPage() {
  const { toast } = useToast();

  const form = useForm<AdvancedConfigFormValues>({
    resolver: zodResolver(AdvancedConfigFormSchema),
    defaultValues: {
      model: AVAILABLE_MODELS[0].id,
      temperature: 0.7,
      topP: 0.9,
      customInstructions: '',
    },
  });

  useEffect(() => {
    const savedConfig = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (savedConfig) {
      try {
        const parsedConfig = JSON.parse(savedConfig) as AdvancedConfigFormValues;
        // Validate parsedConfig against schema before setting values
        const validationResult = AdvancedConfigFormSchema.safeParse(parsedConfig);
        if (validationResult.success) {
           form.reset(validationResult.data);
        } else {
          console.warn("Invalid saved config, using defaults:", validationResult.error.flatten().fieldErrors);
          localStorage.removeItem(LOCAL_STORAGE_KEY); // Clear invalid data
        }
      } catch (error) {
        console.error("Failed to parse saved config, using defaults:", error);
        localStorage.removeItem(LOCAL_STORAGE_KEY); // Clear corrupted data
      }
    }
  }, [form]);

  const onSubmit = (data: AdvancedConfigFormValues) => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));
      toast({
        title: 'Settings Saved',
        description: 'Your advanced AI configurations have been saved locally.',
      });
    } catch (error) {
        console.error("Failed to save settings to local storage:", error);
        toast({
            variant: 'destructive',
            title: 'Save Error',
            description: 'Could not save settings to local storage. Your browser might be blocking it or out of space.',
        });
    }
  };

  return (
    <div className="container mx-auto py-12 px-4 md:px-6">
      <Card className="w-full max-w-2xl mx-auto shadow-xl">
        <CardHeader>
          <CardTitle className="text-3xl font-headline text-primary flex items-center">
            <Cog className="mr-3 h-8 w-8" /> Advanced AI Configuration
          </CardTitle>
          <CardDescription>
            Adjust parameters for the AI models. These settings are saved in your browser.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <FormField
                control={form.control}
                name="model"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-lg">AI Model</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select an AI model" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {AVAILABLE_MODELS.map((model) => (
                          <SelectItem key={model.id} value={model.id}>
                            {model.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      The AI model to use for refactoring and report generation.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="temperature"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-lg">Temperature: {field.value}</FormLabel>
                    <FormControl>
                       <Slider
                        defaultValue={[field.value]}
                        min={0}
                        max={2} // Max for Gemini
                        step={0.01}
                        onValueChange={(value) => field.onChange(value[0])}
                      />
                    </FormControl>
                    <FormDescription>
                      Controls randomness. Lower values make the model more deterministic. (0.0 - 2.0)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="topP"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-lg">Top P: {field.value}</FormLabel>
                    <FormControl>
                       <Slider
                        defaultValue={[field.value]}
                        min={0}
                        max={1}
                        step={0.01}
                        onValueChange={(value) => field.onChange(value[0])}
                      />
                    </FormControl>
                    <FormDescription>
                      Nucleus sampling. Considers tokens with top P probability mass. (0.0 - 1.0)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="customInstructions"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-lg">Custom Instructions</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="e.g., Prioritize PSR-12 coding standards strictly. Explain changes for a junior developer."
                        className="resize-y min-h-[100px]"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Additional instructions to guide the AI during processing.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full md:w-auto bg-primary hover:bg-primary/90">
                Save Configuration
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
