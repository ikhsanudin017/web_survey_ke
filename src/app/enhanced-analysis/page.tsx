'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ProgressIndicator, ProgressStep } from '@/components/ProgressIndicator';
import { EnhancedForm } from '@/components/EnhancedForm';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { useToast } from '@/hooks/use-toast';
import { 
  EnhancedAnalysisData, 
  AnalysisStep, 
  CharacterAssessment, 
  DocumentAnalysis, 
  CollateralAnalysis, 
  FinancialAnalysis,
  AIAnalysisResult 
} from '@/types/enhanced-analysis';

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
              defaultValues={analysisData[getStepKey(currentStep)] || {}}
              onSubmit={handleStepComplete}
              isLoading={isLoading}
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
