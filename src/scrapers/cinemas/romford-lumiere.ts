/**
 * Romford Lumiere Scraper
 *
 * Uses Playwright to intercept CineSync API responses from the Lumiere Romford website.
 * The site is built with Next.js and loads film/screening data dynamically
 * via the CineSync API (lumiereromford.api.cinesync.io).
 *
 * Website: https://www.lumiereromford.com
 * API: https://lumiereromford.api.cinesync.io
 *
 * Strategy:
 * 1. Use Playwright to load the website
 * 2. Intercept API responses containing film and screening data
 * 3. Parse the JSON data directly from API responses
 * 4. Build RawScreening objects from the captured data
 */

import type { RawScreening, ScraperConfig } from "../types";
import { getBrowser, closeBrowser, createPage } from "../utils/browser";
import type { Page, Response } from "playwright";
import { addDays, format, parse } from "date-fns";

// CineSync API response types
interface CineSyncMovie {
  id: number;
  name: string;
  url_key: string;
  runtime?: number;
  release_date?: string;
  director?: string;
  synopsis?: string;
  portrait_image?: string;
  landscape_image?: string;
}

interface CineSyncSession {
  id: number;
  movie_id: number;
  screen_id: number;
  screen_name?: string;
  session_datetime: string; // ISO datetime string
  session_date: string; // YYYY-MM-DD
  session_time: string; // HH:mm
  booking_url?: string;
  sold_out?: boolean;
  format?: string;
}

interface CineSyncScheduleResponse {
  movies?: CineSyncMovie[];
  sessions?: CineSyncSession[];
  schedule?: {
    dates?: Array<{
      date: string;
      movies?: Array<{
        movie: CineSyncMovie;
        sessions: CineSyncSession[];
      }>;
    }>;
  };
}

export class RomfordLumiereScraper {
  private page: Page | null = null;
  private capturedMovies: Map<number, CineSyncMovie> = new Map();
  private capturedSessions: CineSyncSession[] = [];
  private apiResponsesReceived = 0;

  config: ScraperConfig = {
    cinemaId: "romford-lumiere",
    baseUrl: "https://www.lumiereromford.com",
    requestsPerMinute: 10,
    delayBetweenRequests: 2000,
  };

  async scrape(): Promise<RawScreening[]> {
    console.log(`[${this.config.cinemaId}] Starting scrape with API interception...`);

    try {
      await this.initialize();
      const screenings = await this.fetchAllScreenings();
      await this.cleanup();

      const validated = this.validate(screenings);
      console.log(`[${this.config.cinemaId}] Found ${validated.length} valid screenings`);
      return validated;
    } catch (error) {
      console.error(`[${this.config.cinemaId}] Scrape failed:`, error);
      await this.cleanup();
      throw error;
    }
  }

  private async initialize(): Promise<void> {
    console.log(`[${this.config.cinemaId}] Launching browser...`);
    await getBrowser();
    this.page = await createPage();

    // Reset captured data
    this.capturedMovies.clear();
    this.capturedSessions = [];
    this.apiResponsesReceived = 0;

    // Set up response interception for CineSync API
    this.page.on("response", async (response: Response) => {
      await this.handleResponse(response);
    });

    console.log(`[${this.config.cinemaId}] Browser initialized with API interception`);
  }

  private async handleResponse(response: Response): Promise<void> {
    const url = response.url();

    // Only intercept CineSync API responses
    if (!url.includes("lumiereromford.api.cinesync.io") && !url.includes("api.cinesync.io")) {
      return;
    }

    // Skip non-JSON responses
    const contentType = response.headers()["content-type"] || "";
    if (!contentType.includes("application/json")) {
      return;
    }

    try {
      const data = await response.json();
      this.apiResponsesReceived++;

      // Log what we're capturing
      console.log(`[${this.config.cinemaId}] Captured API response from: ${url.substring(0, 100)}...`);

      // Extract movies from various response formats
      if (data.movies && Array.isArray(data.movies)) {
        for (const movie of data.movies) {
          if (movie.id && movie.name) {
            this.capturedMovies.set(movie.id, movie);
          }
        }
        console.log(`[${this.config.cinemaId}] Captured ${data.movies.length} movies`);
      }

      // Extract sessions from various response formats
      if (data.sessions && Array.isArray(data.sessions)) {
        this.capturedSessions.push(...data.sessions);
        console.log(`[${this.config.cinemaId}] Captured ${data.sessions.length} sessions`);
      }

      // Handle schedule format (nested movies/sessions by date)
      if (data.schedule?.dates && Array.isArray(data.schedule.dates)) {
        for (const dateEntry of data.schedule.dates) {
          if (dateEntry.movies && Array.isArray(dateEntry.movies)) {
            for (const movieEntry of dateEntry.movies) {
              if (movieEntry.movie?.id && movieEntry.movie?.name) {
                this.capturedMovies.set(movieEntry.movie.id, movieEntry.movie);
              }
              if (movieEntry.sessions && Array.isArray(movieEntry.sessions)) {
                this.capturedSessions.push(...movieEntry.sessions);
              }
            }
          }
        }
        console.log(`[${this.config.cinemaId}] Captured schedule data with ${data.schedule.dates.length} dates`);
      }

      // Handle data nested under "data" key
      if (data.data) {
        if (data.data.movies && Array.isArray(data.data.movies)) {
          for (const movie of data.data.movies) {
            if (movie.id && movie.name) {
              this.capturedMovies.set(movie.id, movie);
            }
          }
        }
        if (data.data.sessions && Array.isArray(data.data.sessions)) {
          this.capturedSessions.push(...data.data.sessions);
        }
      }

      // Handle movie-specific responses (when viewing a single film)
      if (data.movie && data.movie.id) {
        this.capturedMovies.set(data.movie.id, data.movie);
      }

    } catch {
      // Ignore JSON parse errors - some API responses might not be relevant
    }
  }

  private async cleanup(): Promise<void> {
    if (this.page) {
      await this.page.close();
      this.page = null;
    }
    await closeBrowser();
    console.log(`[${this.config.cinemaId}] Browser closed`);
  }

  private async fetchAllScreenings(): Promise<RawScreening[]> {
    if (!this.page) throw new Error("Browser not initialized");

    const endOfApril = new Date(2026, 3, 30); // April 30, 2026

    try {
      // Navigate to the main "What's On" page to trigger API calls
      console.log(`[${this.config.cinemaId}] Loading buy-tickets page...`);
      await this.page.goto(`${this.config.baseUrl}/en/buy-tickets`, {
        waitUntil: "networkidle",
        timeout: 60000,
      });

      // Wait for API responses to be captured
      await this.page.waitForTimeout(5000);

      console.log(`[${this.config.cinemaId}] Captured ${this.apiResponsesReceived} API responses so far`);
      console.log(`[${this.config.cinemaId}] Movies: ${this.capturedMovies.size}, Sessions: ${this.capturedSessions.length}`);

      // If we didn't get enough data, try navigating to more pages
      if (this.capturedMovies.size === 0 || this.capturedSessions.length === 0) {
        console.log(`[${this.config.cinemaId}] Trying alternative pages...`);

        // Try the available-to-book page
        await this.page.goto(`${this.config.baseUrl}/en/available-to-book`, {
          waitUntil: "networkidle",
          timeout: 60000,
        });
        await this.page.waitForTimeout(5000);

        console.log(`[${this.config.cinemaId}] After available-to-book: Movies: ${this.capturedMovies.size}, Sessions: ${this.capturedSessions.length}`);
      }

      // If we still don't have sessions, try clicking through dates
      if (this.capturedSessions.length === 0) {
        console.log(`[${this.config.cinemaId}] Trying to interact with date selectors...`);

        // Try clicking on date elements
        const dateSelectors = [
          'button[data-date]',
          '[class*="date-selector"] button',
          '[class*="calendar"] button',
          '.date-picker button',
        ];

        for (const selector of dateSelectors) {
          try {
            const elements = await this.page.$$(selector);
            if (elements.length > 0) {
              console.log(`[${this.config.cinemaId}] Found ${elements.length} date elements with selector: ${selector}`);
              // Click on first few dates to trigger API calls
              for (let i = 0; i < Math.min(5, elements.length); i++) {
                try {
                  await elements[i].click();
                  await this.page.waitForTimeout(2000);
                } catch {
                  // Ignore click errors
                }
              }
              break;
            }
          } catch {
            // Continue to next selector
          }
        }
      }

      // If we still don't have data, try the movies page
      if (this.capturedMovies.size === 0) {
        console.log(`[${this.config.cinemaId}] Trying movies page...`);
        await this.page.goto(`${this.config.baseUrl}/en/movies`, {
          waitUntil: "networkidle",
          timeout: 60000,
        });
        await this.page.waitForTimeout(5000);

        console.log(`[${this.config.cinemaId}] After movies page: Movies: ${this.capturedMovies.size}, Sessions: ${this.capturedSessions.length}`);
      }

      // Final summary
      console.log(`[${this.config.cinemaId}] Final capture: ${this.capturedMovies.size} movies, ${this.capturedSessions.length} sessions`);

      // Convert captured data to screenings
      return this.convertToScreenings(endOfApril);

    } catch (error) {
      console.error(`[${this.config.cinemaId}] Error fetching screenings:`, error);
      return [];
    }
  }

  private convertToScreenings(endDate: Date): RawScreening[] {
    const screenings: RawScreening[] = [];
    const now = new Date();

    for (const session of this.capturedSessions) {
      // Get the movie for this session
      const movie = this.capturedMovies.get(session.movie_id);
      if (!movie) {
        console.warn(`[${this.config.cinemaId}] Movie not found for session ${session.id}, movie_id: ${session.movie_id}`);
        continue;
      }

      // Parse the session datetime
      let datetime: Date | null = null;

      if (session.session_datetime) {
        datetime = new Date(session.session_datetime);
      } else if (session.session_date && session.session_time) {
        // Combine date and time
        try {
          datetime = parse(
            `${session.session_date} ${session.session_time}`,
            "yyyy-MM-dd HH:mm",
            new Date()
          );
        } catch {
          console.warn(`[${this.config.cinemaId}] Could not parse date/time: ${session.session_date} ${session.session_time}`);
        }
      }

      if (!datetime || isNaN(datetime.getTime())) {
        console.warn(`[${this.config.cinemaId}] Invalid datetime for session ${session.id}`);
        continue;
      }

      // Skip past screenings and screenings after end date
      if (datetime < now || datetime > endDate) {
        continue;
      }

      // Build booking URL
      const bookingUrl = session.booking_url ||
        `${this.config.baseUrl}/en/movies/${movie.url_key}?session=${session.id}`;

      const sourceId = `romford-lumiere-${session.id}`;

      screenings.push({
        filmTitle: this.cleanTitle(movie.name),
        datetime,
        bookingUrl,
        sourceId,
        screen: session.screen_name,
        format: session.format,
        year: movie.release_date ? this.extractYear(movie.release_date) : undefined,
        director: movie.director,
      });
    }

    return screenings;
  }

  private cleanTitle(title: string): string {
    return title
      .replace(/\s*\+\s*(Q\s*&?\s*A|intro|discussion|panel).*$/i, "")
      .replace(/^(Preview|UK Premiere|Premiere)[:\s]+/i, "")
      .replace(/\s*\(.*?\)\s*$/, "")
      .replace(/\s+/g, " ")
      .trim();
  }

  private extractYear(dateStr: string): number | undefined {
    const match = dateStr.match(/\b(19|20)\d{2}\b/);
    return match ? parseInt(match[0]) : undefined;
  }

  private validate(screenings: RawScreening[]): RawScreening[] {
    const now = new Date();
    const seen = new Set<string>();

    return screenings.filter((s) => {
      if (!s.filmTitle || s.filmTitle.trim() === "") return false;
      if (!s.datetime || isNaN(s.datetime.getTime())) return false;
      if (s.datetime < now) return false;
      if (!s.bookingUrl || s.bookingUrl.trim() === "") return false;

      // Deduplicate by sourceId
      if (s.sourceId && seen.has(s.sourceId)) return false;
      if (s.sourceId) seen.add(s.sourceId);

      return true;
    });
  }

  async healthCheck(): Promise<boolean> {
    try {
      console.log(`[${this.config.cinemaId}] Running health check...`);
      const response = await fetch(this.config.baseUrl, {
        method: "HEAD",
        headers: {
          "User-Agent": "Mozilla/5.0 (compatible; PicturesBot/1.0)",
        },
      });
      return response.ok;
    } catch {
      return false;
    }
  }
}

export function createRomfordLumiereScraper(): RomfordLumiereScraper {
  return new RomfordLumiereScraper();
}
