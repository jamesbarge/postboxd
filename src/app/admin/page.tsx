/**
 * Admin Health Overview Dashboard
 * Shows cinema status, scraper health, and system-wide metrics
 * Phase 1: Basic cinema status and screening counts
 */

import { db } from "@/db";
import { cinemas, screenings, films } from "@/db/schema";
import { eq, gte, count, and, sql, countDistinct, lte } from "drizzle-orm";
import { subDays, startOfDay, endOfDay, format, subWeeks, isSameDay } from "date-fns";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import {
  CheckCircle,
  AlertTriangle,
  XCircle,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  Minus,
} from "lucide-react";
import { cn } from "@/lib/cn";
import Link from "next/link";

export const dynamic = "force-dynamic";

// Status thresholds for cinema health
type CinemaStatus = "healthy" | "warning" | "error";

interface CinemaHealth {
  id: string;
  name: string;
  shortName: string | null;
  tier: "top" | "standard";
  screeningCount: number;
  lastWeekCount: number;
  percentChange: number;
  status: CinemaStatus;
}

// Determine status based on screening count changes
function getStatus(current: number, lastWeek: number, tier: "top" | "standard"): CinemaStatus {
  if (current === 0) return "error";

  const percentChange = lastWeek > 0
    ? ((current - lastWeek) / lastWeek) * 100
    : 0;

  // Top tier cinemas (independents) are more sensitive
  const threshold = tier === "top" ? 30 : 50;

  if (percentChange < -threshold) return "warning";
  return "healthy";
}

// Independent cinemas are top tier
const INDEPENDENT_CHAINS = ["independent", null];

export default async function AdminDashboard() {
  const now = new Date();
  const today = startOfDay(now);
  const todayEnd = endOfDay(now);
  const lastWeekSameDay = subWeeks(today, 1);
  const lastWeekSameDayEnd = endOfDay(lastWeekSameDay);
  const threeDaysAhead = endOfDay(subDays(now, -3));

  // Fetch cinema data with screening counts (today and last week same day)
  const cinemasWithStats = await db
    .select({
      id: cinemas.id,
      name: cinemas.name,
      shortName: cinemas.shortName,
      chain: cinemas.chain,
      isActive: cinemas.isActive,
    })
    .from(cinemas)
    .where(eq(cinemas.isActive, true))
    .orderBy(cinemas.name);

  // Get screening counts for each cinema - today
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

  // Get screening counts for last week same day
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

  // Get upcoming screening counts (next 3 days)
  const upcomingCounts = await db
    .select({
      cinemaId: screenings.cinemaId,
      count: count(screenings.id),
    })
    .from(screenings)
    .where(
      and(
        gte(screenings.datetime, now),
        lte(screenings.datetime, threeDaysAhead)
      )
    )
    .groupBy(screenings.cinemaId);

  // Build cinema health data
  const todayMap = new Map(todayCounts.map(c => [c.cinemaId, c.count]));
  const lastWeekMap = new Map(lastWeekCounts.map(c => [c.cinemaId, c.count]));
  const upcomingMap = new Map(upcomingCounts.map(c => [c.cinemaId, c.count]));

  const cinemaHealth: CinemaHealth[] = cinemasWithStats.map(cinema => {
    const tier = INDEPENDENT_CHAINS.includes(cinema.chain) ? "top" : "standard";
    const current = todayMap.get(cinema.id) || 0;
    const lastWeek = lastWeekMap.get(cinema.id) || 0;
    const percentChange = lastWeek > 0
      ? ((current - lastWeek) / lastWeek) * 100
      : current > 0 ? 100 : 0;

    return {
      id: cinema.id,
      name: cinema.name,
      shortName: cinema.shortName,
      tier,
      screeningCount: upcomingMap.get(cinema.id) || 0,
      lastWeekCount: lastWeek,
      percentChange,
      status: getStatus(current, lastWeek, tier),
    };
  });

  // Sort by status (errors first) then by name
  const sortedCinemas = cinemaHealth.sort((a, b) => {
    const statusOrder = { error: 0, warning: 1, healthy: 2 };
    if (statusOrder[a.status] !== statusOrder[b.status]) {
      return statusOrder[a.status] - statusOrder[b.status];
    }
    return a.name.localeCompare(b.name);
  });

  // Calculate summary stats
  const totalScreenings = upcomingCounts.reduce((sum, c) => sum + c.count, 0);
  const healthyCinemas = cinemaHealth.filter(c => c.status === "healthy").length;
  const warningCinemas = cinemaHealth.filter(c => c.status === "warning").length;
  const errorCinemas = cinemaHealth.filter(c => c.status === "error").length;

  // Get unique films count
  const [filmStats] = await db
    .select({
      totalFilms: countDistinct(screenings.filmId),
    })
    .from(screenings)
    .where(gte(screenings.datetime, now));

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-display text-text-primary">Health Overview</h1>
        <p className="text-text-secondary mt-1">
          Monitor cinema status and scraper health. Last checked: {format(now, "HH:mm")}
        </p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard
          label="Upcoming Screenings"
          value={totalScreenings}
          subtext="Next 3 days"
        />
        <StatCard
          label="Unique Films"
          value={filmStats?.totalFilms || 0}
          subtext="With screenings"
        />
        <StatCard
          label="Healthy Cinemas"
          value={healthyCinemas}
          total={cinemaHealth.length}
          variant="success"
        />
        <StatCard
          label="Issues Detected"
          value={warningCinemas + errorCinemas}
          subtext={`${warningCinemas} warnings, ${errorCinemas} errors`}
          variant={errorCinemas > 0 ? "error" : warningCinemas > 0 ? "warning" : "default"}
        />
      </div>

      {/* Cinema Health Grid */}
      <div>
        <h2 className="text-lg font-display text-text-primary mb-4">
          Cinema Status
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sortedCinemas.map(cinema => (
            <CinemaCard key={cinema.id} cinema={cinema} />
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader heading="Quick Actions" />
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <ActionButton
              href="/admin/screenings"
              icon={<RefreshCw className="w-4 h-4" />}
              label="Browse Screenings"
            />
            <ActionButton
              href="/admin/anomalies"
              icon={<AlertTriangle className="w-4 h-4" />}
              label="View Anomalies"
              variant={errorCinemas > 0 ? "warning" : "default"}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Stat Card Component
function StatCard({
  label,
  value,
  subtext,
  total,
  variant = "default",
}: {
  label: string;
  value: number;
  subtext?: string;
  total?: number;
  variant?: "default" | "success" | "warning" | "error";
}) {
  const variantStyles = {
    default: "",
    success: "border-l-4 border-l-green-500",
    warning: "border-l-4 border-l-yellow-500",
    error: "border-l-4 border-l-red-500",
  };

  return (
    <Card className={cn(variantStyles[variant])}>
      <div className="p-4">
        <p className="text-sm text-text-secondary">{label}</p>
        <p className="text-2xl font-mono text-text-primary mt-1">
          {value.toLocaleString()}
          {total && (
            <span className="text-sm text-text-tertiary">/{total}</span>
          )}
        </p>
        {subtext && (
          <p className="text-xs text-text-tertiary mt-1">{subtext}</p>
        )}
      </div>
    </Card>
  );
}

// Cinema Card Component
function CinemaCard({ cinema }: { cinema: CinemaHealth }) {
  const statusConfig = {
    healthy: {
      icon: <CheckCircle className="w-5 h-5 text-green-500" />,
      border: "border-l-green-500",
      bg: "bg-green-500/5",
    },
    warning: {
      icon: <AlertTriangle className="w-5 h-5 text-yellow-500" />,
      border: "border-l-yellow-500",
      bg: "bg-yellow-500/5",
    },
    error: {
      icon: <XCircle className="w-5 h-5 text-red-500" />,
      border: "border-l-red-500",
      bg: "bg-red-500/5",
    },
  };

  const config = statusConfig[cinema.status];
  const trendIcon = cinema.percentChange > 5 ? (
    <TrendingUp className="w-4 h-4 text-green-500" />
  ) : cinema.percentChange < -5 ? (
    <TrendingDown className="w-4 h-4 text-red-500" />
  ) : (
    <Minus className="w-4 h-4 text-text-tertiary" />
  );

  return (
    <Card className={cn("border-l-4", config.border, config.bg)}>
      <div className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-medium text-text-primary truncate">
                {cinema.shortName || cinema.name}
              </h3>
              {cinema.tier === "top" && (
                <span className="text-xs px-1.5 py-0.5 bg-accent-primary/10 text-accent-primary rounded">
                  Top
                </span>
              )}
            </div>
            <p className="text-sm text-text-secondary mt-1">
              {cinema.screeningCount} upcoming screenings
            </p>
          </div>
          {config.icon}
        </div>

        <div className="mt-3 pt-3 border-t border-border-subtle flex items-center justify-between text-xs">
          <span className="text-text-tertiary flex items-center gap-1">
            {trendIcon}
            <span>
              {cinema.percentChange > 0 ? "+" : ""}
              {cinema.percentChange.toFixed(0)}% vs last week
            </span>
          </span>
          <Link
            href={`/admin/screenings?cinema=${cinema.id}`}
            className="text-accent-primary hover:underline"
          >
            View →
          </Link>
        </div>
      </div>
    </Card>
  );
}

// Action Button Component
function ActionButton({
  href,
  icon,
  label,
  variant = "default",
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
  variant?: "default" | "warning";
}) {
  return (
    <Link
      href={href}
      className={cn(
        "inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors",
        variant === "warning"
          ? "bg-yellow-500/10 text-yellow-700 hover:bg-yellow-500/20"
          : "bg-background-tertiary text-text-secondary hover:bg-background-hover hover:text-text-primary"
      )}
    >
      {icon}
      {label}
    </Link>
  );
}
