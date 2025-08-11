'use client';

import { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error?: Error;
}

/**
 * Professional Error Boundary for Hydration Issues
 * 
 * This replaces simple console suppression with proper error handling
 * and graceful degradation for hydration mismatches.
 */
export class HydrationErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log the error for debugging (but filter hydration noise)
    if (this.isHydrationError(error)) {
      console.warn('Hydration mismatch detected (likely browser extension):', {
        error: error.message,
        stack: errorInfo.componentStack
      });
    } else {
      console.error('React Error Boundary caught an error:', error, errorInfo);
    }

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  private isHydrationError(error: Error): boolean {
    const hydrationKeywords = [
      'hydration',
      'server rendered HTML',
      'client properties',
      'rtrvr-listeners',
      'Text content did not match'
    ];

    return hydrationKeywords.some(keyword => 
      error.message.toLowerCase().includes(keyword.toLowerCase())
    );
  }

  render() {
    if (this.state.hasError) {
      // Render fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default fallback for hydration errors
      if (this.state.error && this.isHydrationError(this.state.error)) {
        return (
          <div className="p-2 text-sm text-gray-500 bg-yellow-50 border border-yellow-200 rounded">
            ⚠️ Loading... (browser extension compatibility mode)
          </div>
        );
      }

      // Default fallback for other errors
      return (
        <div className="p-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded">
          <h3 className="font-semibold">Something went wrong</h3>
          <p className="mt-1">This component encountered an error and has been temporarily disabled.</p>
          <button 
            className="mt-2 px-3 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700"
            onClick={() => this.setState({ hasError: false })}
          >
            Try Again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * Hook-based error boundary for functional components
 */
export function useErrorBoundary() {
  const throwError = (error: Error) => {
    throw error;
  };

  return { throwError };
}