export type AnalysisStep = 1 | 2 | 3 | 4 | 5;

export interface CharacterAssessment {
  professionalStability: number;
  businessExperience: number;
  paymentHistory: number;
  reputationScore: number;
  notes: string;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
}

export interface DocumentAnalysis {
  completeness: number;
  authenticity: number;
  validity: number;
  missingDocuments: string[];
  verifiedDocuments: string[];
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
}

export interface CollateralAnalysis {
  collateralType: string;
  estimatedValue: number;
  marketValue: number;
  liquidity: number;
  legalStatus: string;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
}

export interface FinancialAnalysis {
  monthlyIncome: number;
  businessIncome: number;
  debtToIncomeRatio: number;
  repaymentCapacity: number;
  financialStability: number;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
}

export interface AIAnalysisResult {
  summary: string;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  recommendation: 'APPROVE' | 'REVIEW' | 'REJECT';
  confidenceScore: number;
  factors: string[];
  warnings: string[];
}

export interface EnhancedAnalysisData {
  characterAssessment: CharacterAssessment;
  documentAnalysis: DocumentAnalysis;
  collateralAnalysis: CollateralAnalysis;
  financialAnalysis: FinancialAnalysis;
  aiAnalysis: Record<AnalysisStep, AIAnalysisResult>;
}
