import { Inngest } from "inngest";

/**
 * Inngest Client
 * Used for background job processing (scrapers, data enrichment, etc.)
 */
export const inngest = new Inngest({
  id: "pictures-london",
  // Event key is set via INNGEST_EVENT_KEY env var
  // Signing key is set via INNGEST_SIGNING_KEY env var
});

// Event type definitions for type safety
export type ScraperEvent = {
  name: "scraper/run";
  data: {
    cinemaId: string;
    scraperId: string;
    triggeredBy: string;
  };
};

export type Events = {
  "scraper/run": ScraperEvent;
};
