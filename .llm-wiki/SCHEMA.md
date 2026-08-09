# Project LLM Wiki Schema

## Domain

`bling-bling` 볼링 동호회 점수 관리·통계 분석 웹 애플리케이션의 코드, 데이터 모델, OCR, 운영, 의사결정을 관리한다.

## Storage Policy

- `.llm-wiki/`는 에이전트가 관리하는 프로젝트 지식 원본이다.
- `README.md`, `CLAUDE.md`, 소스 코드, 마이그레이션, 이슈·PR에서 확인한 사실을 raw source와 synthesis page로 정리한다.
- 비밀값, 토큰, 실제 회원 개인정보, Supabase 키 값은 저장하지 않는다. 필요한 경우 구조와 마스킹된 식별자만 기록한다.
- 공식 사용자 문서는 `README.md`와 `docs/`가 담당하고, `.llm-wiki/`는 개발·운영·의사결정의 누적 지식에 집중한다.

## Page Types

- `entity`: 프로젝트·서비스·외부 시스템
- `concept`: 아키텍처·도메인·데이터 흐름·기술 개념
- `decision`: 중요한 설계 결정
- `incident`: 장애와 원인 분석
- `runbook`: 반복 운영 절차
- `query`: 재사용 가치가 있는 분석 결과
- `summary`: 여러 자료의 종합 요약

## Conventions

- 파일명은 읽기 쉬운 kebab-case를 사용한다.
- 모든 synthesis page는 YAML frontmatter를 사용한다.
- 모든 신규·수정 페이지는 가능한 한 2개 이상의 상호 링크를 갖는다.
- 코드 관련 사실에는 파일 경로와 확인 시점을 기록한다.
- 확정된 사실과 추론·미확인 사항을 구분한다.
- `index.md`와 `log.md`를 모든 변경에 맞춰 갱신한다.
- raw source는 수정하지 않고 새 버전으로 추가한다.

## Frontmatter

```yaml
---
title: Page Title
created: YYYY-MM-DD
updated: YYYY-MM-DD
type: entity | concept | decision | incident | runbook | query | summary
tags: [project, architecture]
sources: [raw/project-baseline.md]
confidence: high | medium | low
---
```

## Tag Taxonomy

- `project`: 프로젝트 자체
- `frontend`: React/Vite 프론트엔드
- `typescript`: TypeScript 코드
- `supabase`: Supabase/PostgreSQL/Storage/Realtime
- `data-model`: 데이터 모델과 마이그레이션
- `bowling-domain`: 볼링 도메인 규칙
- `statistics`: 통계·랭킹·분석
- `ocr`: 이미지 OCR과 전처리
- `mcp`: MCP 서버·도구 통합
- `deployment`: Vercel 및 배포
- `security`: RLS·시크릿·보안
- `testing`: 테스트·검증
- `operations`: 운영 절차
- `decision`: 설계 결정
- `incident`: 장애 분석
- `documentation`: 문서

## Page Thresholds

- 프로젝트 핵심 구조·도메인·데이터 흐름은 중앙 문서 하나만 있어도 페이지를 만든다.
- 단순 파일 나열이나 일회성 메모는 raw에만 기록할 수 있다.
- 페이지가 200줄을 넘으면 주제를 분리한다.
- 같은 사실이 새 문서와 충돌하면 날짜와 출처를 함께 기록하고 조용히 덮어쓰지 않는다.
