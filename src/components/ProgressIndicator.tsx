'use client';

import React from 'react';
import { Check, Circle, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';

export interface ProgressStep {
  id: string;
  title: string;
  description?: string;
  status: 'completed' | 'current' | 'pending' | 'error';
  progress?: number; // 0-100
  error?: string;
}

interface ProgressIndicatorProps {
  steps: ProgressStep[];
  orientation?: 'horizontal' | 'vertical';
  showDescriptions?: boolean;
  className?: string;
}

export const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({
  steps,
  orientation = 'horizontal',
  showDescriptions = true,
  className,
}) => {
  const currentStepIndex = steps.findIndex(step => step.status === 'current');
  const completedSteps = steps.filter(step => step.status === 'completed').length;
  const totalSteps = steps.length;
  const overallProgress = Math.round((completedSteps / totalSteps) * 100);

  if (orientation === 'vertical') {
    return (
      <div className={cn('space-y-4', className)}>
        <div className="mb-4">
          <div className="flex justify-between text-sm text-gray-600 mb-1">
            <span>Progress</span>
            <span>{overallProgress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="h-2 rounded-full transition-all duration-300"
              style={{ background: 'linear-gradient(90deg, var(--color-primary), var(--color-accent))', width: `${overallProgress}%` }}
            />
          </div>
        </div>

        {steps.map((step, index) => (
          <div key={step.id} className="flex items-start space-x-3">
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  'w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all duration-300',
                  {
                    'bg-green-500 border-green-500 text-white': step.status === 'completed',
                    'bg-blue-500 border-blue-500 text-white': step.status === 'current',
                    'bg-red-500 border-red-500 text-white': step.status === 'error',
                    'bg-gray-100 border-gray-300 text-gray-500': step.status === 'pending',
                  }
                )}
              >
                {step.status === 'completed' && <Check className="h-4 w-4" />}
                {step.status === 'current' && <Circle className="h-4 w-4" />}
                {step.status === 'error' && <AlertCircle className="h-4 w-4" />}
                {step.status === 'pending' && <Circle className="h-4 w-4" />}
              </div>
              {index < steps.length - 1 && (
                <div
                  className={cn(
                    'w-0.5 h-8 mt-1',
                    step.status === 'completed' ? 'bg-green-500' : 'bg-gray-300'
                  )}
                />
              )}
            </div>

            <div className="flex-1 pt-1">
              <h4 className={cn(
                'font-medium',
                step.status === 'current' ? 'text-blue-600' : 'text-gray-900'
              )}>
                {step.title}
              </h4>
              {showDescriptions && step.description && (
                <p className="text-sm text-gray-600 mt-1">{step.description}</p>
              )}
              {step.status === 'current' && step.progress !== undefined && (
                <div className="mt-2">
                  <div className="flex justify-between text-xs text-gray-500 mb-1">
                    <span>Loading...</span>
                    <span>{step.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1">
                    <div className="h-1 rounded-full transition-all duration-300" style={{ width: `${step.progress}%`, background: 'linear-gradient(90deg, var(--color-primary), var(--color-accent))' }} />
                  </div>
                </div>
              )}
              {step.status === 'error' && step.error && (
                <p className="text-sm text-red-600 mt-1 flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {step.error}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className={cn('w-full', className)}>
      <div className="mb-4">
        <div className="flex justify-between text-sm text-gray-600 mb-1">
          <span>Progress</span>
          <span>{completedSteps} dari {totalSteps} langkah</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="h-2 rounded-full transition-all duration-300"
            style={{ width: `${overallProgress}%`, background: 'linear-gradient(90deg, var(--color-primary), var(--color-accent))' }}
          />
        </div>
      </div>

      <div className="flex items-center justify-between">
        {steps.map((step, index) => (
          <React.Fragment key={step.id}>
            <div className="flex flex-col items-center flex-1 min-w-0">
              <div
                className={cn(
                  'w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300',
                  {
                    'bg-green-500 border-green-500 text-white': step.status === 'completed',
                    'bg-blue-500 border-blue-500 text-white': step.status === 'current',
                    'bg-red-500 border-red-500 text-white': step.status === 'error',
                    'bg-gray-100 border-gray-300 text-gray-500': step.status === 'pending',
                  }
                )}
              >
                {step.status === 'completed' && <Check className="h-5 w-5" />}
                {step.status === 'current' && <Circle className="h-5 w-5" />}
                {step.status === 'error' && <AlertCircle className="h-5 w-5" />}
                {step.status === 'pending' && <span className="text-sm">{index + 1}</span>}
              </div>
              
              <div className="text-center mt-2">
                <h4 className={cn(
                  'text-sm font-medium',
                step.status === 'current' ? 'text-[var(--color-primary-dark)]' : 'text-gray-900'
                )}>
                  {step.title}
                </h4>
                {showDescriptions && step.description && (
                  <p className="text-xs text-gray-600 mt-1">{step.description}</p>
                )}
              </div>
            </div>

            {index < steps.length - 1 && (
              <div className={cn('flex-1 h-0.5 mx-2', step.status === 'completed' ? 'bg-[var(--color-primary)]' : 'bg-gray-300')} />
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

// Mini progress indicator for form sections
export const MiniProgress: React.FC<{
  current: number;
  total: number;
  label?: string;
}> = ({ current, total, label }) => {
  const progress = Math.round((current / total) * 100);

  return (
    <div className="flex items-center space-x-2">
      {label && <span className="text-sm text-gray-600">{label}</span>}
      <div className="flex-1 bg-gray-200 rounded-full h-1.5">
        <div
          className="h-1.5 rounded-full transition-all duration-300"
          style={{ width: `${progress}%`, background: 'linear-gradient(90deg, var(--color-primary), var(--color-accent))' }}
        />
      </div>
      <span className="text-xs text-gray-500">
        {current}/{total}
      </span>
    </div>
  );
};

// Animated progress bar
export const AnimatedProgress: React.FC<{
  value: number;
  max?: number;
  label?: string;
  showPercentage?: boolean;
  className?: string;
}> = ({ value, max = 100, label, showPercentage = true, className }) => {
  const percentage = Math.round((value / max) * 100);

  return (
    <div className={className}>
      {label && (
        <div className="flex justify-between text-sm mb-1">
          <span>{label}</span>
          {showPercentage && <span>{percentage}%</span>}
        </div>
      )}
      <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
        <div
          className="bg-gradient-to-r from-blue-500 to-blue-600 h-full rounded-full transition-all duration-500 ease-out"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};
