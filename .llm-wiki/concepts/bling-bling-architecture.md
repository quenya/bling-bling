---
title: Bling-Bling architecture
created: 2026-08-09
updated: 2026-08-09
type: concept
tags: [project, frontend, typescript, supabase, deployment]
sources: [raw/project-baseline.md]
confidence: medium
---

# Bling-Bling architecture

## 구조

```text
React/Vite client
  ├─ pages / components / hooks
  ├─ services / utils / types
  └─ React Query + Realtime
        ↓
Supabase
  ├─ PostgreSQL: 회원·세션·점수·업로드 기록
  ├─ Storage: 이미지 파일
  ├─ RLS: 데이터 접근 제어
  └─ Realtime: 대시보드 갱신
        ↓
Vercel deployment
```

## 코드 경계

- `src/pages/`: 사용자 흐름과 화면
- `src/components/`: 재사용 UI, 입력 폼, 차트
- `src/hooks/`: 조회·변경·Realtime 연결
- `src/services/`: Supabase 접근과 도메인 서비스
- `src/utils/`: Excel 파싱·검증·오류 처리
- `src/types/`: 볼링 및 DB 타입
- `supabase/migrations/`: 스키마 변경의 기준

## 설계상 핵심

1. 서버 상태는 React Query로 캐시·갱신한다.
2. 실시간 데이터 변경은 Supabase Realtime과 화면 쿼리 갱신을 연결한다.
3. 회원·게임·점수 모델은 [[bowling-data-model]]을 기준으로 일관성을 유지한다.
4. 이미지 인식은 기존 수동 입력을 대체하기보다 검토·수정 단계를 거치는 보조 입력으로 설계한다. 자세한 흐름은 [[ocr-score-recognition]]을 참조한다.

## 확인 필요 사항

README와 CLAUDE 문서는 일부 기능을 계획/완료로 설명하므로, 다음 변경 때 실제 `src/`와 `supabase/migrations/`를 기준으로 구현 상태를 갱신해야 한다.
