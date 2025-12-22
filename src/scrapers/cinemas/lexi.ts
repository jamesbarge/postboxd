/**
 * Lexi Cinema Scraper (Kensal Rise)
 *
 * Social enterprise cinema - profits go to charity
 * Website: https://thelexicinema.co.uk
 *
 * NOTE: Website uses TheLexiCinema.dll pattern (legacy ASP.NET)
 * Main page: /TheLexiCinema.dll/Home
 * Film listings: /TheLexiCinema.dll/WhatsOn
 */

import * as cheerio from "cheerio";
import type { RawScreening, ScraperConfig, CinemaScraper } from "../types";
import { getBrowser, closeBrowser, createPage } from "../utils/browser";
import type { Page } from "playwright";

// ============================================================================
// Lexi Cinema Configuration
// ============================================================================

export const LEXI_CONFIG: ScraperConfig = {
  cinemaId: "lexi",
  baseUrl: "https://thelexicinema.co.uk",
  requestsPerMinute: 10,
  delayBetweenRequests: 2000,
};

export const LEXI_VENUE = {
  id: "lexi",
  name: "The Lexi Cinema",
  shortName: "Lexi",
  area: "Kensal Rise",
  postcode: "NW10 5SN",
  address: "194b Chamberlayne Road",
  features: ["independent", "charity", "single_screen", "repertory"],
  website: "https://thelexicinema.co.uk",
};

// ============================================================================
// Lexi Scraper Implementation
// ============================================================================

export class LexiScraper implements CinemaScraper {
  config = LEXI_CONFIG;
  private page: Page | null = null;

  async scrape(): Promise<RawScreening[]> {
    console.log(`[lexi] Starting scrape with Playwright...`);

    try {
      await this.initialize();

      // Navigate to the homepage which shows all film listings
      const url = `${this.config.baseUrl}/TheLexiCinema.dll/Home`;
      console.log(`[lexi] Navigating to ${url}...`);

      await this.page!.goto(url, { waitUntil: "domcontentloaded", timeout: 60000 });
      await this.page!.waitForTimeout(3000);

      // Get the HTML and parse with Cheerio
      const html = await this.page!.content();
      const screenings = this.parseFilmCardsFromHtml(html);

      await this.cleanup();

      const validated = this.validate(screenings);
      console.log(`[lexi] Found ${validated.length} valid screenings`);

      return validated;
    } catch (error) {
      console.error(`[lexi] Scrape failed:`, error);
      await this.cleanup();
      throw error;
    }
  }

  private async initialize(): Promise<void> {
    console.log(`[lexi] Launching browser...`);
    await getBrowser();
    this.page = await createPage();
  }

  private async cleanup(): Promise<void> {
    if (this.page) {
      await this.page.close();
      this.page = null;
    }
    await closeBrowser();
    console.log(`[lexi] Browser closed`);
  }

  /**
   * Parse film cards from HTML using Cheerio
   * DOM structure: link with h3 title, sibling element with date text
   */
  private parseFilmCardsFromHtml(html: string): RawScreening[] {
    const $ = cheerio.load(html);
    const screenings: RawScreening[] = [];
    const seen = new Set<string>();

    // Find all links to film detail pages that contain an h3
    $('a[href*="WhatsOn?f="]').each((_, linkEl) => {
      const $link = $(linkEl);
      const $h3 = $link.find('h3');

      if ($h3.length === 0) return;

      const title = $h3.text().trim();
      if (!title || title.length < 2) return;

      // Skip section headings
      if (/^(Films?|Family Fun|Event|Theatre|Black History|Talking Pictures|Main Features|Q&As|Spotlight|Women of|Baby-Friendly|Audio|HOH|Relaxed|Seasons|Contact|Subscribe)/i.test(title)) {
        return;
      }

      // Avoid duplicates
      if (seen.has(title)) return;
      seen.add(title);

      const bookingUrl = $link.attr('href') || "";

      // Get the parent container and look for date text
      const $parent = $link.parent();
      const parentText = $parent.text();

      // Look for date patterns
      let dateText = "";

      // Pattern: "Mon 22 Dec 15:00" (with time)
      let match = parentText.match(/(Mon|Tue|Wed|Thu|Fri|Sat|Sun)\s+(\d{1,2})\s+(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+(\d{1,2}:\d{2})/i);
      if (match) {
        dateText = match[0];
      } else {
        // Pattern: just "Mon 22 Dec" (without time)
        match = parentText.match(/(Mon|Tue|Wed|Thu|Fri|Sat|Sun)\s+(\d{1,2})\s+(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)/i);
        if (match) {
          dateText = match[0];
        }
      }

      console.log(`[lexi] Processing: "${title}" - parent text: "${parentText.substring(0, 80)}..." - date: "${dateText}"`);

      if (!dateText) return;

      const datetime = this.parseLexiDateTime(dateText);
      if (!datetime) return;

      const cleanedTitle = this.cleanTitle(title);
      const fullBookingUrl = bookingUrl.startsWith("http")
        ? bookingUrl
        : `${this.config.baseUrl}${bookingUrl}`;

      screenings.push({
        filmTitle: cleanedTitle,
        datetime,
        bookingUrl: fullBookingUrl,
        sourceId: `lexi-${cleanedTitle.toLowerCase().replace(/\s+/g, "-")}-${datetime.toISOString()}`,
      });
    });

    console.log(`[lexi] Found ${screenings.length} screenings from HTML`);
    return screenings;
  }

  /**
   * Parse Lexi date format: "Mon 22 Dec 15:00" or "Mon 22 Dec"
   */
  private parseLexiDateTime(text: string): Date | null {
    // Pattern: "Mon 22 Dec 15:00" or "Mon 22 Dec"
    const match = text.match(/(Mon|Tue|Wed|Thu|Fri|Sat|Sun)\s+(\d{1,2})\s+(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)(?:\s+(\d{1,2}):(\d{2}))?/i);
    if (!match) return null;

    const months: Record<string, number> = {
      jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5,
      jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11,
    };

    const day = parseInt(match[2]);
    const month = months[match[3].toLowerCase()];
    const hours = match[4] ? parseInt(match[4]) : 14; // Default to 14:00 if no time
    const minutes = match[5] ? parseInt(match[5]) : 0;

    const year = new Date().getFullYear();
    const datetime = new Date(year, month, day, hours, minutes);

    // If date is in past, assume next year
    if (datetime < new Date()) {
      datetime.setFullYear(year + 1);
    }

    return datetime;
  }

  private parseScreenings(html: string): RawScreening[] {
    const $ = cheerio.load(html);
    const screenings: RawScreening[] = [];

    // Lexi uses film cards with dates like "Mon 22 Dec 15:00" or "Showing from Mon 22 Dec"
    // Look for film containers
    $(".film, .event, .screening, article, .programme-item, [class*='card'], [class*='film']").each((_, el) => {
      const $film = $(el);

      // Extract title from headings or title classes
      const title = $film.find("h2, h3, h4, .title, .film-title, [class*='title']").first().text().trim();
      if (!title || title.length < 2) return;

      // Get the full text for date/time parsing
      const fullText = $film.text();

      // Look for individual showtime links
      $film.find("a[href*='book'], a[href*='Book'], .showtime, .time, [class*='time']").each((_, timeEl) => {
        const $time = $(timeEl);
        const timeText = $time.text().trim();
        const bookingUrl = $time.attr("href") || $film.find("a").first().attr("href") || "";

        const datetime = this.parseDateTime(fullText, timeText);
        if (!datetime) return;

        screenings.push({
          filmTitle: this.cleanTitle(title),
          datetime,
          bookingUrl: bookingUrl.startsWith("http")
            ? bookingUrl
            : `${this.config.baseUrl}${bookingUrl}`,
          sourceId: `lexi-${title.toLowerCase().replace(/\s+/g, "-")}-${datetime.toISOString()}`,
        });
      });

      // If no specific showtimes found, try to extract from text
      if (screenings.length === 0) {
        const extracted = this.extractScreeningsFromText(fullText, title, $film);
        screenings.push(...extracted);
      }
    });

    return screenings;
  }

  private extractScreeningsFromText(
    text: string,
    title: string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    $film: any
  ): RawScreening[] {
    const screenings: RawScreening[] = [];

    // Pattern: "Sat 21 Dec 7:30pm" or "December 21, 19:30"
    const patterns = [
      /(\d{1,2})\s+(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+(\d{1,2}):(\d{2})\s*(am|pm)?/gi,
      /(Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday)\s+(\d{1,2})\s+(\w+)\s+(\d{1,2}):(\d{2})/gi,
    ];

    for (const pattern of patterns) {
      let match;
      while ((match = pattern.exec(text)) !== null) {
        const datetime = this.parseMatch(match);
        if (datetime) {
          const bookingUrl = $film.find("a").first().attr("href") || this.config.baseUrl;

          screenings.push({
            filmTitle: this.cleanTitle(title),
            datetime,
            bookingUrl: bookingUrl.startsWith("http")
              ? bookingUrl
              : `${this.config.baseUrl}${bookingUrl}`,
            sourceId: `lexi-${title.toLowerCase().replace(/\s+/g, "-")}-${datetime.toISOString()}`,
          });
        }
      }
    }

    return screenings;
  }

  private parseMatch(match: RegExpExecArray): Date | null {
    const months: Record<string, number> = {
      jan: 0, january: 0,
      feb: 1, february: 1,
      mar: 2, march: 2,
      apr: 3, april: 3,
      may: 4,
      jun: 5, june: 5,
      jul: 6, july: 6,
      aug: 7, august: 7,
      sep: 8, september: 8,
      oct: 9, october: 9,
      nov: 10, november: 10,
      dec: 11, december: 11,
    };

    try {
      // Pattern 1: "21 Dec 7:30pm"
      if (match.length >= 5 && !isNaN(parseInt(match[1]))) {
        const day = parseInt(match[1]);
        const month = months[match[2].toLowerCase()];
        let hours = parseInt(match[3]);
        const minutes = parseInt(match[4]);
        const ampm = match[5]?.toLowerCase();

        if (ampm === "pm" && hours < 12) hours += 12;
        if (ampm === "am" && hours === 12) hours = 0;

        const year = new Date().getFullYear();
        const datetime = new Date(year, month, day, hours, minutes);

        if (datetime < new Date()) {
          datetime.setFullYear(year + 1);
        }

        return datetime;
      }

      // Pattern 2: "Saturday 21 December 19:30"
      if (match.length >= 6) {
        const day = parseInt(match[2]);
        const month = months[match[3].toLowerCase()];
        const hours = parseInt(match[4]);
        const minutes = parseInt(match[5]);

        const year = new Date().getFullYear();
        const datetime = new Date(year, month, day, hours, minutes);

        if (datetime < new Date()) {
          datetime.setFullYear(year + 1);
        }

        return datetime;
      }
    } catch {
      return null;
    }

    return null;
  }

  private parseDateTime(contextText: string, timeText: string): Date | null {
    // Try to find time in timeText first
    const timeMatch = timeText.match(/(\d{1,2}):(\d{2})\s*(am|pm)?/i);
    if (!timeMatch) return null;

    // Find date in context
    const dateMatch = contextText.match(
      /(\d{1,2})\s*(January|February|March|April|May|June|July|August|September|October|November|December)/i
    );

    const months: Record<string, number> = {
      january: 0, february: 1, march: 2, april: 3,
      may: 4, june: 5, july: 6, august: 7,
      september: 8, october: 9, november: 10, december: 11,
    };

    const year = new Date().getFullYear();
    let day: number;
    let month: number;

    if (dateMatch) {
      day = parseInt(dateMatch[1]);
      month = months[dateMatch[2].toLowerCase()];
    } else {
      // Default to today
      const now = new Date();
      day = now.getDate();
      month = now.getMonth();
    }

    let hours = parseInt(timeMatch[1]);
    const minutes = parseInt(timeMatch[2]);
    const ampm = timeMatch[3]?.toLowerCase();

    if (ampm === "pm" && hours < 12) hours += 12;
    if (ampm === "am" && hours === 12) hours = 0;

    const datetime = new Date(year, month, day, hours, minutes);

    if (datetime < new Date()) {
      datetime.setFullYear(year + 1);
    }

    return datetime;
  }

  private cleanTitle(title: string): string {
    return title
      .replace(/\s*\(\d{4}\)\s*$/, "")
      .replace(/\s*\+\s*(Q\s*&?\s*A|intro|discussion).*$/i, "")
      .trim();
  }

  private validate(screenings: RawScreening[]): RawScreening[] {
    const now = new Date();
    const seen = new Set<string>();

    return screenings.filter((s) => {
      if (!s.filmTitle || s.filmTitle.trim() === "") return false;
      if (!s.datetime || isNaN(s.datetime.getTime())) return false;
      if (s.datetime < now) return false;

      if (s.sourceId && seen.has(s.sourceId)) return false;
      if (s.sourceId) seen.add(s.sourceId);

      return true;
    });
  }

  async healthCheck(): Promise<boolean> {
    try {
      const response = await fetch(this.config.baseUrl, { method: "HEAD" });
      return response.ok;
    } catch {
      return false;
    }
  }
}

export function createLexiScraper(): LexiScraper {
  return new LexiScraper();
}
