import { z } from 'zod';

export const financingAnalysisSchema = z.object({
  // Data Client (Auto-populated)
  clientData: z.object({
    name: z.string(),
    address: z.string(),
    businessType: z.string(),
    financingAmount: z.number(),
    term: z.number(),
  }),
  
  // Penilaian (1-5) dengan nama penilai
  assessments: z.object({
    businessProspects: z.object({
      score: z.number().min(1).max(5),
      assessedBy: z.string().min(1, "Nama penilai wajib diisi"),
    }),
    repaymentCapacity: z.object({
      score: z.number().min(1).max(5),
      assessedBy: z.string().min(1, "Nama penilai wajib diisi"),
    }),
    collateralValue: z.object({
      score: z.number().min(1).max(5),
      assessedBy: z.string().min(1, "Nama penilai wajib diisi"),
    }),
    completeness: z.object({
      score: z.number().min(1).max(5),
      assessedBy: z.string().min(1, "Nama penilai wajib diisi"),
    }),
  }),
  
  // Checklist data client
  clientDataChecklist: z.object({
    nameVerified: z.boolean(),
    addressVerified: z.boolean(),
    businessTypeVerified: z.boolean(),
    financingAmountVerified: z.boolean(),
    termVerified: z.boolean(),
  }),
  
  // Informasi tambahan
  additionalInfo: z.object({
    houseStatus: z.enum(['sendiri', 'sewa']),
    vehicles: z.array(z.object({
      type: z.enum(['motor', 'mobil']),
      count: z.number().min(0),
    })),
  }),
  
  // BI Checking
  biChecking: z.object({
    pdfUploaded: z.boolean(),
    analysisResult: z.string().optional(),
    isEligible: z.boolean().optional(),
  }),
  
  // Document checklist (auto-populated)
  documentChecklist: z.object({
    fcKtpPemohon: z.boolean(),
    fcKk: z.boolean(),
    fcKtpSuamiIstriAhliWaris: z.boolean(),
    fcSlipGaji: z.boolean(),
    fcAgunan: z.boolean(),
  }),
  
  // Kesimpulan karakter (AI generated)
  characterConclusion: z.object({
    summary: z.string(),
    recommendation: z.enum(['layak', 'tidak_layak', 'pertimbangan']),
    averageScore: z.number(),
  }),
  characterSurvey: z.object({
    religion: z.string(),
    experience: z.string(),
    communityRelations: z.string(),
    loanCharacter: z.string(),
    surveyNotes: z.string(),
    input1: z.string(),
    input2: z.string(),
    input3: z.string(),
    input4: z.string(),
    input5: z.string(),
  }),
});

export type FinancingAnalysisData = z.infer<typeof financingAnalysisSchema>;
