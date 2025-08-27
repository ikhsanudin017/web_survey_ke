import type { EnhancedAnalysisData } from '../../types/enhanced-analysis';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

// Simple types for the service
interface AnalysisRequest {
  applicationId: string;
  data: EnhancedAnalysisData;
}

interface AnalysisResponse {
  id: string;
  status: 'pending' | 'completed' | 'failed';
  data?: EnhancedAnalysisData;
  error?: string;
}

class EnhancedAnalysisService {
  // Single analysis
  async startAnalysis(request: AnalysisRequest): Promise<AnalysisResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/enhanced-analysis`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request)
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return await response.json();
    } catch (error) {
      throw new Error(`Failed to start analysis: ${error}`);
    }
  }

  async getAnalysis(analysisId: string): Promise<AnalysisResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/enhanced-analysis/${analysisId}`);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return await response.json();
    } catch (error) {
      throw new Error(`Failed to get analysis: ${error}`);
    }
  }

  async saveAnalysis(data: any): Promise<AnalysisResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/enhanced-analysis`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return await response.json();
    } catch (error) {
      throw new Error(`Failed to save analysis: ${error}`);
    }
  }

  // Webhook management
  async registerWebhook(url: string, events: string[]): Promise<void> {
    try {
      const response = await fetch(`${API_BASE_URL}/webhooks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url, events })
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
    } catch (error) {
      throw new Error(`Failed to register webhook: ${error}`);
    }
  }

  async unregisterWebhook(url: string): Promise<void> {
    try {
      const response = await fetch(`${API_BASE_URL}/webhooks`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url })
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
    } catch (error) {
      throw new Error(`Failed to unregister webhook: ${error}`);
    }
  }

  // Health check
  async healthCheck(): Promise<boolean> {
    try {
      const response = await fetch(`${API_BASE_URL}/health`);
      return response.ok;
    } catch {
      return false;
    }
  }
}

export const enhancedAnalysisService = new EnhancedAnalysisService();
