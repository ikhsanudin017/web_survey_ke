import { useState, useCallback, useRef } from 'react';

interface ValidationState {
  isValid: boolean;
  errors: Record<string, string>;
  touched: Set<string>;
  dirty: Set<string>;
}

interface ValidationOptions {
  validateOnChange?: boolean;
  validateOnBlur?: boolean;
  validateOnSubmit?: boolean;
}

type ValidationFunction = (data: any, field?: string) => {
  isValid: boolean;
  errors: Record<string, string>;
};

export function useValidationState(
  initialData: any,
  validate: ValidationFunction,
  options: ValidationOptions = {}
) {
  const {
    validateOnChange = true,
    validateOnBlur = true,
    validateOnSubmit = true,
  } = options;

  const [data, setData] = useState<any>(initialData);
  const [state, setState] = useState<ValidationState>({
    isValid: true,
    errors: {},
    touched: new Set(),
    dirty: new Set(),
  });

  const validationCacheRef = useRef<Map<string, any>>(new Map());

  const validateField = useCallback((field: string, value: any) => {
    const cacheKey = `${field}:${JSON.stringify(value)}`;
    
    if (validationCacheRef.current.has(cacheKey)) {
      return validationCacheRef.current.get(cacheKey);
    }

    const result = validate({ [field]: value }, field);
    validationCacheRef.current.set(cacheKey, result);
    
    return result;
  }, [validate]);

  const validateAll = useCallback((newData: any) => {
    const result = validate(newData);
    
    setState(prev => ({
      ...prev,
      isValid: result.isValid,
      errors: result.errors,
    }));

    return result;
  }, [validate]);

  const setFieldValue = useCallback((field: string, value: any) => {
    setData((prev: any) => ({ ...prev, [field]: value }));
    
    setState(prev => ({
      ...prev,
      dirty: new Set(prev.dirty).add(field),
    }));

    if (validateOnChange) {
      const result = validateField(field, value);
      setState(prev => ({
        ...prev,
        isValid: result.isValid,
        errors: { ...prev.errors, [field]: result.errors[field] || '' },
      }));
    }
  }, [validateOnChange, validateField]);

  const setFieldTouched = useCallback((field: string, touched: boolean = true) => {
    setState(prev => {
      const newTouched = new Set(prev.touched);
      if (touched) {
        newTouched.add(field);
      } else {
        newTouched.delete(field);
      }

      let newErrors = prev.errors;
      if (validateOnBlur && touched && prev.dirty.has(field)) {
        const result = validateField(field, data[field]);
        newErrors = { ...prev.errors, [field]: result.errors[field] || '' };
      }

      return {
        ...prev,
        touched: newTouched,
        errors: newErrors,
      };
    });
  }, [validateOnBlur, data, validateField]);

  const reset = useCallback((newData?: any) => {
    if (newData !== undefined) {
      setData(newData);
    }
    
    setState({
      isValid: true,
      errors: {},
      touched: new Set(),
      dirty: new Set(),
    });
    
    validationCacheRef.current.clear();
  }, []);

  const clearErrors = useCallback(() => {
    setState(prev => ({
      ...prev,
      errors: {},
      isValid: true,
    }));
  }, []);

  const getFieldProps = useCallback((field: string) => ({
    value: data[field] || '',
    onChange: (value: any) => setFieldValue(field, value),
    onBlur: () => setFieldTouched(field, true),
    error: state.errors[field],
    touched: state.touched.has(field),
    dirty: state.dirty.has(field),
  }), [data, state, setFieldValue, setFieldTouched]);

  return {
    data,
    state,
    setData,
    setFieldValue,
    setFieldTouched,
    validateAll,
    reset,
    clearErrors,
    getFieldProps,
  };
}
