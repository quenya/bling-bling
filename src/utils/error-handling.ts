import { PostgrestError } from '@supabase/supabase-js';

export type ErrorType = 'network' | 'validation' | 'database' | 'ocr' | 'file' | 'unknown';

export interface AppError {
  type: ErrorType;
  message: string;
  originalError?: Error | PostgrestError;
  code?: string;
  details?: Record<string, any>;
}

/**
 * 사용자 친화적인 에러 메시지 생성
 */
export const createUserFriendlyError = (error: unknown, context?: string): AppError => {
  // Supabase 에러 처리
  if (isPostgrestError(error)) {
    return handlePostgrestError(error, context);
  }

  // 네트워크 에러 처리
  if (isNetworkError(error)) {
    return {
      type: 'network',
      message: '인터넷 연결을 확인해주세요.',
      originalError: error as Error,
    };
  }

  // 파일 에러 처리
  if (isFileError(error)) {
    return {
      type: 'file',
      message: '파일 처리 중 오류가 발생했습니다.',
      originalError: error as Error,
    };
  }

  // OCR 에러 처리
  if (isOCRError(error)) {
    return {
      type: 'ocr',
      message: '이미지 인식 중 오류가 발생했습니다. 더 선명한 이미지를 사용해보세요.',
      originalError: error as Error,
    };
  }

  // 일반 Error 객체
  if (error instanceof Error) {
    return {
      type: 'unknown',
      message: error.message || '알 수 없는 오류가 발생했습니다.',
      originalError: error,
    };
  }

  // 문자열 에러
  if (typeof error === 'string') {
    return {
      type: 'unknown',
      message: error,
    };
  }

  // 기타
  return {
    type: 'unknown',
    message: '알 수 없는 오류가 발생했습니다.',
    originalError: error as Error,
  };
};

/**
 * Supabase PostgrestError 처리
 */
const handlePostgrestError = (error: PostgrestError, context?: string): AppError => {
  const baseMessage = context ? `${context} 중 오류가 발생했습니다` : '데이터베이스 오류가 발생했습니다';

  // 일반적인 Postgres 에러 코드 처리
  switch (error.code) {
    case '23505': // unique_violation
      return {
        type: 'database',
        message: '이미 존재하는 데이터입니다.',
        originalError: error,
        code: error.code,
      };
    
    case '23503': // foreign_key_violation
      return {
        type: 'database',
        message: '참조된 데이터가 존재하지 않습니다.',
        originalError: error,
        code: error.code,
      };
    
    case '23514': // check_violation
      return {
        type: 'validation',
        message: '입력값이 허용된 범위를 벗어났습니다.',
        originalError: error,
        code: error.code,
      };
    
    case '42501': // insufficient_privilege
      return {
        type: 'database',
        message: '해당 작업을 수행할 권한이 없습니다.',
        originalError: error,
        code: error.code,
      };
    
    default:
      return {
        type: 'database',
        message: error.message || baseMessage,
        originalError: error,
        code: error.code,
      };
  }
};

/**
 * 에러 타입 체크 함수들
 */
const isPostgrestError = (error: unknown): error is PostgrestError => {
  return typeof error === 'object' && error !== null && 'code' in error && 'message' in error;
};

const isNetworkError = (error: unknown): boolean => {
  if (!(error instanceof Error)) return false;
  
  return (
    error.name === 'NetworkError' ||
    error.message.includes('network') ||
    error.message.includes('fetch') ||
    error.message.includes('connection')
  );
};

const isFileError = (error: unknown): boolean => {
  if (!(error instanceof Error)) return false;
  
  return (
    error.name === 'FileError' ||
    error.message.includes('file') ||
    error.message.includes('upload')
  );
};

const isOCRError = (error: unknown): boolean => {
  if (!(error instanceof Error)) return false;
  
  return (
    error.message.includes('OCR') ||
    error.message.includes('tesseract') ||
    error.message.includes('recognition')
  );
};

/**
 * 에러 로깅 유틸리티
 */
export const logError = (error: AppError, additionalContext?: Record<string, any>): void => {
  const logData = {
    type: error.type,
    message: error.message,
    code: error.code,
    timestamp: new Date().toISOString(),
    userAgent: navigator.userAgent,
    url: window.location.href,
    ...additionalContext,
  };

  // 개발 환경에서는 콘솔에 출력
  if (import.meta.env.DEV) {
    console.error('Application Error:', logData);
    if (error.originalError) {
      console.error('Original Error:', error.originalError);
    }
  }

  // 프로덕션 환경에서는 에러 모니터링 서비스로 전송
  // 예: Sentry, LogRocket 등
  if (import.meta.env.PROD) {
    // 여기에 외부 에러 모니터링 서비스 연동 코드 추가
    // Sentry.captureException(error.originalError || new Error(error.message), {
    //   extra: logData,
    //   tags: { errorType: error.type }
    // });
  }
};

/**
 * React Query 에러 처리를 위한 헬퍼
 */
export const handleQueryError = (error: unknown, context?: string): AppError => {
  const appError = createUserFriendlyError(error, context);
  logError(appError, { context: 'React Query' });
  return appError;
};

/**
 * 에러 복구 전략
 */
export interface ErrorRecoveryOptions {
  retry?: () => void;
  fallback?: () => void;
  redirect?: string;
}

export const getErrorRecoveryStrategy = (error: AppError): ErrorRecoveryOptions => {
  switch (error.type) {
    case 'network':
      return {
        retry: () => window.location.reload(),
      };
    
    case 'database':
      if (error.code === '42501') {
        return {
          redirect: '/login',
        };
      }
      return {
        retry: () => window.location.reload(),
      };
    
    case 'ocr':
      return {
        fallback: () => {
          // OCR 실패 시 수동 입력 모드로 전환
        },
      };
    
    case 'file':
      return {
        fallback: () => {
          // 파일 업로드 실패 시 다른 방법 제안
        },
      };
    
    default:
      return {};
  }
};

/**
 * 에러 메시지의 심각도 레벨 결정
 */
export type ErrorSeverity = 'info' | 'warning' | 'error' | 'critical';

export const getErrorSeverity = (error: AppError): ErrorSeverity => {
  switch (error.type) {
    case 'validation':
      return 'warning';
    
    case 'network':
    case 'database':
      return 'error';
    
    case 'unknown':
      return 'critical';
    
    default:
      return 'error';
  }
};

/**
 * 사용자에게 표시할 에러 메시지 포맷팅
 */
export const formatErrorForUser = (error: AppError): {
  title: string;
  message: string;
  severity: ErrorSeverity;
  recovery?: ErrorRecoveryOptions;
} => {
  const severity = getErrorSeverity(error);
  const recovery = getErrorRecoveryStrategy(error);

  const titles: Record<ErrorType, string> = {
    network: '연결 오류',
    validation: '입력 오류',
    database: '데이터 오류',
    ocr: '이미지 인식 오류',
    file: '파일 오류',
    unknown: '시스템 오류',
  };

  return {
    title: titles[error.type],
    message: error.message,
    severity,
    recovery,
  };
};