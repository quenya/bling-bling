import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Card, CardHeader, CardBody } from '../ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import type { MemberInsert } from '@/types/database';
import { validate, memberValidationSchema } from '@/utils/validation';
import { createUserFriendlyError, formatErrorForUser } from '@/utils/error-handling';

interface MemberFormProps {
  initialData?: Partial<MemberInsert>;
  onSubmit: (data: MemberInsert) => Promise<void>;
  onCancel?: () => void;
  isLoading?: boolean;
  submitLabel?: string;
}

export const MemberForm: React.FC<MemberFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
  isLoading = false,
  submitLabel = '저장',
}) => {
  const [submitError, setSubmitError] = useState<string | null>(null);
  
  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    setError,
    clearErrors,
  } = useForm<MemberInsert>({
    defaultValues: {
      name: initialData?.name || '',
      email: initialData?.email || '',
      phone: initialData?.phone || '',
      notes: initialData?.notes || '',
      is_active: initialData?.is_active ?? true,
    },
    mode: 'onChange',
  });

  const validateForm = (data: MemberInsert) => {
    const result = validate(data, memberValidationSchema);
    
    if (!result.isValid) {
      Object.entries(result.errors).forEach(([field, message]) => {
        setError(field as keyof MemberInsert, { 
          type: 'manual', 
          message 
        });
      });
      return false;
    }
    
    clearErrors();
    return true;
  };

  const handleFormSubmit = async (data: MemberInsert) => {
    setSubmitError(null);
    
    if (!validateForm(data)) {
      return;
    }

    try {
      await onSubmit(data);
    } catch (error) {
      const appError = createUserFriendlyError(error, '회원 정보 저장');
      const formatted = formatErrorForUser(appError);
      setSubmitError(formatted.message);
    }
  };

  const formatPhoneNumber = (value: string) => {
    const numbers = value.replace(/[^\d]/g, '');
    if (numbers.length <= 3) return numbers;
    if (numbers.length <= 7) return `${numbers.slice(0, 3)}-${numbers.slice(3)}`;
    return `${numbers.slice(0, 3)}-${numbers.slice(3, 7)}-${numbers.slice(7, 11)}`;
  };

  return (
    <Card className="max-w-md mx-auto">
      <CardHeader>
        <h2 className="text-xl font-semibold">
          {initialData ? '회원 정보 수정' : '새 회원 등록'}
        </h2>
      </CardHeader>
      <CardBody>
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              이름 *
            </label>
            <Input
              id="name"
              type="text"
              placeholder="회원 이름을 입력하세요"
              error={errors.name?.message}
              {...register('name', {
                required: '이름은 필수 입력 항목입니다',
                minLength: {
                  value: 2,
                  message: '이름은 2자 이상이어야 합니다'
                },
                maxLength: {
                  value: 10,
                  message: '이름은 10자 이하여야 합니다'
                },
                pattern: {
                  value: /^[가-힣a-zA-Z\s]+$/,
                  message: '이름은 한글, 영문, 공백만 입력 가능합니다'
                }
              })}
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              이메일
            </label>
            <Input
              id="email"
              type="email"
              placeholder="example@email.com"
              error={errors.email?.message}
              {...register('email', {
                pattern: {
                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  message: '올바른 이메일 형식을 입력해주세요'
                }
              })}
            />
          </div>

          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
              휴대폰 번호
            </label>
            <Input
              id="phone"
              type="tel"
              placeholder="010-0000-0000"
              error={errors.phone?.message}
              {...register('phone', {
                pattern: {
                  value: /^010-\d{4}-\d{4}$/,
                  message: '010-0000-0000 형식으로 입력해주세요'
                },
                onChange: (e) => {
                  e.target.value = formatPhoneNumber(e.target.value);
                }
              })}
            />
          </div>

          <div>
            <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
              메모
            </label>
            <textarea
              id="notes"
              rows={3}
              placeholder="추가 정보나 메모를 입력하세요"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              {...register('notes', {
                maxLength: {
                  value: 500,
                  message: '메모는 500자 이하여야 합니다'
                }
              })}
            />
            {errors.notes && (
              <p className="mt-1 text-sm text-red-600">{errors.notes.message}</p>
            )}
          </div>

          <div className="flex items-center">
            <input
              id="is_active"
              type="checkbox"
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              {...register('is_active')}
            />
            <label htmlFor="is_active" className="ml-2 block text-sm text-gray-700">
              활성 회원
            </label>
          </div>

          {submitError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-600">{submitError}</p>
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <Button
              type="submit"
              variant="primary"
              disabled={!isValid || isLoading}
              loading={isLoading}
              className="flex-1"
            >
              {submitLabel}
            </Button>
            {onCancel && (
              <Button
                type="button"
                variant="secondary"
                onClick={onCancel}
                disabled={isLoading}
                className="flex-1"
              >
                취소
              </Button>
            )}
          </div>
        </form>
      </CardBody>
    </Card>
  );
};