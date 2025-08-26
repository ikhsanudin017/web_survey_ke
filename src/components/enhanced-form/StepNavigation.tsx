'use client';

import { ChevronLeft, ChevronRight, Save, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface StepNavigationProps {
  currentStep: number;
  totalSteps: number;
  onPrevious: () => void;
  onNext: () => void;
  onSaveDraft: () => void;
  onSubmit: () => void;
  isFirstStep?: boolean;
  isLastStep?: boolean;
  isLoading?: boolean;
  isValid?: boolean;
  hasChanges?: boolean;
}

export function StepNavigation({
  currentStep,
  totalSteps,
  onPrevious,
  onNext,
  onSaveDraft,
  onSubmit,
  isFirstStep = false,
  isLastStep = false,
  isLoading = false,
  isValid = true,
  hasChanges = false
}: StepNavigationProps) {
  const progress = ((currentStep - 1) / (totalSteps - 1)) * 100;

  return (
    <div className="space-y-4">
      {/* Progress Bar */}
      <div className="relative">
        <div className="flex justify-between text-sm text-gray-600 mb-2">
          <span>Langkah {currentStep} dari {totalSteps}</span>
          <span>{Math.round(progress)}% Selesai</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between items-center">
        <div className="flex gap-2">
          {!isFirstStep && (
            <Button
              type="button"
              variant="outline"
              onClick={onPrevious}
              disabled={isLoading}
              className="flex items-center gap-2"
            >
              <ChevronLeft className="h-4 w-4" />
              Sebelumnya
            </Button>
          )}
          
          <Button
            type="button"
            variant="secondary"
            onClick={onSaveDraft}
            disabled={isLoading || !hasChanges}
            className="flex items-center gap-2"
          >
            <Save className="h-4 w-4" />
            Simpan Draft
          </Button>
        </div>

        <div className="flex gap-2">
          {!isLastStep ? (
            <Button
              type="button"
              onClick={onNext}
              disabled={isLoading || !isValid}
              className="flex items-center gap-2"
            >
              Selanjutnya
              <ChevronRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button
              type="button"
              onClick={onSubmit}
              disabled={isLoading || !isValid}
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
            >
              <Send className="h-4 w-4" />
              Kirim Analisis
            </Button>
          )}
        </div>
      </div>

      {/* Step Indicators */}
      <div className="flex justify-center gap-2">
        {Array.from({ length: totalSteps }, (_, i) => (
          <div
            key={i}
            className={cn(
              "w-2 h-2 rounded-full transition-all duration-300",
              i + 1 === currentStep
                ? "bg-blue-600 w-8"
                : i + 1 < currentStep
                ? "bg-blue-400"
                : "bg-gray-300"
            )}
          />
        ))}
      </div>
    </div>
  );
}
