---
title: Bling-Bling project baseline
ingested: 2026-08-09
source_url: local://bling-bling/README.md-and-CLAUDE.md
kind: project-baseline
---

# Bling-Bling project baseline

이 raw source는 2026-08-09에 저장소의 `README.md`, `CLAUDE.md`, 최상위 구조를 확인해 만든 초기 기준선이다. 원문 문서는 저장소 루트에 유지하며, 이 파일은 Wiki의 초기 provenance용 요약 원본이다.

## 확인된 목적

볼링 동호회 화이트보드 사진에서 점수를 관리하고, 회원·게임 기록을 바탕으로 통계를 분석하는 웹 애플리케이션이다.

## 확인된 기술

- React 18, TypeScript, Vite, TailwindCSS
- React Router, React Hook Form, TanStack React Query
- Chart.js / react-chartjs-2
- Supabase PostgreSQL, Storage, Realtime, RLS
- Vitest, ESLint, Context7 MCP
- Vercel 배포 설정

## 확인된 기능 상태

- 수동 게임 입력, 회원 관리, 통계 대시보드, 데이터 가져오기 및 Supabase 연동은 구현된 기능으로 문서화되어 있다.
- OCR 기능과 일부 고급 통계 기능은 계획 또는 진행 중으로 문서화되어 있다.
- `src/`, `supabase/`, `scripts/`, `sheets/`, `images/`가 주요 작업 영역이다.

## 주의

- 문서의 “현재 상태” 날짜와 실제 코드 상태가 다를 수 있으므로, 구현 여부를 단정할 때는 소스 코드와 마이그레이션을 다시 확인한다.
- 환경변수 값, Supabase 키, 실제 회원정보는 이 Wiki에 저장하지 않는다.
