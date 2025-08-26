import { z } from 'zod';

// Document validation schema
export const DocumentValidationSchema = z.object({
  documentId: z.string().uuid(),
  type: z.enum([
    'KTP',
    'KK',
    'SLIP_GAJI',
    'REKENING_KORAN',
    'SERTIFIKAT_TANAH',
    'SERTIFIKAT_RUMAH',
    'STNK',
    'BPKB',
    'NPWP',
    'SIUP',
    'TDP',
    'AKTA_PERUSAHAAN',
    'LAINNYA'
  ]),
  fileName: z.string().min(1).max(255),
  fileSize: z.number().positive(),
  mimeType: z.string().regex(/^image\/(jpeg|png|pdf)$|^application\/pdf$/),
  uploadDate: z.date(),
  verification: z.object({
    status: z.enum(['PENDING', 'VERIFIED', 'REJECTED', 'EXPIRED']),
    verifiedBy: z.string().optional(),
    verifiedDate: z.date().optional(),
    confidenceScore: z.number().min(0).max(100).optional(),
    issues: z.array(z.string()).optional(),
    notes: z.string().max(500).optional()
  }),
  metadata: z.object({
    originalName: z.string(),
    dimensions: z.object({
      width: z.number().optional(),
      height: z.number().optional()
    }).optional(),
    fileHash: z.string().optional()
  }).optional()
});

// Document analysis result schema
export const DocumentAnalysisResultSchema = z.object({
  documentId: z.string().uuid(),
  analysis: z.object({
    textContent: z.string().optional(),
    extractedData: z.record(z.any()).optional(),
    validationResults: z.array(z.object({
      field: z.string(),
      value: z.string(),
      confidence: z.number().min(0).max(100),
      isValid: z.boolean(),
      issues: z.array(z.string()).optional()
    })),
    fraudIndicators: z.array(z.object({
      type: z.string(),
      severity: z.enum(['LOW', 'MEDIUM', 'HIGH']),
      description: z.string()
    })).optional()
  }),
  overallAssessment: z.object({
    authenticity: z.enum(['AUTHENTIC', 'SUSPICIOUS', 'FAKE']),
    completeness: z.enum(['COMPLETE', 'INCOMPLETE', 'CORRUPTED']),
    quality: z.enum(['EXCELLENT', 'GOOD', 'FAIR', 'POOR'])
  })
});

// Batch document analysis schema
export const BatchDocumentAnalysisSchema = z.object({
  applicationId: z.string().uuid(),
  documents: z.array(DocumentValidationSchema),
  analysisResults: z.array(DocumentAnalysisResultSchema),
  summary: z.object({
    totalDocuments: z.number().positive(),
    verifiedDocuments: z.number().nonnegative(),
    rejectedDocuments: z.number().nonnegative(),
    pendingDocuments: z.number().nonnegative(),
    overallStatus: z.enum(['COMPLETE', 'INCOMPLETE', 'REJECTED'])
  })
});

// Document upload validation schema
export const DocumentUploadSchema = z.object({
  applicationId: z.string().uuid(),
  documents: z.array(z.object({
    type: z.enum([
      'KTP',
      'KK',
      'SLIP_GAJI',
      'REKENING_KORAN',
      'SERTIFIKAT_TANAH',
      'SERTIFIKAT_RUMAH',
      'STNK',
      'BPKB',
      'NPWP',
      'SIUP',
      'TDP',
      'AKTA_PERUSAHAAN',
      'LAINNYA'
    ]),
    file: z.any().refine((file) => file instanceof File, {
      message: 'File harus berupa file yang valid'
    }).refine((file) => file.size <= 5 * 1024 * 1024, {
      message: 'Ukuran file maksimal 5MB'
    }).refine((file) => 
      ['image/jpeg', 'image/png', 'application/pdf'].includes(file.type), {
      message: 'Format file harus JPG, PNG, atau PDF'
    })
  })).min(1).max(10)
});

// Type exports
export type DocumentValidation = z.infer<typeof DocumentValidationSchema>;
export type DocumentAnalysisResult = z.infer<typeof DocumentAnalysisResultSchema>;
export type BatchDocumentAnalysis = z.infer<typeof BatchDocumentAnalysisSchema>;
export type DocumentUpload = z.infer<typeof DocumentUploadSchema>;
