# Project: Fix Scrapers and Populate February Data

## Overview

Fix broken cinema scrapers and run all high-priority scrapers to populate screening data through end of February 2026.

## Core Value

Ensure users can see complete cinema listings for all London venues through end of February.

## Requirements

### Validated

- Scraper infrastructure exists (BaseScraper, pipeline, utilities)
- Database schema supports screening storage
- 54 cinemas currently have some data

### Active

- [ ] Fix Genesis Cinema scraper (no data)
- [ ] Fix The Lexi Cinema scraper (no data)
- [ ] Fix Phoenix Cinema scraper (no data)
- [ ] Fix Castle Cinema Sidcup scraper (no data)
- [ ] Run Curzon scraper (10 venues, data ends mid-Jan)
- [ ] Run Everyman scraper (15 venues, data ends mid-Jan)
- [ ] Run BFI scraper (data ends mid-Jan)
- [ ] Run Barbican scraper (data ends Jan 17)
- [ ] Run Electric scraper (data ends Jan 15)
- [ ] Run all remaining scrapers for February data

### Out of Scope

- Adding new cinemas not already in the system
- Scraper performance optimization
- UI changes

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Fix broken scrapers first | No point running a scraper that doesn't work | Pending |
| Prioritize high-traffic venues | Curzon/Everyman/BFI are most popular | Pending |

## Technical Context

### Scraper Types
- **Playwright**: BFI, Curzon, Everyman (JS-heavy sites)
- **Cheerio/Fetch**: Most independents (static HTML)
- **API-based**: Picturehouse, Electric (fastest)

### Known Issues from Playbook
- Genesis: Multi-page HTML scraper, may have selector changes
- Lexi: Simple HTML scraper, likely selector drift
- Phoenix: Unknown - needs investigation
- Castle Sidcup: Unknown - needs investigation

### Database State (as of diagnostic)
- Total future screenings: 2,872
- Cinemas with no data: 4
- Cinemas with data ending mid-Jan: ~20

## Success Criteria

- [ ] All 4 broken scrapers fixed and producing data
- [ ] All high-priority scrapers run successfully
- [ ] Screening data available through Feb 28, 2026
- [ ] No regressions in working scrapers

---
*Last updated: 2026-01-10 after initialization*
