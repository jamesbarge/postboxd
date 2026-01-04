/**
 * Cinema Config API
 * Get and update cinema baseline configuration
 *
 * GET /api/admin/cinemas/[id]/config - Fetch config
 * PUT /api/admin/cinemas/[id]/config - Update config
 */

import { auth } from "@clerk/nextjs/server";
import { db } from "@/db";
import { cinemaBaselines, cinemas } from "@/db/schema";
import { eq } from "drizzle-orm";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// Default config for cinemas without baselines
const DEFAULT_CONFIG = {
  tier: "standard" as const,
  tolerancePercent: 30,
  weekdayAvg: null,
  weekendAvg: null,
  manualOverride: false,
  notes: null,
};

export async function GET(request: Request, { params }: RouteParams) {
  // Verify admin auth
  const { userId } = await auth();
  if (!userId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: cinemaId } = await params;

  try {
    // Verify cinema exists
    const [cinema] = await db
      .select({ id: cinemas.id })
      .from(cinemas)
      .where(eq(cinemas.id, cinemaId))
      .limit(1);

    if (!cinema) {
      return Response.json({ error: "Cinema not found" }, { status: 404 });
    }

    // Fetch baseline config
    const [baseline] = await db
      .select()
      .from(cinemaBaselines)
      .where(eq(cinemaBaselines.cinemaId, cinemaId))
      .limit(1);

    if (baseline) {
      return Response.json({
        tier: baseline.tier,
        tolerancePercent: baseline.tolerancePercent,
        weekdayAvg: baseline.weekdayAvg,
        weekendAvg: baseline.weekendAvg,
        manualOverride: baseline.manualOverride,
        notes: baseline.notes,
      });
    }

    // Return defaults if no baseline exists
    return Response.json(DEFAULT_CONFIG);
  } catch (error) {
    console.error("Error fetching cinema config:", error);
    return Response.json(
      { error: "Failed to fetch config" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request, { params }: RouteParams) {
  // Verify admin auth
  const { userId } = await auth();
  if (!userId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: cinemaId } = await params;

  try {
    const body = await request.json();
    const { tier, tolerancePercent, weekdayAvg, weekendAvg, manualOverride, notes } = body;

    // Validate tier
    if (tier && !["top", "standard"].includes(tier)) {
      return Response.json({ error: "Invalid tier" }, { status: 400 });
    }

    // Validate tolerancePercent
    if (tolerancePercent !== undefined) {
      const tolerance = parseInt(tolerancePercent);
      if (isNaN(tolerance) || tolerance < 10 || tolerance > 80) {
        return Response.json(
          { error: "Tolerance must be between 10 and 80" },
          { status: 400 }
        );
      }
    }

    // Verify cinema exists
    const [cinema] = await db
      .select({ id: cinemas.id })
      .from(cinemas)
      .where(eq(cinemas.id, cinemaId))
      .limit(1);

    if (!cinema) {
      return Response.json({ error: "Cinema not found" }, { status: 404 });
    }

    // Check if baseline exists
    const [existing] = await db
      .select({ cinemaId: cinemaBaselines.cinemaId })
      .from(cinemaBaselines)
      .where(eq(cinemaBaselines.cinemaId, cinemaId))
      .limit(1);

    const configData = {
      tier: tier || "standard",
      tolerancePercent: tolerancePercent ?? 30,
      weekdayAvg: weekdayAvg ?? null,
      weekendAvg: weekendAvg ?? null,
      manualOverride: manualOverride ?? false,
      notes: notes ?? null,
      updatedAt: new Date(),
    };

    if (existing) {
      // Update existing baseline
      await db
        .update(cinemaBaselines)
        .set(configData)
        .where(eq(cinemaBaselines.cinemaId, cinemaId));
    } else {
      // Insert new baseline
      await db.insert(cinemaBaselines).values({
        cinemaId,
        ...configData,
      });
    }

    return Response.json({
      success: true,
      message: "Config saved",
    });
  } catch (error) {
    console.error("Error saving cinema config:", error);
    return Response.json(
      { error: "Failed to save config" },
      { status: 500 }
    );
  }
}
