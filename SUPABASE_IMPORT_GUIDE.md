# Supabase 데이터 삽입 가이드

## 개요
이 가이드는 파싱된 볼링 게임 데이터를 Supabase 데이터베이스에 삽입하는 방법을 설명합니다.

## 사전 준비

### 1. 환경 변수 설정
`.env` 파일을 프로젝트 루트에 생성하고 다음 내용을 추가하세요:

```bash
# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 2. Supabase 프로젝트 설정
- Supabase 대시보드에서 프로젝트 생성
- 마이그레이션 파일 실행: `supabase/migrations/20250102_001_create_bowling_tables.sql`
- RLS 정책 설정: `supabase/migrations/20250102_002_setup_rls_policies.sql`

## 데이터 구조

### 테이블 관계
```
members (회원)
├── game_sessions (게임 세션)
    ├── game_results (게임 결과)
    └── upload_history (업로드 기록)
```

### 삽입 프로세스
1. **회원 생성/조회**: 각 플레이어의 회원 정보를 생성하거나 기존 회원을 조회
2. **게임 세션 생성**: 날짜와 게임 타입에 따라 세션 생성
3. **게임 결과 삽입**: 각 플레이어의 3게임 점수를 개별 레코드로 삽입
4. **세션 정보 업데이트**: 총 플레이어 수 등 세션 메타데이터 업데이트

## 스크립트 실행

### 방법 1: 직접 실행
```bash
npm run tsx scripts/import-to-supabase.js
```

### 방법 2: package.json 스크립트 추가
package.json에 다음 스크립트 추가:
```json
{
  "scripts": {
    "import:supabase": "tsx scripts/import-to-supabase.js"
  }
}
```

그 후 실행:
```bash
npm run import:supabase
```

## 데이터 검증

삽입 후 다음 쿼리로 데이터를 확인할 수 있습니다:

```sql
-- 회원 수 확인
SELECT COUNT(*) as member_count FROM members;

-- 게임 세션 수 확인  
SELECT COUNT(*) as session_count FROM game_sessions;

-- 게임 결과 수 확인
SELECT COUNT(*) as result_count FROM game_results;

-- 게임별 통계
SELECT 
  gs.date,
  gs.game_type,
  gs.total_players,
  COUNT(gr.id) as total_games,
  ROUND(AVG(gr.score), 2) as avg_score
FROM game_sessions gs
LEFT JOIN game_results gr ON gs.id = gr.session_id
GROUP BY gs.id, gs.date, gs.game_type, gs.total_players
ORDER BY gs.date;
```

## 주의사항

1. **중복 실행**: 스크립트를 여러 번 실행하면 회원은 이름으로 중복 체크되지만, 게임 세션과 결과는 중복 생성됩니다.
2. **데이터 정합성**: 삽입 전 기존 데이터를 확인하고 필요시 정리하세요.
3. **환경 변수**: Supabase URL과 키가 올바르게 설정되었는지 확인하세요.

## 트러블슈팅

### 연결 오류
```
Error: Missing Supabase environment variables
```
→ `.env` 파일의 환경 변수를 확인하세요.

### 권한 오류
```
Error: new row violates row-level security policy
```
→ RLS 정책이 올바르게 설정되었는지 확인하세요.

### 파싱 오류
```
Error: 게임 점수 컬럼을 찾을 수 없습니다
```
→ Excel 파일의 헤더 구조를 확인하세요.
