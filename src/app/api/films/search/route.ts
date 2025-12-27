import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { films, screenings } from "@/db/schema";
import { ilike, or, sql, asc, gte, lte, eq, and } from "drizzle-orm";
import { startOfDay, addDays } from "date-fns";
import { z } from "zod";
import { checkRateLimit, getClientIP, RATE_LIMITS } from "@/lib/rate-limit";

// Input validation schema
const querySchema = z.object({
  q: z.string().max(100).optional(),
  browse: z.enum(["true", "false"]).optional(),
});

export async function GET(request: NextRequest) {
  // Rate limit check
  const ip = getClientIP(request);
  const rateLimitResult = checkRateLimit(ip, { ...RATE_LIMITS.search, prefix: "search" });
  if (!rateLimitResult.success) {
    return NextResponse.json(
      { error: "Too many requests", results: [] },
      {
        status: 429,
        headers: { "Retry-After": String(rateLimitResult.resetIn) },
      }
    );
  }

  const searchParams = request.nextUrl.searchParams;

  // Validate query parameters
  const parseResult = querySchema.safeParse({
    q: searchParams.get("q") || undefined,
    browse: searchParams.get("browse") || undefined,
  });

  if (!parseResult.success) {
    return NextResponse.json(
      { error: "Invalid query parameters", results: [] },
      { status: 400 }
    );
  }

  const query = parseResult.data.q?.trim();
  const browse = parseResult.data.browse === "true";

  // Only show films with screenings in the next 30 days
  const startDate = startOfDay(new Date());
  const endDate = addDays(startDate, 30);

  try {
    // Browse mode: return films with upcoming screenings, alphabetically
    if (browse && !query) {
      const results = await db
        .selectDistinct({
          id: films.id,
          title: films.title,
          year: films.year,
          directors: films.directors,
          posterUrl: films.posterUrl,
        })
        .from(films)
        .innerJoin(screenings, eq(films.id, screenings.filmId))
        .where(
          and(
            gte(screenings.datetime, startDate),
            lte(screenings.datetime, endDate)
          )
        )
        .orderBy(asc(films.title))
        .limit(200); // Safety cap for browse mode

      return NextResponse.json(
        { results },
        {
          headers: {
            // Cache browse results for 10 minutes (very stable data)
            "Cache-Control": "public, s-maxage=600, stale-while-revalidate=1200",
          },
        }
      );
    }

    // Search mode: filter by query, only films with upcoming screenings
    if (!query || query.length < 2) {
      return NextResponse.json({ results: [] });
    }

    const searchPattern = `%${query}%`;

    const results = await db
      .selectDistinct({
        id: films.id,
        title: films.title,
        year: films.year,
        directors: films.directors,
        posterUrl: films.posterUrl,
      })
      .from(films)
      .innerJoin(screenings, eq(films.id, screenings.filmId))
      .where(
        and(
          gte(screenings.datetime, startDate),
          lte(screenings.datetime, endDate),
          or(
            ilike(films.title, searchPattern),
            sql`array_to_string(${films.directors}, ', ') ILIKE ${searchPattern}`
          )
        )
      )
      .orderBy(asc(films.title))
      .limit(50);

    return NextResponse.json(
      { results },
      {
        headers: {
          // Cache search results for 5 minutes
          "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
        },
      }
    );
  } catch (error) {
    console.error("Film search error:", error);
    return NextResponse.json({ results: [] }, { status: 500 });
  }
}
