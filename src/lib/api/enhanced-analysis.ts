import axios from 'axios';
import type {
  EnhancedAnalysisRequest,
  EnhancedAnalysisResponse,
  RealTimeAnalysisUpdate,
  BatchAnalysisRequest,
  BatchAnalysisResponse,
  AnalysisConfig,
  AnalysisWebhookPayload
} from '../../types/enhanced-analysis';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

class EnhancedAnalysisService {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;

  // Single analysis
  async startAnalysis(request: EnhancedAnalysisRequest): Promise<EnhancedAnalysisResponse> {
    try {
      const response = await axios.post<EnhancedAnalysisResponse>(
        `${API_BASE_URL}/analysis/enhanced`,
        request
      );
      return response.data;
    } catch (error) {
      throw new Error(`Failed to start analysis: ${error}`);
    }
  }

  async getAnalysis(analysisId: string): Promise<EnhancedAnalysisResponse> {
    try {
      const response = await axios.get<EnhancedAnalysisResponse>(
        `${API_BASE_URL}/analysis/enhanced/${analysisId}`
      );
      return response.data;
    } catch (error) {
      throw new Error(`Failed to get analysis: ${error}`);
    }
  }

  async cancelAnalysis(analysisId: string): Promise<void> {
    try {
      await axios.delete(`${API_BASE_URL}/analysis/enhanced/${analysisId}`);
    } catch (error) {
      throw new Error(`Failed to cancel analysis: ${error}`);
    }
  }

  // Batch analysis
  async startBatchAnalysis(request: BatchAnalysisRequest): Promise<BatchAnalysisResponse> {
    try {
      const response = await axios.post<BatchAnalysisResponse>(
        `${API_BASE_URL}/analysis/batch`,
        request
      );
      return response.data;
    } catch (error) {
      throw new Error(`Failed to start batch analysis: ${error}`);
    }
  }

  async getBatchAnalysis(batchId: string): Promise<BatchAnalysisResponse> {
    try {
      const response = await axios.get<BatchAnalysisResponse>(
        `${API_BASE_URL}/analysis/batch/${batchId}`
      );
      return response.data;
    } catch (error) {
      throw new Error(`Failed to get batch analysis: ${error}`);
    }
  }

  // Configuration
  async getAnalysisConfig(): Promise<AnalysisConfig> {
    try {
      const response = await axios.get<AnalysisConfig>(
        `${API_BASE_URL}/analysis/config`
      );
      return response.data;
    } catch (error) {
      throw new Error(`Failed to get analysis config: ${error}`);
    }
  }

  async updateAnalysisConfig(config: Partial<AnalysisConfig>): Promise<AnalysisConfig> {
    try {
      const response = await axios.put<AnalysisConfig>(
        `${API_BASE_URL}/analysis/config`,
        config
      );
      return response.data;
    } catch (error) {
      throw new Error(`Failed to update analysis config: ${error}`);
    }
  }

  // Real-time updates
  connectWebSocket(analysisId: string, onUpdate: (update: RealTimeAnalysisUpdate) => void): void {
    const wsUrl = `${API_BASE_URL.replace('http', 'ws')}/analysis/realtime/${analysisId}`;
    
    this.ws = new WebSocket(wsUrl);

    this.ws.onopen = () => {
      console.log('WebSocket connected for analysis:', analysisId);
      this.reconnectAttempts = 0;
    };

    this.ws.onmessage = (event) => {
      try {
        const update: RealTimeAnalysisUpdate = JSON.parse(event.data);
        onUpdate(update);
      } catch (error) {
        console.error('Failed to parse WebSocket message:', error);
      }
    };

    this.ws.onclose = () => {
      console.log('WebSocket disconnected');
      this.reconnect(onUpdate);
    };

    this.ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };
  }

  private reconnect(onUpdate: (update: RealTimeAnalysisUpdate) => void): void {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`Reconnecting... Attempt ${this.reconnectAttempts}`);
      
      setTimeout(() => {
        if (this.ws) {
          this.connectWebSocket(this.ws.url.split('/').pop()!, onUpdate);
        }
      }, this.reconnectDelay * this.reconnectAttempts);
    }
  }

  disconnectWebSocket(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  // Webhook management
  async registerWebhook(url: string, events: string[]): Promise<void> {
    try {
      await axios.post(`${API_BASE_URL}/webhooks`, {
        url,
        events
      });
    } catch (error) {
      throw new Error(`Failed to register webhook: ${error}`);
    }
  }

  async unregisterWebhook(url: string): Promise<void> {
    try {
      await axios.delete(`${API_BASE_URL}/webhooks`, {
        data: { url }
      });
    } catch (error) {
      throw new Error(`Failed to unregister webhook: ${error}`);
    }
  }

  // Health check
  async healthCheck(): Promise<boolean> {
    try {
      const response = await axios.get(`${API_BASE_URL}/health`);
      return response.status === 200;
    } catch {
      return false;
    }
  }
}

export const enhancedAnalysisService = new EnhancedAnalysisService();
