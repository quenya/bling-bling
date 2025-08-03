import React, { useState, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import type { GameResultInsert } from '@/types/database';
import { validateGameResults } from '@/utils/validation';
import { createUserFriendlyError, formatErrorForUser } from '@/utils/error-handling';

interface ScoreData {
  memberId: string;
  memberName: string;
  game1Score: number | '';
  game2Score: number | '';
  game3Score: number | '';
}

interface ScoreInputFormProps {
  sessionId: string;
  members: Array<{ id: string; name: string }>;
  initialScores?: Array<{ memberId: string; scores: number[] }>;
  onSubmit: (scores: GameResultInsert[]) => Promise<void>;
  onCancel?: () => void;
  isLoading?: boolean;
}

export const ScoreInputForm: React.FC<ScoreInputFormProps> = ({
  sessionId,
  members,
  initialScores = [],
  onSubmit,
  onCancel,
  isLoading = false,
}) => {
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const { control, handleSubmit, watch, setValue, formState: { errors } } = useForm<{
    scores: ScoreData[]
  }>({
    defaultValues: {
      scores: members.map(member => {
        const existingScore = initialScores.find(s => s.memberId === member.id);
        return {
          memberId: member.id,
          memberName: member.name,
          game1Score: existingScore?.scores[0] || '',
          game2Score: existingScore?.scores[1] || '',
          game3Score: existingScore?.scores[2] || '',
        };
      }),
    },
  });

  const { fields } = useFieldArray({
    control,
    name: 'scores',
  });

  const watchedScores = watch('scores');

  // 실시간 점수 유효성 검증
  useEffect(() => {
    const newErrors: Record<string, string> = {};
    
    watchedScores.forEach((score, index) => {
      const scores = [score.game1Score, score.game2Score, score.game3Score]
        .filter(s => s !== '')
        .map(s => Number(s));
      
      scores.forEach((s, gameIndex) => {
        if (s < 0 || s > 300) {
          newErrors[`${index}-${gameIndex}`] = '점수는 0~300 사이여야 합니다';
        }
      });
      
      // 3게임 모두 입력된 경우 평균 계산
      if (scores.length === 3) {
        const average = scores.reduce((sum, s) => sum + s, 0) / 3;
        if (average < 50) {
          newErrors[`${index}-average`] = '평균이 너무 낮습니다. 점수를 확인해주세요';
        }
      }
    });
    
    setValidationErrors(newErrors);
  }, [watchedScores]);

  const calculateAverage = (scores: (number | '')[]) => {
    const validScores = scores.filter(s => s !== '' && !isNaN(Number(s))).map(Number);
    if (validScores.length === 0) return 0;
    return validScores.reduce((sum, score) => sum + score, 0) / validScores.length;
  };

  const calculateTotal = (scores: (number | '')[]) => {
    const validScores = scores.filter(s => s !== '' && !isNaN(Number(s))).map(Number);
    return validScores.reduce((sum, score) => sum + score, 0);
  };

  const validateAllScores = (): boolean => {
    const allErrors: Record<string, string> = {};
    let hasValidData = false;

    watchedScores.forEach((score, index) => {
      const scores = [score.game1Score, score.game2Score, score.game3Score];
      const validScores = scores.filter(s => s !== '').map(Number);
      
      if (validScores.length > 0) {
        hasValidData = true;
        const result = validateGameResults(validScores);
        if (!result.isValid) {
          Object.entries(result.errors).forEach(([field, message]) => {
            allErrors[`${index}-${field}`] = message;
          });
        }
      }
    });

    setValidationErrors(allErrors);
    return hasValidData && Object.keys(allErrors).length === 0;
  };

  const handleFormSubmit = async () => {
    setSubmitError(null);
    
    if (!validateAllScores()) {
      setSubmitError('입력된 점수를 확인해주세요.');
      return;
    }

    try {
      const gameResults: GameResultInsert[] = [];
      
      watchedScores.forEach((score) => {
        const scores = [score.game1Score, score.game2Score, score.game3Score];
        
        scores.forEach((s, gameIndex) => {
          if (s !== '') {
            gameResults.push({
              session_id: sessionId,
              member_id: score.memberId,
              game_number: gameIndex + 1,
              score: Number(s),
            });
          }
        });
      });

      if (gameResults.length === 0) {
        setSubmitError('최소 하나 이상의 점수를 입력해주세요.');
        return;
      }

      await onSubmit(gameResults);
    } catch (error) {
      const appError = createUserFriendlyError(error, '점수 저장');
      const formatted = formatErrorForUser(appError);
      setSubmitError(formatted.message);
    }
  };

  const handleScoreChange = (memberIndex: number, gameIndex: number, value: string) => {
    const numValue = value === '' ? '' : Number(value);
    const fieldName = `scores.${memberIndex}.game${gameIndex + 1}Score` as const;
    setValue(fieldName, numValue);
  };

  const getScoreInputClassName = (memberIndex: number, gameIndex: number) => {
    const errorKey = `${memberIndex}-${gameIndex}`;
    const hasError = validationErrors[errorKey];
    return hasError ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : '';
  };

  return (
    <Card>
      <CardHeader>
        <h2 className="text-xl font-semibold">점수 입력</h2>
        <p className="text-sm text-gray-600 mt-1">
          각 회원의 3게임 점수를 입력하세요 (0-300점)
        </p>
      </CardHeader>
      <CardBody>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-medium text-gray-700">회원명</th>
                <th className="text-center py-3 px-4 font-medium text-gray-700">1게임</th>
                <th className="text-center py-3 px-4 font-medium text-gray-700">2게임</th>
                <th className="text-center py-3 px-4 font-medium text-gray-700">3게임</th>
                <th className="text-center py-3 px-4 font-medium text-gray-700">평균</th>
                <th className="text-center py-3 px-4 font-medium text-gray-700">총점</th>
              </tr>
            </thead>
            <tbody>
              {fields.map((field, memberIndex) => {
                const memberScores = watchedScores[memberIndex];
                const scores = [memberScores.game1Score, memberScores.game2Score, memberScores.game3Score];
                const average = calculateAverage(scores);
                const total = calculateTotal(scores);
                
                return (
                  <tr key={field.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4 font-medium text-gray-900">
                      {field.memberName}
                    </td>
                    {[0, 1, 2].map((gameIndex) => (
                      <td key={gameIndex} className="py-3 px-4">
                        <Input
                          type="number"
                          min="0"
                          max="300"
                          placeholder="0"
                          value={scores[gameIndex] === '' ? '' : scores[gameIndex]}
                          onChange={(e) => handleScoreChange(memberIndex, gameIndex, e.target.value)}
                          className={`w-20 text-center ${getScoreInputClassName(memberIndex, gameIndex)}`}
                          error={validationErrors[`${memberIndex}-${gameIndex}`]}
                        />
                      </td>
                    ))}
                    <td className="py-3 px-4 text-center">
                      <span className={`font-medium ${average >= 150 ? 'text-green-600' : average >= 100 ? 'text-yellow-600' : 'text-red-600'}`}>
                        {average > 0 ? average.toFixed(1) : '-'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="font-medium text-gray-900">
                        {total > 0 ? total : '-'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {Object.keys(validationErrors).length > 0 && (
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
            <h4 className="text-sm font-medium text-yellow-800 mb-2">입력 확인 필요</h4>
            <ul className="text-sm text-yellow-700 space-y-1">
              {Object.entries(validationErrors).map(([key, message]) => (
                <li key={key}>• {message}</li>
              ))}
            </ul>
          </div>
        )}

        {submitError && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-600">{submitError}</p>
          </div>
        )}

        <div className="flex gap-3 pt-6">
          <Button
            onClick={handleFormSubmit}
            variant="primary"
            disabled={isLoading || Object.keys(validationErrors).length > 0}
            loading={isLoading}
            className="flex-1"
          >
            점수 저장
          </Button>
          {onCancel && (
            <Button
              onClick={onCancel}
              variant="secondary"
              disabled={isLoading}
              className="flex-1"
            >
              취소
            </Button>
          )}
        </div>
      </CardBody>
    </Card>
  );
};