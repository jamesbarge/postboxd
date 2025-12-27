-- Add performance indexes to films table
-- These indexes improve search and filtering performance

-- Index for ILIKE search queries on title (used by /api/search and /api/films/search)
CREATE INDEX IF NOT EXISTS "idx_films_title" ON "films" ("title");

-- Index for filtering by repertory status (used in calendar filtering)
CREATE INDEX IF NOT EXISTS "idx_films_repertory" ON "films" ("is_repertory");

-- Index for decade/year filtering
CREATE INDEX IF NOT EXISTS "idx_films_year" ON "films" ("year");
