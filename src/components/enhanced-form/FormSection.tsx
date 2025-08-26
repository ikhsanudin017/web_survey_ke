'use client';

import { ReactNode } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface FormSectionProps {
  title: string;
  description?: string;
  children: ReactNode;
  icon?: ReactNode;
  badge?: string;
  className?: string;
  collapsible?: boolean;
  isOpen?: boolean;
  onToggle?: () => void;
}

export function FormSection({
  title,
  description,
  children,
  icon,
  badge,
  className,
  collapsible = false,
  isOpen = true,
  onToggle
}: FormSectionProps) {
  return (
    <Card className={cn("border-gray-200", className)}>
      <CardHeader 
        className={cn(
          "pb-3",
          collapsible && "cursor-pointer hover:bg-gray-50 transition-colors"
        )}
        onClick={collapsible ? onToggle : undefined}
      >
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            {icon && <div className="text-blue-600">{icon}</div>}
            <div>
              <CardTitle className="text-lg font-semibold">{title}</CardTitle>
              {description && (
                <CardDescription className="mt-1">{description}</CardDescription>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {badge && (
              <Badge variant="secondary" className="text-xs">
                {badge}
              </Badge>
            )}
            {collapsible && (
              <div className={cn(
                "transform transition-transform duration-200",
                !isOpen && "rotate-180"
              )}>
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            )}
          </div>
        </div>
      </CardHeader>
      
      {(!collapsible || isOpen) && (
        <CardContent className="pt-0">
          {children}
        </CardContent>
      )}
    </Card>
  );
}
