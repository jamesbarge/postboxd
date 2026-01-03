/**
 * Admin Anomalies Page
 * Review and resolve data anomalies detected by the system
 * Phase 1: Placeholder with manual anomaly simulation
 */

import { db } from "@/db";
import { cinemas, screenings } from "@/db/schema";
import { eq, gte, lte, count, and, sql } from "drizzle-orm";
import { startOfDay, endOfDay, subWeeks, format } from "date-fns";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle, CheckCircle, XCircle, Zap, RefreshCw } from "lucide-react";
import { cn } from "@/lib/cn";
import Link from "next/link";

export const dynamic = "force-dynamic";

// Simulate anomaly detection - in Phase 2 this will use the scraper_runs table
interface DetectedAnomaly {
  cinemaId: string;
  cinemaName: string;
  type: "low_count" | "zero_results" | "high_variance";
  severity: "warning" | "error";
  todayCount: number;
  lastWeekCount: number;
  percentChange: number;
  detectedAt: Date;
}

// Independent cinemas (top tier)
const INDEPENDENT_CHAINS = ["independent", null];

export default async function AdminAnomaliesPage() {
  const now = new Date();
  const today = startOfDay(now);
  const todayEnd = endOfDay(now);
  const lastWeekSameDay = subWeeks(today, 1);
  const lastWeekSameDayEnd = endOfDay(lastWeekSameDay);

  // Fetch all active cinemas
  const allCinemas = await db
    .select({
      id: cinemas.id,
      name: cinemas.name,
      shortName: cinemas.shortName,
      chain: cinemas.chain,
    })
    .from(cinemas)
    .where(eq(cinemas.isActive, true));

  // Get today's counts
  const todayCounts = await db
    .select({
      cinemaId: screenings.cinemaId,
      count: count(screenings.id),
    })
    .from(screenings)
    .where(
      and(
        gte(screenings.datetime, today),
        lte(screenings.datetime, todayEnd)
      )
    )
    .groupBy(screenings.cinemaId);

  // Get last week same day counts
  const lastWeekCounts = await db
    .select({
      cinemaId: screenings.cinemaId,
      count: count(screenings.id),
    })
    .from(screenings)
    .where(
      and(
        gte(screenings.datetime, lastWeekSameDay),
        lte(screenings.datetime, lastWeekSameDayEnd)
      )
    )
    .groupBy(screenings.cinemaId);

  // Build maps
  const todayMap = new Map(todayCounts.map(c => [c.cinemaId, c.count]));
  const lastWeekMap = new Map(lastWeekCounts.map(c => [c.cinemaId, c.count]));

  // Detect anomalies
  const anomalies: DetectedAnomaly[] = [];

  for (const cinema of allCinemas) {
    const todayCount = todayMap.get(cinema.id) || 0;
    const lastWeekCount = lastWeekMap.get(cinema.id) || 0;

    // Skip if both are zero (cinema might not have listings for this day)
    if (todayCount === 0 && lastWeekCount === 0) continue;

    const percentChange = lastWeekCount > 0
      ? ((todayCount - lastWeekCount) / lastWeekCount) * 100
      : todayCount > 0 ? 100 : -100;

    const isTopTier = INDEPENDENT_CHAINS.includes(cinema.chain);
    const threshold = isTopTier ? 30 : 50;

    // Zero results is always an error for cinemas that had screenings last week
    if (todayCount === 0 && lastWeekCount > 0) {
      anomalies.push({
        cinemaId: cinema.id,
        cinemaName: cinema.shortName || cinema.name,
        type: "zero_results",
        severity: "error",
        todayCount,
        lastWeekCount,
        percentChange,
        detectedAt: now,
      });
    }
    // Significant drop
    else if (percentChange < -threshold && lastWeekCount >= 3) {
      anomalies.push({
        cinemaId: cinema.id,
        cinemaName: cinema.shortName || cinema.name,
        type: "low_count",
        severity: isTopTier ? "error" : "warning",
        todayCount,
        lastWeekCount,
        percentChange,
        detectedAt: now,
      });
    }
    // Unusual increase (might indicate duplicate scraping)
    else if (percentChange > 100 && todayCount > lastWeekCount + 10) {
      anomalies.push({
        cinemaId: cinema.id,
        cinemaName: cinema.shortName || cinema.name,
        type: "high_variance",
        severity: "warning",
        todayCount,
        lastWeekCount,
        percentChange,
        detectedAt: now,
      });
    }
  }

  // Sort by severity (errors first)
  const sortedAnomalies = anomalies.sort((a, b) => {
    if (a.severity !== b.severity) {
      return a.severity === "error" ? -1 : 1;
    }
    return a.cinemaName.localeCompare(b.cinemaName);
  });

  const errorCount = anomalies.filter(a => a.severity === "error").length;
  const warningCount = anomalies.filter(a => a.severity === "warning").length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display text-text-primary">Anomalies</h1>
          <p className="text-text-secondary mt-1">
            Review and resolve data issues detected by the system
          </p>
        </div>
        <Button variant="secondary" size="sm">
          <RefreshCw className="w-4 h-4 mr-2" />
          Re-scan All
        </Button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-l-4 border-l-red-500">
          <div className="p-4">
            <div className="flex items-center gap-2">
              <XCircle className="w-5 h-5 text-red-500" />
              <span className="text-sm text-text-secondary">Errors</span>
            </div>
            <p className="text-2xl font-mono text-text-primary mt-1">{errorCount}</p>
          </div>
        </Card>
        <Card className="border-l-4 border-l-yellow-500">
          <div className="p-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-yellow-500" />
              <span className="text-sm text-text-secondary">Warnings</span>
            </div>
            <p className="text-2xl font-mono text-text-primary mt-1">{warningCount}</p>
          </div>
        </Card>
        <Card className="border-l-4 border-l-green-500">
          <div className="p-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <span className="text-sm text-text-secondary">Healthy</span>
            </div>
            <p className="text-2xl font-mono text-text-primary mt-1">
              {allCinemas.length - anomalies.length}
            </p>
          </div>
        </Card>
      </div>

      {/* Comparison Info */}
      <Card>
        <CardContent>
          <p className="text-sm text-text-secondary">
            Comparing <strong>{format(today, "EEEE, d MMMM")}</strong> (today)
            with <strong>{format(lastWeekSameDay, "EEEE, d MMMM")}</strong> (same day last week).
            Independent cinemas alert at &gt;30% change, chains at &gt;50%.
          </p>
        </CardContent>
      </Card>

      {/* Anomaly List */}
      {sortedAnomalies.length > 0 ? (
        <div className="space-y-3">
          <h2 className="text-lg font-display text-text-primary">
            Detected Issues ({sortedAnomalies.length})
          </h2>
          {sortedAnomalies.map((anomaly, index) => (
            <AnomalyCard key={`${anomaly.cinemaId}-${index}`} anomaly={anomaly} />
          ))}
        </div>
      ) : (
        <Card className="text-center py-12">
          <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
          <p className="text-lg font-medium text-text-primary">All systems healthy</p>
          <p className="text-sm text-text-secondary mt-1">
            No anomalies detected comparing today with last week
          </p>
        </Card>
      )}

      {/* Phase 2 Notice */}
      <Card className="bg-accent-primary/5 border-accent-primary/20">
        <CardContent>
          <div className="flex items-start gap-3">
            <Zap className="w-5 h-5 text-accent-primary shrink-0 mt-0.5" />
            <div>
              <h3 className="font-medium text-text-primary">Phase 2: AI Verification</h3>
              <p className="text-sm text-text-secondary mt-1">
                In the next phase, anomalies will trigger AI verification agents that can
                automatically visit cinema websites, compare data, and add missing screenings.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function AnomalyCard({ anomaly }: { anomaly: DetectedAnomaly }) {
  const typeLabels = {
    zero_results: "Zero Results",
    low_count: "Low Count",
    high_variance: "High Variance",
  };

  const typeDescriptions = {
    zero_results: "No screenings found but had listings last week",
    low_count: "Significantly fewer screenings than expected",
    high_variance: "Unusually high count - possible duplicates",
  };

  return (
    <Card className={cn(
      "border-l-4",
      anomaly.severity === "error" ? "border-l-red-500 bg-red-500/5" : "border-l-yellow-500 bg-yellow-500/5"
    )}>
      <div className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              {anomaly.severity === "error" ? (
                <XCircle className="w-5 h-5 text-red-500" />
              ) : (
                <AlertTriangle className="w-5 h-5 text-yellow-500" />
              )}
              <h3 className="font-medium text-text-primary">{anomaly.cinemaName}</h3>
              <span className={cn(
                "text-xs px-2 py-0.5 rounded",
                anomaly.severity === "error" ? "bg-red-500/20 text-red-700" : "bg-yellow-500/20 text-yellow-700"
              )}>
                {typeLabels[anomaly.type]}
              </span>
            </div>
            <p className="text-sm text-text-secondary mt-1">
              {typeDescriptions[anomaly.type]}
            </p>
          </div>
        </div>

        <div className="mt-3 flex items-center gap-6 text-sm">
          <div>
            <span className="text-text-tertiary">Today:</span>
            <span className="font-mono ml-1 text-text-primary">{anomaly.todayCount}</span>
          </div>
          <div>
            <span className="text-text-tertiary">Last week:</span>
            <span className="font-mono ml-1 text-text-primary">{anomaly.lastWeekCount}</span>
          </div>
          <div>
            <span className="text-text-tertiary">Change:</span>
            <span className={cn(
              "font-mono ml-1",
              anomaly.percentChange < 0 ? "text-red-600" : "text-green-600"
            )}>
              {anomaly.percentChange > 0 ? "+" : ""}{anomaly.percentChange.toFixed(0)}%
            </span>
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-border-subtle flex gap-2">
          <Link
            href={`/admin/screenings?cinema=${anomaly.cinemaId}`}
            className="text-sm text-accent-primary hover:underline"
          >
            View Screenings →
          </Link>
          <Button variant="ghost" size="sm" className="ml-auto">
            Re-scrape
          </Button>
          <Button variant="secondary" size="sm">
            AI Verify
          </Button>
          <Button variant="ghost" size="sm">
            Dismiss
          </Button>
        </div>
      </div>
    </Card>
  );
}
