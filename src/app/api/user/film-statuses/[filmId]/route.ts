import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { userFilmStatuses } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { requireAuth, unauthorizedResponse } from "@/lib/auth";

interface RouteParams {
  params: Promise<{ filmId: string }>;
}

/**
 * PUT /api/user/film-statuses/[filmId] - Update a single film status
 */
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const userId = await requireAuth();
    const { filmId } = await params;
    const body = await request.json();

    const {
      status,
      addedAt,
      seenAt,
      rating,
      notes,
      filmTitle,
      filmYear,
      filmDirectors,
      filmPosterUrl,
      updatedAt,
    } = body;

    // Check if entry exists
    const existing = await db.query.userFilmStatuses.findFirst({
      where: and(
        eq(userFilmStatuses.userId, userId),
        eq(userFilmStatuses.filmId, filmId)
      ),
    });

    if (existing) {
      // Update existing
      await db
        .update(userFilmStatuses)
        .set({
          status,
          addedAt: addedAt ? new Date(addedAt) : undefined,
          seenAt: seenAt ? new Date(seenAt) : null,
          rating: rating ?? null,
          notes: notes ?? null,
          filmTitle: filmTitle ?? null,
          filmYear: filmYear ?? null,
          filmDirectors: filmDirectors ?? null,
          filmPosterUrl: filmPosterUrl ?? null,
          updatedAt: new Date(updatedAt || Date.now()),
        })
        .where(eq(userFilmStatuses.id, existing.id));
    } else {
      // Insert new
      await db.insert(userFilmStatuses).values({
        userId,
        filmId,
        status,
        addedAt: new Date(addedAt || Date.now()),
        seenAt: seenAt ? new Date(seenAt) : null,
        rating: rating ?? null,
        notes: notes ?? null,
        filmTitle: filmTitle ?? null,
        filmYear: filmYear ?? null,
        filmDirectors: filmDirectors ?? null,
        filmPosterUrl: filmPosterUrl ?? null,
        updatedAt: new Date(updatedAt || Date.now()),
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return unauthorizedResponse();
    }
    console.error("Film status update error:", error);
    return NextResponse.json({ error: "Failed to update film status" }, { status: 500 });
  }
}

/**
 * DELETE /api/user/film-statuses/[filmId] - Remove a film status
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const userId = await requireAuth();
    const { filmId } = await params;

    await db
      .delete(userFilmStatuses)
      .where(
        and(
          eq(userFilmStatuses.userId, userId),
          eq(userFilmStatuses.filmId, filmId)
        )
      );

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return unauthorizedResponse();
    }
    console.error("Film status delete error:", error);
    return NextResponse.json({ error: "Failed to delete film status" }, { status: 500 });
  }
}
