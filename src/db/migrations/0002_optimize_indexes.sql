-- Optimize screening indexes for common query patterns
-- Run this in Supabase SQL Editor

-- Drop old inefficient indexes (if they exist)
DROP INDEX IF EXISTS idx_screenings_film;
DROP INDEX IF EXISTS idx_screenings_cinema;
DROP INDEX IF EXISTS idx_screenings_calendar;
DROP INDEX IF EXISTS idx_screenings_upcoming;

-- Create optimized compound indexes
-- Film detail pages: WHERE filmId = ? AND datetime >= ?
CREATE INDEX IF NOT EXISTS idx_screenings_film_datetime
ON screenings (film_id, datetime);

-- Cinema calendar: WHERE cinemaId IN (...) AND datetime BETWEEN ? AND ?
CREATE INDEX IF NOT EXISTS idx_screenings_cinema_datetime
ON screenings (cinema_id, datetime);

-- Note: idx_screenings_datetime and idx_screenings_unique should already exist
