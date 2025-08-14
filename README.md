# 🎳 Bling-Bling - 볼링 점수 관리 시스템

동호회 볼링 화이트보드 사진을 OCR로 자동 인식하여 점수를 관리하고 통계를 분석하는 웹 애플리케이션입니다.

## ✨ 주요 기능

### 📸 이미지 인식
- 볼링 화이트보드 사진 업로드
- Tesseract.js 기반 OCR로 회원 이름과 점수 자동 인식
- 이미지 전처리를 통한 인식률 향상
- 인식 결과 수정 및 검증 기능

### 📊 통계 분석
- **개인 통계**: 평균 점수, 최고/최저 점수, 점수 추이 그래프
- **그룹 통계**: 동호회 랭킹, 월간 MVP, 참석률 분석
- **재미있는 통계**: 행운의 요일, 콤보 스트라이크, 개선왕, 가장 시너지 좋은 회원 등
- **실시간 대시보드**: Supabase Realtime으로 실시간 업데이트

### 🎯 게임 관리
- 게임 세션 생성 및 관리
- 3게임 점수 기록 및 검증
- 회원 정보 관리
- 이미지 업로드 히스토리

## 🛠 기술 스택

### Frontend
- **React 18** + **TypeScript**
- **Vite** (빌드 도구)
- **TailwindCSS** (스타일링)
- **React Router** (라우팅)
- **React Hook Form** (폼 관리)
- **React Query** (데이터 fetching)
- **Chart.js** (차트 및 그래프)

### OCR & Image Processing
- **Tesseract.js** (브라우저 OCR)
- **Canvas API** (이미지 전처리)

### Backend & Database
- **Supabase**
  - PostgreSQL 데이터베이스
  - Storage (이미지 파일 저장)
  - Row Level Security (RLS)
  - Real-time 기능
  - Edge Functions

### AI & Context Management
- **Context7 MCP** (Model Context Protocol)
  - 대화 컨텍스트 관리
  - Upstash Redis 기반 데이터 저장
  - AI 어시스턴트 통합

## 🚀 빠른 시작

### 사전 요구사항
- Node.js 18 이상
- npm 또는 yarn

### 설치 및 실행
```bash
# 저장소 클론
git clone https://github.com/quenya/bling-bling.git
cd bling-bling

# 의존성 설치
npm install

# 환경변수 설정
cp .env.example .env
# .env에서 Supabase 설정 정보 입력

# 개발 서버 실행
npm run dev
```

### Context7 MCP 설정 (VS Code)
VS Code Copilot Chat에서 최신 라이브러리 문서를 활용하려면:

1. **Upstash Redis 설정**
   - [Upstash Console](https://console.upstash.com/)에서 Redis 인스턴스 생성
   - REST API URL과 Token 복사

2. **VS Code에서 MCP 활성화**
   - `Ctrl+Shift+P` → `MCP: List Servers` 실행
   - `context7` 서버 확인 및 Redis 정보 입력

3. **사용 방법**
   - Copilot Chat에서 Agent mode 선택
   - 프롬프트에 `use context7` 추가
   ```
   "How to implement authentication in Next.js 14? use context7"
   ```

자세한 설정 방법은 [CONTEXT7_GUIDE.md](./CONTEXT7_GUIDE.md)를 참고하세요.

## 📦 Vercel 배포

### 자동 배포 (권장)
1. [Vercel](https://vercel.com)에 GitHub 계정으로 로그인
2. "New Project" → GitHub에서 `quenya/bling-bling` 선택
3. 환경 변수 설정:
   ```
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```
4. Deploy 클릭

### CLI 배포
```bash
npm i -g vercel
vercel login
vercel --prod
```

### 환경변수 설정
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## 📁 프로젝트 구조

```
bling-bling/
├── public/             # 정적 파일
├── src/
│   ├── components/     # 재사용 가능한 컴포넌트
│   │   ├── ui/        # 기본 UI 컴포넌트
│   │   ├── forms/     # 폼 관련 컴포넌트
│   │   └── charts/    # 차트 컴포넌트
│   ├── pages/         # 페이지 컴포넌트
│   ├── hooks/         # 커스텀 훅
│   ├── services/      # API 호출 및 비즈니스 로직
│   ├── utils/         # 유틸리티 함수
│   ├── types/         # TypeScript 타입 정의
│   ├── stores/        # 상태 관리
│   └── styles/        # 글로벌 스타일
├── supabase/          # Supabase 설정 및 마이그레이션
└── .mcp.json          # MCP 서버 설정
```

## 🗄 데이터베이스 스키마

### 주요 테이블
- **members**: 동호회 회원 정보 (id, name, email, joined_date)
- **game_sessions**: 볼링 게임 세션 (id, date, location, session_name)
- **game_results**: 개별 게임 결과 (id, session_id, member_id, game_number, score)
- **upload_history**: 이미지 업로드 기록 (id, session_id, image_url, processed_date)

## 🔧 개발 명령어

```bash
# 개발 서버 실행
npm run dev

# 프로덕션 빌드
npm run build

# 빌드 결과 미리보기
npm run preview

# 린트 검사
npm run lint

# 타입 검사
npm run typecheck

# 테스트 실행
npm test
```

## 🎯 개발 로드맵

### Phase 1: 기본 구조 (완료)
- [x] 프로젝트 초기 설정
- [x] Supabase 연동
- [x] 기본 UI 컴포넌트

### Phase 2: OCR 기능 (진행 중)
- [ ] 이미지 업로드 기능
- [ ] Tesseract.js OCR 구현
- [ ] 이미지 전처리 알고리즘
- [ ] 볼링 점수 패턴 인식

### Phase 3: 데이터 관리
- [ ] 게임 세션 관리
- [ ] 회원 관리 시스템
- [ ] OCR 결과 검증 및 수정

### Phase 4: 통계 및 분석
- [ ] 개인 통계 대시보드
- [ ] 그룹 통계 및 랭킹
- [ ] 차트 및 그래프 구현
- [ ] 실시간 업데이트

### Phase 5: 최적화 및 배포
- [ ] 성능 최적화
- [ ] PWA 기능
- [ ] 모바일 최적화
- [ ] 배포 및 CI/CD

## 🤝 기여 방법

1. 이슈를 먼저 확인하고 중복되지 않도록 합니다
2. 새로운 기능이나 버그 수정 전에 이슈를 생성합니다
3. 브랜치를 생성하여 작업합니다 (`feature/기능명` 또는 `fix/버그명`)
4. 커밋 메시지는 컨벤션을 따릅니다
5. Pull Request를 통해 코드 리뷰를 받습니다

### 커밋 메시지 컨벤션
```
feat: 새로운 기능 추가
fix: 버그 수정
docs: 문서 수정
style: 코드 포맷팅, 세미콜론 누락 등
refactor: 코드 리팩토링
test: 테스트 추가
chore: 빌드 업무 수정, 패키지 매니저 수정
```

## 📖 문서

- [개발 가이드](./DEVELOPMENT_GUIDE.md) - 상세한 개발 표준 및 워크플로우
- [Context7 가이드](./CONTEXT7_GUIDE.md) - Context7 MCP 서버 활용법
- [Claude 가이드](./CLAUDE.md) - Claude Code 작업 가이드라인

## 📄 라이선스

이 프로젝트는 MIT 라이선스하에 배포됩니다.

## 💬 문의사항

프로젝트 관련 문의사항이 있으시면 GitHub Issues를 통해 연락해주세요.
