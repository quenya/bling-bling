# Context7 MCP 설정 가이드 - Bling-Bling 프로젝트

Context7 MCP (Model Context Protocol) 서버가 성공적으로 설치되었습니다!

## 📋 설치된 구성 요소

- **@upstash/context7-mcp**: Context7 MCP 서버 패키지
- **concurrently**: 개발 서버와 MCP 서버 동시 실행용
- **VS Code MCP 설정**: `.vscode/mcp.json`
- **시작 스크립트**: `scripts/start-mcp.js`

## 🔧 설정 방법

### 1. Upstash Redis 인스턴스 생성

Context7 MCP는 Redis를 사용하여 컨텍스트 데이터를 저장합니다.

1. [Upstash Console](https://console.upstash.com/)에 접속
2. 새 Redis 데이터베이스 생성
3. REST API 섹션에서 다음 정보 복사:
   - `UPSTASH_REDIS_REST_URL`
   - `UPSTASH_REDIS_REST_TOKEN`

### 2. VS Code에서 Context7 MCP 사용

VS Code Copilot Chat에서 Context7 MCP를 사용하는 방법:

#### 2.1 MCP 서버 활성화
1. VS Code에서 `Ctrl+Shift+P` (또는 `Cmd+Shift+P`)를 눌러 Command Palette 열기
2. `MCP: List Servers` 명령 실행
3. `context7` 서버가 목록에 있는지 확인
4. 처음 실행 시 Upstash Redis 정보 입력 프롬프트가 나타남

#### 2.2 Agent Mode에서 사용
1. `Ctrl+Alt+I` (또는 `Cmd+Alt+I`)로 Copilot Chat 열기
2. 드롭다운에서 **Agent mode** 선택
3. **Tools** 버튼 클릭하여 사용 가능한 도구 확인
4. Context7 도구들이 활성화되어 있는지 확인:
   - `resolve-library-id`: 라이브러리 이름을 Context7 ID로 변환
   - `get-library-docs`: 라이브러리 문서 가져오기

#### 2.3 사용 예시
```
// 프롬프트 예시 1: 라이브러리 이름으로 검색
Create a Next.js middleware that checks for a valid JWT in cookies. use context7

// 프롬프트 예시 2: 특정 라이브러리 ID 사용  
implement basic authentication with supabase. use library /supabase/supabase

// 프롬프트 예시 3: 일반적인 질문
How do I set up routing in React Router v6? use context7
```

### 3. 환경 변수 설정 (선택사항)

`.env` 파일에서 다음 값들을 설정할 수도 있습니다:

```bash
# Context7 MCP - Upstash Redis 설정
UPSTASH_REDIS_REST_URL=your_actual_redis_url_here
UPSTASH_REDIS_REST_TOKEN=your_actual_redis_token_here
```
## 🚀 사용 방법

### VS Code Copilot Chat에서 사용

Context7 MCP가 설정되면 VS Code Copilot Chat에서 최신 라이브러리 문서를 실시간으로 가져올 수 있습니다.

#### 기본 사용법
1. **Agent Mode 활성화**: Copilot Chat에서 Agent mode 선택
2. **Context7 활용**: 프롬프트에 `use context7` 추가
3. **자동 문서 검색**: Context7이 최신 문서를 자동으로 가져와서 답변에 반영

#### 효과적인 프롬프트 작성
```bash
# 일반적인 라이브러리 질문
"How do I implement file upload with Multer in Express? use context7"

# 특정 라이브러리 버전
"Show me React 18 new features and Suspense usage. use context7"

# 문제 해결
"Fix CORS issues in Next.js API routes. use context7"

# 최신 API 사용법
"How to use the new Supabase JavaScript client v2? use context7"
```

### MCP 도구 직접 호출

Agent Mode에서 도구를 직접 호출할 수도 있습니다:

- `#resolve-library-id`: 라이브러리 이름을 Context7 ID로 변환
- `#get-library-docs`: 특정 라이브러리의 문서 가져오기

## 💡 Context7 MCP 기능

### 🔍 실시간 문서 검색
- **최신 정보**: 실시간으로 업데이트되는 라이브러리 문서
- **버전별 문서**: 특정 버전의 API 문서 제공
- **코드 예제**: 실제 작동하는 코드 예제 포함

### 🎯 지원하는 주요 라이브러리
- **Frontend**: React, Vue, Angular, Next.js, Nuxt.js
- **Backend**: Node.js, Express, Fastify, NestJS
- **Database**: MongoDB, PostgreSQL, Supabase, Prisma
- **Cloud**: AWS, Google Cloud, Azure, Vercel
- **Tools**: Webpack, Vite, ESLint, Prettier

### ⚡ 성능 최적화
- **캐싱**: Redis를 통한 빠른 응답
- **토큰 제한**: 응답 크기 조절 가능
- **주제 필터링**: 특정 주제에 집중된 문서 검색

## 📚 고급 사용법

### 자동 규칙 설정

`.vscode/settings.json`에 규칙을 추가하여 Context7을 자동으로 호출할 수 있습니다:

```json
{
  "github.copilot.chat.codeGeneration.instructions": [
    {
      "text": "When providing code examples or library documentation, use Context7 to get the most up-to-date information."
    }
  ]
}
```

### 특정 라이브러리 ID 사용

라이브러리 ID를 알고 있다면 더 정확한 검색이 가능합니다:

```bash
"implement authentication with /supabase/supabase library"
"create middleware with /vercel/next.js routing"
"set up database with /mongodb/docs connection"
```

## 🔧 문제 해결

### MCP 서버가 시작되지 않는 경우
1. **VS Code 재시작**: MCP 설정 후 VS Code를 재시작
2. **권한 확인**: Upstash Redis 인스턴스의 접근 권한 확인
3. **로그 확인**: `MCP: Show Output` 명령으로 오류 로그 확인

### Context7 도구가 보이지 않는 경우
1. **Agent Mode 확인**: Copilot Chat이 Agent mode인지 확인
2. **도구 활성화**: Tools 버튼에서 Context7 도구들이 활성화되어 있는지 확인
3. **서버 재시작**: `MCP: List Servers`에서 context7 서버 재시작

### 응답이 느린 경우
- **토큰 수 조절**: 필요한 만큼만 토큰 수를 설정
- **주제 지정**: 특정 주제를 명시하여 검색 범위 축소
- **캐시 활용**: 같은 질문은 캐시된 결과 사용

## 🌟 베스트 프랙티스

### 1. 명확한 질문하기
```bash
❌ "How to use React?"
✅ "How to implement useEffect cleanup in React 18? use context7"
```

### 2. 라이브러리 버전 명시
```bash
❌ "Next.js routing"
✅ "Next.js 14 App Router file-based routing examples. use context7"
```

### 3. 구체적인 문제 상황
```bash
❌ "Database error"
✅ "Fix MongoDB connection timeout in Node.js Express app. use context7"
```

## 📖 참고 자료

- [Context7 공식 웹사이트](https://context7.com/)
- [VS Code MCP 서버 문서](https://code.visualstudio.com/docs/copilot/chat/mcp-servers)
- [Model Context Protocol 문서](https://modelcontextprotocol.io/)
- [Upstash Redis 문서](https://docs.upstash.com/redis)

---

이제 VS Code Copilot Chat에서 `use context7`를 추가하여 최신 라이브러리 문서와 함께 더 정확한 코딩 도움을 받을 수 있습니다! 🎉
