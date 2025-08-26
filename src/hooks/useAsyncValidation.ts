import { useState, useCallback, useRef, useEffect } from 'react';

interface AsyncValidationOptions {
  enabled?: boolean;
  validateOnMount?: boolean;
}

interface AsyncValidationState {
  isValidating: boolean;
  isValid: boolean;
  errors: Record<string, string>;
  lastValidatedAt?: Date;
}

type ValidationFunction = (data: any) => Promise<{
  isValid: boolean;
  errors: Record<string, string>;
}>;

export function useAsyncValidation(
  validate: ValidationFunction,
  data: any,
  options: AsyncValidationOptions = {}
) {
  const {
    enabled = true,
    validateOnMount = false,
  } = options;

  const [state, setState] = useState<AsyncValidationState>({
    isValidating: false,
    isValid: true,
    errors: {},
  });

  const abortControllerRef = useRef<AbortController | null>(null);
  const validationIdRef = useRef(0);

  const validateAsync = useCallback(async () => {
    if (!enabled) return;

    // Cancel previous validation
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const validationId = ++validationIdRef.current;
    abortControllerRef.current = new AbortController();

    setState(prev => ({ ...prev, isValidating: true }));

    try {
      const result = await validate(data);

      // Check if this is still the latest validation
      if (validationId !== validationIdRef.current) {
        return;
      }

      setState({
        isValidating: false,
        isValid: result.isValid,
        errors: result.errors,
        lastValidatedAt: new Date(),
      });
    } catch (error) {
      if (validationId === validationIdRef.current && error instanceof Error && error.name !== 'AbortError') {
        console.error('Validation error:', error);
        setState(prev => ({
          ...prev,
          isValidating: false,
          isValid: false,
          errors: { _validation: 'Validation failed' },
        }));
      }
    }
  }, [validate, data, enabled]);

  const reset = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setState({
      isValidating: false,
      isValid: true,
      errors: {},
      lastValidatedAt: undefined,
    });
  }, []);

  // Validate on mount if enabled
  useEffect(() => {
    if (validateOnMount && enabled) {
      validateAsync();
    }
  }, [validateOnMount, enabled]);

  // Validate when data changes
  useEffect(() => {
    if (enabled) {
      validateAsync();
    }
  }, [data, enabled, validateAsync]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return {
    ...state,
    validate: validateAsync,
    reset,
  };
}
