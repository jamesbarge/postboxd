/**
 * Admin Cinemas Page
 * Configure cinema tiers and baselines for anomaly detection
 */

import { db } from "@/db";
import { cinemas, screenings } from "@/db/schema";
import { eq, gte, count, and } from "drizzle-orm";
import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";
import { CinemaCardWithConfig } from "./components/cinema-card-with-config";

export const dynamic = "force-dynamic";

// Independent cinemas are top tier
const INDEPENDENT_CHAINS = ["independent", null];

export default async function AdminCinemasPage() {
  const now = new Date();

  // Fetch all active cinemas with screening counts
  const cinemasWithStats = await db
    .select({
      id: cinemas.id,
      name: cinemas.name,
      shortName: cinemas.shortName,
      chain: cinemas.chain,
      website: cinemas.website,
      lastScrapedAt: cinemas.lastScrapedAt,
      dataSourceType: cinemas.dataSourceType,
      screeningCount: count(screenings.id),
    })
    .from(cinemas)
    .leftJoin(
      screenings,
      and(
        eq(screenings.cinemaId, cinemas.id),
        gte(screenings.datetime, now)
      )
    )
    .where(eq(cinemas.isActive, true))
    .groupBy(cinemas.id)
    .orderBy(cinemas.name);

  // Group by tier
  const topTier = cinemasWithStats.filter(c => INDEPENDENT_CHAINS.includes(c.chain));
  const standardTier = cinemasWithStats.filter(c => !INDEPENDENT_CHAINS.includes(c.chain));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display text-text-primary">Cinemas</h1>
          <p className="text-text-secondary mt-1">
            Configure cinema tiers and baseline expectations
          </p>
        </div>
      </div>

      {/* Tier Explanation */}
      <Card>
        <CardContent>
          <div className="flex items-start gap-4">
            <AlertCircle className="w-5 h-5 text-accent-primary shrink-0 mt-0.5" />
            <div>
              <h3 className="font-medium text-text-primary">About Cinema Tiers</h3>
              <p className="text-sm text-text-secondary mt-1">
                <strong>Top tier</strong> (independent cinemas): AI verification triggers on ANY anomaly.
                These are the priority venues for data completeness.
              </p>
              <p className="text-sm text-text-secondary mt-1">
                <strong>Standard tier</strong> (chain cinemas): AI verification only triggers on &gt;50% drops.
                More tolerant of normal variation.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Top Tier Cinemas */}
      <div>
        <h2 className="text-lg font-display text-text-primary mb-4 flex items-center gap-2">
          <span className="px-2 py-0.5 bg-accent-primary/10 text-accent-primary text-xs rounded">
            Top Tier
          </span>
          Independent Cinemas ({topTier.length})
        </h2>
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {topTier.map(cinema => (
            <CinemaCardWithConfig
              key={cinema.id}
              cinema={{
                ...cinema,
                lastScrapedAt: cinema.lastScrapedAt?.toISOString() ?? null,
              }}
              tier="top"
            />
          ))}
        </div>
      </div>

      {/* Standard Tier Cinemas */}
      <div>
        <h2 className="text-lg font-display text-text-primary mb-4 flex items-center gap-2">
          <span className="px-2 py-0.5 bg-background-tertiary text-text-secondary text-xs rounded">
            Standard
          </span>
          Chain Cinemas ({standardTier.length})
        </h2>
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {standardTier.map(cinema => (
            <CinemaCardWithConfig
              key={cinema.id}
              cinema={{
                ...cinema,
                lastScrapedAt: cinema.lastScrapedAt?.toISOString() ?? null,
              }}
              tier="standard"
            />
          ))}
        </div>
      </div>
    </div>
  );
}
