'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertCircle, RefreshCw, Home } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  canRetry: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      canRetry: true,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null,
      canRetry: true,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
    
    // Log to external service
    this.logErrorToService(error, errorInfo);
    
    this.setState({
      error,
      errorInfo,
      canRetry: this.isRecoverableError(error),
    });

    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  private logErrorToService(error: Error, errorInfo: ErrorInfo) {
    // In production, send to error tracking service
    if (process.env.NODE_ENV === 'production') {
      fetch('/api/errors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          error: error.message,
          stack: error.stack,
          componentStack: errorInfo.componentStack,
          timestamp: new Date().toISOString(),
          userAgent: navigator.userAgent,
          url: window.location.href,
        }),
      }).catch(console.error);
    }
  }

  private isRecoverableError(error: Error): boolean {
    // Determine if error is recoverable
    const recoverableErrors = [
      'NetworkError',
      'TypeError: Failed to fetch',
      'TimeoutError',
    ];
    
    return recoverableErrors.some(recoverable => 
      error.message.includes(recoverable)
    );
  }

  private handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      canRetry: true,
    });
  };

  private handleGoHome = () => {
    if (typeof window !== 'undefined') {
      window.location.href = '/';
    }
  };

  private handleRefresh = () => {
    if (typeof window !== 'undefined') {
      window.location.reload();
    }
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <Card className="max-w-lg w-full">
            <CardHeader>
              <div className="flex items-center space-x-2">
                <AlertCircle className="h-6 w-6 text-red-500" />
                <CardTitle>Terjadi Kesalahan</CardTitle>
              </div>
              <CardDescription>
                Maaf, terjadi kesalahan yang tidak terduga. Tim kami telah diberitahu.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {process.env.NODE_ENV === 'development' && (
                  <details className="bg-gray-100 p-4 rounded-lg">
                    <summary className="cursor-pointer font-medium text-sm">
                      Detail Error (Development Only)
                    </summary>
                    <div className="mt-2 text-xs font-mono text-gray-600">
                      <p className="font-bold">{this.state.error?.message}</p>
                      <pre className="mt-2 whitespace-pre-wrap">
                        {this.state.error?.stack}
                      </pre>
                      {this.state.errorInfo && (
                        <div className="mt-4">
                          <p className="font-bold">Component Stack:</p>
                          <pre className="whitespace-pre-wrap">
                            {this.state.errorInfo.componentStack}
                          </pre>
                        </div>
                      )}
                    </div>
                  </details>
                )}

                <div className="flex flex-col sm:flex-row gap-3">
                  {this.state.canRetry && (
                    <Button
                      onClick={this.handleRetry}
                      className="flex-1"
                      variant="default"
                    >
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Coba Lagi
                    </Button>
                  )}
                  <Button
                    onClick={this.handleRefresh}
                    className="flex-1"
                    variant="outline"
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Refresh Halaman
                  </Button>
                  <Button
                    onClick={this.handleGoHome}
                    className="flex-1"
                    variant="ghost"
                  >
                    <Home className="h-4 w-4 mr-2" />
                    Kembali ke Beranda
                  </Button>
                </div>

                <div className="text-xs text-gray-500 text-center">
                  <p>
                    Error ID: {Math.random().toString(36).substring(2, 15)}
                  </p>
                  <p>
                    Jika masalah berlanjut, hubungi support dengan ID error ini.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

// Hook for error handling in components
export const useErrorHandler = () => {
  const handleError = React.useCallback((error: Error, errorInfo?: ErrorInfo) => {
    console.error('Component error:', error, errorInfo);
    
    // Send to error boundary
    if (errorInfo) {
      throw error;
    }
  }, []);

  return { handleError };
};

// Error recovery component
export const ErrorRecovery: React.FC<{
  error: Error;
  onRetry: () => void;
  onCancel?: () => void;
}> = ({ error, onRetry, onCancel }) => {
  const [isRetrying, setIsRetrying] = React.useState(false);

  const handleRetry = async () => {
    setIsRetrying(true);
    try {
      await onRetry();
    } finally {
      setIsRetrying(false);
    }
  };

  return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
      <div className="flex items-start space-x-3">
        <AlertCircle className="h-5 w-5 text-red-500 mt-0.5" />
        <div className="flex-1">
          <h4 className="text-sm font-medium text-red-800">Gagal memproses</h4>
          <p className="text-sm text-red-600 mt-1">{error.message}</p>
          
          <div className="mt-3 flex space-x-2">
            <Button
              size="sm"
              onClick={handleRetry}
              disabled={isRetrying}
              className="bg-red-600 hover:bg-red-700"
            >
              {isRetrying ? 'Mencoba...' : 'Coba Lagi'}
            </Button>
            {onCancel && (
              <Button
                size="sm"
                variant="outline"
                onClick={onCancel}
              >
                Batal
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Form field error component
export const FieldError: React.FC<{
  error?: string;
  helpText?: string;
}> = ({ error, helpText }) => {
  if (!error && !helpText) return null;

  return (
    <div className="mt-1">
      {error && (
        <p className="text-sm text-red-600 flex items-center">
          <AlertCircle className="h-3 w-3 mr-1" />
          {error}
        </p>
      )}
      {helpText && !error && (
        <p className="text-sm text-gray-500">{helpText}</p>
      )}
    </div>
  );
};
