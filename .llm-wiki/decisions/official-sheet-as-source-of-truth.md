---
title: Official Sheet as Result Source of Truth
created: 2026-08-09
updated: 2026-08-09
type: decision
tags: [project, bowling-domain, ocr, security, decision]
sources: [raw/2026-08-09-official-sheet-decision.md]
confidence: high
---

# Official Sheet as Result Source of Truth

## Decision

Bling-Bling 경기 결과 등록은 **공식 결과 Sheet를 기준 데이터(source of truth)**로 사용한다. 경기 결과 이미지의 OCR 자동 인식은 현재 신뢰성과 개인정보 보호 측면의 불확실성이 있어 운영 등록 경로로 사용하지 않는다.

## Consequences

- 공식 Sheet를 확인·정리한 뒤 수동 또는 검증된 import 절차로 `game_sessions`와 `game_results`에 반영한다.
- 원본 경기 결과 이미지는 공개 GitHub 저장소와 공개 Issue에 올리지 않고 외장하드의 비공개 경로에 보관한다.
- OCR 관련 Issue #3, #4, #5, #11은 모두 `not planned`로 종료했다.
- OCR 자동화는 별도 재검토 사항이며, 재개할 경우 정확도·실패 패턴·비식별화·보존 정책을 먼저 검증한다.

## Related

- [[ocr-score-recognition]]
- [[bowling-data-model]]
- [[bling-bling]]

## Evidence

- GitHub Issue #11 및 종료 댓글: [raw/2026-08-09-official-sheet-decision.md]
