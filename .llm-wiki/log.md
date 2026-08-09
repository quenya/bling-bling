# Bling-Bling Project Wiki Log

> Chronological record of project-wiki actions. Append-only.
> Format: `## [YYYY-MM-DD] action | subject`

## [2026-08-09] create | Project LLM Wiki initialized

- Repository: `quenya/bling-bling`
- Path: `/Volumes/Seagate500/project/js/bling-bling`
- Created `SCHEMA.md`, `index.md`, `log.md`
- Created initial baseline raw source and four synthesis pages
- Existing working-tree changes were preserved; no existing project files were modified

## [2026-08-09] decision | Official Sheet as result source of truth

- Closed GitHub Issue #11 as `not planned` after deciding OCR is not reliable enough for result registration.
- Kept original match images in private external-disk storage; no public repository or Issue upload.
- Created decision page: `decisions/official-sheet-as-source-of-truth.md`
- Updated concept page: `concepts/ocr-score-recognition.md`
- Added immutable raw source: `raw/2026-08-09-official-sheet-decision.md`
- Official result Sheets are now the source of truth for `game_sessions` and `game_results` registration.

## [2026-08-09] decision | Close OCR implementation issues

- Closed Issues #3, #4, and #5 as `not planned`.
- Their image-upload, OCR-engine, and OCR-review/database-save scopes are superseded by the official-Sheet source-of-truth decision.
- Added the closure rationale to each issue without storing private match images in GitHub.
