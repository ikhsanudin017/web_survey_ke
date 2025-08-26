export interface AnalysisResult {
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  riskScore: number;
  recommendations: string[];
  keyConcerns: string[];
  approvalLikelihood: number;
  debtToIncomeRatio: number;
  characterScore: number;
}

export class AIAnalysisEngine {
  static analyzeApplication(data: any): AnalysisResult {
    const characterScore = this.calculateCharacterScore(data);
    const debtToIncome = this.calculateDebtToIncome(data);
    const riskFactors = this.identifyRiskFactors(data);
    
    return {
      riskLevel: this.determineRiskLevel(characterScore, debtToIncome, riskFactors),
      riskScore: this.calculateRiskScore(characterScore, debtToIncome, riskFactors),
      recommendations: this.generateRecommendations(characterScore, debtToIncome, riskFactors),
      keyConcerns: this.identifyKeyConcerns(riskFactors),
      approvalLikelihood: this.calculateApprovalLikelihood(characterScore, debtToIncome),
      debtToIncomeRatio: debtToIncome,
      characterScore
    };
  }

  private static calculateCharacterScore(data: any): number {
    const ratings = [
      data.karakter1, data.karakter2, data.karakter3, 
      data.karakter4, data.karakter5
    ].filter(r => r !== null && r !== undefined);
    
    if (ratings.length === 0) return 0;
    
    const average = ratings.reduce((sum: number, r: string) => sum + parseInt(r), 0) / ratings.length;
    const penalty = [
      data.karakter1Jelek, data.karakter2Jelek, data.karakter3Jelek,
      data.karakter4Jelek, data.karakter5Jelek
    ].filter(Boolean).length * 10;
    
    return Math.max(0, average - penalty);
  }

  private static calculateDebtToIncome(data: any): number {
    const monthlyIncome = parseFloat(data.pengajuan) || 0;
    const estimatedPayment = (parseFloat(data.pengajuan) || 0) / (parseInt(data.jangkaWaktu) || 1);
    return monthlyIncome > 0 ? (estimatedPayment / monthlyIncome) * 100 : 0;
  }

  private static identifyRiskFactors(data: any): string[] {
    const risks = [];
    
    if (data.karakter1 < 3) risks.push('Low payment history rating');
    if (data.karakter2 < 3) risks.push('Poor community relations');
    if (data.karakter3 < 3) risks.push('Limited business experience');
    if (data.karakter4 < 3) risks.push('Weak repayment capacity');
    if (data.karakter5 < 3) risks.push('Inadequate collateral');
    
    return risks;
  }

  private static determineRiskLevel(score: number, debtRatio: number, risks: string[]): 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' {
    const riskCount = risks.length;
    if (score < 60 || debtRatio > 50 || riskCount >= 3) return 'CRITICAL';
    if (score < 70 || debtRatio > 40 || riskCount >= 2) return 'HIGH';
    if (score < 80 || debtRatio > 30 || riskCount >= 1) return 'MEDIUM';
    return 'LOW';
  }

  private static generateRecommendations(score: number, debtRatio: number, risks: string[]): string[] {
    const recommendations = [];
    
    if (score < 70) recommendations.push('Improve character assessment factors');
    if (debtRatio > 40) recommendations.push('Reduce loan amount or extend term');
    if (risks.includes('Low payment history')) recommendations.push('Require additional guarantor');
    if (risks.includes('Inadequate collateral')) recommendations.push('Increase collateral value');
    
    return recommendations;
  }

  private static identifyKeyConcerns(riskFactors: string[]): string[] {
    return riskFactors.slice(0, 3);
  }

  private static calculateRiskScore(characterScore: number, debtRatio: number, risks: string[]): number {
    let score = characterScore;
    score -= (debtRatio * 0.5);
    score -= (risks.length * 5);
    return Math.max(0, Math.min(100, score));
  }

  private static calculateApprovalLikelihood(characterScore: number, debtRatio: number): number {
    let likelihood = 0;
    
    if (characterScore >= 80 && debtRatio <= 30) likelihood = 95;
    else if (characterScore >= 70 && debtRatio <= 40) likelihood = 80;
    else if (characterScore >= 60 && debtRatio <= 50) likelihood = 60;
    else if (characterScore >= 50 && debtRatio <= 60) likelihood = 40;
    else likelihood = 20;
    
    return Math.max(0, Math.min(100, likelihood));
  }
}
