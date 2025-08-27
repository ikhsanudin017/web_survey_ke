import React from 'react';

interface FormActionsProps {
  currentStep: number;
  totalSteps: number;
  onNext?: () => Promise<void>;
  onSave?: (data: any) => Promise<void>;
  onPrevious: () => void;
  isSubmitting: boolean;
}

export default function FormActions({
  currentStep,
  totalSteps,
  onNext,
  onPrevious,
  isSubmitting,
}: FormActionsProps) {
  return (
    <div>
      <h2>Form Actions</h2>
      {/* Add your component logic here */}
      {/* You can use currentStep, totalSteps, onNext, onPrevious, isSubmitting here */}
    </div>
  );
}
