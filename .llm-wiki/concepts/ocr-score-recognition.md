---
title: OCR score recognition
created: 2026-08-09
updated: 2026-08-09
type: concept
tags: [project, ocr, bowling-domain, frontend]
sources: [raw/project-baseline.md]
confidence: low
---

# OCR score recognition

## 목적

볼링 화이트보드 사진에서 회원 이름과 점수를 자동 인식해 입력 부담을 낮추는 기능이다. 문서 기준으로는 Tesseract.js와 Canvas API 기반의 계획 또는 진행 중 기능이다.

## 권장 처리 흐름

```text
사진 업로드
  → Canvas 이미지 전처리
  → Tesseract.js OCR
  → 이름·점수 후보 파싱
  → 회원 매칭 및 점수 범위 검증
  → 사용자 검토·수정
  → game_sessions / game_results 저장
  → upload_history 기록
```

## 설계 원칙

- OCR 결과를 즉시 확정하지 않고 사용자가 검토한다.
- 원본 이미지는 Storage에 보관하되 접근 정책과 보존 기간을 명확히 한다.
- 인식 실패·수정 이력을 추적할 수 있도록 업로드 처리 상태를 남긴다.
- 이름 매칭 실패와 점수 파싱 실패를 별도 오류로 표시한다.

## 현재 불확실성

실제 OCR 구현 여부, 전처리 파라미터, 저장 스키마는 소스 코드와 Supabase migration을 추가 점검해야 한다. 현재 페이지는 제품 문서에 기반한 설계 지식이며 구현 완료를 의미하지 않는다.

## 관련 페이지

- [[bling-bling]]
- [[bling-bling-architecture]]
- [[bowling-data-model]]
