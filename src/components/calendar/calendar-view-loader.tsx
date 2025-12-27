"use client";

import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { addDays, format } from "date-fns";
import { CalendarView } from "./calendar-view";
import { ErrorBoundary } from "@/components/error-boundary";
import { Loader2, ChevronDown } from "lucide-react";

interface Screening {
  id: string;
  datetime: Date;
  format?: string | null;
  screen?: string | null;
  eventType?: string | null;
  eventDescription?: string | null;
  isSpecialEvent?: boolean;
  bookingUrl: string;
  film: {
    id: string;
    title: string;
    year?: number | null;
    directors: string[];
    posterUrl?: string | null;
    runtime?: number | null;
    isRepertory: boolean;
    genres?: string[];
    decade?: string | null;
  };
  cinema: {
    id: string;
    name: string;
    shortName?: string | null;
  };
}

interface CinemaWithCoords {
  id: string;
  name: string;
  shortName: string | null;
  coordinates: { lat: number; lng: number } | null;
}

interface CalendarViewWithLoaderProps {
  initialScreenings: Screening[];
  cinemas: CinemaWithCoords[];
}

async function fetchMoreScreenings(startDay: number, endDay: number): Promise<Screening[]> {
  const now = new Date();
  const startDate = addDays(now, startDay);
  const endDate = addDays(now, endDay);

  const params = new URLSearchParams({
    startDate: startDate.toISOString(),
    endDate: endDate.toISOString(),
  });

  const res = await fetch(`/api/screenings?${params}`);
  if (!res.ok) throw new Error("Failed to fetch screenings");

  const data = await res.json();
  return data.screenings;
}

export function CalendarViewWithLoader({ initialScreenings, cinemas }: CalendarViewWithLoaderProps) {
  // Track load state (0 = initial 3 days, 1 = week 1 complete, 2-4 = additional weeks)
  const [loadState, setLoadState] = useState(0);
  const maxLoadState = 4; // Up to 4 weeks (28 days)

  // Fetch rest of week 1 (days 4-7) - server only sends 3 days for fast initial load
  const week1RestQuery = useQuery({
    queryKey: ["screenings", "week1-rest"],
    queryFn: () => fetchMoreScreenings(3, 7),
    enabled: loadState >= 1,
    staleTime: 5 * 60 * 1000,
  });

  // Fetch week 2 (days 8-14)
  const week2Query = useQuery({
    queryKey: ["screenings", "week2"],
    queryFn: () => fetchMoreScreenings(7, 14),
    enabled: loadState >= 2,
    staleTime: 5 * 60 * 1000,
  });

  // Fetch week 3 (days 15-21)
  const week3Query = useQuery({
    queryKey: ["screenings", "week3"],
    queryFn: () => fetchMoreScreenings(14, 21),
    enabled: loadState >= 3,
    staleTime: 5 * 60 * 1000,
  });

  // Fetch week 4 (days 22-28)
  const week4Query = useQuery({
    queryKey: ["screenings", "week4"],
    queryFn: () => fetchMoreScreenings(21, 28),
    enabled: loadState >= 4,
    staleTime: 5 * 60 * 1000,
  });

  // Merge all loaded screenings
  const allScreenings = useMemo(() => {
    const screenings = [...initialScreenings];

    if (week1RestQuery.data) {
      screenings.push(...week1RestQuery.data);
    }
    if (week2Query.data) {
      screenings.push(...week2Query.data);
    }
    if (week3Query.data) {
      screenings.push(...week3Query.data);
    }
    if (week4Query.data) {
      screenings.push(...week4Query.data);
    }

    // Deduplicate by ID and sort by datetime
    const uniqueMap = new Map<string, Screening>();
    for (const s of screenings) {
      uniqueMap.set(s.id, s);
    }

    return Array.from(uniqueMap.values()).sort(
      (a, b) => new Date(a.datetime).getTime() - new Date(b.datetime).getTime()
    );
  }, [initialScreenings, week1RestQuery.data, week2Query.data, week3Query.data, week4Query.data]);

  const isLoading =
    (loadState >= 1 && week1RestQuery.isLoading) ||
    (loadState >= 2 && week2Query.isLoading) ||
    (loadState >= 3 && week3Query.isLoading) ||
    (loadState >= 4 && week4Query.isLoading);

  const canLoadMore = loadState < maxLoadState;

  const handleLoadMore = () => {
    if (canLoadMore) {
      setLoadState((s) => s + 1);
    }
  };

  // Calculate what date range we're showing
  // loadState 0 = 3 days, 1 = 7 days, 2 = 14 days, etc.
  const daysShowing = loadState === 0 ? 3 : loadState * 7;
  const endDate = addDays(new Date(), daysShowing);
  const dateLabel = format(endDate, "d MMMM");

  return (
    <div>
      <ErrorBoundary>
        <CalendarView screenings={allScreenings} cinemas={cinemas} />
      </ErrorBoundary>

      {/* Load More Button */}
      {canLoadMore && (
        <div className="flex justify-center py-8">
          <button
            onClick={handleLoadMore}
            disabled={isLoading}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-background-secondary border border-border-subtle text-text-secondary hover:text-text-primary hover:border-border-default shadow-card transition-all disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Loading more screenings...
              </>
            ) : (
              <>
                <ChevronDown className="w-4 h-4" />
                Load more (showing until {dateLabel})
              </>
            )}
          </button>
        </div>
      )}

      {/* All loaded indicator */}
      {!canLoadMore && allScreenings.length > 0 && (
        <div className="text-center py-8 text-text-tertiary text-sm">
          Showing all screenings for the next 4 weeks
        </div>
      )}
    </div>
  );
}
