'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp, Edit3, CheckCircle, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface FormSummaryProps {
  data: any;
  steps: Array<{
    id: string;
    title: string;
    fields: Array<{
      key: string;
      label: string;
      type?: string;
      required?: boolean;
    }>;
  }>;
  onEditStep?: (stepId: string) => void;
  className?: string;
}

export function FormSummary({ data, steps, onEditStep, className }: FormSummaryProps) {
  const [expandedSections, setExpandedSections] = useState<string[]>([]);

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev =>
      prev.includes(sectionId)
        ? prev.filter(id => id !== sectionId)
        : [...prev, sectionId]
    );
  };

  const getFieldValue = (key: string, type?: string) => {
    const value = key.split('.').reduce((obj, k) => obj?.[k], data);
    
    if (value === undefined || value === null || value === '') {
      return <span className="text-gray-400 italic">Belum diisi</span>;
    }

    switch (type) {
      case 'currency':
        return new Intl.NumberFormat('id-ID', {
          style: 'currency',
          currency: 'IDR'
        }).format(value);
      
      case 'date':
        return new Date(value).toLocaleDateString('id-ID', {
          day: '2-digit',
          month: 'long',
          year: 'numeric'
        });
      
      case 'boolean':
        return value ? 'Ya' : 'Tidak';
      
      case 'array':
        return Array.isArray(value) ? value.join(', ') : value;
      
      default:
        return String(value);
    }
  };

  const isSectionComplete = (section: any) => {
    return section.fields.every(field => {
      const value = field.key.split('.').reduce((obj, k) => obj?.[k], data);
      return !field.required || (value !== undefined && value !== null && value !== '');
    });
  };

  const getCompletionRate = () => {
    const totalFields = steps.reduce((acc, step) => acc + step.fields.length, 0);
    const filledFields = steps.reduce((acc, step) => {
      return acc + step.fields.filter(field => {
        const value = field.key.split('.').reduce((obj, k) => obj?.[k], data);
        return value !== undefined && value !== null && value !== '';
      }).length;
    }, 0);
    
    return Math.round((filledFields / totalFields) * 100);
  };

  return (
    <div className={cn("space-y-4", className)}>
      {/* Summary Header */}
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Ringkasan Formulir</span>
            <Badge variant="outline" className="text-sm">
              {getCompletionRate()}% Lengkap
            </Badge>
          </CardTitle>
        </CardHeader>
      </Card>

      {/* Sections */}
      {steps.map((section) => {
        const isComplete = isSectionComplete(section);
        const isExpanded = expandedSections.includes(section.id);

        return (
          <Card key={section.id} className="border-gray-200">
            <CardHeader
              className="cursor-pointer hover:bg-gray-50 transition-colors"
              onClick={() => toggleSection(section.id)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {isComplete ? (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-amber-600" />
                  )}
                  <CardTitle className="text-base font-medium">{section.title}</CardTitle>
                </div>
                
                <div className="flex items-center gap-2">
                  {onEditStep && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        onEditStep(section.id);
                      }}
                      className="h-8 px-2"
                    >
                      <Edit3 className="h-4 w-4" />
                    </Button>
                  )}
                  
                  {isExpanded ? (
                    <ChevronUp className="h-4 w-4 text-gray-500" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-gray-500" />
                  )}
                </div>
              </div>
            </CardHeader>

            {isExpanded && (
              <CardContent>
                <div className="space-y-3">
                  {section.fields.map((field) => (
                    <div key={field.key} className="flex justify-between items-start py-2 border-b border-gray-100 last:border-0">
                      <div className="flex-1">
                        <span className="text-sm font-medium text-gray-700">
                          {field.label}
                          {field.required && <span className="text-red-500 ml-1">*</span>}
                        </span>
                      </div>
                      <div className="flex-1 text-right">
                        <span className="text-sm text-gray-900">
                          {getFieldValue(field.key, field.type)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            )}
          </Card>
        );
      })}

      {/* Completion Status */}
      <Card className="border-green-200 bg-green-50">
        <CardContent className="pt-6">
          <div className="text-center">
            <p className="text-sm text-gray-600">
              Formulir telah diisi {getCompletionRate()}%. 
              {getCompletionRate() === 100 
                ? ' Semua bagian telah lengkap dan siap untuk dikirim.' 
                : ' Lengkapi bagian yang masih kosong untuk melanjutkan.'}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
