# CLAUDE.md

이 파일은 이 저장소에서 작업할 때 Claude Code (claude.ai/code)에게 가이드라인을 제공합니다.

## 프로젝트 개요
Bling-Bling은 동호회 볼링 점수 관리 및 통계 분석 시스템입니다. 볼링 화이트보드 사진을 업로드하면 OCR을 통해 회원 이름과 점수를 자동으로 인식하고, Supabase DB에 저장한 후 다양한 통계 분석을 제공하는 React 기반 웹 애플리케이션입니다.

## 현재 구현 상태 (2025년 8월 10일 기준)

### ✅ 완성된 기능
1. **게임 입력 시스템**
   - `GameInputWizard`: 3단계 게임 입력 마법사 (참여자 선택 → 팀 구성 → 점수 입력)
   - `ManualInputPage`: 수동 점수 입력 페이지
   - 핸디캡 시스템 (개별 적용 가능)
   - 17개 레인 제한 및 자동 레인 번호 관리
   - 가상 회원 '동수' 지원
   - 팀 자동 구성 알고리즘 (티어별 균등 배분)

2. **회원 관리**
   - 회원 등록/조회/수정
   - 최근 20게임 평균 계산
   - 티어 시스템 (상위/중위/하위)

3. **통계 시스템**
   - 대시보드 통계 (`StatisticsPage`)
   - Top 5 플레이어 랭킹
   - 레인별 트렌드 분석
   - 재미있는 통계 (일관성 지수, 아쉬운 기록 등)

4. **데이터 관리**
   - Supabase 연동 완료
   - React Query 기반 데이터 fetching
   - 실시간 업데이트 지원
   - 엑셀 파일 파싱 및 데이터 가져오기

### 🚧 진행 중인 기능
1. **OCR 기능** (계획 단계)
   - Tesseract.js 기반 이미지 인식
   - 볼링 점수 패턴 최적화

2. **고급 통계 기능**
   - 더 많은 재미있는 통계 추가
   - 개인별 상세 분석

## MCP 서버 설정
이 프로젝트는 다음 MCP 서버들이 필요합니다:

- **Supabase MCP 서버**: 데이터베이스 연동 (project-ref: vpaomoinssfzlyqzrdfu)
- **Context7 MCP 서버**: 기술 문서 검색 및 지식 관리

MCP 설정은 `mcp-server.json` 파일에 저장되어 있으며 Claude Code 사용 시 자동으로 로드됩니다.

## 개발 명령어
```bash
# 의존성 설치
npm install

# 개발 서버 실행
npm run dev

# 프로젝트 빌드
npm run build

# 테스트 실행
npm test

# 린트 검사
npm run lint

# 타입 검사
npm run typecheck
```

## 기술 스택

### 프론트엔드
- **React 18** + **TypeScript**
- **Vite** (빌드 도구)
- **TailwindCSS** (스타일링)
- **React Router** (라우팅)
- **React Hook Form** (폼 관리)
- **React Query (TanStack Query)** (데이터 fetching)
- **Chart.js** + **react-chartjs-2** (차트 및 시각화)
- **Lucide React** (아이콘)
- **React Hot Toast** (토스트 알림)

### 이미지 처리 & OCR (계획)
- **Tesseract.js** (브라우저 OCR)
- **Canvas API** (이미지 전처리)

### 백엔드 & 데이터베이스
- **Supabase** 
  - PostgreSQL 데이터베이스
  - Storage (이미지 파일)
  - Row Level Security (RLS)
  - Real-time 기능

### 개발 도구
- **ESLint** + **TypeScript ESLint**
- **Vitest** (테스트 프레임워크)
- **Context7 MCP** (기술 문서 검색)
- **Upstash Redis** (MCP 데이터 저장)

## 프로젝트 구조
```
bling-bling/
├── public/             # 정적 파일
│   ├── manifest.json   # PWA 매니페스트
│   └── vite.svg       # 파비콘
├── src/
│   ├── components/     # 재사용 가능한 컴포넌트
│   │   ├── ui/        # 기본 UI 컴포넌트 (Button, Card, Input 등)
│   │   ├── forms/     # 폼 관련 컴포넌트 (GameInputWizard)
│   │   ├── charts/    # 차트 컴포넌트 (LaneTrendChart, MemberRankingChart 등)
│   │   ├── stats/     # 통계 관련 컴포넌트
│   │   └── history/   # 히스토리 관련 컴포넌트
│   ├── pages/         # 페이지 컴포넌트
│   │   ├── ManualInputPage.tsx      # 게임 입력 페이지
│   │   ├── StatisticsPage.tsx       # 통계 페이지
│   │   ├── HistoryPage.tsx          # 게임 기록 페이지
│   │   ├── MemberRecordsPage.tsx    # 회원 기록 페이지
│   │   ├── SessionsPage.tsx         # 세션 관리 페이지
│   │   └── NotFoundPage.tsx         # 404 페이지
│   ├── hooks/         # 커스텀 훅
│   │   ├── queries/   # React Query 훅들
│   │   ├── useMembers.ts    # 회원 관련 훅
│   │   └── useRealtime.ts   # 실시간 업데이트 훅
│   ├── services/      # API 호출 및 비즈니스 로직
│   │   ├── supabase.ts      # Supabase 클라이언트
│   │   ├── members.ts       # 회원 관리 서비스
│   │   ├── gameResults.ts   # 게임 결과 서비스
│   │   ├── gameSessions.ts  # 게임 세션 서비스
│   │   ├── statistics.ts    # 통계 서비스
│   │   └── achievements.ts  # 성취 시스템 서비스
│   ├── utils/         # 유틸리티 함수
│   │   ├── excelParser.ts   # 엑셀 파일 파싱
│   │   ├── validation.ts    # 유효성 검사
│   │   └── error-handling.ts # 에러 처리
│   ├── types/         # TypeScript 타입 정의
│   │   ├── bowling.ts       # 볼링 관련 타입
│   │   ├── database.ts      # 데이터베이스 스키마 타입
│   │   └── index.ts         # 공통 타입
│   └── styles/        # 글로벌 스타일
│       └── index.css        # Tailwind CSS 포함
├── scripts/           # 데이터 처리 스크립트
│   ├── parse-all-games.js   # 게임 데이터 파싱
│   └── import-to-supabase.js # Supabase 데이터 가져오기
├── sheets/            # 엑셀 파일 저장소
├── images/            # 업로드된 이미지 파일
├── supabase/          # Supabase 설정 및 마이그레이션
│   └── migrations/    # 데이터베이스 마이그레이션 파일
├── mcp-server.json    # MCP 서버 설정
└── vercel.json        # Vercel 배포 설정
```

## 데이터베이스 스키마

### 주요 테이블
- **members**: 동호회 회원 정보 (이름, 이메일, 가입일 등)
- **game_sessions**: 볼링 게임 세션 (날짜, 레인번호, 참가자 수)
- **game_results**: 개별 게임 결과 (회원별 3게임 점수)
- **upload_history**: 이미지 업로드 기록 (OCR 처리 이력)
- **member_statistics**: 회원별 통계 (평균, 최고점, 게임 수 등)
- **achievements**: 성취 시스템 (업적 정의)
- **member_achievements**: 회원별 달성 업적

### 주요 비즈니스 로직
- 게임 세션은 **날짜 + 레인번호**로 식별
- 모든 게임은 **수요일**에 진행
- 17개 레인 제한 (볼링장 물리적 제약)
- 핸디캡은 UI에서만 표시, 원본 점수는 데이터베이스에 저장
- '동수'는 가상 회원으로 실제 데이터베이스에 저장하지 않음

## 개발 가이드라인

### 최근 주요 업데이트 (2025년 8월)
- **레인 번호 관리 시스템**: 17개 레인 제한, 자동 동기화, 팀 추가/제거 시 자동 조정
- **게임 입력 마법사**: 3단계 프로세스로 사용자 친화적 게임 입력
- **핸디캡 시스템**: 개별 회원별 핸디캡 적용 여부 선택 가능
- **가상 회원 '동수'**: 팀 구성 시 부족한 인원을 위한 가상 회원 지원
- **팀 자동 구성**: 티어별 균등 배분 알고리즘

### 프로젝트 메모리

#### 데이터 모델링 원칙
- 게임 정보의 key는 **날짜와 레인번호**로 구성
- 모든 게임날은 **수요일**
- 최대 **17개 레인** 제한 (물리적 제약)
- 원본 점수는 핸디캡 적용 없이 저장
- '동수'는 가상 회원이므로 실제 DB에 저장하지 않음

#### 게임 입력 워크플로우
1. **참여자 선택**: 기존 회원 중 선택 또는 신규 회원 추가
2. **팀 구성**: 자동 구성 또는 수동 드래그앤드롭으로 팀 배정
3. **점수 입력**: 팀별 레인 설정 후 3게임 점수 입력 및 핸디캡 적용

#### 핸디캡 시스템
- 개별 회원별 핸디캡 값 설정 가능
- 핸디캡 적용 여부는 체크박스로 개별 제어
- UI에서는 원본 점수와 핸디캡 적용 점수 모두 표시
- 데이터베이스에는 **원본 점수만 저장**

### 기술 문서 검색 우선순위
1. **Context7 MCP 서버 우선 사용** - 모든 기술적 질문과 문서 검색
2. 검색 결과는 팀과 공유하여 문서화
3. DEVELOPMENT_GUIDE.md의 세부 프로세스 준수

### 코딩 표준
- **ES6+** 문법 사용
- **TypeScript** 타입 안정성 확보
- **함수형 프로그래밍** 접근 방식 선호
- **camelCase** (변수/함수), **PascalCase** (컴포넌트/클래스)
- **kebab-case** (파일명)

### OCR 및 이미지 처리
- Tesseract.js 사용하여 브라우저에서 OCR 처리
- 이미지 전처리로 인식률 향상
- 볼링 점수 패턴에 특화된 후처리 로직 구현

### 개발 워크플로우
1. Context7 MCP로 관련 기술 검색
2. 기능 설계 및 타입 정의
3. 컴포넌트 개발 (TDD 권장)
4. Supabase 연동 및 데이터 처리
5. 테스트 및 린트 검사
6. 코드 리뷰 및 문서화

## 주요 파일 및 컴포넌트

### 핵심 컴포넌트
- **`GameInputWizard.tsx`**: 3단계 게임 입력 마법사
  - 참여자 선택 → 팀 구성 → 점수 입력
  - 레인 번호 자동 관리 및 17개 제한
  - 핸디캡 시스템 및 가상 회원 지원
- **`ManualInputPage.tsx`**: 게임 입력 메인 페이지
- **`StatisticsPage.tsx`**: 통계 대시보드
- **`Layout.tsx`** + **`Sidebar.tsx`**: 메인 레이아웃

### 설정 파일
- **`README.md`**: 프로젝트 개요 및 설치 가이드
- **`DEVELOPMENT_GUIDE.md`**: 상세한 개발 표준 및 워크플로우
- **`CONTEXT7_GUIDE.md`**: Context7 MCP 서버 활용 가이드
- **`FUNNY_STATS_PLAN.md`**: 재미있는 통계 구현 계획
- **`mcp-server.json`**: MCP 서버 설정
- **`vercel.json`**: Vercel 배포 설정

### 타입 정의
- **`src/types/bowling.ts`**: 볼링 관련 타입 (Participant, Team, GameResult 등)
- **`src/types/database.ts`**: Supabase 데이터베이스 스키마 타입
- **`src/types/index.ts`**: 공통 유틸리티 타입

### 데이터 서비스
- **`src/services/`**: 각 도메인별 API 서비스 모듈
- **`src/hooks/queries/`**: React Query 훅들
- **`supabase/migrations/`**: 데이터베이스 마이그레이션 파일

## 개발 로드맵

### ✅ Phase 1: 기본 구조 (완료)
- [x] 프로젝트 초기 설정 (React 18 + TypeScript + Vite)
- [x] Supabase 연동 및 데이터베이스 설계
- [x] 기본 UI 컴포넌트 라이브러리
- [x] 라우팅 및 레이아웃 구조

### ✅ Phase 2: 게임 입력 시스템 (완료)
- [x] 게임 입력 마법사 (GameInputWizard)
- [x] 회원 관리 시스템
- [x] 팀 구성 알고리즘 (티어별 균등 배분)
- [x] 레인 번호 관리 (17개 제한)
- [x] 핸디캡 시스템
- [x] 가상 회원 '동수' 지원

### ✅ Phase 3: 통계 및 분석 (기본 완료)
- [x] 대시보드 통계
- [x] 회원별 순위 시스템
- [x] 레인별 트렌드 분석
- [x] 기본 재미있는 통계

### 🚧 Phase 4: OCR 기능 (계획 중)
- [ ] 이미지 업로드 기능
- [ ] Tesseract.js OCR 구현
- [ ] 이미지 전처리 알고리즘
- [ ] 볼링 점수 패턴 인식 최적화

### 📋 Phase 5: 고급 기능 (향후 계획)
- [ ] 고급 통계 분석
- [ ] PWA 기능 강화
- [ ] 모바일 최적화
- [ ] 성취 시스템 확장

## 특별 고려사항 및 제약조건

### 물리적 제약
- **17개 레인 제한**: 볼링장의 물리적 제약으로 최대 17개 레인까지만 사용 가능
- **수요일 고정**: 모든 게임은 수요일에만 진행 (동호회 정기 모임일)

### 기술적 제약 및 설계 원칙
- **모바일 우선** 반응형 디자인
- **PWA** 기능으로 오프라인 지원 (향후 계획)
- **실시간 업데이트** (Supabase Realtime)
- **접근성(a11y)** 기준 준수
- 한국어 볼링 용어 및 이름 패턴 최적화

### 데이터 정책
- **개인정보 보호** 및 **데이터 익명화** 고려
- 원본 점수만 데이터베이스에 저장 (핸디캡은 UI 계산)
- '동수' 가상 회원은 실제 DB에 저장하지 않음
- 중복 데이터 방지 (같은 세션, 같은 회원, 같은 게임 번호)

### 성능 최적화
- **이미지 최적화** 및 **OCR 성능** 튜닝 (향후 OCR 구현 시)
- React Query를 통한 효율적인 데이터 캐싱
- Supabase RLS를 통한 보안 및 성능 최적화

## 향후 확장 계획

### 동호회원 공유 콘텐츠 (기획 단계)
- **개인 성장 분석**: 점수 향상 그래프, 개인 기록 달성 현황
- **재미있는 통계**: 행운의 요일/시간대, 연속 스트라이크 기록, 아쉬운 기록들
- **그룹 역학 분석**: 베스트 파트너, 라이벌 매치업, 팀 시너지
- **게임화 요소**: 업적 시스템, 레벨 시스템, 특별 칭호
- **소셜 기능**: 사진/영상 하이라이트, 회원 스포트라이트