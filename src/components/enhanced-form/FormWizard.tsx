'use client';

import { useState, useEffect, ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { StepNavigation } from './StepNavigation';
import { FormSection } from './FormSection';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface Step {
  id: string;
  title: string;
  description: string;
  content: ReactNode;
  icon?: ReactNode;
  validation?: () => boolean;
  onEnter?: () => void;
  onExit?: () => void;
}

interface FormWizardProps {
  steps: Step[];
  onComplete: (data: any) => void;
  onSaveDraft?: (data: any) => void;
  initialData?: any;
  className?: string;
}

export function FormWizard({
  steps,
  onComplete,
  onSaveDraft,
  initialData = {},
  className
}: FormWizardProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState(initialData);
  const [isLoading, setIsLoading] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  const currentStepData = steps[currentStep];

  useEffect(() => {
    currentStepData.onEnter?.();
    return () => {
      currentStepData.onExit?.();
    };
  }, [currentStep, currentStepData]);

  const handleNext = async () => {
    if (currentStepData.validation && !currentStepData.validation()) {
      return;
    }

    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSaveDraft = async () => {
    if (onSaveDraft) {
      setIsLoading(true);
      try {
        await onSaveDraft(formData);
        setHasChanges(false);
      } catch (error) {
        console.error('Error saving draft:', error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleSubmit = async () => {
    if (currentStepData.validation && !currentStepData.validation()) {
      return;
    }

    setIsLoading(true);
    try {
      await onComplete(formData);
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateFormData = (newData: any) => {
    setFormData((prev: any) => ({ ...prev, ...newData }));
    setHasChanges(true);
  };

  const isStepValid = () => {
    return currentStepData.validation ? currentStepData.validation() : true;
  };

  const pageVariants = {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 }
  };

  return (
    <div className={cn("max-w-4xl mx-auto", className)}>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Analisis Kredit Enhanced
        </h1>
        <p className="text-gray-600">
          Lengkapi semua informasi untuk analisis kredit yang komprehensif
        </p>
      </div>

      {/* Progress */}
      <div className="mb-8">
        <StepNavigation
          currentStep={currentStep + 1}
          totalSteps={steps.length}
          onPrevious={handlePrevious}
          onNext={handleNext}
          onSaveDraft={handleSaveDraft}
          onSubmit={handleSubmit}
          isFirstStep={currentStep === 0}
          isLastStep={currentStep === steps.length - 1}
          isLoading={isLoading}
          isValid={isStepValid()}
          hasChanges={hasChanges}
        />
      </div>

      {/* Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          variants={pageVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={{ duration: 0.3 }}
        >
          <Card className="border-gray-200">
            <div className="p-6">
              <FormSection
                title={currentStepData.title}
                description={currentStepData.description}
                icon={currentStepData.icon}
              >
                <div className="space-y-6">
                  {typeof currentStepData.content === 'function'
                    ? currentStepData.content({ formData, updateFormData })
                    : currentStepData.content}
                </div>
              </FormSection>
            </div>
          </Card>
        </motion.div>
      </AnimatePresence>

      {/* Bottom Navigation */}
      <div className="mt-8">
        <StepNavigation
          currentStep={currentStep + 1}
          totalSteps={steps.length}
          onPrevious={handlePrevious}
          onNext={handleNext}
          onSaveDraft={handleSaveDraft}
          onSubmit={handleSubmit}
          isFirstStep={currentStep === 0}
          isLastStep={currentStep === steps.length - 1}
          isLoading={isLoading}
          isValid={isStepValid()}
          hasChanges={hasChanges}
        />
      </div>
    </div>
  );
}
