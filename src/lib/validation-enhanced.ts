import { z } from 'zod';
import { UseFormSetError, UseFormClearErrors } from 'react-hook-form';
import { ApplicationFormData } from './validations/application';

// Enhanced validation with real-time feedback
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings?: string[];
}

// Async validation utilities
export class AsyncValidator {
  static async validateEmailUniqueness(email: string): Promise<boolean> {
    try {
      const response = await fetch('/api/validate/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await response.json();
      return data.available;
    } catch {
      return true; // Assume valid on error
    }
  }

  static async validatePhoneUniqueness(phone: string): Promise<boolean> {
    try {
      const response = await fetch('/api/validate/phone', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone }),
      });
      const data = await response.json();
      return data.available;
    } catch {
      return true; // Assume valid on error
    }
  }
}

// File validation utilities
export interface FileValidationOptions {
  maxSize: number; // in bytes
  allowedTypes: string[];
  maxWidth?: number;
  maxHeight?: number;
}

export class FileValidator {
  static validateFile(file: File, options: FileValidationOptions): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Size validation
    if (file.size > options.maxSize) {
      const maxSizeMB = options.maxSize / (1024 * 1024);
      errors.push(`File terlalu besar. Maksimal ${maxSizeMB}MB`);
    }

    // Type validation
    if (!options.allowedTypes.includes(file.type)) {
      errors.push(`Tipe file tidak didukung. Gunakan: ${options.allowedTypes.join(', ')}`);
    }

    // Image dimensions validation (if image)
    if (file.type.startsWith('image/') && (options.maxWidth || options.maxHeight)) {
      const img = new Image();
      img.onload = () => {
        if (options.maxWidth && img.width > options.maxWidth) {
          warnings.push(`Lebar gambar lebih dari ${options.maxWidth}px`);
        }
        if (options.maxHeight && img.height > options.maxHeight) {
          warnings.push(`Tinggi gambar lebih dari ${options.maxHeight}px`);
        }
      };
      img.src = URL.createObjectURL(file);
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }

  static validateMultipleFiles(
    files: File[],
    options: FileValidationOptions
  ): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    files.forEach((file, index) => {
      const result = this.validateFile(file, options);
      if (!result.isValid) {
        errors.push(`File ${index + 1}: ${result.errors.join(', ')}`);
      }
      if (result.warnings) {
        warnings.push(...result.warnings.map(w => `File ${index + 1}: ${w}`));
      }
    });

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }
}

// Enhanced field validation with context
export const createFieldValidator = (
  fieldName: string,
  setError: UseFormSetError<ApplicationFormData>,
  clearErrors: UseFormClearErrors<ApplicationFormData>
) => {
  return {
    validateEmail: async (value: string) => {
      try {
        const isUnique = await AsyncValidator.validateEmailUniqueness(value);
        if (!isUnique) {
          setError('contactData.email' as any, {
            type: 'manual',
            message: 'Email sudah terdaftar',
          });
          return false;
        }
        clearErrors('contactData.email' as any);
        return true;
      } catch {
        return true;
      }
    },

    validatePhone: async (value: string) => {
      try {
        const isUnique = await AsyncValidator.validatePhoneUniqueness(value);
        if (!isUnique) {
          setError('contactData.phone' as any, {
            type: 'manual',
            message: 'Nomor telepon sudah terdaftar',
          });
          return false;
        }
        clearErrors('contactData.phone' as any);
        return true;
      } catch {
        return true;
      }
    },

    validateIncome: (value: string, field: string) => {
      const numericValue = parseFloat(value.replace(/[^0-9.-]+/g, ''));
      
      if (numericValue < 1000000) {
        setError(field as any, {
          type: 'manual',
          message: 'Penghasilan minimal Rp 1.000.000',
        });
        return false;
      }
      
      if (numericValue > 100000000) {
        setError(field as any, {
          type: 'manual',
          message: 'Penghasilan maksimal Rp 100.000.000',
        });
        return false;
      }
      
      clearErrors(field as any);
      return true;
    },
  };
};

// Debounced validation helper
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  delay: number
): ((...args: Parameters<T>) => void) => {
  let timeoutId: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};

// Validation message helpers
export const getValidationMessage = (error: any): string => {
  if (!error) return '';
  
  if (typeof error === 'string') return error;
  if (error.message) return error.message;
  
  return 'Validasi gagal';
};

// Contextual help messages
export const getFieldHelp = (fieldName: string): string => {
  const helpMessages: Record<string, string> = {
    'personalData.fullName': 'Masukkan nama lengkap sesuai KTP',
    'personalData.birthDate': 'Minimal 18 tahun untuk mengajukan pinjaman',
    'personalData.monthlyIncome': 'Masukkan penghasilan bersih per bulan',
    'contactData.email': 'Gunakan email aktif untuk verifikasi',
    'contactData.phone': 'Format: 08xx-xxxx-xxxx atau +62xxx',
    'contactData.homeAddress': 'Masukkan alamat lengkap sesuai KTP',
    'financingData.loanAmount': 'Jumlah pinjaman antara Rp 1.000.000 - Rp 50.000.000',
    'financingData.loanPurpose': 'Jelaskan secara detail tujuan penggunaan pinjaman',
    'financingData.collateral': 'Jelaskan jaminan yang akan digunakan',
  };
  
  return helpMessages[fieldName] || '';
};

// Progress calculation
export const calculateProgress = (data: Partial<ApplicationFormData>): number => {
  const totalFields = 25; // Total fields across all steps
  let filledFields = 0;
  
  // Personal data
  if (data.personalData?.fullName) filledFields++;
  if (data.personalData?.birthDate) filledFields++;
  if (data.personalData?.maritalStatus) filledFields++;
  if (data.personalData?.monthlyIncome) filledFields++;
  
  // Contact data
  if (data.contactData?.email) filledFields++;
  if (data.contactData?.phone) filledFields++;
  if (data.contactData?.homeAddress) filledFields++;
  if (data.contactData?.contactNumbers?.length) filledFields++;
  if (data.contactData?.emergencyContacts?.length) filledFields++;
  
  // Financing data
  if (data.financingData?.loanAmount) filledFields++;
  if (data.financingData?.loanTerm) filledFields++;
  if (data.financingData?.loanPurpose) filledFields++;
  if (data.financingData?.collateral) filledFields++;
  
  // Documents
  if (data.documentUpload?.documents?.length) filledFields++;
  
  return Math.round((filledFields / totalFields) * 100);
};
