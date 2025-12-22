# FilmCal2: London Cinema Calendar
## Product Requirements Document

**Version:** 1.0
**Last Updated:** December 2024
**Author:** Marcus (Product Manager)

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Feature List](#2-feature-list)
3. [London Cinemas](#3-london-cinemas)
4. [Data Models](#4-data-models)
5. [UI/UX Direction](#5-uiux-direction)
6. [Technical Architecture](#6-technical-architecture)
7. [Implementation Roadmap](#7-implementation-roadmap)
8. [Success Metrics](#8-success-metrics)

---

## 1. Executive Summary

### 1.1 Vision

FilmCal2 is the definitive cinema calendar for London cinephiles - a beautifully-designed, deeply personal tool that ensures you never miss a film worth seeing. In a world of algorithmic streaming recommendations and corporate booking platforms, FilmCal2 respects how real film lovers actually discover and plan their viewing.

This is not another listings aggregator. It is a curated, customizable experience that feels like a cinephile's personal notebook - one that happens to know about every 35mm print, every Herzog retrospective, and every midnight screening of The Room happening across London.

### 1.2 Target Users

**Primary Persona: The Dedicated Cinephile**
- Attends 2-5 cinema screenings per week
- Has strong preferences about venues (knows which screens have the best projection)
- Actively seeks repertory programming, restorations, and special events
- Currently juggles multiple cinema websites, newsletters, and social media accounts
- Values the theatrical experience over streaming
- Often plans viewing weeks in advance around repertory seasons

**Secondary Persona: The Curious Explorer**
- Attends cinema 2-4 times per month
- Open to discovering repertory and independent cinema
- Overwhelmed by the fragmented London cinema landscape
- Wants recommendations but not algorithmic ones
- Values curation and context over convenience

**Tertiary Persona: The Event Organizer**
- Plans group cinema outings
- Needs to coordinate availability across multiple people
- Values sharing and social features
- Often books for special occasions

### 1.3 Value Proposition

| Current Pain Point | FilmCal2 Solution |
|-------------------|-------------------|
| Checking 10+ cinema websites weekly | Single unified calendar across all selected venues |
| Missing repertory screenings you'd love | Smart filtering by era, director, genre; "want to see" watchlist |
| No memory of what you've seen | Personal viewing history with notes |
| Forgetting screening times | Calendar integration, push notifications |
| Information overload from new releases | Filter to show only repertory/classics |
| Generic, corporate booking interfaces | Cinephile-first design that celebrates film culture |
| Scattered film information | Rich metadata: director, year, runtime, format, synopsis |

### 1.4 Competitive Landscape

| Competitor | Strengths | Weaknesses | Our Differentiation |
|-----------|-----------|------------|---------------------|
| Individual cinema websites | Accurate, bookable | Fragmented, no unified view | Aggregation across venues |
| Time Out London | Good coverage | Generic design, cluttered | Cinephile-focused curation |
| Letterboxd | Strong social, film tracking | No showtimes, no calendar | Screening-centric + tracking |
| IMDb Showtimes | Wide coverage | Poor UX, ads, no personalization | Beautiful UX, deep customization |
| Google Movies | Convenient | Soulless, chain-focused | Independent cinema focus |

---

## 2. Feature List

### 2.1 Core Calendar Features

#### F-001: Multi-Cinema Unified Calendar
**Priority:** P0 (MVP)
**Description:** Display all screenings across user-selected cinemas in a single, unified calendar view.

**User Story:**
As a cinephile, I want to see all screenings from my favorite cinemas in one place, so I don't have to visit multiple websites to plan my week.

**Acceptance Criteria:**
- [ ] User can view 30-day rolling calendar of screenings
- [ ] Screenings grouped by date with clear visual hierarchy
- [ ] Each screening shows: film title, cinema, time, screen/format info
- [ ] Calendar updates daily (overnight sync)
- [ ] Empty states handled gracefully ("No screenings match your filters")
- [ ] Loading states feel cinematic, not frustrating

**Edge Cases:**
- Film showing at multiple venues on same day: Group by film with venue sub-listings
- Cinema with no listings (technical issue): Show last-updated timestamp, graceful degradation
- Very long film titles: Truncate with ellipsis, full title on hover/tap

---

#### F-002: Calendar View Modes
**Priority:** P0 (MVP)
**Description:** Multiple ways to view the calendar data based on user preference.

**User Story:**
As a user, I want to switch between different calendar views so I can plan my viewing in the way that suits me best.

**Acceptance Criteria:**
- [ ] **Day View:** All screenings for a single day, grouped by time
- [ ] **Week View:** 7-day spread, scrollable, condensed screening info
- [ ] **Month View:** Traditional calendar grid with screening counts per day
- [ ] **List View:** Chronological list of all screenings (default)
- [ ] View preference persists across sessions
- [ ] Smooth transitions between views

---

#### F-003: Cinema Selection & Management
**Priority:** P0 (MVP)
**Description:** Users select which cinemas appear in their calendar from the available London venues.

**User Story:**
As a user, I want to add and remove cinemas from my calendar so I only see screenings at venues I actually attend.

**Acceptance Criteria:**
- [ ] Onboarding flow presents all available cinemas with helpful descriptions
- [ ] Quick-select for common groupings ("All BFI venues", "East London independents")
- [ ] Cinema cards show: name, location, brief description, sample programming type
- [ ] Changes take effect immediately on calendar
- [ ] Settings page allows modification at any time
- [ ] Minimum 1 cinema required; maximum unlimited

---

#### F-004: Film Detail View
**Priority:** P0 (MVP)
**Description:** Rich information display for each film with all scheduled screenings.

**User Story:**
As a cinephile, I want to see comprehensive information about a film and all its upcoming screenings so I can decide when and where to see it.

**Acceptance Criteria:**
- [ ] Film poster (high resolution, fallback to placeholder)
- [ ] Title, year, director, runtime, country
- [ ] Genre tags
- [ ] Synopsis (expandable if long)
- [ ] All upcoming screenings across selected cinemas
- [ ] Screening format info (35mm, 70mm, DCP, etc.) when available
- [ ] Direct booking links to cinema websites
- [ ] TMDB/Letterboxd external links
- [ ] Personal status indicator (seen/want to see/not interested)

---

### 2.2 Filtering & Search

#### F-005: Smart Filtering System
**Priority:** P0 (MVP)
**Description:** Powerful filters to narrow down screenings to exactly what the user wants.

**User Story:**
As a repertory enthusiast, I want to filter out new releases and only see classic films so I can focus on the programming I care about.

**Acceptance Criteria:**
- [ ] **Programming Type:** Repertory/Classic, New Release, Special Event, Preview
- [ ] **Decade:** Pre-1950, 1950s, 1960s, 1970s, 1980s, 1990s, 2000s, 2010s, 2020s
- [ ] **Genre:** Drama, Comedy, Horror, Documentary, Sci-Fi, Animation, etc.
- [ ] **Format:** 35mm, 70mm, DCP, 4K, IMAX
- [ ] **Time of Day:** Morning, Afternoon, Evening, Late Night
- [ ] **Day of Week:** Weekday, Weekend, specific days
- [ ] **Personal Status:** Hide seen, Hide "not interested"
- [ ] Filters combinable (AND logic)
- [ ] Active filters clearly displayed with easy removal
- [ ] Filter state persists across sessions
- [ ] "Clear all filters" option

---

#### F-006: Director/Actor Filtering
**Priority:** P1
**Description:** Filter screenings by specific filmmakers or actors.

**User Story:**
As a director devotee, I want to see all upcoming screenings of films by my favorite directors so I never miss a chance to see their work on the big screen.

**Acceptance Criteria:**
- [ ] Searchable director input with autocomplete
- [ ] Multiple directors selectable (OR logic within, AND with other filters)
- [ ] Actor filtering with same functionality
- [ ] "Following" list of directors for quick filter access
- [ ] Notifications when followed director's film is programmed (P2)

---

#### F-007: Full-Text Search
**Priority:** P0 (MVP)
**Description:** Search across all film data.

**User Story:**
As a user, I want to search for specific films by title so I can quickly find if and when they're showing.

**Acceptance Criteria:**
- [ ] Search box prominently placed
- [ ] Searches: title, director, actor, cinema name
- [ ] Results appear as-you-type (debounced)
- [ ] Results grouped by type (Films, Cinemas, Directors)
- [ ] Recent searches saved locally
- [ ] "No results" state with helpful suggestions

---

### 2.3 Personal Features

#### F-008: Personal Status Tracking
**Priority:** P0 (MVP)
**Description:** Mark films with personal viewing status.

**User Story:**
As a cinephile who sees many films, I want to track which films I've seen and which I want to see so I can focus on new discoveries.

**Acceptance Criteria:**
- [ ] Three statuses: "Want to See", "Seen", "Not Interested"
- [ ] Status changeable from any film card or detail view
- [ ] Quick visual indicators on calendar/list views
- [ ] "Seen" films optionally hidden from calendar
- [ ] "Not Interested" films optionally hidden
- [ ] Status data stored locally (MVP), synced with account (P1)

---

#### F-009: Viewing History & Notes
**Priority:** P1
**Description:** Log when and where you saw films with personal notes.

**User Story:**
As a dedicated film-goer, I want to record my viewing history with notes so I can remember my experiences and track my cinema habits.

**Acceptance Criteria:**
- [ ] When marking "Seen," prompt for date and venue
- [ ] Optional star rating (1-5)
- [ ] Optional personal notes field
- [ ] Viewing history page with statistics
- [ ] Stats: films per month, favorite cinemas, genres watched
- [ ] Export viewing history (CSV, JSON)

---

#### F-010: Watchlist
**Priority:** P0 (MVP)
**Description:** Dedicated view for films marked "Want to See."

**User Story:**
As a planner, I want a dedicated watchlist view so I can easily see which films on my list are currently showing.

**Acceptance Criteria:**
- [ ] Watchlist page showing all "Want to See" films
- [ ] Films with upcoming screenings prominently featured
- [ ] Films without current screenings shown in separate section
- [ ] Sort by: date added, next screening, alphabetical
- [ ] "Currently Showing" badge for films with screenings
- [ ] One-tap to see all screenings for a watchlist film

---

### 2.4 Calendar Integration

#### F-011: External Calendar Export
**Priority:** P1
**Description:** Add screenings to personal calendars.

**User Story:**
As an organized person, I want to add screenings to my Google/Apple Calendar so I don't forget about them and can coordinate with other plans.

**Acceptance Criteria:**
- [ ] Single screening: "Add to Calendar" button
- [ ] Generates .ics file or direct calendar links
- [ ] Calendar event includes: film title, cinema, time, booking link
- [ ] Google Calendar, Apple Calendar, Outlook support
- [ ] Optional: recurring calendar feed for watchlist screenings

---

#### F-012: Availability Planning
**Priority:** P2
**Description:** Mark times when you're available to go to cinema.

**User Story:**
As someone with a busy schedule, I want to mark when I'm free so the app can highlight screenings that fit my availability.

**Acceptance Criteria:**
- [ ] Calendar overlay to mark available time slots
- [ ] Screenings matching availability visually highlighted
- [ ] "Show only available times" filter option
- [ ] Weekly recurring availability patterns

---

### 2.5 Notifications

#### F-013: Screening Reminders
**Priority:** P1
**Description:** Reminders for screenings of interest.

**User Story:**
As a forgetful person, I want to get reminders about screenings I'm interested in so I don't miss them.

**Acceptance Criteria:**
- [ ] Set reminder from any screening (24h, 2h, 30min before)
- [ ] Push notification with film, time, venue
- [ ] Notification links directly to screening/booking
- [ ] Reminder preferences configurable globally

---

#### F-014: Watchlist Alerts
**Priority:** P2
**Description:** Notifications when watchlist films get scheduled.

**User Story:**
As a patient film lover, I want to be notified when a film on my watchlist is programmed at one of my cinemas so I can plan to see it.

**Acceptance Criteria:**
- [ ] Alert when watchlist film appears in listings
- [ ] Configurable: immediate, daily digest, weekly digest
- [ ] Include all screening times in notification
- [ ] One-tap to view film detail page

---

#### F-015: Season/Retrospective Alerts
**Priority:** P2
**Description:** Notifications for new repertory seasons.

**User Story:**
As a repertory fan, I want to know when new seasons are announced (Hitchcock retrospective, etc.) so I can plan ahead.

**Acceptance Criteria:**
- [ ] Detect and categorize repertory seasons from listings
- [ ] Notify when new season detected at subscribed cinema
- [ ] Season page showing all films in the season
- [ ] "Add all to watchlist" functionality

---

### 2.6 Social Features

#### F-016: Screening Sharing
**Priority:** P1
**Description:** Share screenings with friends.

**User Story:**
As a social cinema-goer, I want to easily share screening info with friends so we can plan to go together.

**Acceptance Criteria:**
- [ ] Share button on screenings and films
- [ ] Native share sheet (mobile)
- [ ] Copy link functionality
- [ ] Shared link opens app/web with full context
- [ ] Optional: include personal message

---

#### F-017: Group Planning (Future)
**Priority:** P3
**Description:** Coordinate cinema visits with friends.

**User Story:**
As a group organizer, I want to find screenings that work for multiple people so we can plan outings together.

**Acceptance Criteria:**
- [ ] Create group with invited members
- [ ] Members mark availability
- [ ] System suggests screenings matching group availability
- [ ] Voting on screening options
- [ ] Group chat/discussion

---

### 2.7 Data & Import

#### F-018: Letterboxd Integration
**Priority:** P2
**Description:** Import watchlist and diary from Letterboxd.

**User Story:**
As a Letterboxd user, I want to import my watchlist so I don't have to rebuild it manually.

**Acceptance Criteria:**
- [ ] Letterboxd OAuth or CSV import
- [ ] Import watchlist as "Want to See"
- [ ] Import diary as "Seen" with dates
- [ ] Match films to our database (fuzzy matching)
- [ ] Show match confidence, allow manual corrections
- [ ] One-time or recurring sync options

---

#### F-019: Manual Film Addition
**Priority:** P2
**Description:** Add films not in database to personal lists.

**User Story:**
As a thorough tracker, I want to add films I've seen that aren't in the database so my history is complete.

**Acceptance Criteria:**
- [ ] Search TMDB for any film
- [ ] Add to personal lists even if no current screenings
- [ ] Notification if film later gets scheduled

---

### 2.8 Discovery Features

#### F-020: "On This Day" Feature
**Priority:** P2
**Description:** Show films with anniversaries and historical context.

**User Story:**
As a film history enthusiast, I want to see what films premiered on today's date so I can discover cinema history.

**Acceptance Criteria:**
- [ ] Daily "On This Day" section showing anniversary films
- [ ] Highlight if any are currently screening
- [ ] Link to film detail and screening info

---

#### F-021: Curated Collections
**Priority:** P3
**Description:** Editorial collections highlighting themes and connections.

**User Story:**
As a curious viewer, I want curated lists that help me discover films I might not find on my own.

**Acceptance Criteria:**
- [ ] Staff-curated collections ("Essential Film Noir," "London on Screen")
- [ ] Algorithmically-generated based on viewing history
- [ ] Show which collection films are currently screening
- [ ] Subscribe to collections for alerts

---

---

## 3. London Cinemas

### 3.1 Priority Tier 1: Essential (MVP)

These are the core repertory and independent cinemas that define London film culture.

| Cinema | Location | Focus | Data Source Strategy |
|--------|----------|-------|---------------------|
| **BFI Southbank** | South Bank, SE1 | Repertory, seasons, restorations | Web scraping (whatson.bfi.org.uk) + manual curation |
| **BFI IMAX** | Waterloo, SE1 | Large format, events | Same as BFI Southbank |
| **Prince Charles Cinema** | Leicester Square, WC2 | Cult classics, sing-alongs, marathons | Web scraping (princecharlescinema.com) |
| **ICA Cinema** | The Mall, SW1 | Art house, experimental, premieres | Web scraping (ica.art/films) |
| **Barbican Cinema** | Barbican, EC2 | International, seasons, events | Web scraping (barbican.org.uk/whats-on/cinema) |
| **Rio Cinema** | Dalston, E8 | Community, repertory, indie | Web scraping (riocinema.org.uk) |
| **Genesis Cinema** | Mile End, E1 | Eclectic, independent, affordable | Web scraping (genesiscinema.co.uk) |

### 3.2 Priority Tier 2: Important Chains

| Cinema Chain | Venues | Focus | Data Source Strategy |
|--------------|--------|-------|---------------------|
| **Curzon** | Soho, Mayfair, Bloomsbury, Victoria, Aldgate, etc. | Art house, premieres, new releases | UK Cinema API or web scraping |
| **Picturehouse** | Multiple London locations | Art house, events, kids | UK Cinema API or picturehouse_uk gem |
| **Everyman** | Multiple London locations | Premium, events, classics | UK Cinema API |

### 3.3 Priority Tier 3: Valuable Additions

| Cinema | Location | Focus | Data Source Strategy |
|--------|----------|-------|---------------------|
| **Ciné Lumière** | South Kensington, SW7 | French, European cinema | Web scraping |
| **Garden Cinema** | Covent Garden, WC2 | Boutique, curated | Web scraping |
| **Regent Street Cinema** | West End, W1 | Heritage, classic, events | Web scraping |
| **Lexi Cinema** | Kensal Rise, NW10 | Community, charity, curated | Web scraping |
| **Electric Cinema** | Portobello, W11 | Luxury, classics | Web scraping |
| **Screen on the Green** | Islington, N1 | Art house (Everyman) | Via Everyman |
| **Close-Up Cinema** | Shoreditch, E2 | Independent, micro-cinema | Web scraping/manual |

### 3.4 Priority Tier 4: Major Chains (Lower Priority)

| Cinema Chain | Notes | Data Source Strategy |
|--------------|-------|---------------------|
| **Odeon** | Leicester Square for premieres/IMAX | UK Cinema API |
| **Vue** | West End for IMAX/premium formats | UK Cinema API |
| **Cineworld** | Leicester Square IMAX, formats | UK Cinema API |

### 3.5 Data Source Analysis

#### Commercial APIs

| Provider | Coverage | Pricing | Pros | Cons |
|----------|----------|---------|------|------|
| **UK Cinema API** | Odeon, Cineworld, Vue, Everyman, Picturehouse, Curzon, etc. | TBD (competitive) | Good chain coverage, daily updates, TMDB/IMDB matching | May not cover key independents (BFI, PCC, Rio) |
| **International Showtimes** | 120+ countries | From EUR149/month/market | Comprehensive data | Expensive for indie project, may lack London independents |
| **Film Chase (RapidAPI)** | Major UK chains | ~$50/month | Affordable, good extras | Limited independent coverage |

#### Open/Free Resources

| Resource | Use Case | Limitations |
|----------|----------|-------------|
| **TMDB API** | Film metadata, posters, cast | Free with attribution; no showtimes |
| **OMDB API** | Backup metadata source | Limited requests on free tier |
| **Letterboxd** | Social data, ratings | No official API, scraping TOS issues |

#### Recommended Strategy

1. **MVP:** Web scraping for Tier 1 independents + UK Cinema API trial for chains
2. **Scale:** Evaluate UK Cinema API full subscription vs. expanded scraping
3. **Metadata:** TMDB for all film information (free, comprehensive)
4. **Backup:** Build scraping infrastructure for independence from paid APIs

---

## 4. Data Models

### 4.1 Cinema

```typescript
interface Cinema {
  id: string;                    // Unique identifier (slug: "bfi-southbank")
  name: string;                  // Display name
  shortName: string;             // Abbreviated ("BFI")
  chain?: string;                // Parent chain if applicable

  // Location
  address: {
    street: string;
    area: string;                // "South Bank"
    postcode: string;
    borough: string;             // "Southwark"
  };
  coordinates: {
    lat: number;
    lng: number;
  };

  // Transport
  nearestTube?: string[];
  nearestRail?: string[];
  busRoutes?: string[];

  // Characteristics
  screens: number;
  features: CinemaFeature[];     // ["35mm", "70mm", "IMAX", "Dolby Atmos", "Bar"]
  programmingFocus: ProgrammingType[];  // ["repertory", "arthouse", "mainstream"]

  // URLs
  website: string;
  bookingUrl: string;
  socialMedia?: {
    twitter?: string;
    instagram?: string;
  };

  // Data sourcing
  dataSource: {
    type: "api" | "scrape" | "manual";
    endpoint?: string;
    lastUpdated: Date;
    updateFrequency: "hourly" | "daily" | "weekly";
  };

  // Metadata
  description: string;           // Editorial description
  imageUrl?: string;             // Venue photo
  isActive: boolean;
  addedAt: Date;
  updatedAt: Date;
}

type CinemaFeature =
  | "35mm"
  | "70mm"
  | "IMAX"
  | "Dolby Atmos"
  | "Dolby Cinema"
  | "4DX"
  | "bar"
  | "restaurant"
  | "accessible"
  | "hearing_loop"
  | "audio_description";

type ProgrammingType =
  | "repertory"
  | "arthouse"
  | "mainstream"
  | "documentary"
  | "experimental"
  | "family"
  | "events";
```

### 4.2 Film

```typescript
interface Film {
  id: string;                    // Internal ID
  tmdbId?: number;               // TMDB reference
  imdbId?: string;               // IMDB reference

  // Core info
  title: string;
  originalTitle?: string;        // If different from English title
  year: number;
  runtime?: number;              // Minutes

  // Credits
  director: string[];
  cast: CastMember[];

  // Classification
  genres: Genre[];
  countries: string[];           // Country codes
  languages: string[];

  // Certification
  certification?: string;        // "15", "PG", "U", etc.
  certificationBody?: string;    // "BBFC"

  // Content
  synopsis?: string;
  tagline?: string;

  // Media
  posterUrl?: string;
  backdropUrl?: string;
  trailerUrl?: string;

  // Categorization
  isRepertory: boolean;          // vs. new release
  releaseStatus: "theatrical" | "restoration" | "revival" | "preview";
  decade: string;                // "1970s"

  // External ratings (optional enrichment)
  tmdbRating?: number;
  letterboxdUrl?: string;

  // Metadata
  createdAt: Date;
  updatedAt: Date;
}

interface CastMember {
  name: string;
  character?: string;
  order: number;
  tmdbId?: number;
}

type Genre =
  | "action"
  | "adventure"
  | "animation"
  | "comedy"
  | "crime"
  | "documentary"
  | "drama"
  | "experimental"
  | "family"
  | "fantasy"
  | "horror"
  | "musical"
  | "mystery"
  | "romance"
  | "scifi"
  | "thriller"
  | "war"
  | "western";
```

### 4.3 Screening

```typescript
interface Screening {
  id: string;                    // Unique identifier

  // References
  filmId: string;
  cinemaId: string;

  // Timing
  datetime: Date;                // Start time
  endTime?: Date;                // Calculated from runtime

  // Screen info
  screen?: string;               // "NFT1", "Screen 2"
  format?: ScreeningFormat;
  is3D: boolean;

  // Event info
  isSpecialEvent: boolean;
  eventType?: EventType;
  eventDescription?: string;     // "With intro by director"
  season?: string;               // "Hitchcock: Master of Suspense"

  // Booking
  bookingUrl: string;
  ticketPrice?: {
    standard?: number;
    member?: number;
    concession?: number;
  };
  isSoldOut: boolean;

  // Accessibility
  hasSubtitles: boolean;
  subtitleLanguage?: string;
  hasAudioDescription: boolean;
  isRelaxedScreening: boolean;

  // Metadata
  sourceId: string;              // Original ID from cinema
  scrapedAt: Date;
  updatedAt: Date;
}

type ScreeningFormat =
  | "35mm"
  | "70mm"
  | "70mm_imax"
  | "dcp"
  | "dcp_4k"
  | "imax"
  | "imax_laser"
  | "dolby_cinema"
  | "4dx"
  | "screenx"
  | "unknown";

type EventType =
  | "q_and_a"
  | "intro"
  | "discussion"
  | "double_bill"
  | "marathon"
  | "singalong"
  | "quote_along"
  | "preview"
  | "premiere"
  | "restoration_premiere"
  | "anniversary"
  | "members_only";
```

### 4.4 User

```typescript
interface User {
  id: string;

  // Profile
  email: string;
  displayName?: string;
  avatarUrl?: string;

  // Preferences
  selectedCinemas: string[];     // Cinema IDs
  defaultView: "day" | "week" | "month" | "list";

  // Filter defaults
  defaultFilters: {
    hideNewReleases: boolean;
    hideSeen: boolean;
    hideNotInterested: boolean;
    formats?: ScreeningFormat[];
    timePreference?: "morning" | "afternoon" | "evening" | "late";
  };

  // Notification preferences
  notifications: {
    enabled: boolean;
    watchlistAlerts: boolean;
    reminderDefault: number;     // Minutes before screening
    digestFrequency: "realtime" | "daily" | "weekly";
  };

  // Following
  followedDirectors: string[];
  followedGenres: Genre[];

  // Metadata
  createdAt: Date;
  lastActiveAt: Date;

  // Subscription (future)
  subscription?: {
    tier: "free" | "supporter" | "patron";
    expiresAt?: Date;
  };
}
```

### 4.5 UserFilmStatus

```typescript
interface UserFilmStatus {
  id: string;
  userId: string;
  filmId: string;

  // Status
  status: "want_to_see" | "seen" | "not_interested";

  // Viewing record (if seen)
  viewingRecord?: {
    date: Date;
    cinemaId?: string;
    screeningId?: string;        // If linked to specific screening
    format?: ScreeningFormat;
    rating?: number;             // 1-5
    notes?: string;
    isRewatch: boolean;
  }[];

  // Watchlist metadata
  addedToWatchlistAt?: Date;
  watchlistPriority?: number;    // User-defined ordering

  // Metadata
  createdAt: Date;
  updatedAt: Date;
}
```

### 4.6 Season/Collection

```typescript
interface Season {
  id: string;
  cinemaId: string;

  // Info
  name: string;                  // "Hitchcock: Master of Suspense"
  description?: string;
  imageUrl?: string;

  // Dates
  startDate: Date;
  endDate: Date;

  // Content
  filmIds: string[];
  screeningIds: string[];

  // Metadata
  isActive: boolean;
  createdAt: Date;
}
```

---

## 5. UI/UX Direction

### 5.1 Design Philosophy

FilmCal2's design should feel like a cinephile's well-worn notebook crossed with a beautifully-printed film programme. We're not building a corporate booking system; we're building a tool for people who genuinely love cinema.

**Core Principles:**
1. **Cinematic, not theatrical:** Evoke the experience of watching films, not the lobby of a multiplex
2. **Information-dense but scannable:** Cinephiles want data; present it hierarchically
3. **Posters as first-class citizens:** Film art deserves prominence and respect
4. **Dark mode default:** We live in the dark; the UI should feel natural there
5. **Progressive disclosure:** Simple surface, depth on demand
6. **Personality over polish:** Small touches that show we care (film quotes in loading states, etc.)

### 5.2 Visual Language

#### Color Palette

**Dark Mode (Primary):**
```css
--bg-primary: #0D0D0D;           /* Deep black, theater darkness */
--bg-secondary: #1A1A1A;         /* Card backgrounds */
--bg-tertiary: #262626;          /* Elevated surfaces */
--bg-hover: #333333;             /* Hover states */

--text-primary: #F5F5F5;         /* High contrast text */
--text-secondary: #A3A3A3;       /* Supporting text */
--text-tertiary: #737373;        /* Subdued text */

--accent-gold: #C9A227;          /* Film reel gold, awards */
--accent-red: #B91C1C;           /* Urgency, sold out */
--accent-blue: #3B82F6;          /* Links, interactive */
--accent-green: #22C55E;         /* Success, available */

--border-subtle: #2E2E2E;        /* Subtle dividers */
--border-emphasis: #404040;      /* Emphasized borders */
```

**Light Mode (Secondary):**
```css
--bg-primary: #FAFAF9;           /* Warm off-white, like aged paper */
--bg-secondary: #F5F5F4;         /* Card backgrounds */
--bg-tertiary: #E7E5E4;          /* Elevated surfaces */

--text-primary: #1C1917;         /* Rich black */
--text-secondary: #57534E;       /* Supporting text */
--accent-gold: #A17D1A;          /* Adjusted for light mode */
```

**Semantic Colors:**
```css
--status-want-to-see: #3B82F6;   /* Blue bookmark */
--status-seen: #22C55E;          /* Green checkmark */
--status-not-interested: #737373; /* Gray dismiss */

--format-35mm: #C9A227;          /* Gold for celluloid */
--format-70mm: #DC2626;          /* Red for premium */
--format-imax: #2563EB;          /* Blue for IMAX */
```

#### Typography

**Font Stack:**
```css
--font-display: 'Instrument Serif', Georgia, serif;
--font-body: 'Inter', -apple-system, sans-serif;
--font-mono: 'JetBrains Mono', monospace;
```

**Type Scale:**
```css
--text-xs: 0.75rem;    /* 12px - Metadata, timestamps */
--text-sm: 0.875rem;   /* 14px - Secondary info */
--text-base: 1rem;     /* 16px - Body text */
--text-lg: 1.125rem;   /* 18px - Emphasis */
--text-xl: 1.25rem;    /* 20px - Section headers */
--text-2xl: 1.5rem;    /* 24px - Page titles */
--text-3xl: 1.875rem;  /* 30px - Feature titles */
--text-4xl: 2.25rem;   /* 36px - Hero text */
```

**Usage:**
- Film titles: `font-display`, weight 400-600
- UI elements: `font-body`, weight 400-500
- Metadata (runtime, year): `font-mono`, weight 400

#### Spacing & Layout

Base unit: 4px

```css
--space-1: 0.25rem;   /* 4px */
--space-2: 0.5rem;    /* 8px */
--space-3: 0.75rem;   /* 12px */
--space-4: 1rem;      /* 16px */
--space-6: 1.5rem;    /* 24px */
--space-8: 2rem;      /* 32px */
--space-12: 3rem;     /* 48px */
--space-16: 4rem;     /* 64px */
```

**Grid:**
- Mobile: 4-column grid, 16px gutters
- Tablet: 8-column grid, 24px gutters
- Desktop: 12-column grid, 24px gutters

### 5.3 Component Styling with Base UI

Base UI provides unstyled, accessible components. Our styling approach:

#### Cards (Film/Screening)

```css
.FilmCard {
  background: var(--bg-secondary);
  border: 1px solid var(--border-subtle);
  border-radius: 8px;
  overflow: hidden;
  transition: transform 150ms ease, box-shadow 150ms ease;
}

.FilmCard:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
  border-color: var(--border-emphasis);
}

.FilmCard__poster {
  aspect-ratio: 2/3;
  object-fit: cover;
  width: 100%;
}

.FilmCard__info {
  padding: var(--space-4);
}

.FilmCard__title {
  font-family: var(--font-display);
  font-size: var(--text-lg);
  font-weight: 500;
  color: var(--text-primary);
  margin-bottom: var(--space-1);
}

.FilmCard__meta {
  font-family: var(--font-mono);
  font-size: var(--text-xs);
  color: var(--text-tertiary);
  display: flex;
  gap: var(--space-2);
}
```

#### Buttons

```css
.Button {
  font-family: var(--font-body);
  font-weight: 500;
  border-radius: 6px;
  padding: var(--space-2) var(--space-4);
  transition: all 150ms ease;
}

.Button--primary {
  background: var(--accent-gold);
  color: var(--bg-primary);
}

.Button--primary:hover {
  background: #D4AF37;
  transform: translateY(-1px);
}

.Button--ghost {
  background: transparent;
  color: var(--text-secondary);
  border: 1px solid var(--border-subtle);
}

.Button--ghost:hover {
  background: var(--bg-hover);
  color: var(--text-primary);
}
```

#### Filters (Chips)

```css
.FilterChip {
  display: inline-flex;
  align-items: center;
  gap: var(--space-1);
  padding: var(--space-1) var(--space-3);
  border-radius: 9999px;
  font-size: var(--text-sm);
  border: 1px solid var(--border-subtle);
  background: var(--bg-secondary);
  color: var(--text-secondary);
  transition: all 150ms ease;
}

.FilterChip--active {
  background: var(--accent-gold);
  color: var(--bg-primary);
  border-color: var(--accent-gold);
}

.FilterChip:hover:not(.FilterChip--active) {
  border-color: var(--text-tertiary);
  color: var(--text-primary);
}
```

### 5.4 Key Screens

#### Home / Calendar View

```
+--------------------------------------------------+
|  [Logo]  FilmCal           [Search] [User]       |
+--------------------------------------------------+
|                                                  |
|  [Day] [Week] [Month] [List]     [Filters v]     |
|                                                  |
|  +--------------------------------------------+  |
|  |  Today, December 18                        |  |
|  +--------------------------------------------+  |
|                                                  |
|  6:00 PM                                         |
|  +----------------+  +----------------+          |
|  | [Poster]       |  | [Poster]       |          |
|  | The Brutalist  |  | Paris, Texas   |          |
|  | BFI IMAX       |  | Prince Charles |          |
|  | 70mm           |  | 35mm           |          |
|  | [Want to See]  |  | [Seen]         |          |
|  +----------------+  +----------------+          |
|                                                  |
|  8:30 PM                                         |
|  +----------------+  +----------------+  +----+  |
|  | [Poster]       |  | [Poster]       |  | +2 |  |
|  | In the Mood... |  | Nosferatu      |  |    |  |
|  | ICA            |  | BFI Southbank  |  |    |  |
|  | DCP            |  | with intro     |  |    |  |
|  +----------------+  +----------------+  +----+  |
|                                                  |
+--------------------------------------------------+
```

#### Film Detail

```
+--------------------------------------------------+
|  [< Back]                         [Share] [...]  |
+--------------------------------------------------+
|                                                  |
|  +--------+  THE BRUTALIST                       |
|  |        |  2024 | Brady Corbet | 215 min       |
|  |[Poster]|  Drama                               |
|  |        |  ****1/2 (4.3 on TMDB)               |
|  |        |                                      |
|  +--------+  [Want to See v]                     |
|                                                  |
|  A visionary epic following a Hungarian-born     |
|  Jewish architect who immigrates to America...   |
|  [Read more]                                     |
|                                                  |
|  +--------------------------------------------+  |
|  | UPCOMING SCREENINGS                        |  |
|  +--------------------------------------------+  |
|                                                  |
|  Thu, Dec 19                                     |
|  +------------------------------------------+   |
|  | 2:00 PM  | BFI IMAX    | 70mm    | [Book]|   |
|  +------------------------------------------+   |
|  | 7:00 PM  | BFI IMAX    | 70mm    | [Book]|   |
|  +------------------------------------------+   |
|                                                  |
|  Fri, Dec 20                                     |
|  +------------------------------------------+   |
|  | 6:30 PM  | BFI IMAX    | 70mm    | [Book]|   |
|  +------------------------------------------+   |
|                                                  |
|  [View on TMDB]  [View on Letterboxd]           |
+--------------------------------------------------+
```

#### Watchlist

```
+--------------------------------------------------+
|  WATCHLIST                    [Sort: Next Show]  |
+--------------------------------------------------+
|                                                  |
|  SHOWING NOW (3)                                 |
|  +----------------------------------------------+|
|  | [P] The Brutalist      | Dec 19, BFI IMAX   ||
|  | [P] Paris, Texas       | Dec 18, PCC        ||
|  | [P] Dune: Part Two     | Dec 20, IMAX       ||
|  +----------------------------------------------+|
|                                                  |
|  NOT CURRENTLY SHOWING (12)                      |
|  +----------------------------------------------+|
|  | [P] Until the End of the World               ||
|  | [P] Satantango                               ||
|  | [P] The Turin Horse                          ||
|  | ...                                          ||
|  +----------------------------------------------+|
+--------------------------------------------------+
```

### 5.5 Micro-interactions & Delight

**Loading States:**
- Skeleton loaders shaped like film cards
- Film-related quotes cycling during longer loads
- "Rewinding..." for refresh actions

**Empty States:**
- Illustrated, personality-filled
- "No screenings match your filters. Perhaps you're being too picky? (We respect that.)"

**Status Changes:**
- Satisfying animation when marking "Seen" (checkmark draws in)
- Subtle gold shimmer when adding to watchlist

**Transitions:**
- Card-to-detail: Poster expands, content fades in
- View switches: Smooth cross-fade
- Filter application: Results animate in/out

---

## 6. Technical Architecture

### 6.1 Technology Stack

#### Frontend

| Layer | Technology | Rationale |
|-------|------------|-----------|
| **Framework** | Next.js 14+ (App Router) | SSR for SEO, RSC for performance, excellent DX |
| **UI Components** | Base UI (React) | Unstyled, accessible, flexible |
| **Styling** | Tailwind CSS + CSS Modules | Utility-first with component encapsulation |
| **State Management** | Zustand | Lightweight, TypeScript-friendly |
| **Data Fetching** | TanStack Query | Caching, background updates, optimistic UI |
| **Forms** | React Hook Form + Zod | Performant forms with type-safe validation |
| **Animations** | Framer Motion | Declarative, powerful animations |
| **Date Handling** | date-fns | Lightweight, immutable, tree-shakeable |

#### Backend

| Layer | Technology | Rationale |
|-------|------------|-----------|
| **Runtime** | Node.js 20+ | LTS, performance, ecosystem |
| **API Framework** | Next.js API Routes / tRPC | Type-safe, co-located with frontend |
| **Database** | PostgreSQL (via Supabase) | Relational integrity, JSON support, full-text search |
| **ORM** | Drizzle ORM | Type-safe, lightweight, SQL-like |
| **Caching** | Redis (Upstash) | Session storage, rate limiting, data cache |
| **Job Queue** | Inngest or Trigger.dev | Background jobs, scheduling, retries |
| **Search** | Meilisearch or PostgreSQL FTS | Fast, typo-tolerant search |

#### Data Pipeline

| Component | Technology | Rationale |
|-----------|------------|-----------|
| **Web Scraping** | Playwright + Cheerio | Dynamic sites (Playwright), static parsing (Cheerio) |
| **Scheduling** | Cron jobs via Vercel/Railway | Daily data updates |
| **Data Validation** | Zod | Runtime type checking for scraped data |
| **API Integration** | Custom clients | TMDB, UK Cinema API |

#### Infrastructure

| Component | Technology | Rationale |
|-----------|------------|-----------|
| **Hosting** | Vercel | Optimized for Next.js, edge functions |
| **Database Hosting** | Supabase or Railway | Managed Postgres, easy scaling |
| **File Storage** | Cloudflare R2 | Cached posters, cost-effective |
| **CDN** | Cloudflare | Global edge caching |
| **Monitoring** | Sentry | Error tracking, performance |
| **Analytics** | Plausible or PostHog | Privacy-friendly analytics |

### 6.2 Data Flow Architecture

```
                                    +------------------+
                                    |   TMDB API       |
                                    |  (Film metadata) |
                                    +--------+---------+
                                             |
+------------------+    +------------------+ |  +------------------+
|  Cinema Website  |    |  Cinema Website  | |  |  UK Cinema API   |
|  (BFI, PCC, etc.)|    |  (Rio, Genesis)  | |  |  (Chains)        |
+--------+---------+    +--------+---------+ |  +--------+---------+
         |                       |           |           |
         v                       v           v           v
+--------+-------------------------------------------+---+
|                    DATA PIPELINE                       |
|  +---------------+  +---------------+  +------------+  |
|  | Playwright    |  | Cheerio       |  | API Client |  |
|  | (Dynamic)     |  | (Static)      |  | (REST)     |  |
|  +-------+-------+  +-------+-------+  +-----+------+  |
|          |                  |                |         |
|          v                  v                v         |
|  +-------+------------------+----------------+------+  |
|  |              Data Normalization                  |  |
|  |  - Validate with Zod schemas                     |  |
|  |  - Match films to TMDB                           |  |
|  |  - Deduplicate screenings                        |  |
|  +---------------------------+----------------------+  |
+--------------------------|-----------------------------+
                           |
                           v
+--------------------------|-----------------------------+
|                    POSTGRESQL                          |
|  +----------+  +----------+  +----------+  +---------+ |
|  | Cinemas  |  | Films    |  | Screens  |  | Users   | |
|  +----------+  +----------+  +----------+  +---------+ |
+--------------------------|-----------------------------+
                           |
                           v
+--------------------------|-----------------------------+
|                    NEXT.JS APP                         |
|  +----------------+  +----------------+  +-----------+ |
|  | API Routes     |  | React Server   |  | Client    | |
|  | (tRPC)         |  | Components     |  | Components| |
|  +----------------+  +----------------+  +-----------+ |
+--------------------------|-----------------------------+
                           |
                           v
                    +------+------+
                    |   Browser   |
                    |   (User)    |
                    +-------------+
```

### 6.3 Scraping Architecture

```typescript
// Scraper interface - each cinema implements this
interface CinemaScraper {
  cinemaId: string;

  // Main scrape function
  scrape(): Promise<RawScreening[]>;

  // Health check
  healthCheck(): Promise<boolean>;

  // Rate limiting config
  rateLimiting: {
    requestsPerMinute: number;
    delayBetweenRequests: number;
  };
}

// Scraper orchestration
class ScraperOrchestrator {
  private scrapers: Map<string, CinemaScraper>;

  async runDailyUpdate(): Promise<void> {
    for (const [id, scraper] of this.scrapers) {
      try {
        const rawData = await scraper.scrape();
        const validated = this.validate(rawData);
        const enriched = await this.enrichWithTMDB(validated);
        await this.upsertToDatabase(enriched);
      } catch (error) {
        await this.alertOnFailure(id, error);
        // Continue with other cinemas
      }
    }
  }

  private async enrichWithTMDB(screenings: Screening[]): Promise<Screening[]> {
    // Match films to TMDB, fetch posters, metadata
  }
}
```

### 6.4 Caching Strategy

| Data Type | Cache Location | TTL | Invalidation |
|-----------|---------------|-----|--------------|
| Film metadata | PostgreSQL + Redis | 24h | On scraper update |
| Posters | Cloudflare R2 + CDN | 30d | Never (immutable URLs) |
| Screening data | PostgreSQL | 1h | On scraper update |
| User preferences | Redis | Session | On user action |
| Search index | Meilisearch | Real-time | On data change |
| API responses | Vercel Edge | 5min | stale-while-revalidate |

### 6.5 API Design (tRPC)

```typescript
// Router structure
const appRouter = router({
  // Cinema operations
  cinema: router({
    list: publicProcedure.query(/* ... */),
    getById: publicProcedure.input(z.string()).query(/* ... */),
  }),

  // Film operations
  film: router({
    search: publicProcedure.input(searchSchema).query(/* ... */),
    getById: publicProcedure.input(z.string()).query(/* ... */),
    getScreenings: publicProcedure.input(z.string()).query(/* ... */),
  }),

  // Screening operations
  screening: router({
    list: publicProcedure.input(screeningFilterSchema).query(/* ... */),
    getByDate: publicProcedure.input(dateRangeSchema).query(/* ... */),
  }),

  // User operations (protected)
  user: router({
    getPreferences: protectedProcedure.query(/* ... */),
    updatePreferences: protectedProcedure.input(prefsSchema).mutation(/* ... */),
    setFilmStatus: protectedProcedure.input(statusSchema).mutation(/* ... */),
    getWatchlist: protectedProcedure.query(/* ... */),
    getHistory: protectedProcedure.query(/* ... */),
  }),
});
```

---

## 7. Implementation Roadmap

### 7.1 MVP (Phase 1) - 8-10 weeks

**Goal:** Functional calendar with core cinemas, basic personalization

#### Week 1-2: Foundation
- [ ] Project setup (Next.js, Tailwind, Base UI)
- [ ] Database schema design and setup (Supabase)
- [ ] Base UI theming and component library foundation
- [ ] Design system tokens and core components

#### Week 3-4: Data Pipeline
- [ ] TMDB API integration for film metadata
- [ ] First scraper: BFI Southbank
- [ ] Second scraper: Prince Charles Cinema
- [ ] Data normalization and validation pipeline
- [ ] Film-to-TMDB matching logic

#### Week 5-6: Core UI
- [ ] Calendar list view (primary)
- [ ] Film detail page
- [ ] Cinema selection interface
- [ ] Basic filtering (date, cinema, repertory/new)
- [ ] Search functionality

#### Week 7-8: Personalization
- [ ] Local storage for preferences (no auth MVP)
- [ ] Film status tracking (want to see/seen/not interested)
- [ ] Watchlist view
- [ ] Filter persistence

#### Week 9-10: Polish & Launch Prep
- [ ] Mobile responsive refinement
- [ ] Performance optimization
- [ ] Error handling and empty states
- [ ] Soft launch to test users

**MVP Deliverables:**
- 7 Tier 1 cinemas integrated
- List and day calendar views
- Film search and filtering
- Personal watchlist (local storage)
- Mobile-responsive design

### 7.2 Phase 2 - 6-8 weeks

**Goal:** User accounts, notifications, expanded coverage

#### Features
- [ ] User authentication (email/social)
- [ ] Cloud sync for preferences and watchlist
- [ ] Week and month calendar views
- [ ] External calendar integration (.ics export)
- [ ] Push notifications (screening reminders)
- [ ] Watchlist alerts (when films get scheduled)
- [ ] Tier 2 cinema integration (Curzon, Picturehouse, Everyman)
- [ ] UK Cinema API integration evaluation
- [ ] Viewing history with notes and ratings
- [ ] Sharing functionality
- [ ] Director/actor filtering

### 7.3 Phase 3 - 6-8 weeks

**Goal:** Social features, discovery, premium

#### Features
- [ ] Letterboxd import
- [ ] Season/retrospective detection and pages
- [ ] "On This Day" feature
- [ ] Curated collections
- [ ] Group planning features
- [ ] Tier 3 cinema integration
- [ ] Advanced search (by decade, country, etc.)
- [ ] Availability planning
- [ ] Premium/supporter tier exploration
- [ ] Native mobile app evaluation

### 7.4 Future Considerations

- **Native Apps:** React Native for iOS/Android
- **Widget Support:** iOS widgets, Android widgets
- **API Access:** Public API for community projects
- **Expansion:** Other UK cities (Manchester, Edinburgh, Bristol)
- **Editorial Content:** Reviews, essays, interviews
- **Ticket Aggregation:** Deep linking to best prices

---

## 8. Success Metrics

### 8.1 North Star Metric

**Weekly Active Users Viewing Calendar**
Users who view the calendar at least once per week

### 8.2 Engagement Metrics

| Metric | Target (Month 3) | Target (Month 6) |
|--------|-----------------|------------------|
| Weekly Active Users | 500 | 2,000 |
| Sessions per User per Week | 2.5 | 3.0 |
| Films Added to Watchlist | 5 per user avg | 8 per user avg |
| Calendar Export Rate | 10% of users | 15% of users |
| Return Rate (Week 2) | 40% | 50% |

### 8.3 Data Quality Metrics

| Metric | Target |
|--------|--------|
| Screening Data Accuracy | >98% (spot-check verified) |
| Data Freshness | <24h from cinema update |
| Film Matching Rate | >95% matched to TMDB |
| Scraper Success Rate | >99% daily runs successful |

### 8.4 Technical Metrics

| Metric | Target |
|--------|--------|
| Page Load Time (LCP) | <2.5s |
| Time to Interactive | <3.5s |
| Core Web Vitals | All "Good" |
| API Response Time (p95) | <200ms |
| Uptime | 99.5% |

### 8.5 Business Metrics (Post-MVP)

| Metric | Target |
|--------|--------|
| Supporter Conversion Rate | 5% of monthly active users |
| Monthly Recurring Revenue | Break-even on hosting costs |
| Organic Traffic Growth | 20% month-over-month |
| Newsletter Subscribers | 1,000 by month 6 |

### 8.6 Qualitative Metrics

- **User Satisfaction:** NPS > 50
- **Feature Requests:** Active community contributing ideas
- **Cinema Partnerships:** At least 2 cinemas providing direct data
- **Press Coverage:** Featured in London film publications

---

## Appendix A: Competitive Analysis Details

### Existing Solutions

**Time Out London Film Listings**
- Pros: Good coverage, editorial content
- Cons: Cluttered, ad-heavy, no personalization, poor mobile

**Individual Cinema Websites**
- Pros: Accurate, bookable
- Cons: Fragmented, different UX for each, no unified view

**Letterboxd**
- Pros: Excellent social features, diary, beautiful design
- Cons: No showtimes, no calendar, streaming-focused

**Google Movies**
- Pros: Quick, integrated
- Cons: Chain-focused, no repertory awareness, soulless

**IMDb Showtimes**
- Pros: Comprehensive
- Cons: Terrible UX, data issues, ad-heavy

### Key Differentiators

1. **Repertory-First:** Built for people who care about film history
2. **Beautiful Design:** Celebrates film culture visually
3. **Personal:** Your cinemas, your watchlist, your history
4. **London-Focused:** Deep knowledge of the local scene
5. **Cinephile-Built:** Made by people who actually go to these cinemas

---

## Appendix B: Data Source Technical Notes

### BFI Southbank (whatson.bfi.org.uk)

**Structure:** Classic server-rendered HTML, jQuery-based filtering
**Approach:** Cheerio parsing, daily scrape
**Challenges:**
- Pagination handling
- Season/event categorization
- Format detection (not always explicit)

**Key Selectors (to be validated):**
```javascript
// Film listings container
'.film-list-item'

// Individual film data
'.film-title'
'.film-meta' // Contains director, year, runtime
'.screening-time'
'.screening-format'
```

### Prince Charles Cinema (princecharlescinema.com)

**Structure:** Modern CMS, likely WordPress-based
**Approach:** Mix of Cheerio and potentially Playwright for dynamic content
**Challenges:**
- Event types (sing-along, quote-along) need categorization
- Multiple screenings per page
- Membership pricing variations

### ICA (ica.art)

**Structure:** React-based SPA
**Approach:** Playwright to render JS, then parse
**Challenges:**
- Requires JS execution
- Pagination via infinite scroll
- Art event vs. film distinction

### Barbican (barbican.org.uk)

**Structure:** Complex CMS, multiple content types
**Approach:** Cheerio for cinema-specific pages
**Challenges:**
- Cinema content mixed with other events
- Season pages need special handling

---

## Appendix C: Base UI Component Mapping

| App Component | Base UI Component | Customization Notes |
|--------------|------------------|---------------------|
| Cinema Select | Combobox | Multi-select, search, chips |
| Date Picker | Custom (no Base UI date picker) | Build with Popover + Calendar grid |
| Film Card | Card (custom) | Poster aspect ratio, hover states |
| Filter Chips | ToggleGroup | Pill styling, multi-select |
| Dropdown Menu | Menu | Cinema actions, sort options |
| Modal | Dialog | Film detail overlay on mobile |
| Tabs | Tabs | Calendar view switching |
| Toast | Toast | Notification feedback |
| Tooltip | Tooltip | Screening format info |
| Search | Combobox | Autocomplete, recent searches |

---

## Appendix D: Glossary

| Term | Definition |
|------|------------|
| **Repertory** | Older films shown as part of curated programming, as opposed to new releases |
| **DCP** | Digital Cinema Package - standard digital format for theatrical projection |
| **35mm/70mm** | Film gauges for celluloid projection |
| **Season** | A curated series of films around a theme, director, or genre |
| **Restoration** | A film that has been digitally or photochemically restored to improve quality |
| **Preview** | A screening before official release date |
| **Q&A** | Question and answer session with filmmakers after screening |

---

*This PRD is a living document and will be updated as research continues and development progresses.*

**Document History:**
- v1.0 (December 2024): Initial comprehensive PRD
