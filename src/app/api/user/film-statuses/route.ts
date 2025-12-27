import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { userFilmStatuses } from "@/db/schema";
import { eq, sql } from "drizzle-orm";
import { requireAuth, unauthorizedResponse } from "@/lib/auth";

/**
 * GET /api/user/film-statuses - Fetch all film statuses for the current user
 */
export async function GET() {
  try {
    const userId = await requireAuth();

    const statuses = await db.query.userFilmStatuses.findMany({
      where: eq(userFilmStatuses.userId, userId),
    });

    // Transform to a map format for easy client-side merging
    const statusMap: Record<string, typeof statuses[number]> = {};
    for (const status of statuses) {
      statusMap[status.filmId] = status;
    }

    return NextResponse.json({ statuses: statusMap });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return unauthorizedResponse();
    }
    console.error("Film statuses fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch film statuses" }, { status: 500 });
  }
}

interface FilmStatusPayload {
  filmId: string;
  status: "want_to_see" | "seen" | "not_interested";
  addedAt: string;
  seenAt?: string | null;
  rating?: number | null;
  notes?: string | null;
  filmTitle?: string | null;
  filmYear?: number | null;
  filmDirectors?: string[] | null;
  filmPosterUrl?: string | null;
  updatedAt: string;
}

/**
 * POST /api/user/film-statuses - Bulk upsert film statuses
 * Used for syncing local state to server
 *
 * Optimized: Uses batch fetch + conditional upsert instead of N+1 queries
 * Before: 2N queries (check + update/insert per status)
 * After: 2 queries (fetch all existing + batch upsert)
 */
export async function POST(request: NextRequest) {
  try {
    const userId = await requireAuth();
    const body = await request.json();
    const { statuses } = body as { statuses: FilmStatusPayload[] };

    if (!Array.isArray(statuses) || statuses.length === 0) {
      return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
    }

    // 1. Fetch all existing statuses for this user in ONE query
    const existingStatuses = await db.query.userFilmStatuses.findMany({
      where: eq(userFilmStatuses.userId, userId),
    });

    // Build a map for O(1) lookups
    const existingMap = new Map(
      existingStatuses.map((s) => [s.filmId, s])
    );

    // 2. Filter statuses to only those that need updating (incoming is newer)
    const toUpsert = statuses.filter((status) => {
      const existing = existingMap.get(status.filmId);
      if (!existing) return true; // New entry, always insert

      // Only update if incoming timestamp is newer
      const existingTime = new Date(existing.updatedAt).getTime();
      const incomingTime = new Date(status.updatedAt).getTime();
      return incomingTime > existingTime;
    });

    if (toUpsert.length === 0) {
      return NextResponse.json({
        success: true,
        results: { processed: 0, skipped: statuses.length }
      });
    }

    // 3. Batch upsert using ON CONFLICT DO UPDATE
    // This handles both inserts and updates in a single query
    await db
      .insert(userFilmStatuses)
      .values(
        toUpsert.map((status) => ({
          userId,
          filmId: status.filmId,
          status: status.status,
          addedAt: new Date(status.addedAt),
          seenAt: status.seenAt ? new Date(status.seenAt) : null,
          rating: status.rating ?? null,
          notes: status.notes ?? null,
          filmTitle: status.filmTitle ?? null,
          filmYear: status.filmYear ?? null,
          filmDirectors: status.filmDirectors ?? null,
          filmPosterUrl: status.filmPosterUrl ?? null,
          updatedAt: new Date(status.updatedAt),
        }))
      )
      .onConflictDoUpdate({
        target: [userFilmStatuses.userId, userFilmStatuses.filmId],
        set: {
          status: sql`excluded.status`,
          addedAt: sql`excluded.added_at`,
          seenAt: sql`excluded.seen_at`,
          rating: sql`excluded.rating`,
          notes: sql`excluded.notes`,
          filmTitle: sql`excluded.film_title`,
          filmYear: sql`excluded.film_year`,
          filmDirectors: sql`excluded.film_directors`,
          filmPosterUrl: sql`excluded.film_poster_url`,
          updatedAt: sql`excluded.updated_at`,
        },
      });

    return NextResponse.json({
      success: true,
      results: {
        processed: toUpsert.length,
        skipped: statuses.length - toUpsert.length
      }
    });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return unauthorizedResponse();
    }
    console.error("Film statuses sync error:", error);
    return NextResponse.json({ error: "Failed to sync film statuses" }, { status: 500 });
  }
}
