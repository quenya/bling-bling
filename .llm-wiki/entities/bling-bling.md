---
title: Bling-Bling
created: 2026-08-09
updated: 2026-08-09
type: entity
tags: [project, frontend, bowling-domain, statistics]
sources: [raw/project-baseline.md]
confidence: medium
---

# Bling-Bling

## 개요

`bling-bling`은 볼링 동호회의 회원·게임·점수 기록을 관리하고 통계를 제공하는 React 기반 웹 애플리케이션이다. 초기 제품 방향은 화이트보드 사진을 OCR로 읽어 수동 입력을 줄이는 것이다.

## 현재 기술 경계

- 프론트엔드: React 18 + TypeScript + Vite + TailwindCSS
- 데이터/백엔드: Supabase PostgreSQL, Storage, Realtime, RLS
- 배포: Vercel 설정 포함
- 개발 보조: Context7 MCP, ESLint, Vitest

## 주요 도메인 기능

- 회원 등록·조회·수정 및 티어 계산
- 게임 세션과 3게임 점수 입력
- 개인·그룹·재미있는 통계
- Excel 데이터 가져오기와 Supabase 저장
- 향후 이미지 OCR 기반 점수 인식

## 관련 페이지

- [[bling-bling-architecture]]
- [[bowling-data-model]]
- [[ocr-score-recognition]]
