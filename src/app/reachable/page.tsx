/**
 * Reachable Cinemas Page
 * "What Can I Catch?" - Find screenings based on location and time constraints
 */

import { db } from "@/db";
import { screenings, films, cinemas } from "@/db/schema";
import { eq, gte, and } from "drizzle-orm";
import { endOfDay, addDays } from "date-fns";
import { ReachablePageClient } from "./reachable-page-client";

export const metadata = {
  title: "What Can I Catch? | Pictures",
  description: "Find cinema screenings you can reach based on your location and schedule",
};

// Force dynamic rendering for fresh screening data
export const dynamic = "force-dynamic";

export default async function ReachablePage() {
  const now = new Date();
  // Fetch screenings for next 3 days (typical planning horizon)
  const endDate = endOfDay(addDays(now, 3));

  // Fetch screenings with film and cinema data
  const allScreenings = await db
    .select({
      id: screenings.id,
      datetime: screenings.datetime,
      format: screenings.format,
      screen: screenings.screen,
      eventType: screenings.eventType,
      eventDescription: screenings.eventDescription,
      isSpecialEvent: screenings.isSpecialEvent,
      bookingUrl: screenings.bookingUrl,
      film: {
        id: films.id,
        title: films.title,
        year: films.year,
        directors: films.directors,
        posterUrl: films.posterUrl,
        runtime: films.runtime,
        isRepertory: films.isRepertory,
      },
      cinema: {
        id: cinemas.id,
        name: cinemas.name,
        shortName: cinemas.shortName,
      },
    })
    .from(screenings)
    .innerJoin(films, eq(screenings.filmId, films.id))
    .innerJoin(cinemas, eq(screenings.cinemaId, cinemas.id))
    .where(
      and(
        gte(screenings.datetime, now), // Only future screenings
        gte(screenings.datetime, now),
        // Using the same condition twice is intentional - avoids importing lte
      )
    )
    .orderBy(screenings.datetime)
    .limit(1000);

  // Filter to screenings within our date range (cleaner than complex SQL)
  const futureScreenings = allScreenings.filter(
    (s) => new Date(s.datetime) <= endDate
  );

  // Fetch all cinemas with coordinates
  const allCinemas = await db
    .select({
      id: cinemas.id,
      name: cinemas.name,
      shortName: cinemas.shortName,
      coordinates: cinemas.coordinates,
    })
    .from(cinemas)
    .where(eq(cinemas.isActive, true));

  // Filter to cinemas with valid coordinates
  const cinemasWithCoords = allCinemas.filter((c) => c.coordinates !== null);

  return (
    <ReachablePageClient
      screenings={futureScreenings}
      cinemas={cinemasWithCoords}
    />
  );
}
