import { z } from 'zod';

// Character Assessment Validation Schema
export const CharacterAssessmentSchema = z.object({
  ratings: z.object({
    honesty: z.number().min(1).max(5).describe('Kejujuran (1-5)'),
    responsibility: z.number().min(1).max(5).describe('Tanggung jawab (1-5)'),
    financialDiscipline: z.number().min(1).max(5).describe('Disiplin keuangan (1-5)'),
    workCommitment: z.number().min(1).max(5).describe('Komitmen kerja (1-5)'),
    communication: z.number().min(1).max(5).describe('Komunikasi (1-5)')
  }),
  evaluatorName: z.string().min(2).max(100).describe('Nama evaluator'),
  evaluationDate: z.date().describe('Tanggal evaluasi'),
  notes: z.string().max(500).optional().describe('Catatan tambahan')
});

// AI Conclusion Validation Schema
export const AIConclusionSchema = z.object({
  summary: z.string().min(50).max(1000).describe('Ringkasan analisis AI'),
  riskLevel: z.enum(['LOW', 'MEDIUM', 'HIGH']).describe('Level risiko'),
  recommendation: z.enum(['APPROVE', 'REJECT', 'REVIEW']).describe('Rekomendasi AI'),
  confidenceScore: z.number().min(0).max(100).describe('Skor kepercayaan AI'),
  factors: z.array(z.string()).describe('Faktor-faktor pertimbangan'),
  warnings: z.array(z.string()).optional().describe('Peringatan khusus')
});

// Document Analysis Validation Schema
export const DocumentAnalysisSchema = z.object({
  documents: z.array(z.object({
    type: z.enum(['KTP', 'KK', 'SLIP_GAJI', 'REKENING', 'SERTIFIKAT', 'PAJAK', 'LAINNYA']),
    status: z.enum(['VALID', 'INVALID', 'PENDING', 'EXPIRED']),
    confidence: z.number().min(0).max(100),
    issues: z.array(z.string()).optional(),
    verificationDate: z.date()
  })),
  overallStatus: z.enum(['COMPLETE', 'INCOMPLETE', 'REJECTED']),
  missingDocuments: z.array(z.string()).optional()
});

// Collateral Analysis Validation Schema
export const CollateralAnalysisSchema = z.object({
  collateralType: z.enum(['PROPERTY', 'VEHICLE', 'DEPOSIT', 'GUARANTEE', 'OTHER']),
  estimatedValue: z.number().positive().describe('Nilai estimasi collateral'),
  marketValue: z.number().positive().describe('Nilai pasar collateral'),
  loanToValueRatio: z.number().min(0).max(100).describe('LTV Ratio (%)'),
  verificationStatus: z.enum(['VERIFIED', 'UNVERIFIED', 'DISPUTED']),
  legalStatus: z.enum(['CLEAR', 'ENCUMBERED', 'DISPUTED']),
  documents: z.array(z.object({
    type: z.string(),
    verified: z.boolean(),
    verificationDate: z.date()
  }))
});

// Financial Capacity Validation Schema
export const FinancialCapacitySchema = z.object({
  monthlyIncome: z.number().positive().describe('Penghasilan bulanan'),
  monthlyExpenses: z.number().positive().describe('Pengeluaran bulanan'),
  disposableIncome: z.number().positive().describe('Penghasilan bersih'),
  debtServiceRatio: z.number().min(0).max(100).describe('Debt Service Ratio (%)'),
  existingDebts: z.array(z.object({
    type: z.string(),
    amount: z.number().positive(),
    monthlyPayment: z.number().positive()
  })),
  creditScore: z.number().min(300).max(850).optional()
});

// Final Decision Validation Schema
export const FinalDecisionSchema = z.object({
  decision: z.enum(['APPROVED', 'REJECTED', 'PENDING', 'CONDITIONAL']),
  approvedAmount: z.number().positive().optional(),
  approvedTerm: z.number().positive().min(1).max(60).optional(),
  interestRate: z.number().min(0).max(100).optional(),
  conditions: z.array(z.string()).optional(),
  rejectionReasons: z.array(z.string()).optional(),
  decisionDate: z.date(),
  decisionMaker: z.string().min(2).max(100),
  notes: z.string().max(1000).optional()
});

// Complete Enhanced Analysis Schema
export const EnhancedAnalysisSchema = z.object({
  applicationId: z.string().uuid(),
  applicantId: z.string().uuid(),
  characterAssessment: CharacterAssessmentSchema,
  aiConclusion: AIConclusionSchema,
  documentAnalysis: DocumentAnalysisSchema,
  collateralAnalysis: CollateralAnalysisSchema,
  financialCapacity: FinancialCapacitySchema,
  finalDecision: FinalDecisionSchema,
  createdAt: z.date(),
  updatedAt: z.date(),
  status: z.enum(['DRAFT', 'SUBMITTED', 'APPROVED', 'REJECTED'])
});

// Type exports
export type CharacterAssessment = z.infer<typeof CharacterAssessmentSchema>;
export type AIConclusion = z.infer<typeof AIConclusionSchema>;
export type DocumentAnalysis = z.infer<typeof DocumentAnalysisSchema>;
export type CollateralAnalysis = z.infer<typeof CollateralAnalysisSchema>;
export type FinancialCapacity = z.infer<typeof FinancialCapacitySchema>;
export type FinalDecision = z.infer<typeof FinalDecisionSchema>;
export type EnhancedAnalysis = z.infer<typeof EnhancedAnalysisSchema>;
