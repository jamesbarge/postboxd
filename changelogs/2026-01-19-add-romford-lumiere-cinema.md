# Add Romford Lumiere Cinema

**Date**: 2026-01-19

## Changes
- Added Lumiere Romford as a new independent cinema to the platform
- Created a Playwright-based scraper for the CineSync-powered website (Next.js)
- Added cinema to seed data with:
  - ID: `romford-lumiere`
  - 4 screens
  - Features: bar, accessible, community
  - Programming focus: mainstream, arthouse, repertory, events
  - Location: Mercury Gardens, Romford RM1 3EE (Borough of Havering)
- Added npm script: `npm run scrape:romford-lumiere`
- Updated `scrape:independents` to include the new scraper

## Technical Details

### Scraper Architecture
The scraper uses Playwright due to the CineSync/Next.js dynamic website structure:
- Navigates to the buy-tickets page
- Extracts film listings and their URLs
- Visits each film page to extract screening times
- Parses dates and times with AM/PM assumptions per project rules
- Scrapes screenings up until end of April as requested

### Files Changed
- `src/db/seed-cli.ts` - Added cinema to LONDON_CINEMAS array
- `src/scrapers/cinemas/romford-lumiere.ts` - New Playwright scraper
- `src/scrapers/run-romford-lumiere-v2.ts` - Runner script using runner-factory
- `package.json` - Added scrape:romford-lumiere script, updated scrape:independents

## Impact
- Users can now see screenings from Lumiere Romford in the calendar
- Expands coverage to the Borough of Havering in East London
- Adds another community-focused independent cinema to the platform
