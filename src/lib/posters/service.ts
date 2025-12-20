/**
 * Poster Service
 *
 * Orchestrates multiple poster sources with intelligent fallback:
 * 1. TMDB - Primary source (best mainstream coverage)
 * 2. OMDB - Uses IMDb data, good for older films
 * 3. Fanart.tv - Artistic posters, good for cult films
 * 4. Scraper-provided - Extracted from cinema websites
 * 5. Generated placeholder - Stylized SVG fallback
 */

import { getTMDBClient } from "@/lib/tmdb";
import { getOMDBClient } from "./omdb";
import { getFanartClient } from "./fanart";
import { getPosterPlaceholderUrl } from "./placeholder";
import { extractFilmTitle } from "@/lib/title-extractor";
import type { PosterResult, PosterSearchParams, PosterSource } from "./types";

export class PosterService {
  private tmdb = getTMDBClient();
  private omdb = getOMDBClient();
  private fanart = getFanartClient();

  /**
   * Find the best available poster for a film
   * Tries sources in order until one succeeds
   */
  async findPoster(params: PosterSearchParams): Promise<PosterResult> {
    const { title, year, imdbId, tmdbId, scraperPosterUrl } = params;

    // Track attempted sources for logging
    const attempted: PosterSource[] = [];

    // 1. Try TMDB first (if we have a TMDB ID)
    if (tmdbId) {
      attempted.push("tmdb");
      const tmdbPoster = await this.tryTMDB(tmdbId);
      if (tmdbPoster) {
        return {
          url: tmdbPoster,
          source: "tmdb",
          quality: "high",
        };
      }
    }

    // 2. Try TMDB by title search
    if (!tmdbId) {
      attempted.push("tmdb");
      const tmdbPoster = await this.tryTMDBSearch(title, year);
      if (tmdbPoster) {
        return {
          url: tmdbPoster,
          source: "tmdb",
          quality: "high",
        };
      }
    }

    // 3. Try OMDB (uses IMDb data)
    if (this.omdb.isConfigured()) {
      attempted.push("omdb");
      const omdbPoster = imdbId
        ? await this.tryOMDBById(imdbId)
        : await this.tryOMDBSearch(title, year);
      if (omdbPoster) {
        return {
          url: omdbPoster,
          source: "omdb",
          quality: "high",
        };
      }
    }

    // 4. Try Fanart.tv
    if (this.fanart.isConfigured() && (tmdbId || imdbId)) {
      attempted.push("fanart");
      const fanartPoster = await this.tryFanart(tmdbId, imdbId);
      if (fanartPoster) {
        return {
          url: fanartPoster,
          source: "fanart",
          quality: "high",
        };
      }
    }

    // 5. Use scraper-provided poster if available
    if (scraperPosterUrl && await this.validateImageUrl(scraperPosterUrl)) {
      return {
        url: scraperPosterUrl,
        source: "scraper",
        quality: "medium",
      };
    }

    // 6. Generate placeholder as last resort
    console.log(`No poster found for "${title}" (${year}) after trying: ${attempted.join(", ")}`);
    return {
      url: getPosterPlaceholderUrl(title, year),
      source: "placeholder",
      quality: "placeholder",
    };
  }

  /**
   * Batch find posters for multiple films
   * Useful for initial data enrichment
   */
  async findPostersForMany(
    films: PosterSearchParams[],
    onProgress?: (completed: number, total: number) => void
  ): Promise<Map<string, PosterResult>> {
    const results = new Map<string, PosterResult>();

    for (let i = 0; i < films.length; i++) {
      const film = films[i];
      const key = `${film.title}-${film.year || ""}`;

      try {
        const result = await this.findPoster(film);
        results.set(key, result);
      } catch (error) {
        console.error(`Error finding poster for ${film.title}:`, error);
        results.set(key, {
          url: getPosterPlaceholderUrl(film.title, film.year),
          source: "placeholder",
          quality: "placeholder",
        });
      }

      // Rate limiting
      await this.delay(250);

      // Progress callback
      if (onProgress) {
        onProgress(i + 1, films.length);
      }
    }

    return results;
  }

  // ============= Private Methods =============

  private async tryTMDB(tmdbId: number): Promise<string | null> {
    try {
      const details = await this.tmdb.getFilmDetails(tmdbId);
      if (details.poster_path) {
        return `https://image.tmdb.org/t/p/w500${details.poster_path}`;
      }
    } catch (error) {
      console.error("TMDB lookup error:", error);
    }
    return null;
  }

  private async tryTMDBSearch(title: string, year?: number): Promise<string | null> {
    try {
      // First try with original title
      const results = await this.tmdb.searchFilms(title, year);
      if (results.results.length > 0) {
        const best = results.results[0];
        if (best.poster_path) {
          return `https://image.tmdb.org/t/p/w500${best.poster_path}`;
        }
      }

      // If no results, try AI-powered title cleaning
      // This extracts the actual film title from event names like "Classic Matinee: Sunset Boulevard"
      const extraction = await extractFilmTitle(title);
      if (extraction.filmTitle !== title && extraction.confidence !== "low") {
        console.log(`  → AI cleaned title: "${title}" → "${extraction.filmTitle}"`);
        const cleanedResults = await this.tmdb.searchFilms(extraction.filmTitle, year);
        if (cleanedResults.results.length > 0) {
          const best = cleanedResults.results[0];
          if (best.poster_path) {
            return `https://image.tmdb.org/t/p/w500${best.poster_path}`;
          }
        }
      }
    } catch (error) {
      console.error("TMDB search error:", error);
    }
    return null;
  }

  private async tryOMDBById(imdbId: string): Promise<string | null> {
    try {
      const result = await this.omdb.getByImdbId(imdbId);
      if (result?.Poster && result.Poster !== "N/A") {
        return result.Poster;
      }
    } catch (error) {
      console.error("OMDB lookup error:", error);
    }
    return null;
  }

  private async tryOMDBSearch(title: string, year?: number): Promise<string | null> {
    try {
      // First try with original title
      const result = await this.omdb.searchByTitle(title, year);
      if (result?.Poster && result.Poster !== "N/A") {
        return result.Poster;
      }

      // If no results, try AI-powered title cleaning
      const extraction = await extractFilmTitle(title);
      if (extraction.filmTitle !== title && extraction.confidence !== "low") {
        const cleanedResult = await this.omdb.searchByTitle(extraction.filmTitle, year);
        if (cleanedResult?.Poster && cleanedResult.Poster !== "N/A") {
          return cleanedResult.Poster;
        }
      }
    } catch (error) {
      console.error("OMDB search error:", error);
    }
    return null;
  }

  private async tryFanart(tmdbId?: number, imdbId?: string): Promise<string | null> {
    try {
      if (tmdbId) {
        const poster = await this.fanart.getBestPoster(tmdbId);
        if (poster) return poster;
      }
      if (imdbId) {
        const poster = await this.fanart.getBestPoster(imdbId);
        if (poster) return poster;
      }
    } catch (error) {
      console.error("Fanart.tv lookup error:", error);
    }
    return null;
  }

  /**
   * Validate that an image URL is accessible
   */
  private async validateImageUrl(url: string): Promise<boolean> {
    try {
      const response = await fetch(url, { method: "HEAD" });
      const contentType = response.headers.get("content-type") || "";
      return response.ok && contentType.startsWith("image/");
    } catch {
      return false;
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

// Singleton instance
let posterService: PosterService | null = null;

export function getPosterService(): PosterService {
  if (!posterService) {
    posterService = new PosterService();
  }
  return posterService;
}
