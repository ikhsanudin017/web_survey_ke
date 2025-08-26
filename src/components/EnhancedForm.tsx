'use client';

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { z } from 'zod';
import { useForm, FormProvider, UseFormReturn, Path } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, Save, AlertCircle, Check } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { ProgressIndicator } from './ProgressIndicator';
import { ErrorBoundary } from './ErrorBoundary';
import { FieldError } from './ErrorBoundary';
import { cn } from '@/lib/utils';

export interface FormFieldConfig<T extends z.ZodType> {
  name: string;
  label: string;
  type: 'text' | 'email' | 'number' | 'select' | 'textarea' | 'date' | 'file';
  placeholder?: string;
  required?: boolean;
  options?: { value: string; label: string }[];
  validation?: z.ZodType;
  description?: string;
  gridSpan?: number;
  disabled?: boolean;
  hidden?: boolean;
}

interface EnhancedFormProps<T extends z.ZodType> {
  schema: T;
  fields: FormFieldConfig<T>[];
  onSubmit: (data: z.infer<T>) => Promise<void>;
  defaultValues?: Partial<z.infer<T>>;
  title?: string;
  description?: string;
  submitText?: string;
  cancelText?: string;
  onCancel?: () => void;
  showProgress?: boolean;
  autoSave?: boolean;
  autoSaveDelay?: number;
  className?: string;
}

export function EnhancedForm<T extends z.ZodType>({
  schema,
  fields,
  onSubmit,
  defaultValues,
  title,
  description,
  submitText = 'Simpan',
  cancelText = 'Batal',
  onCancel,
  showProgress = true,
  autoSave = false,
  autoSaveDelay = 3000,
  className,
}: EnhancedFormProps<T>) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [autoSaveStatus, setAutoSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [currentSection, setCurrentSection] = useState(0);
  
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastSavedDataRef = useRef<string | null>(null);

  const methods = useForm<z.infer<T>>({
    resolver: zodResolver(schema),
    defaultValues: defaultValues as any,
    mode: 'onBlur',
  });

  const { handleSubmit, watch, formState: { errors, isDirty, isValid }, reset } = methods;

  const watchedValues = watch();

  // Auto-save functionality
  useEffect(() => {
    if (!autoSave || !isDirty) return;

    const currentData = JSON.stringify(watchedValues);
    
    if (currentData === lastSavedDataRef.current) return;

    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
    }

    autoSaveTimeoutRef.current = setTimeout(async () => {
      try {
        setAutoSaveStatus('saving');
        // In real implementation, this would save to backend
        await new Promise(resolve => setTimeout(resolve, 1000));
        setAutoSaveStatus('saved');
        lastSavedDataRef.current = currentData;
        
        setTimeout(() => setAutoSaveStatus('idle'), 2000);
      } catch (error) {
        setAutoSaveStatus('error');
        setTimeout(() => setAutoSaveStatus('idle'), 3000);
      }
    }, autoSaveDelay);

    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    };
  }, [watchedValues, autoSave, autoSaveDelay, isDirty]);

  // Progress calculation
  const calculateProgress = useCallback(() => {
    const totalFields = fields.filter(f => !f.hidden).length;
    const completedFields = fields.filter(f => {
      if (f.hidden) return false;
      const value = watchedValues[f.name as keyof z.infer<T>];
      return value !== undefined && value !== '' && value !== null;
    }).length;

    return Math.round((completedFields / totalFields) * 100);
  }, [fields, watchedValues]);

  const progressSteps = fields
    .filter(f => !f.hidden)
    .map((field, index) => ({
      id: field.name,
      title: field.label,
      description: field.description,
      status: (() => {
        const value = watchedValues[field.name as keyof z.infer<T>];
        const hasValue = value !== undefined && value !== '' && value !== null;
        const hasError = errors[field.name as keyof typeof errors];
        
        if (hasError) return 'error' as const;
        if (hasValue) return 'completed' as const;
        return 'pending' as const;
      })(),
    }));

  const onFormSubmit = async (data: z.infer<T>) => {
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      await onSubmit(data);
      setAutoSaveStatus('idle');
      lastSavedDataRef.current = JSON.stringify(data);
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'Terjadi kesalahan saat menyimpan');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderField = (field: FormFieldConfig<T>) => {
    if (field.hidden) return null;

    const fieldName = field.name as Path<z.infer<T>>;
    const error = errors[fieldName]?.message as string;
    
    return (
      <div key={field.name} className={cn(
        'space-y-2',
        field.gridSpan && `col-span-${field.gridSpan}`
      )}>
        <label className="text-sm font-medium text-gray-700">
          {field.label}
          {field.required && <span className="text-red-500 ml-1">*</span>}
        </label>
        
        {field.type === 'textarea' ? (
          <textarea
            {...methods.register(fieldName)}
            placeholder={field.placeholder}
            disabled={field.disabled}
            className={cn(
              'w-full px-3 py-2 border rounded-md shadow-sm',
              'focus:outline-none focus:ring-2 focus:ring-blue-500',
              error ? 'border-red-500' : 'border-gray-300'
            )}
            rows={4}
          />
        ) : field.type === 'select' ? (
          <select
            {...methods.register(fieldName)}
            disabled={field.disabled}
            className={cn(
              'w-full px-3 py-2 border rounded-md shadow-sm',
              'focus:outline-none focus:ring-2 focus:ring-blue-500',
              error ? 'border-red-500' : 'border-gray-300'
            )}
          >
            <option value="">Pilih {field.label.toLowerCase()}</option>
            {field.options?.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        ) : (
          <input
            {...methods.register(fieldName)}
            type={field.type}
            placeholder={field.placeholder}
            disabled={field.disabled}
            className={cn(
              'w-full px-3 py-2 border rounded-md shadow-sm',
              'focus:outline-none focus:ring-2 focus:ring-blue-500',
              error ? 'border-red-500' : 'border-gray-300'
            )}
          />
        )}
        
        <FieldError error={error} helpText={field.description} />
      </div>
    );
  };

  return (
    <ErrorBoundary>
      <FormProvider {...methods}>
        <form onSubmit={handleSubmit(onFormSubmit)} className={className}>
          <Card>
            {(title || description) && (
              <CardHeader>
                {title && <CardTitle>{title}</CardTitle>}
                {description && <CardDescription>{description}</CardDescription>}
              </CardHeader>
            )}
            
            <CardContent className="space-y-6">
              {showProgress && (
                <div>
                  <ProgressIndicator
                    steps={progressSteps}
                    orientation="horizontal"
                    showDescriptions={false}
                  />
                  <div className="mt-2 text-sm text-gray-600">
                    Progress: {calculateProgress()}% terisi
                  </div>
                </div>
              )}

              {submitError && (
                <div className="bg-red-50 border border-red-200 rounded-md p-4">
                  <div className="flex items-center">
                    <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
                    <p className="text-sm text-red-800">{submitError}</p>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {fields.map(renderField)}
              </div>

              {autoSave && (
                <div className="text-sm text-gray-500 flex items-center">
                  {autoSaveStatus === 'saving' && (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Menyimpan otomatis...
                    </>
                  )}
                  {autoSaveStatus === 'saved' && (
                    <>
                      <Check className="h-4 w-4 mr-2 text-green-500" />
                      Tersimpan otomatis
                    </>
                  )}
                  {autoSaveStatus === 'error' && (
                    <>
                      <AlertCircle className="h-4 w-4 mr-2 text-red-500" />
                      Gagal menyimpan otomatis
                    </>
                  )}
                </div>
              )}

              <div className="flex justify-end space-x-3 pt-4 border-t">
                {onCancel && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={onCancel}
                    disabled={isSubmitting}
                  >
                    {cancelText}
                  </Button>
                )}
                <Button
                  type="submit"
                  disabled={isSubmitting || !isValid}
                  className="min-w-[100px]"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Menyimpan...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      {submitText}
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </form>
      </FormProvider>
    </ErrorBoundary>
  );
}

// Form field wrapper for custom components
export const FormFieldWrapper: React.FC<{
  label: string;
  error?: string;
  required?: boolean;
  description?: string;
  children: React.ReactNode;
}> = ({ label, error, required, description, children }) => {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-gray-700">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      {children}
      <FieldError error={error} helpText={description} />
    </div>
  );
};

// Form section component
export const FormSection: React.FC<{
  title: string;
  description?: string;
  children: React.ReactNode;
}> = ({ title, description, children }) => {
  return (
    <div className="border rounded-lg p-4 space-y-4">
      <div>
        <h3 className="text-lg font-medium">{title}</h3>
        {description && (
          <p className="text-sm text-gray-600 mt-1">{description}</p>
        )}
      </div>
      {children}
    </div>
  );
};
