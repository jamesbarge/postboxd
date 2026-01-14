/**
 * Debug script to check director matching
 */

import { db } from "@/db";
import { films, seasons } from "@/db/schema";
import { ilike, eq, and, sql } from "drizzle-orm";

async function debug() {
  // Get active director seasons
  const directorSeasons = await db
    .select({
      id: seasons.id,
      name: seasons.name,
      directorName: seasons.directorName,
    })
    .from(seasons)
    .where(
      and(
        eq(seasons.isActive, true),
        sql`${seasons.directorName} IS NOT NULL`
      )
    );

  console.log("Director seasons:");
  for (const s of directorSeasons) {
    console.log(`  - ${s.name} (Director: ${s.directorName})`);
  }

  // Check some films
  console.log("\nSample films with 'Lynch' in directors:");
  const lynchFilms = await db
    .select({ title: films.title, directors: films.directors })
    .from(films)
    .where(sql`${films.directors}::text ILIKE '%Lynch%'`)
    .limit(10);
  console.log(JSON.stringify(lynchFilms, null, 2));

  console.log("\nSample films with 'Virginia Woolf' in title:");
  const vwFilms = await db
    .select({ title: films.title, directors: films.directors })
    .from(films)
    .where(ilike(films.title, '%virginia woolf%'))
    .limit(5);
  console.log(JSON.stringify(vwFilms, null, 2));
}

debug()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Error:", error);
    process.exit(1);
  });
