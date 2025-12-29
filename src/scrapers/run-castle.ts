/**
 * Run Castle Cinema Scraper
 *
 * Usage:
 *   npm run scrape:castle
 */

import { createCastleScraper, CASTLE_VENUE } from "./cinemas/castle";
import { saveScreenings, ensureCinemaExists } from "./pipeline";

async function main() {
  console.log("[castle-cinema] Starting Castle Cinema scrape...");

  const scraper = createCastleScraper();

  // Ensure cinema exists in database
  await ensureCinemaExists({
    id: CASTLE_VENUE.id,
    name: CASTLE_VENUE.name,
    shortName: CASTLE_VENUE.shortName,
    website: CASTLE_VENUE.website,
    address: {
      street: CASTLE_VENUE.address,
      area: CASTLE_VENUE.area,
      postcode: CASTLE_VENUE.postcode,
    },
    features: CASTLE_VENUE.features,
  });

  // Scrape
  const screenings = await scraper.scrape();

  // Save
  if (screenings.length > 0) {
    await saveScreenings(CASTLE_VENUE.id, screenings);
  }

  console.log("[castle-cinema] Complete: " + screenings.length + " screenings");
}

main().catch((error) => {
  console.error("[castle-cinema] Fatal error:", error);
  process.exit(1);
});
