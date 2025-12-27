import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { userFilmStatuses } from "@/db/schema";
import { eq } from "drizzle-orm";
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
 */
export async function POST(request: NextRequest) {
  try {
    const userId = await requireAuth();
    const body = await request.json();
    const { statuses } = body as { statuses: FilmStatusPayload[] };

    if (!Array.isArray(statuses)) {
      return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
    }

    // Process each status
    const results = await Promise.all(
      statuses.map(async (status) => {
        // Check if entry exists
        const existing = await db.query.userFilmStatuses.findFirst({
          where: (table, { and, eq }) =>
            and(eq(table.userId, userId), eq(table.filmId, status.filmId)),
        });

        if (existing) {
          // Compare timestamps - only update if incoming is newer
          const existingTime = new Date(existing.updatedAt).getTime();
          const incomingTime = new Date(status.updatedAt).getTime();

          if (incomingTime > existingTime) {
            // Update existing
            await db
              .update(userFilmStatuses)
              .set({
                status: status.status,
                addedAt: new Date(status.addedAt),
                seenAt: status.seenAt ? new Date(status.seenAt) : null,
                rating: status.rating,
                notes: status.notes,
                filmTitle: status.filmTitle,
                filmYear: status.filmYear,
                filmDirectors: status.filmDirectors,
                filmPosterUrl: status.filmPosterUrl,
                updatedAt: new Date(status.updatedAt),
              })
              .where(eq(userFilmStatuses.id, existing.id));
          }
          return { filmId: status.filmId, action: "updated" };
        } else {
          // Insert new
          await db.insert(userFilmStatuses).values({
            userId,
            filmId: status.filmId,
            status: status.status,
            addedAt: new Date(status.addedAt),
            seenAt: status.seenAt ? new Date(status.seenAt) : null,
            rating: status.rating,
            notes: status.notes,
            filmTitle: status.filmTitle,
            filmYear: status.filmYear,
            filmDirectors: status.filmDirectors,
            filmPosterUrl: status.filmPosterUrl,
            updatedAt: new Date(status.updatedAt),
          });
          return { filmId: status.filmId, action: "created" };
        }
      })
    );

    return NextResponse.json({ success: true, results });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return unauthorizedResponse();
    }
    console.error("Film statuses sync error:", error);
    return NextResponse.json({ error: "Failed to sync film statuses" }, { status: 500 });
  }
}
