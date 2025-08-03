import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  color?: 'blue' | 'green' | 'red' | 'gray' | 'white';
  className?: string;
  text?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  color = 'blue',
  className = '',
  text,
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
  };

  const colorClasses = {
    blue: 'text-blue-600',
    green: 'text-green-600',
    red: 'text-red-600',
    gray: 'text-gray-600',
    white: 'text-white',
  };

  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <div className="relative">
        <div className={`
          ${sizeClasses[size]} 
          ${colorClasses[color]}
          animate-spin
        `}>
          <svg
            className="w-full h-full"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        </div>
      </div>
      {text && (
        <p className={`mt-2 text-sm ${colorClasses[color]} font-medium`}>
          {text}
        </p>
      )}
    </div>
  );
};

/**
 * 전체 페이지 로딩 스피너
 */
export const FullPageSpinner: React.FC<{ text?: string }> = ({
  text = '로딩 중...'
}) => {
  return (
    <div className="fixed inset-0 bg-white bg-opacity-90 flex items-center justify-center z-50">
      <LoadingSpinner size="xl" text={text} />
    </div>
  );
};

/**
 * 인라인 로딩 스피너 (텍스트와 함께)
 */
export const InlineSpinner: React.FC<{ text?: string }> = ({
  text = '로딩 중...'
}) => {
  return (
    <div className="flex items-center space-x-2">
      <LoadingSpinner size="sm" />
      <span className="text-sm text-gray-600">{text}</span>
    </div>
  );
};

/**
 * 카드 내용 로딩 스피너
 */
export const CardSpinner: React.FC<{ text?: string; height?: string }> = ({
  text = '데이터를 불러오는 중...',
  height = 'h-40'
}) => {
  return (
    <div className={`${height} flex items-center justify-center bg-gray-50 rounded-lg`}>
      <LoadingSpinner size="lg" text={text} color="gray" />
    </div>
  );
};

/**
 * 버튼 내 로딩 스피너
 */
export const ButtonSpinner: React.FC = () => {
  return (
    <LoadingSpinner size="sm" color="white" className="mr-2" />
  );
};