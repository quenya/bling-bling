import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Card, CardHeader, CardBody } from './Card';
import { Button } from './Button';
import { createUserFriendlyError, formatErrorForUser, logError } from '@/utils/error-handling';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorMessage: string | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorMessage: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    const appError = createUserFriendlyError(error, '애플리케이션 오류');
    const formatted = formatErrorForUser(appError);
    
    return {
      hasError: true,
      error,
      errorMessage: formatted.message,
    };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    // 에러 로깅
    const appError = createUserFriendlyError(error, '컴포넌트 에러');
    logError(appError, {
      componentStack: errorInfo.componentStack,
      errorBoundary: true,
    });

    // 부모 컴포넌트에 에러 알림
    this.props.onError?.(error, errorInfo);
  }

  private handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorMessage: null,
    });
  };

  private handleReload = () => {
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      // 커스텀 fallback이 제공된 경우
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // 기본 에러 UI
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
          <Card className="max-w-md w-full">
            <CardHeader>
              <div className="text-center">
                <div className="text-6xl mb-4">🎳</div>
                <h1 className="text-xl font-semibold text-gray-900">
                  앗! 문제가 발생했습니다
                </h1>
              </div>
            </CardHeader>
            <CardBody>
              <div className="text-center space-y-4">
                <p className="text-gray-600">
                  {this.state.errorMessage || '예상치 못한 오류가 발생했습니다.'}
                </p>
                
                {import.meta.env.DEV && this.state.error && (
                  <details className="text-left bg-gray-100 p-3 rounded text-sm">
                    <summary className="cursor-pointer text-gray-700 font-medium">
                      개발자 정보
                    </summary>
                    <pre className="mt-2 whitespace-pre-wrap text-xs text-red-600">
                      {this.state.error.message}
                      {'\n\n'}
                      {this.state.error.stack}
                    </pre>
                  </details>
                )}

                <div className="space-y-2">
                  <Button
                    onClick={this.handleRetry}
                    variant="primary"
                    className="w-full"
                  >
                    다시 시도
                  </Button>
                  <Button
                    onClick={this.handleReload}
                    variant="secondary"
                    className="w-full"
                  >
                    페이지 새로고침
                  </Button>
                </div>

                <div className="text-xs text-gray-500 mt-4">
                  <p>문제가 계속 발생하면 관리자에게 문의해주세요.</p>
                  <p className="mt-1">
                    오류 시간: {new Date().toLocaleString('ko-KR')}
                  </p>
                </div>
              </div>
            </CardBody>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * 함수형 컴포넌트용 에러 바운더리 HOC
 */
export const withErrorBoundary = <P extends object>(
  Component: React.ComponentType<P>,
  fallback?: ReactNode,
  onError?: (error: Error, errorInfo: ErrorInfo) => void
) => {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary fallback={fallback} onError={onError}>
      <Component {...props} />
    </ErrorBoundary>
  );

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;
  
  return WrappedComponent;
};

/**
 * 특정 섹션용 작은 에러 바운더리
 */
export const SectionErrorBoundary: React.FC<{
  children: ReactNode;
  title?: string;
  onRetry?: () => void;
}> = ({ children, title = '이 섹션', onRetry }) => {
  return (
    <ErrorBoundary
      fallback={
        <Card className="border-red-200 bg-red-50">
          <CardBody>
            <div className="text-center py-8">
              <div className="text-red-500 text-4xl mb-3">⚠️</div>
              <h3 className="text-lg font-medium text-red-800 mb-2">
                {title} 로드 실패
              </h3>
              <p className="text-red-600 text-sm mb-4">
                데이터를 불러오는 중 문제가 발생했습니다.
              </p>
              {onRetry && (
                <Button
                  onClick={onRetry}
                  variant="secondary"
                  size="sm"
                >
                  다시 시도
                </Button>
              )}
            </div>
          </CardBody>
        </Card>
      }
    >
      {children}
    </ErrorBoundary>
  );
};