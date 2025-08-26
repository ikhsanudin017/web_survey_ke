import { useState, useCallback, useEffect } from 'react';
import { useValidationState } from './useValidationState';
import { useFormProgress } from './useFormProgress';
import { useAsyncValidation } from './useAsyncValidation';
import { useDebouncedValidation } from './useDebouncedValidation';

interface EnhancedFormOptions {
  initialData: any;
  validationSchema?: any;
  asyncValidation?: any;
  steps?: any[];
  onSubmit?: (data: any) => Promise<void>;
  onError?: (errors: any) => void;
  onSuccess?: (data: any) => void;
}

export function useEnhancedForm(options: EnhancedFormOptions) {
  const {
    initialData,
    validationSchema,
    asyncValidation,
    steps = [],
    onSubmit,
    onError,
    onSuccess,
  } = options;

  // Validation state management
  const validationState = useValidationState(
    initialData,
    validationSchema || (() => ({ isValid: true, errors: {} })),
    {
      validateOnChange: true,
      validateOnBlur: true,
      validateOnSubmit: true,
    }
  );

  // Form progress management
  const formProgress = useFormProgress({
    steps: steps.map((step, index) => ({
      id: step.id || `step-${index}`,
      title: step.title || `Step ${index + 1}`,
      isCompleted: false,
      isValid: true,
      isRequired: step.required !== false,
    })),
    onStepChange: (step, index) => {
      console.log(`Step changed to: ${step.title} (${index})`);
    },
    onComplete: () => {
      console.log('All steps completed');
    },
  });

  // Async validation
  const asyncValidationHook = useAsyncValidation({
    validationFn: asyncValidation,
    debounceMs: 500,
  });

  // Debounced validation
  const debouncedValidation = useDebouncedValidation({
    validationFn: validationSchema,
    delay: 300,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Handle form submission
  const handleSubmit = useCallback(async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    setIsSubmitting(true);
    setSubmitError(null);
    setSubmitSuccess(false);

    try {
      // Validate all data
      const validationResult = validationState.validateAll(validationState.data);
      
      if (!validationResult.isValid) {
        onError?.(validationResult.errors);
        return;
      }

      // Run async validation if provided
      if (asyncValidation) {
        const asyncResult = await asyncValidationHook.validate(validationState.data);
        if (!asyncResult.isValid) {
          onError?.(asyncResult.errors);
          return;
        }
      }

      // Submit form
      if (onSubmit) {
        await onSubmit(validationState.data);
        setSubmitSuccess(true);
        onSuccess?.(validationState.data);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An error occurred';
      setSubmitError(errorMessage);
      onError?.({ submit: errorMessage });
    } finally {
      setIsSubmitting(false);
    }
  }, [validationState, asyncValidationHook, onSubmit, onError, onSuccess]);

  // Auto-validate on data change
  useEffect(() => {
    const validate = async () => {
      if (debouncedValidation.validate) {
        const result = await debouncedValidation.validate(validationState.data);
        if (result) {
          validationState.setState(prev => ({
            ...prev,
            isValid: result.isValid,
            errors: { ...prev.errors, ...result.errors },
          }));
        }
      }
    };

    validate();
  }, [validationState.data, debouncedValidation, validationState.setState]);

  // Update step validity based on current data
  useEffect(() => {
    const currentStep = formProgress.steps[formProgress.currentStep];
    if (currentStep) {
      const isValid = validationState.state.isValid;
      formProgress.updateStepStatus(currentStep.id, { isValid });
    }
  }, [validationState.state.isValid, formProgress.currentStep, formProgress.updateStepStatus]);

  const reset = useCallback(() => {
    validationState.reset(initialData);
    formProgress.reset();
    setSubmitError(null);
    setSubmitSuccess(false);
  }, [validationState, formProgress, initialData]);

  return {
    // Form state
    data: validationState.data,
    errors: validationState.state.errors,
    isValid: validationState.state.isValid,
    isSubmitting,
    submitError,
    submitSuccess,

    // Progress state
    currentStep: formProgress.currentStep,
    steps: formProgress.steps,
    progress: formProgress.progress,

    // Actions
    setFieldValue: validationState.setFieldValue,
    setFieldTouched: validationState.setFieldTouched,
    validateField: validationState.validateField,
    validateAll: validationState.validateAll,
    handleSubmit,
    reset,
    nextStep: formProgress.nextStep,
    prevStep: formProgress.prevStep,
    goToStep: formProgress.goToStep,

    // Field helpers
    getFieldProps: validationState.getFieldProps,
    register: (name: string) => ({
      name,
      value: validationState.data[name] || '',
      onChange: (e: React.ChangeEvent<HTMLInputElement>) => 
        validationState.setFieldValue(name, e.target.value),
      onBlur: () => validationState.setFieldTouched(name, true),
    }),
  };
}
