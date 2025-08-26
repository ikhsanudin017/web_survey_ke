import { z } from 'zod';

// Base schemas from existing validations
import { CharacterAssessmentValidationSchema } from './character-assessment';
import { BatchDocumentAnalysisSchema } from './document-analysis';
import { CollateralAnalysisSchema } from './collateral-analysis';
import { FinancialCapacitySchema } from './enhanced-analysis';
import { AIConclusionSchema } from './enhanced-analysis';
import { FinalDecisionSchema } from './enhanced-analysis';

// Enhanced form field schemas with better UX
export const EnhancedFormFieldSchema = z.object({
  // Character Assessment Fields
  honestyRating: z.number().min(1).max(5).describe('Kejujuran'),
  responsibilityRating: z.number().min(1).max(5).describe('Tanggung jawab'),
  financialDisciplineRating: z.number().min(1).max(5).describe('Disiplin keuangan'),
  workCommitmentRating: z.number().min(1).max(5).describe('Komitmen kerja'),
  communicationRating: z.number().min(1).max(5).describe('Komunikasi'),
  evaluatorName: z.string().min(2, 'Nama evaluator minimal 2 karakter').max(100),
  evaluationDate: z.date(),
  characterNotes: z.string().max(500, 'Catatan maksimal 500 karakter').optional(),

  // Document Analysis Fields
  documentTypes: z.array(z.enum(['KTP', 'KK', 'SLIP_GAJI', 'REKENING', 'SERTIFIKAT', 'PAJAK', 'LAINNYA'])),
  documentStatus: z.record(z.enum(['VALID', 'INVALID', 'PENDING', 'EXPIRED'])),
  documentConfidence: z.record(z.number().min(0).max(100)),
  missingDocuments: z.array(z.string()).optional(),

  // Collateral Analysis Fields
  collateralType: z.enum(['PROPERTY', 'VEHICLE', 'DEPOSIT', 'GUARANTEE', 'OTHER']),
  estimatedValue: z.number().positive('Nilai estimasi harus positif'),
  marketValue: z.number().positive('Nilai pasar harus positif'),
  loanToValueRatio: z.number().min(0).max(100, 'LTV ratio harus antara 0-100%'),
  collateralVerificationStatus: z.enum(['VERIFIED', 'UNVERIFIED', 'DISPUTED']),
  legalStatus: z.enum(['CLEAR', 'ENCUMBERED', 'DISPUTED']),
  collateralDocuments: z.array(z.object({
    type: z.string(),
    verified: z.boolean(),
    verificationDate: z.date()
  })),

  // Financial Capacity Fields
  monthlyIncome: z.number().positive('Penghasilan bulanan harus positif'),
  monthlyExpenses: z.number().positive('Pengeluaran bulanan harus positif'),
  disposableIncome: z.number().positive('Penghasilan bersih harus positif'),
  debtServiceRatio: z.number().min(0).max(100, 'DSR harus antara 0-100%'),
  existingDebts: z.array(z.object({
    type: z.string(),
    amount: z.number().positive(),
    monthlyPayment: z.number().positive()
  })),
  creditScore: z.number().min(300).max(850, 'Credit score harus antara 300-850').optional(),

  // AI Conclusion Fields
  aiSummary: z.string().min(50, 'Ringkasan minimal 50 karakter').max(1000, 'Ringkasan maksimal 1000 karakter'),
  aiRiskLevel: z.enum(['LOW', 'MEDIUM', 'HIGH']),
  aiRecommendation: z.enum(['APPROVE', 'REJECT', 'REVIEW']),
  aiConfidenceScore: z.number().min(0).max(100, 'Skor kepercayaan harus antara 0-100'),
  aiFactors: z.array(z.string()).describe('Faktor-faktor pertimbangan'),
  aiWarnings: z.array(z.string()).optional(),

  // Final Decision Fields
  finalDecision: z.enum(['APPROVED', 'REJECTED', 'PENDING', 'CONDITIONAL']),
  approvedAmount: z.number().positive().optional(),
  approvedTerm: z.number().positive().min(1).max(60).optional(),
  interestRate: z.number().min(0).max(100).optional(),
  conditions: z.array(z.string()).optional(),
  rejectionReasons: z.array(z.string()).optional(),
  decisionMaker: z.string().min(2, 'Nama pembuat keputusan minimal 2 karakter').max(100),
  decisionNotes: z.string().max(1000, 'Catatan keputusan maksimal 1000 karakter').optional()
});

// Form step validation schemas
export const Step1CharacterSchema = EnhancedFormFieldSchema.pick({
  honestyRating: true,
  responsibilityRating: true,
  financialDisciplineRating: true,
  workCommitmentRating: true,
  communicationRating: true,
  evaluatorName: true,
  evaluationDate: true,
  characterNotes: true
});

export const Step2DocumentSchema = EnhancedFormFieldSchema.pick({
  documentTypes: true,
  documentStatus: true,
  documentConfidence: true,
  missingDocuments: true
});

export const Step3CollateralSchema = EnhancedFormFieldSchema.pick({
  collateralType: true,
  estimatedValue: true,
  marketValue: true,
  loanToValueRatio: true,
  collateralVerificationStatus: true,
  legalStatus: true,
  collateralDocuments: true
});

export const Step4FinancialSchema = EnhancedFormFieldSchema.pick({
  monthlyIncome: true,
  monthlyExpenses: true,
  disposableIncome: true,
  debtServiceRatio: true,
  existingDebts: true,
  creditScore: true
});

export const Step5DecisionSchema = EnhancedFormFieldSchema.pick({
  finalDecision: true,
  approvedAmount: true,
  approvedTerm: true,
  interestRate: true,
  conditions: true,
  rejectionReasons: true,
  decisionMaker: true,
  decisionNotes: true
});

// API request/response schemas
export const SaveAnalysisRequestSchema = z.object({
  applicationId: z.string().uuid(),
  applicantId: z.string().uuid(),
  step: z.number().min(1).max(5),
  data: EnhancedFormFieldSchema.partial(),
  isDraft: z.boolean().default(true)
});

export const SaveAnalysisResponseSchema = z.object({
  success: z.boolean(),
  analysisId: z.string().uuid(),
  step: z.number(),
  nextStep: z.number().optional(),
  errors: z.array(z.string()).optional()
});

// Type exports
export type EnhancedFormField = z.infer<typeof EnhancedFormFieldSchema>;
export type Step1Character = z.infer<typeof Step1CharacterSchema>;
export type Step2Document = z.infer<typeof Step2DocumentSchema>;
export type Step3Collateral = z.infer<typeof Step3CollateralSchema>;
export type Step4Financial = z.infer<typeof Step4FinancialSchema>;
export type Step5Decision = z.infer<typeof Step5DecisionSchema>;
export type SaveAnalysisRequest = z.infer<typeof SaveAnalysisRequestSchema>;
export type SaveAnalysisResponse = z.infer<typeof SaveAnalysisResponseSchema>;
