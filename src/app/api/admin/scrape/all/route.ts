/**
 * Admin Scrape All API
 * Triggers ALL scrapers via Inngest (including Playwright ones that may fail on Vercel)
 *
 * POST /api/admin/scrape/all
 */

import { auth } from "@clerk/nextjs/server";
import { inngest } from "@/inngest/client";

// All cinema IDs that have scrapers configured
// Note: Playwright-based scrapers will fail gracefully on Vercel
const ALL_CINEMA_IDS = [
  // Independent cinemas (Cheerio-based - work on Vercel)
  "rio-dalston",
  "prince-charles",
  "ica",
  "genesis",
  "peckhamplex",
  "nickel",
  "garden",
  "castle",
  "rich-mix",
  // Independent cinemas (Playwright-based - may fail on Vercel)
  "bfi-southbank",
  "barbican",
  "electric-portobello",
  "lexi",
  "phoenix",
  // Chain cinemas (Playwright-based - may fail on Vercel)
  // These trigger full chain scrapes
  "curzon-soho", // Triggers curzon chain scraper
  "picturehouse-central", // Triggers picturehouse chain scraper
  "everyman-belsize-park", // Triggers everyman chain scraper
];

// Map cinema IDs to their scraper IDs
const CINEMA_TO_SCRAPER: Record<string, string> = {
  // Independent cinemas
  "rio-dalston": "rio",
  "prince-charles": "pcc",
  "ica": "ica",
  "barbican": "barbican",
  "genesis": "genesis",
  "peckhamplex": "peckhamplex",
  "nickel": "nickel",
  "electric-portobello": "electric",
  "lexi": "lexi",
  "garden": "garden",
  "castle": "castle",
  "phoenix": "phoenix",
  "rich-mix": "rich-mix",
  "bfi-southbank": "bfi",
  // Chain cinemas (one representative per chain)
  "curzon-soho": "curzon",
  "picturehouse-central": "picturehouse",
  "everyman-belsize-park": "everyman",
};

export async function POST(request: Request) {
  // Verify admin auth
  const { userId } = await auth();
  if (!userId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Create events for all scrapers
    const events = ALL_CINEMA_IDS.map((cinemaId) => ({
      name: "scraper/run" as const,
      data: {
        cinemaId,
        scraperId: CINEMA_TO_SCRAPER[cinemaId] || cinemaId,
        triggeredBy: userId,
      },
    }));

    // Send all events to Inngest
    const { ids } = await inngest.send(events);

    return Response.json({
      success: true,
      message: `Queued ${events.length} scrapers`,
      count: events.length,
      eventIds: ids,
      cinemas: ALL_CINEMA_IDS,
    });
  } catch (error) {
    console.error("Error triggering all scrapers:", error);
    return Response.json(
      { error: "Failed to trigger scrapers" },
      { status: 500 }
    );
  }
}
