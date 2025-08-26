import { useState, useCallback, useEffect } from 'react';

interface FormStep {
  id: string;
  title: string;
  isCompleted: boolean;
  isValid: boolean;
  isRequired: boolean;
}

interface FormProgressOptions {
  steps: FormStep[];
  onStepChange?: (step: FormStep, index: number) => void;
  onComplete?: () => void;
}

export function useFormProgress(options: FormProgressOptions) {
  const { steps: initialSteps, onStepChange, onComplete } = options;
  
  const [currentStep, setCurrentStep] = useState(0);
  const [steps, setSteps] = useState<FormStep[]>(initialSteps);
  const [isCompleted, setIsCompleted] = useState(false);

  const updateStepStatus = useCallback((stepId: string, updates: Partial<FormStep>) => {
    setSteps(prev => prev.map(step => 
      step.id === stepId ? { ...step, ...updates } : step
    ));
  }, []);

  const markStepComplete = useCallback((stepId: string) => {
    updateStepStatus(stepId, { isCompleted: true });
  }, [updateStepStatus]);

  const markStepInvalid = useCallback((stepId: string) => {
    updateStepStatus(stepId, { isValid: false });
  }, [updateStepStatus]);

  const markStepValid = useCallback((stepId: string) => {
    updateStepStatus(stepId, { isValid: true });
  }, [updateStepStatus]);

  const nextStep = useCallback(() => {
    if (currentStep < steps.length - 1) {
      const newStep = currentStep + 1;
      setCurrentStep(newStep);
      onStepChange?.(steps[newStep], newStep);
    }
  }, [currentStep, steps, onStepChange]);

  const prevStep = useCallback(() => {
    if (currentStep > 0) {
      const newStep = currentStep - 1;
      setCurrentStep(newStep);
      onStepChange?.(steps[newStep], newStep);
    }
  }, [currentStep, steps, onStepChange]);

  const goToStep = useCallback((stepIndex: number) => {
    if (stepIndex >= 0 && stepIndex < steps.length) {
      setCurrentStep(stepIndex);
      onStepChange?.(steps[stepIndex], stepIndex);
    }
  }, [steps, onStepChange]);

  const reset = useCallback(() => {
    setCurrentStep(0);
    setSteps(initialSteps);
    setIsCompleted(false);
  }, [initialSteps]);

  const complete = useCallback(() => {
    setIsCompleted(true);
    onComplete?.();
  }, [onComplete]);

  const progress = {
    current: currentStep + 1,
    total: steps.length,
    percentage: ((currentStep + 1) / steps.length) * 100,
    isFirst: currentStep === 0,
    isLast: currentStep === steps.length - 1,
  };

  const canProceed = useCallback(() => {
    const currentStepData = steps[currentStep];
    return currentStepData?.isValid ?? true;
  }, [currentStep, steps]);

  const isStepAccessible = useCallback((stepIndex: number) => {
    // Allow access to completed steps and the next incomplete step
    if (stepIndex <= currentStep) return true;
    
    // Check if all previous required steps are completed
    for (let i = 0; i < stepIndex; i++) {
      const step = steps[i];
      if (step.isRequired && !step.isCompleted) {
        return false;
      }
    }
    
    return true;
  }, [currentStep, steps]);

  useEffect(() => {
    // Check if all steps are completed
    const allCompleted = steps.every(step => step.isCompleted);
    if (allCompleted && !isCompleted) {
      complete();
    }
  }, [steps, isCompleted, complete]);

  return {
    currentStep,
    steps,
    progress,
    isCompleted,
    canProceed,
    isStepAccessible,
    updateStepStatus,
    markStepComplete,
    markStepInvalid,
    markStepValid,
    nextStep,
    prevStep,
    goToStep,
    reset,
  };
}
