/**
 * BFI Southbank & BFI IMAX Scraper
 * Uses Playwright with stealth plugin to bypass Cloudflare protection
 * Iterates through dates to fetch complete listings
 */

import * as cheerio from "cheerio";
import type { RawScreening, ScraperConfig } from "../types";
import { getBrowser, closeBrowser, createPage, waitForCloudflare } from "../utils/browser";
import type { Page } from "playwright";
import { parseFilmMetadata } from "../utils/metadata-parser";

interface BFIVenueConfig {
  id: "bfi-southbank" | "bfi-imax";
  name: string;
  baseUrl: string;
}

const VENUES: Record<string, BFIVenueConfig> = {
  "bfi-southbank": {
    id: "bfi-southbank",
    name: "BFI Southbank",
    baseUrl: "https://whatson.bfi.org.uk/Online",
  },
  "bfi-imax": {
    id: "bfi-imax",
    name: "BFI IMAX",
    baseUrl: "https://whatson.bfi.org.uk/imax/Online",
  },
};

export class BFIScraper {
  private venue: BFIVenueConfig;
  private page: Page | null = null;

  config: ScraperConfig;

  constructor(venueId: "bfi-southbank" | "bfi-imax" = "bfi-southbank") {
    this.venue = VENUES[venueId];
    this.config = {
      cinemaId: venueId,
      baseUrl: this.venue.baseUrl,
      requestsPerMinute: 10,
      delayBetweenRequests: 3000, // Increased for Cloudflare
    };
  }

  async scrape(): Promise<RawScreening[]> {
    console.log(`[${this.config.cinemaId}] Starting scrape with Playwright stealth mode...`);

    try {
      await this.initialize();
      const screenings = await this.fetchAllDates();
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
    console.log(`[${this.config.cinemaId}] Launching browser with enhanced stealth mode...`);
    await getBrowser();
    this.page = await createPage();

    // First visit the homepage to establish session/cookies and bypass initial Cloudflare
    console.log(`[${this.config.cinemaId}] Warming up session on homepage...`);
    await this.page.goto(this.venue.baseUrl, {
      waitUntil: "domcontentloaded",
      timeout: 60000,
    });

    // Wait for Cloudflare challenge if present (uses enhanced human-like behavior)
    const passed = await waitForCloudflare(this.page, 60);
    if (!passed) {
      console.log(`[${this.config.cinemaId}] Cloudflare challenge timeout, continuing anyway...`);
    }

    // Wait for page to settle
    await this.page.waitForTimeout(2000);
    console.log(`[${this.config.cinemaId}] Session established`);
  }

  private async cleanup(): Promise<void> {
    if (this.page) {
      await this.page.close();
      this.page = null;
    }
    await closeBrowser();
    console.log(`[${this.config.cinemaId}] Browser closed`);
  }

  private async fetchAllDates(): Promise<RawScreening[]> {
    if (!this.page) throw new Error("Browser not initialized");

    const screenings: RawScreening[] = [];
    const dates = this.generateDateRange(45); // Fetch next 45 days

    console.log(`[${this.config.cinemaId}] Fetching ${dates.length} days of screenings via direct URL...`);

    for (let i = 0; i < dates.length; i++) {
      const date = dates[i];
      const dateStr = this.formatDate(date);
      const url = this.buildSearchUrl(dateStr);

      try {
        console.log(`[${this.config.cinemaId}] Fetching ${dateStr} (${i + 1}/${dates.length})...`);

        await this.page.goto(url, {
          waitUntil: "domcontentloaded",
          timeout: 30000,
        });

        // Wait for potential Cloudflare challenge
        await waitForCloudflare(this.page, 15);
        await this.page.waitForTimeout(1500);

        const html = await this.page.content();

        // Check if we got blocked
        if (html.includes("challenge-platform") || html.includes("Checking your browser")) {
          console.log(`[${this.config.cinemaId}] Cloudflare challenge on ${dateStr}, waiting...`);
          await this.page.waitForTimeout(5000);
          continue;
        }

        // Debug: check what's in the HTML
        if (i < 3) {
          const hasMain = html.includes('<main');
          const hasResults = html.includes('Search results');
          const hasChallenge = html.includes('challenge-platform');
          console.log(`[${this.config.cinemaId}] Page debug: main=${hasMain}, results=${hasResults}, challenge=${hasChallenge}, length=${html.length}`);
        }

        const dayScreenings = this.parseSearchResults(html);

        if (dayScreenings.length > 0) {
          console.log(`[${this.config.cinemaId}] ${dateStr}: ${dayScreenings.length} screenings`);
          screenings.push(...dayScreenings);
        }

        // Small delay between requests to avoid rate limiting
        await this.page.waitForTimeout(this.config.delayBetweenRequests || 2000);

      } catch (error) {
        console.error(`[${this.config.cinemaId}] Error fetching ${dateStr}:`, error);
        // Continue with next date
        await this.page.waitForTimeout(3000);
      }
    }

    return screenings;
  }

  private generateDateRange(days: number): Date[] {
    const dates: Date[] = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 0; i < days; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      dates.push(date);
    }
    return dates;
  }

  private formatDate(date: Date): string {
    // BFI uses YYYY-M-D format (no leading zeros)
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    return `${year}-${month}-${day}`;
  }

  private buildSearchUrl(date: string): string {
    // Use the URL pattern discovered from MCP Playwright exploration
    const params = new URLSearchParams({
      "doWork::WScontent::search": "1",
      "BOset::WScontent::SearchCriteria::search_from": date,
      "BOset::WScontent::SearchCriteria::search_to": date,
    });
    return `${this.venue.baseUrl}/default.asp?${params.toString()}`;
  }

  private parseSearchResults(html: string): RawScreening[] {
    const $ = cheerio.load(html);
    const screenings: RawScreening[] = [];
    const now = new Date();

    // Check if we hit Cloudflare
    if (html.includes("challenge-platform") || html.includes("Checking your browser")) {
      return [];
    }

    // BFI search results structure:
    // Links with loadArticle in href point to film/event pages
    // The datetime and screen info is in sibling/parent elements
    // Note: Page may not have <main> element - search for loadArticle links directly

    // Find all links that point to articles (film/event pages)
    const loadArticleLinks = $('a[href*="loadArticle"]');
    console.log(`[${this.config.cinemaId}] Found ${loadArticleLinks.length} loadArticle links`);

    let processedCount = 0;
    loadArticleLinks.each((idx, el) => {
      const $link = $(el);
      const title = $link.text().trim();
      const href = $link.attr("href") || "";

      // Debug: log first few links
      if (idx < 3) {
        console.log(`[${this.config.cinemaId}] Link ${idx}: title="${title.substring(0, 50)}", href contains loadArticle`);
      }

      // Skip empty, short titles, and navigation links
      if (!title || title.length < 3) return;
      if (href.includes("javascript:")) return;

      // Skip non-film items
      if (this.isNonFilmEvent(title)) return;

      processedCount++;

      // Get the parent container to find datetime and screen
      // Structure: generic > generic > [link, datetime div, screen div]
      const $container = $link.parent();
      const $grandparent = $container.parent();

      // Try to find datetime in container text or grandparent
      const containerText = $container.text();
      const grandparentText = $grandparent.text();

      // Debug: log structure for first few
      if (processedCount <= 3) {
        console.log(`[${this.config.cinemaId}] Processing "${title.substring(0, 30)}...": container="${containerText.substring(0, 100)}..."`);
      }

      // Find datetime from sibling elements
      let datetimeStr = "";
      let screen = "";

      // First try to match from the grandparent text (which includes siblings)
      const datetimePattern = /(\w+)\s+(\d{1,2})\s+(\w+)\s+(\d{4})\s+(\d{1,2}:\d{2})/;
      const dtMatch = grandparentText.match(datetimePattern);
      if (dtMatch) {
        datetimeStr = dtMatch[0];
      }

      // Also look for screen info
      const screenMatch = grandparentText.match(/(NFT[1-4]|IMAX|Studio|BFI Reuben Library)/i);
      if (screenMatch) {
        screen = screenMatch[1];
      }

      if (!datetimeStr) {
        if (processedCount <= 3) {
          console.log(`[${this.config.cinemaId}] No datetime found in: "${grandparentText.substring(0, 200)}..."`);
        }
        return;
      }

      const datetime = this.parseBFIDateTime(datetimeStr);
      if (!datetime || datetime < now) return;

      // Build booking URL
      const bookingUrl = href.startsWith("http")
        ? href
        : `${this.venue.baseUrl}/${href}`;

      // Detect special event types from title
      let eventType: string | undefined;
      const cleanTitle = this.cleanTitle(title);

      if (/\+\s*Q\s*&?\s*A/i.test(title)) eventType = "q_and_a";
      else if (/\+\s*intro/i.test(title)) eventType = "intro";
      else if (/\+\s*discussion/i.test(title)) eventType = "discussion";
      else if (/preview/i.test(title)) eventType = "preview";
      else if (/premiere/i.test(title)) eventType = "premiere";

      // Extract director/year from the listing text
      // BFI often includes "Dir. Name" and year in the description
      const metadata = parseFilmMetadata(grandparentText);

      screenings.push({
        filmTitle: cleanTitle,
        datetime,
        screen: screen || undefined,
        bookingUrl,
        eventType,
        sourceId: `${this.config.cinemaId}-${cleanTitle.toLowerCase().replace(/\s+/g, "-")}-${datetime.toISOString()}`,
        // Pass extracted metadata for better TMDB matching
        year: metadata.year,
        director: metadata.director,
        // Detect festival based on title/date
        ...this.detectFestival(cleanTitle, datetime),
      });
    });

    return screenings;
  }

  private isNonFilmEvent(title: string): boolean {
    const skipPatterns = [
      /^library/i,
      /auction/i,
      /members?\s+(only|event|screening)/i,
      /research\s+session/i,
      /workshop/i,
      /^talk\s*$/i,
      /lecture/i,
    ];
    return skipPatterns.some((p) => p.test(title));
  }

  private parseBFIDateTime(text: string): Date | null {
    // Format: "Friday 19 December 2025 14:30"
    const match = text.match(/(\d{1,2})\s+(\w+)\s+(\d{4})\s+(\d{1,2}):(\d{2})/);
    if (!match) return null;

    const [, day, monthName, year, hours, minutes] = match;

    const months: Record<string, number> = {
      January: 0, February: 1, March: 2, April: 3,
      May: 4, June: 5, July: 6, August: 7,
      September: 8, October: 9, November: 10, December: 11,
    };

    const month = months[monthName];
    if (month === undefined) return null;

    return new Date(
      parseInt(year),
      month,
      parseInt(day),
      parseInt(hours),
      parseInt(minutes)
    );
  }

  private cleanTitle(title: string): string {
    return title
      .replace(/\s*\+\s*(Q\s*&?\s*A|intro|discussion|panel).*$/i, "")
      .replace(/^(Preview|UK Premiere|Premiere)[:\s]+/i, "")
      .replace(/\s*\(.*?\)\s*$/, "")
      .trim();
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
      const page = await createPage();

      await page.goto(this.venue.baseUrl, {
        waitUntil: "domcontentloaded",
        timeout: 30000,
      });

      // Wait for potential Cloudflare challenge
      for (let i = 0; i < 15; i++) {
        const html = await page.content();
        if (!html.includes("challenge-platform") && !html.includes("Checking your browser")) {
          break;
        }
        await page.waitForTimeout(1000);
      }

      const title = await page.title();
      await page.close();
      await closeBrowser();

      return title.toLowerCase().includes("bfi");
    } catch (error) {
      console.error(`[${this.config.cinemaId}] Health check failed:`, error);
      await closeBrowser();
      return false;
    }
  }

  private detectFestival(title: string, date: Date): { festivalSlug?: string; festivalSection?: string } {
    const month = date.getMonth(); // 0-indexed
    const year = date.getFullYear();

    // BFI Flare: March
    if (month === 2 && (title.includes("Flare") || title.includes("BFI Flare"))) {
      return { festivalSlug: `bfi-flare-${year}` };
    }

    // BFI LFF: October
    if (month === 9 && (title.includes("LFF") || title.includes("London Film Festival"))) {
      return { festivalSlug: `bfi-lff-${year}` };
    }
    
    // Future: Specific data-driven rules
    return {};
  }
}

export function createBFIScraper(venueId: "bfi-southbank" | "bfi-imax"): BFIScraper {
  return new BFIScraper(venueId);
}
