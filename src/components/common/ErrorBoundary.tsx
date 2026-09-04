import React, { Component, ErrorInfo, ReactNode } from 'react';
import { ErrorPage } from '../../pages/common/ErrorPage';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: string | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('SecureVote Uncaught Exception:', error, errorInfo);
    this.setState({
      error,
      errorInfo: errorInfo.componentStack || null,
    });
  }

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }
      return (
        <ErrorPage
          error={this.state.error}
          errorInfo={this.state.errorInfo}
          onResetError={() => this.setState({ hasError: false, error: null, errorInfo: null })}
          onBackToHome={() => {
            this.setState({ hasError: false, error: null, errorInfo: null });
            window.location.href = '/';
          }}
        />
      );
    }

    return this.props.children;
  }
}
