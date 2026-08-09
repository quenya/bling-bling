---
title: Bowling data model
created: 2026-08-09
updated: 2026-08-09
type: concept
tags: [project, bowling-domain, data-model, supabase, security]
sources: [raw/project-baseline.md]
confidence: medium
---

# Bowling data model

## 핵심 엔티티

| 엔티티 | 역할 |
|---|---|
| `members` | 동호회 회원과 가입 정보 |
| `game_sessions` | 특정 날짜·장소의 게임 세션 |
| `game_results` | 세션·회원·게임 번호별 점수 |
| `upload_history` | 이미지 업로드와 처리 이력 |

## 관계

```text
members 1 ── N game_results N ── 1 game_sessions
                         ↑
              upload_history (이미지 입력 이력)
```

실제 foreign key, nullable 여부, unique 제약, RLS 정책은 `supabase/migrations/`를 기준으로 확인해야 하며 이 페이지는 문서화된 개념 모델이다.

## 도메인 규칙 후보

- 한 세션은 여러 회원과 게임 결과를 가진다.
- 일반 입력 흐름은 최대 3게임 점수 기록을 전제로 한다.
- 회원별 평균·최고·최저·추세 통계는 `game_results`에서 계산된다.
- OCR 또는 Excel 입력은 저장 전에 이름 매칭과 점수 검증을 거쳐야 한다.

## 보안 경계

실제 회원 식별정보와 Supabase 인증/키 값은 Wiki에 기록하지 않는다. 데이터 접근은 Supabase RLS 정책과 애플리케이션의 권한 검사를 함께 확인해야 한다.

## 관련 페이지

- [[bling-bling]]
- [[bling-bling-architecture]]
- [[ocr-score-recognition]]
