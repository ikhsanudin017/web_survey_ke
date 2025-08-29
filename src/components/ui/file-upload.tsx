'use client';

import { useRef } from 'react';
import { Upload } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FileUploadProps {
  accept?: string;
  onChange: (file: File) => void;
  disabled?: boolean;
  className?: string;
  // Optional actions row shown under the drop area
  showActions?: boolean;
  uploaded?: boolean;
  onClear?: () => void;
}

export function FileUpload({ accept, onChange, disabled, className, showActions, uploaded, onClear }: FileUploadProps) {
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
          {uploaded ? 'File uploaded' : 'Click to upload or drag and drop'}
        </span>
      </button>
      {showActions && (
        <div className="mt-2 flex items-center gap-2">
          <button
            type="button"
            onClick={handleClick}
            className="px-3 py-1 text-sm border rounded hover:bg-gray-50"
          >
            Upload Ulang
          </button>
          <button
            type="button"
            onClick={onClear}
            className="px-3 py-1 text-sm border rounded text-red-600 hover:bg-red-50"
          >
            Hapus
          </button>
        </div>
      )}
    </div>
  );
}
