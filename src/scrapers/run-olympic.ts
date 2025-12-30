/**
 * Run Olympic Studios Scraper
 *
 * Usage:
 *   npm run scrape:olympic
 */

import { createOlympicScraper } from "./cinemas/olympic";
import { saveScreenings, ensureCinemaExists } from "./pipeline";

const VENUE = {
  id: "olympic-studios",
  name: "Olympic Studios",
  shortName: "Olympic",
  website: "https://www.olympiccinema.com",
  address: {
    street: "117-123 Church Road",
    area: "Barnes",
    postcode: "SW13 9HL",
  },
  coordinates: {
    lat: 51.4751,
    lng: -0.2407,
  },
  features: ["independent", "bar", "restaurant", "historic"],
};

async function main() {
  console.log("[olympic] Starting Olympic Studios scrape...");

  const scraper = createOlympicScraper();

  try {
    // Ensure cinema exists in database
    await ensureCinemaExists({
      id: VENUE.id,
      name: VENUE.name,
      shortName: VENUE.shortName,
      website: VENUE.website,
      address: VENUE.address,
      features: VENUE.features,
    });

    // Run scraper
    const screenings = await scraper.scrape();

    // Save to database
    const results = await saveScreenings(VENUE.id, screenings);

    console.log(`[olympic] Complete: ${screenings.length} screenings`);
    return results;
  } catch (error) {
    console.error("[olympic] Error:", error);
    throw error;
  }
}

main().catch(console.error);
