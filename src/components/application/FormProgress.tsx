import React from 'react';

interface FormProgressProps {
  steps: { id: number; name: string; description: string; }[];
  currentStep: number;
  onStepClick: (step: number) => void;
}

export default function FormProgress({ steps, currentStep, onStepClick }: FormProgressProps) {
  return (
    <div>
      <h2>Form Progress</h2>
      {/* Add your component logic here */}
      {/* You can use steps, currentStep, and onStepClick here */}
    </div>
  );
}
