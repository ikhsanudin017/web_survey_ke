'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ProgressIndicator, ProgressStep } from '@/components/ProgressIndicator';
import { EnhancedForm, FormFieldConfig } from '@/components/EnhancedForm';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { useToast } from '@/hooks/use-toast';
import { z } from 'zod';
import { 
  EnhancedAnalysisData, 
  AnalysisStep, 
  CharacterAssessment, 
  DocumentAnalysis, 
  CollateralAnalysis, 
  FinancialAnalysis,
  AIAnalysisResult 
} from '@/types/enhanced-analysis';
import {
  Step1CharacterSchema,
  Step2DocumentSchema,
  Step3CollateralSchema,
  Step4FinancialSchema,
  Step5DecisionSchema
} from '@/lib/validations/unified-enhanced-analysis';

export default function EnhancedAnalysisPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState<AnalysisStep>(1);
  const [isLoading, setIsLoading] = useState(false);
  const [applicationId, setApplicationId] = useState<string>('');
  
  const [analysisData, setAnalysisData] = useState<EnhancedAnalysisData>({
    characterAssessment: {} as CharacterAssessment,
    documentAnalysis: {} as DocumentAnalysis,
    collateralAnalysis: {} as CollateralAnalysis,
    financialAnalysis: {} as FinancialAnalysis,
    aiAnalysis: {} as Record<AnalysisStep, AIAnalysisResult>
  });

  useEffect(() => {
    // Get application ID from URL or localStorage
    const urlParams = new URLSearchParams(window.location.search);
    const appId = urlParams.get('applicationId') || localStorage.getItem('currentApplicationId');
    
    if (appId) {
      setApplicationId(appId);
      loadExistingAnalysis(appId);
    } else {
      toast({
        title: "Error",
        description: "No application ID provided",
        variant: "destructive"
      });
      router.push('/applications');
    }
  }, [router, toast]);

  const loadExistingAnalysis = async (appId: string) => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/enhanced-analysis?applicationId=${appId}`);
      
      if (response.ok) {
        const data = await response.json();
        if (data.analysis) {
          setAnalysisData(prev => ({
            ...prev,
            ...data.analysis
          }));
        }
      }
    } catch (error) {
      console.error('Error loading analysis:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStepComplete = async (stepData: any) => {
    try {
      setIsLoading(true);
      
      // Update local state
      setAnalysisData(prev => ({
        ...prev,
        [getStepKey(currentStep)]: stepData
      }));

      // Save to database
      const response = await fetch('/api/enhanced-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          applicationId,
          step: currentStep,
          data: stepData
        })
      });

      if (!response.ok) {
        throw new Error('Failed to save analysis');
      }

      // Generate AI analysis
      const aiResponse = await fetch('/api/enhanced-analysis/ai-analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          applicationId,
          step: currentStep
        })
      });

      if (aiResponse.ok) {
        const aiResult = await aiResponse.json();
        setAnalysisData(prev => ({
          ...prev,
          aiAnalysis: {
            ...prev.aiAnalysis,
            [currentStep]: aiResult.aiAnalysis
          }
        }));
      }

      toast({
        title: "Success",
        description: `Step ${currentStep} completed successfully`,
      });

      // Move to next step or complete
      if (currentStep < 5) {
        setCurrentStep(prev => prev + 1 as AnalysisStep);
      } else {
        toast({
          title: "Analysis Complete",
          description: "All analysis steps completed successfully",
        });
        router.push(`/applications/${applicationId}`);
      }

    } catch (error) {
      console.error('Error completing step:', error);
      toast({
        title: "Error",
        description: "Failed to complete step",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getSteps = (): ProgressStep[] => {
    const steps: ProgressStep[] = [];
    for (let i = 1; i <= 5; i++) {
      let status: 'completed' | 'current' | 'pending' | 'error' = 'pending';
      if (i < currentStep) {
        status = 'completed';
      } else if (i === currentStep) {
        status = 'current';
      }
      steps.push({
        id: `step-${i}`,
        title: getStepTitle(i as AnalysisStep),
        description: getStepDescription(i as AnalysisStep),
        status: status,
      });
    }
    return steps;
  };

  const getStepKey = (step: AnalysisStep): keyof EnhancedAnalysisData => {
    const keys = {
      1: 'characterAssessment',
      2: 'documentAnalysis',
      3: 'collateralAnalysis',
      4: 'financialAnalysis',
      5: 'aiAnalysis'
    };
    return keys[step] as keyof EnhancedAnalysisData;
  };

  const getStepTitle = (step: AnalysisStep): string => {
    const titles = {
      1: 'Analisis Karakter',
      2: 'Analisis Dokumen',
      3: 'Analisis Jaminan',
      4: 'Analisis Kapasitas Keuangan',
      5: 'Keputusan Akhir'
    };
    return titles[step];
  };

  const getStepDescription = (step: AnalysisStep): string => {
    const descriptions = {
      1: 'Evaluasi karakter dan reputasi pemohon',
      2: 'Verifikasi kelengkapan dan keabsahan dokumen',
      3: 'Penilaian jaminan yang diajukan',
      4: 'Analisis kemampuan keuangan dan pembayaran',
      5: 'Keputusan akhir berdasarkan analisis menyeluruh'
    };
    return descriptions[step];
  };

  const getStepConfig = (step: AnalysisStep) => {
    switch (step) {
      case 1:
        return {
          schema: Step1CharacterSchema,
          fields: [
            { name: 'honestyRating', label: 'Kejujuran (1-5)', type: 'number', required: true },
            { name: 'responsibilityRating', label: 'Tanggung jawab (1-5)', type: 'number', required: true },
            { name: 'financialDisciplineRating', label: 'Disiplin keuangan (1-5)', type: 'number', required: true },
            { name: 'workCommitmentRating', label: 'Komitmen kerja (1-5)', type: 'number', required: true },
            { name: 'communicationRating', label: 'Komunikasi (1-5)', type: 'number', required: true },
            { name: 'evaluatorName', label: 'Nama Evaluator', type: 'text', required: true },
            { name: 'evaluationDate', label: 'Tanggal Evaluasi', type: 'date', required: true },
            { name: 'characterNotes', label: 'Catatan Karakter', type: 'textarea' },
          ] as FormFieldConfig<typeof Step1CharacterSchema>[],
        };
      case 2:
        return {
          schema: Step2DocumentSchema,
          fields: [
            { name: 'documentTypes', label: 'Jenis Dokumen', type: 'text', required: true }, // This should be a multi-select or checkbox group
            { name: 'documentStatus', label: 'Status Dokumen', type: 'text', required: true }, // This should be a select
            { name: 'documentConfidence', label: 'Keyakinan Dokumen', type: 'number', required: true },
            { name: 'missingDocuments', label: 'Dokumen Hilang', type: 'textarea' },
          ] as FormFieldConfig<typeof Step2DocumentSchema>[],
        };
      case 3:
        return {
          schema: Step3CollateralSchema,
          fields: [
            { name: 'collateralType', label: 'Jenis Jaminan', type: 'select', required: true, options: [{ value: 'PROPERTY', label: 'Properti' }, { value: 'VEHICLE', label: 'Kendaraan' }, { value: 'DEPOSIT', label: 'Deposit' }, { value: 'GUARANTEE', label: 'Jaminan' }, { value: 'OTHER', label: 'Lainnya' }] },
            { name: 'estimatedValue', label: 'Nilai Estimasi', type: 'number', required: true },
            { name: 'marketValue', label: 'Nilai Pasar', type: 'number', required: true },
            { name: 'loanToValueRatio', label: 'Rasio LTV', type: 'number', required: true },
            { name: 'collateralVerificationStatus', label: 'Status Verifikasi Jaminan', type: 'select', required: true, options: [{ value: 'VERIFIED', label: 'Terverifikasi' }, { value: 'UNVERIFIED', label: 'Belum Terverifikasi' }, { value: 'DISPUTED', label: 'Sengketa' }] },
            { name: 'legalStatus', label: 'Status Hukum', type: 'select', required: true, options: [{ value: 'CLEAR', label: 'Jelas' }, { value: 'ENCUMBERED', label: 'Dibebani' }, { value: 'DISPUTED', label: 'Sengketa' }] },
            { name: 'collateralDocuments', label: 'Dokumen Jaminan', type: 'text' }, // This should be a complex field
          ] as FormFieldConfig<typeof Step3CollateralSchema>[],
        };
      case 4:
        return {
          schema: Step4FinancialSchema,
          fields: [
            { name: 'monthlyIncome', label: 'Penghasilan Bulanan', type: 'number', required: true },
            { name: 'monthlyExpenses', label: 'Pengeluaran Bulanan', type: 'number', required: true },
            { name: 'disposableIncome', label: 'Pendapatan Bersih', type: 'number', required: true },
            { name: 'debtServiceRatio', label: 'Rasio Pelayanan Utang', type: 'number', required: true },
            { name: 'existingDebts', label: 'Utang yang Ada', type: 'textarea' }, // This should be a complex field
            { name: 'creditScore', label: 'Skor Kredit', type: 'number' },
          ] as FormFieldConfig<typeof Step4FinancialSchema>[],
        };
      case 5:
        return {
          schema: Step5DecisionSchema,
          fields: [
            { name: 'finalDecision', label: 'Keputusan Akhir', type: 'select', required: true, options: [{ value: 'APPROVED', label: 'Disetujui' }, { value: 'REJECTED', label: 'Ditolak' }, { value: 'PENDING', label: 'Menunggu' }, { value: 'CONDITIONAL', label: 'Bersyarat' }] },
            { name: 'approvedAmount', label: 'Jumlah Disetujui', type: 'number' },
            { name: 'approvedTerm', label: 'Jangka Waktu Disetujui (bulan)', type: 'number' },
            { name: 'interestRate', label: 'Suku Bunga (%)', type: 'number' },
            { name: 'conditions', label: 'Kondisi', type: 'textarea' },
            { name: 'rejectionReasons', label: 'Alasan Penolakan', type: 'textarea' },
            { name: 'decisionMaker', label: 'Pembuat Keputusan', type: 'text', required: true },
            { name: 'decisionNotes', label: 'Catatan Keputusan', type: 'textarea' },
          ] as FormFieldConfig<typeof Step5DecisionSchema>[],
        };
      default:
        return { schema: z.object({}), fields: [] };
    }
  };

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">
              Enhanced Credit Analysis
            </h1>
            <p className="mt-2 text-gray-600">
              Analisis kredit komprehensif dengan pendekatan 5C
            </p>
          </div>

          <div className="mb-8">
            <ProgressIndicator 
              steps={getSteps()}
            />
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <EnhancedForm
              schema={getStepConfig(currentStep).schema}
              fields={getStepConfig(currentStep).fields}
              defaultValues={analysisData[getStepKey(currentStep)] || {}}
              onSubmit={handleStepComplete}
            />
          </div>

          {/* AI Analysis Display */}
          {analysisData.aiAnalysis[currentStep] && (
            <div className="mt-6 bg-blue-50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-blue-900 mb-2">
                AI Analysis - Step {currentStep}
              </h3>
              <div className="text-sm text-blue-800">
                <p className="mb-2">{analysisData.aiAnalysis[currentStep].summary}</p>
                <div className="flex items-center gap-4">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    analysisData.aiAnalysis[currentStep].riskLevel === 'LOW' ? 'bg-green-100 text-green-800' :
                    analysisData.aiAnalysis[currentStep].riskLevel === 'MEDIUM' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    Risk: {analysisData.aiAnalysis[currentStep].riskLevel}
                  </span>
                  <span className="text-xs">
                    Confidence: {analysisData.aiAnalysis[currentStep].confidenceScore}%
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </ErrorBoundary>
  );
}
