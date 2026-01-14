/**
 * Link Films to Seasons by Director Name
 *
 * Batch operation that finds all director retrospective seasons
 * and links films from the database that are directed by that director.
 *
 * Usage: npx tsx scripts/link-seasons-by-director.ts
 */

import { linkAllFilmsByDirector } from "@/scrapers/seasons/season-linker";

async function main() {
  console.log("=".repeat(60));
  console.log("Season Film Linker - Director Matching");
  console.log("=".repeat(60));

  const { totalLinked, seasonResults } = await linkAllFilmsByDirector();

  console.log("\n" + "=".repeat(60));
  console.log("Summary");
  console.log("=".repeat(60));

  // Show seasons by film count
  const sorted = [...seasonResults].sort((a, b) => b.linkedCount - a.linkedCount);
  for (const { seasonName, linkedCount } of sorted) {
    console.log(`  ${linkedCount.toString().padStart(3)} new links | ${seasonName}`);
  }

  console.log("-".repeat(60));
  console.log(`  Total: ${totalLinked} films linked to seasons`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Error:", error);
    process.exit(1);
  });
