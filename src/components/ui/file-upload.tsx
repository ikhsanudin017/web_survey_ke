'use client';

import { useRef } from 'react';
import { Upload } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FileUploadProps {
  accept?: string;
  onChange: (file: File) => void;
  disabled?: boolean;
  className?: string;
}

export function FileUpload({ accept, onChange, disabled, className }: FileUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onChange(file);
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={cn('relative', className)}>
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleFileChange}
        className="hidden"
        disabled={disabled}
      />
      <button
        type="button"
        onClick={handleClick}
        disabled={disabled}
        className={cn(
          'w-full p-6 border-2 border-dashed rounded-lg',
          'hover:border-primary hover:bg-primary/5',
          'transition-colors duration-200',
          'flex flex-col items-center justify-center gap-2',
          disabled && 'opacity-50 cursor-not-allowed'
        )}
      >
        <Upload className="h-8 w-8 text-muted-foreground" />
        <span className="text-sm text-muted-foreground">
          {disabled ? 'File uploaded' : 'Click to upload or drag and drop'}
        </span>
      </button>
    </div>
  );
}
