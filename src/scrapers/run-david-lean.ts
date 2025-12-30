/**
 * Run David Lean Cinema Scraper
 *
 * Usage:
 *   npm run scrape:david-lean
 */

import { createDavidLeanScraper } from "./cinemas/david-lean";
import { saveScreenings, ensureCinemaExists } from "./pipeline";

const VENUE = {
  id: "david-lean-cinema",
  name: "The David Lean Cinema",
  shortName: "David Lean",
  website: "https://www.davidleancinema.org.uk",
  address: {
    street: "Katharine Street, Croydon Clocktower",
    area: "Croydon",
    postcode: "CR9 1ET",
  },
  coordinates: {
    lat: 51.3762,
    lng: -0.0986,
  },
  features: ["independent", "community", "accessible"],
};

async function main() {
  console.log("[david-lean] Starting David Lean Cinema scrape...");

  const scraper = createDavidLeanScraper();

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

    console.log(`[david-lean] Complete: ${screenings.length} screenings`);
    return results;
  } catch (error) {
    console.error("[david-lean] Error:", error);
    throw error;
  }
}

main().catch(console.error);
