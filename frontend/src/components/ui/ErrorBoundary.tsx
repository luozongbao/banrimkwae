import React, { Component, type ErrorInfo } from 'react';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { Button } from './Button';
import { Card } from './Card';

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error?: Error; retry?: () => void }>;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error Boundary caught an error:', error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        const FallbackComponent = this.props.fallback;
        return <FallbackComponent error={this.state.error} retry={this.handleRetry} />;
      }

      return (
        <Card className="p-8 text-center">
          <ExclamationTriangleIcon className="w-12 h-12 text-red-500 mx-auto mb-4" />
          
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Something went wrong
          </h3>
          
          <p className="text-gray-600 mb-6">
            {this.state.error?.message || 'An unexpected error occurred. Please try again.'}
          </p>
          
          <Button
            onClick={this.handleRetry}
            variant="outline"
          >
            Try Again
          </Button>
        </Card>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
