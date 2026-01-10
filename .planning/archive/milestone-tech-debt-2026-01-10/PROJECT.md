# High Priority Technical Debt

## What This Is

A focused cleanup of 3 high-priority security and stability concerns in the pictures.london codebase. Addressing missing input validation, rate limiting gaps, and error handling holes identified in the codebase analysis.

## Core Value

Prevent API crashes and abuse by ensuring all request bodies are validated with Zod schemas.

## Requirements

### Validated

- ✓ Cinema scraping pipeline with TMDB enrichment — existing
- ✓ User authentication via Clerk — existing
- ✓ Zustand state management with localStorage persistence — existing
- ✓ Screenings API with Zod validation — existing
- ✓ Rate limiting utility exists in codebase — existing
- ✓ Error handling patterns established (custom error classes) — existing

### Active

- [ ] Add Zod validation to admin API routes (`/api/admin/screenings/[id]`, `/api/admin/cinemas/[id]/config`)
- [ ] Apply rate limiting to public API routes (`/api/screenings`, `/api/search`, `/api/films/search`)
- [ ] Fix JSON parsing error handling in title-extractor

### Out of Scope

- Medium priority concerns (webhook validation, agent persistence, schema migrations) — deferred to future milestone
- Low priority concerns (component refactoring, scraper cleanup, documentation) — not in scope
- New features — this is purely technical debt reduction

## Context

The codebase analysis on 2026-01-10 identified 10 technical concerns. The 3 high-priority items all relate to input handling:

1. **Admin APIs** accept raw JSON without schema validation, risking crashes from malformed requests
2. **Public APIs** have no rate limiting despite a utility existing in `src/lib/rate-limit.ts`
3. **Title extractor** calls `JSON.parse()` on Claude responses without try-catch

Existing patterns to follow:
- `/api/screenings/route.ts` has proper Zod validation — use as template
- `src/lib/rate-limit.ts` has rate limiting implementation ready to apply
- Custom error classes exist in `src/lib/api-errors.ts`

## Constraints

- **Testing**: Each fix must include tests verifying the fix works
- **Pattern consistency**: Follow existing codebase patterns (Zod schemas, error handling)
- **Minimal changes**: Fix the issues, don't refactor surrounding code

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| High priority only | Focus on critical security/stability issues first | — Pending |
| Tests required | Verify fixes work and prevent regressions | — Pending |

---
*Last updated: 2026-01-10 after initialization*
