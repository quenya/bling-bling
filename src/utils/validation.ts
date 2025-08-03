import type { MemberInsert, GameSessionInsert } from '@/types/database';

export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

export interface ValidationRule<T> {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  pattern?: RegExp;
  custom?: (value: T) => string | null;
}

export interface ValidationSchema<T> {
  [key: string]: ValidationRule<any>;
}

/**
 * 일반적인 유효성 검증 함수
 */
export const validate = <T extends Record<string, any>>(
  data: T,
  schema: ValidationSchema<T>
): ValidationResult => {
  const errors: Record<string, string> = {};

  for (const [field, rule] of Object.entries(schema)) {
    const value = data[field];
    const error = validateField(value, rule, field);
    if (error) {
      errors[field] = error;
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

/**
 * 개별 필드 유효성 검증
 */
const validateField = (value: any, rule: ValidationRule<any>, fieldName: string): string | null => {
  // Required 검증
  if (rule.required && (value === undefined || value === null || value === '')) {
    return `${fieldName}은(는) 필수 입력 항목입니다.`;
  }

  // 값이 없고 required가 아니면 통과
  if (!value && !rule.required) {
    return null;
  }

  // 문자열 길이 검증
  if (typeof value === 'string') {
    if (rule.minLength && value.length < rule.minLength) {
      return `${fieldName}은(는) 최소 ${rule.minLength}자 이상이어야 합니다.`;
    }
    if (rule.maxLength && value.length > rule.maxLength) {
      return `${fieldName}은(는) 최대 ${rule.maxLength}자 이하여야 합니다.`;
    }
  }

  // 숫자 범위 검증
  if (typeof value === 'number') {
    if (rule.min !== undefined && value < rule.min) {
      return `${fieldName}은(는) ${rule.min} 이상이어야 합니다.`;
    }
    if (rule.max !== undefined && value > rule.max) {
      return `${fieldName}은(는) ${rule.max} 이하여야 합니다.`;
    }
  }

  // 패턴 검증
  if (rule.pattern && typeof value === 'string' && !rule.pattern.test(value)) {
    return `${fieldName}의 형식이 올바르지 않습니다.`;
  }

  // 커스텀 검증
  if (rule.custom) {
    const customError = rule.custom(value);
    if (customError) {
      return customError;
    }
  }

  return null;
};

/**
 * 회원 정보 유효성 검증 스키마
 */
export const memberValidationSchema: ValidationSchema<MemberInsert> = {
  name: {
    required: true,
    minLength: 2,
    maxLength: 10,
    pattern: /^[가-힣a-zA-Z\s]+$/,
    custom: (value: string) => {
      if (value && value.trim() !== value) {
        return '이름의 앞뒤 공백은 제거해주세요.';
      }
      return null;
    },
  },
  email: {
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    custom: (value: string) => {
      if (value && !value.includes('@')) {
        return '올바른 이메일 형식을 입력해주세요.';
      }
      return null;
    },
  },
  phone: {
    pattern: /^010-\d{4}-\d{4}$/,
    custom: (value: string) => {
      if (value && !value.startsWith('010')) {
        return '휴대폰 번호는 010으로 시작해야 합니다.';
      }
      return null;
    },
  },
};

/**
 * 게임 세션 유효성 검증 스키마
 */
export const sessionValidationSchema: ValidationSchema<GameSessionInsert> = {
  session_date: {
    required: true,
    custom: (value: string) => {
      const date = new Date(value);
      const now = new Date();
      if (date > now) {
        return '미래 날짜는 입력할 수 없습니다.';
      }
      const oneYearAgo = new Date();
      oneYearAgo.setFullYear(now.getFullYear() - 1);
      if (date < oneYearAgo) {
        return '1년 이전 날짜는 입력할 수 없습니다.';
      }
      return null;
    },
  },
  location: {
    required: true,
    minLength: 2,
    maxLength: 50,
  },
  notes: {
    maxLength: 500,
  },
};

/**
 * 볼링 점수 유효성 검증
 */
export const validateBowlingScore = (score: number, gameNumber: number): string | null => {
  if (score < 0) {
    return '점수는 0 이상이어야 합니다.';
  }
  if (score > 300) {
    return '점수는 300 이하여야 합니다.';
  }
  if (!Number.isInteger(score)) {
    return '점수는 정수여야 합니다.';
  }
  return null;
};

/**
 * 게임 결과 유효성 검증
 */
export const validateGameResults = (scores: number[]): ValidationResult => {
  const errors: Record<string, string> = {};

  if (scores.length !== 3) {
    errors.scores = '3게임의 점수를 모두 입력해야 합니다.';
    return { isValid: false, errors };
  }

  scores.forEach((score, index) => {
    const error = validateBowlingScore(score, index + 1);
    if (error) {
      errors[`game${index + 1}`] = error;
    }
  });

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

/**
 * 이미지 파일 유효성 검증
 */
export const validateImageFile = (file: File): string | null => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  const maxSize = 10 * 1024 * 1024; // 10MB

  if (!allowedTypes.includes(file.type)) {
    return '지원되는 이미지 형식: JPEG, PNG, WebP';
  }

  if (file.size > maxSize) {
    return '이미지 크기는 10MB 이하여야 합니다.';
  }

  return null;
};

/**
 * 회원 이름 중복 검증 (비동기)
 */
export const validateMemberNameUnique = async (
  name: string,
  existingMembers: string[]
): Promise<string | null> => {
  if (existingMembers.includes(name)) {
    return '이미 등록된 회원 이름입니다.';
  }
  return null;
};

/**
 * 실시간 입력 유효성 검증 (디바운싱용)
 */
export const createFieldValidator = <T>(
  schema: ValidationSchema<T>,
  field: keyof T
) => {
  return (value: any): string | null => {
    const rule = schema[field as string];
    if (!rule) return null;
    return validateField(value, rule, field as string);
  };
};

/**
 * 폼 전체 유효성 검증 결과 요약
 */
export const getValidationSummary = (errors: Record<string, string>): string => {
  const errorCount = Object.keys(errors).length;
  if (errorCount === 0) {
    return '모든 입력이 유효합니다.';
  }
  return `${errorCount}개의 오류를 수정해주세요.`;
};