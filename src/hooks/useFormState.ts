import { useReducer, useCallback, useMemo } from 'react';

// Action types
type FormAction =
  | { type: 'UPDATE_FIELD'; field: string; value: any }
  | { type: 'UPDATE_MULTIPLE'; data: Record<string, any> }
  | { type: 'RESET_FORM' }
  | { type: 'SET_ERRORS'; errors: Record<string, string> }
  | { type: 'CLEAR_ERROR'; field: string }
  | { type: 'SET_TOUCHED'; field: string }
  | { type: 'SET_LOADING'; loading: boolean };

// State interface
interface FormState {
  data: Record<string, any>;
  errors: Record<string, string>;
  touched: Set<string>;
  isLoading: boolean;
  hasChanges: boolean;
}

// Initial state
const initialState: FormState = {
  data: {},
  errors: {},
  touched: new Set(),
  isLoading: false,
  hasChanges: false,
};

// Reducer
function formReducer(state: FormState, action: FormAction): FormState {
  switch (action.type) {
    case 'UPDATE_FIELD':
      return {
        ...state,
        data: {
          ...state.data,
          [action.field]: action.value,
        },
        hasChanges: true,
      };
      
    case 'UPDATE_MULTIPLE':
      return {
        ...state,
        data: {
          ...state.data,
          ...action.data,
        },
        hasChanges: true,
      };
      
    case 'RESET_FORM':
      return initialState;
      
    case 'SET_ERRORS':
      return {
        ...state,
        errors: action.errors,
      };
      
    case 'CLEAR_ERROR':
      const newErrors = { ...state.errors };
      delete newErrors[action.field];
      return {
        ...state,
        errors: newErrors,
      };
      
    case 'SET_TOUCHED':
      return {
        ...state,
        touched: new Set([...state.touched, action.field]),
      };
      
    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.loading,
      };
      
    default:
      return state;
  }
}

// Custom hook
export function useFormState(initialData: Record<string, any> = {}) {
  const [state, dispatch] = useReducer(formReducer, {
    ...initialState,
    data: initialData,
  });

  // Memoized actions
  const updateField = useCallback((field: string, value: any) => {
    dispatch({ type: 'UPDATE_FIELD', field, value });
  }, []);

  const updateMultiple = useCallback((data: Record<string, any>) => {
    dispatch({ type: 'UPDATE_MULTIPLE', data });
  }, []);

  const resetForm = useCallback(() => {
    dispatch({ type: 'RESET_FORM' });
  }, []);

  const setErrors = useCallback((errors: Record<string, string>) => {
    dispatch({ type: 'SET_ERRORS', errors });
  }, []);

  const clearError = useCallback((field: string) => {
    dispatch({ type: 'CLEAR_ERROR', field });
  }, []);

  const setTouched = useCallback((field: string) => {
    dispatch({ type: 'SET_TOUCHED', field });
  }, []);

  const setLoading = useCallback((loading: boolean) => {
    dispatch({ type: 'SET_LOADING', loading });
  }, []);

  // Memoized selectors
  const getFieldValue = useCallback((field: string) => {
    return field.split('.').reduce((obj, key) => obj?.[key], state.data);
  }, [state.data]);

  const getFieldError = useCallback((field: string) => {
    return state.errors[field];
  }, [state.errors]);

  const isFieldTouched = useCallback((field: string) => {
    return state.touched.has(field);
  }, [state.touched]);

  // Memoized state
  const memoizedState = useMemo(() => ({
    data: state.data,
    errors: state.errors,
    touched: state.touched,
    isLoading: state.isLoading,
    hasChanges: state.hasChanges,
  }), [state]);

  return {
    state: memoizedState,
    actions: {
      updateField,
      updateMultiple,
      resetForm,
      setErrors,
      clearError,
      setTouched,
      setLoading,
    },
    selectors: {
      getFieldValue,
      getFieldError,
      isFieldTouched,
    },
  };
}
