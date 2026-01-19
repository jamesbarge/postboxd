/**
 * Run Romford Lumiere Scraper (v2 - using runner factory)
 *
 * Usage:
 *   npm run scrape:romford-lumiere
 */

import { createMain, type SingleVenueConfig } from "./runner-factory";
import { createRomfordLumiereScraper } from "./cinemas/romford-lumiere";

const config: SingleVenueConfig = {
  type: "single",
  venue: {
    id: "romford-lumiere",
    name: "Lumiere Romford",
    shortName: "Lumiere",
    website: "https://www.lumiereromford.com",
    address: {
      street: "Mercury Gardens",
      area: "Romford",
      postcode: "RM1 3EE",
    },
    features: ["community", "bar", "accessible"],
  },
  createScraper: () => createRomfordLumiereScraper(),
};

const main = createMain(config, {
  useValidation: true,
});

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
