# Roadmap: Fix Scrapers and Populate February Data

## Overview

Fix 4 broken cinema scrapers and run all high-priority scrapers to populate screening data through end of February 2026.

## Domain Expertise

Cinema web scraping - HTML parsing, API integration, Playwright automation

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

- [ ] **Phase 1: Diagnose Broken Scrapers** - Investigate why 4 scrapers produce no data
- [ ] **Phase 2: Fix Genesis Cinema** - Repair Genesis scraper (multi-page HTML)
- [ ] **Phase 3: Fix The Lexi Cinema** - Repair Lexi scraper (simple HTML)
- [ ] **Phase 4: Fix Phoenix Cinema** - Repair Phoenix scraper
- [ ] **Phase 5: Fix Castle Sidcup** - Repair Castle Sidcup scraper
- [ ] **Phase 6: Run High-Priority Scrapers** - Execute Curzon, Everyman, BFI, Barbican, Electric
- [ ] **Phase 7: Run Remaining Scrapers** - Execute all other scrapers for February data

## Phase Details

### Phase 1: Diagnose Broken Scrapers
**Goal**: Understand why Genesis, Lexi, Phoenix, and Castle Sidcup scrapers fail
**Depends on**: Nothing (first phase)
**Research**: Yes - need to inspect websites and compare to current scrapers
**Plans**: TBD

Target files:
- `src/scrapers/cinemas/genesis.ts`
- `src/scrapers/cinemas/lexi.ts`
- `src/scrapers/cinemas/phoenix.ts`
- `src/scrapers/cinemas/castle.ts`

### Phase 2: Fix Genesis Cinema
**Goal**: Repair Genesis scraper to produce valid screening data
**Depends on**: Phase 1 (diagnosis)
**Research**: Unlikely (will know issue from diagnosis)
**Plans**: TBD

### Phase 3: Fix The Lexi Cinema
**Goal**: Repair Lexi scraper to produce valid screening data
**Depends on**: Phase 1 (diagnosis)
**Research**: Unlikely
**Plans**: TBD

### Phase 4: Fix Phoenix Cinema
**Goal**: Repair Phoenix scraper to produce valid screening data
**Depends on**: Phase 1 (diagnosis)
**Research**: Unlikely
**Plans**: TBD

### Phase 5: Fix Castle Sidcup
**Goal**: Repair Castle Sidcup scraper to produce valid screening data
**Depends on**: Phase 1 (diagnosis)
**Research**: Unlikely
**Plans**: TBD

### Phase 6: Run High-Priority Scrapers
**Goal**: Execute main chain scrapers to populate February data
**Depends on**: Phases 2-5 (all fixes complete)
**Research**: No
**Plans**: TBD

Target commands:
- `npm run scrape:curzon`
- `npm run scrape:everyman`
- `npm run scrape:bfi`
- `npm run scrape:barbican`
- `npm run scrape:electric`

### Phase 7: Run Remaining Scrapers
**Goal**: Execute all other scrapers for comprehensive February coverage
**Depends on**: Phase 6
**Research**: No
**Plans**: TBD

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3 → 4 → 5 → 6 → 7

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Diagnose Broken Scrapers | 0/? | Not Started | — |
| 2. Fix Genesis Cinema | 0/? | Not Started | — |
| 3. Fix The Lexi Cinema | 0/? | Not Started | — |
| 4. Fix Phoenix Cinema | 0/? | Not Started | — |
| 5. Fix Castle Sidcup | 0/? | Not Started | — |
| 6. Run High-Priority Scrapers | 0/? | Not Started | — |
| 7. Run Remaining Scrapers | 0/? | Not Started | — |

**Milestone Status:** 0% complete
