'use client';

import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { CalendarIcon, Eye, EyeOff, AlertCircle, CheckCircle } from 'lucide-react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

interface FormFieldProps {
  name: string;
  label: string;
  type?: string;
  placeholder?: string;
  value?: any;
  onChange?: (value: any) => void;
  onBlur?: () => void;
  error?: string;
  touched?: boolean;
  required?: boolean;
  options?: Array<{ value: string; label: string }>;
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
  className?: string;
  description?: string;
  conditional?: {
    dependsOn: string;
    condition: (value: any) => boolean;
  };
  validation?: {
    pattern?: RegExp;
    minLength?: number;
    maxLength?: number;
    custom?: (value: any) => string | null;
  };
}

export function FormField({
  name,
  label,
  type = 'text',
  placeholder,
  value,
  onChange,
  onBlur,
  error,
  touched,
  required = false,
  options,
  min,
  max,
  step,
  disabled,
  className,
  description,
  conditional,
  validation
}: FormFieldProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [localError, setLocalError] = useState<string | null>(null);

  useEffect(() => {
    if (conditional) {
      // In real implementation, this would check form context
      setIsVisible(true);
    }
  }, [conditional]);

  const validateField = (val: any) => {
    if (validation?.custom) {
      const customError = validation.custom(val);
      if (customError) {
        setLocalError(customError);
        return;
      }
    }

    if (validation?.pattern && val && !validation.pattern.test(val)) {
      setLocalError(`Format ${label} tidak valid`);
      return;
    }

    if (validation?.minLength && val?.length < validation.minLength) {
      setLocalError(`${label} minimal ${validation.minLength} karakter`);
      return;
    }

    if (validation?.maxLength && val?.length > validation.maxLength) {
      setLocalError(`${label} maksimal ${validation.maxLength} karakter`);
      return;
    }

    setLocalError(null);
  };

  const handleChange = (val: any) => {
    validateField(val);
    onChange?.(val);
  };

  const hasError = error || localError;
  const isValid = touched && !hasError && value !== undefined && value !== '';

  if (!isVisible) return null;

  const renderField = () => {
    switch (type) {
      case 'select':
        return (
          <Select value={value} onValueChange={handleChange} disabled={disabled}>
            <SelectTrigger className={cn(
              "w-full",
              hasError && "border-red-500",
              isValid && "border-green-500"
            )}>
              <SelectValue placeholder={placeholder} />
            </SelectTrigger>
            <SelectContent>
              {options?.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );

      case 'radio':
        return (
          <RadioGroup value={value} onValueChange={handleChange} disabled={disabled}>
            <div className="grid gap-2">
              {options?.map((option) => (
                <div key={option.value} className="flex items-center space-x-2">
                  <RadioGroupItem value={option.value} id={`${name}-${option.value}`} />
                  <Label htmlFor={`${name}-${option.value}`} className="cursor-pointer">
                    {option.label}
                  </Label>
                </div>
              ))}
            </div>
          </RadioGroup>
        );

      case 'checkbox':
        return (
          <div className="space-y-2">
            {options?.map((option) => (
              <div key={option.value} className="flex items-center space-x-2">
                <Checkbox
                  checked={Array.isArray(value) && value.includes(option.value)}
                  onCheckedChange={(checked) => {
                    const newValue = checked
                      ? [...(value || []), option.value]
                      : (value || []).filter((v: string) => v !== option.value);
                    handleChange(newValue);
                  }}
                  disabled={disabled}
                />
                <Label className="cursor-pointer">{option.label}</Label>
              </div>
            ))}
          </div>
        );

      case 'slider':
        return (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>{min}</span>
              <span className="font-medium">{value || 0}</span>
              <span>{max}</span>
            </div>
            <Slider
              value={[value || 0]}
              onValueChange={([val]) => handleChange(val)}
              min={min}
              max={max}
              step={step || 1}
              disabled={disabled}
              className={cn(
                hasError && "text-red-500",
                isValid && "text-green-500"
              )}
            />
          </div>
        );

      case 'textarea':
        return (
          <Textarea
            value={value || ''}
            onChange={(e) => handleChange(e.target.value)}
            onBlur={onBlur}
            placeholder={placeholder}
            disabled={disabled}
            className={cn(
              "min-h-[80px]",
              hasError && "border-red-500",
              isValid && "border-green-500"
            )}
          />
        );

      case 'date':
        return (
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !value && "text-muted-foreground",
                  hasError && "border-red-500",
                  isValid && "border-green-500"
                )}
                disabled={disabled}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {value ? format(new Date(value), 'PPP', { locale: id }) : placeholder}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={value ? new Date(value) : undefined}
                onSelect={(date) => handleChange(date)}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        );

      case 'password':
        return (
          <div className="relative">
            <Input
              type={showPassword ? 'text' : 'password'}
              value={value || ''}
              onChange={(e) => handleChange(e.target.value)}
              onBlur={onBlur}
              placeholder={placeholder}
              disabled={disabled}
              className={cn(
                "pr-10",
                hasError && "border-red-500",
                isValid && "border-green-500"
              )}
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4 text-gray-500" />
              ) : (
                <Eye className="h-4 w-4 text-gray-500" />
              )}
            </button>
          </div>
        );

      default:
        return (
          <Input
            type={type}
            value={value || ''}
            onChange={(e) => handleChange(e.target.value)}
            onBlur={onBlur}
            placeholder={placeholder}
            disabled={disabled}
            min={min}
            max={max}
            step={step}
            className={cn(
              hasError && "border-red-500",
              isValid && "border-green-500"
            )}
          />
        );
    }
  };

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center justify-between">
        <Label className={cn(
          "text-sm font-medium",
          required && "after:content-['*'] after:ml-1 after:text-red-500"
        )}>
          {label}
        </Label>
        {isValid && <CheckCircle className="h-4 w-4 text-green-500" />}
      </div>

      {description && (
        <p className="text-xs text-gray-500">{description}</p>
      )}

      {renderField()}

      {hasError && (
        <div className="flex items-center gap-1 text-xs text-red-500">
          <AlertCircle className="h-3 w-3" />
          <span>{error || localError}</span>
        </div>
      )}
    </div>
  );
}
