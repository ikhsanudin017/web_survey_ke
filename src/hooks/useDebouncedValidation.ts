import { useCallback, useRef, useEffect } from 'react';
import { debounce } from '@/lib/utils';

interface ValidationOptions {
  delay?: number;
  leading?: boolean;
  trailing?: boolean;
}

interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

type ValidationFunction = (data: any) => Promise<ValidationResult>;

export function useDebouncedValidation(
  validate: ValidationFunction,
  options: ValidationOptions = {}
) {
  const {
    delay = 300,
    leading = false,
    trailing = true,
  } = options;

  const validationRef = useRef<ValidationFunction | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Create debounced validation function
  const debouncedValidation = useCallback(
    debounce(async (data: any, callback: (result: ValidationResult) => void) => {
      // Cancel previous validation
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      // Create new abort controller
      abortControllerRef.current = new AbortController();

      try {
        const result = await validate(data);
        
        // Check if validation was aborted
        if (abortControllerRef.current?.signal.aborted) {
          return;
        }

        callback(result);
      } catch (error) {
        if (error instanceof Error && error.name !== 'AbortError') {
          console.error('Validation error:', error);
          callback({ isValid: false, errors: {} });
        }
      }
    }, delay, { leading, trailing }),
    [validate, delay, leading, trailing]
  );

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  const validateDebounced = useCallback(
    (data: any): Promise<ValidationResult> => {
      return new Promise((resolve) => {
        debouncedValidation(data, resolve);
      });
    },
    [debouncedValidation]
  );

  const validateImmediate = useCallback(
    async (data: any): Promise<ValidationResult> => {
      // Cancel any pending validation
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      try {
        return await validate(data);
      } catch (error) {
        console.error('Validation error:', error);
        return { isValid: false, errors: {} };
      }
    },
    [validate]
  );

  return {
    validateDebounced,
    validateImmediate,
    cancel: () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    },
  };
}
