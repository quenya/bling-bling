---
title: OCR score recognition
created: 2026-08-09
updated: 2026-08-09
type: concept
tags: [project, ocr, bowling-domain, frontend]
sources: [raw/project-baseline.md, raw/2026-08-09-official-sheet-decision.md]
confidence: low
---

# OCR score recognition

## 목적

볼링 화이트보드 사진에서 회원 이름과 점수를 자동 인식해 입력 부담을 낮추는 기능 후보였다. 2026-08-09 결정에 따라 현재는 운영 등록 경로로 사용하지 않으며, 공식 결과 Sheet를 기준 데이터로 삼는다.

## 권장 처리 흐름

```text
사진 확보 (비공개 보관)
  → Canvas 이미지 전처리
  → Tesseract.js OCR
  → 이름·점수 후보 파싱
  → 회원 매칭 및 점수 범위 검증
  → 사용자 검토·수정 (현재 미진행)
  → 별도 재검토
```

## 설계 원칙

- OCR 결과를 즉시 확정하지 않고 사용자가 검토한다.
- 원본 이미지는 Storage에 보관하되 접근 정책과 보존 기간을 명확히 한다.
- 인식 실패·수정 이력을 추적할 수 있도록 업로드 처리 상태를 남긴다.
- 이름 매칭 실패와 점수 파싱 실패를 별도 오류로 표시한다.

## 현재 불확실성

OCR 엔진·전처리 실험은 신뢰성과 개인정보 보호 우려로 중단했다. 공식 Sheet가 현재의 source of truth이며, OCR 자동화는 정확도·실패 패턴·비식별화·보존 정책을 포함한 별도 재검토 사항이다.

## 관련 페이지

- [[bling-bling]]
- [[bling-bling-architecture]]
- [[bowling-data-model]]
- [[official-sheet-as-source-of-truth]]
