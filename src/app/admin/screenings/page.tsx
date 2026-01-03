/**
 * Admin Screenings Page
 * Browse and manage all screenings with full CRUD capabilities
 * Phase 1: Basic listing with filters
 */

import { db } from "@/db";
import { screenings, films, cinemas } from "@/db/schema";
import { eq, gte, lte, and, desc, asc, ilike, or } from "drizzle-orm";
import { startOfDay, endOfDay, addDays, format, parseISO } from "date-fns";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Film, Calendar, MapPin, ExternalLink, ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/cn";

export const dynamic = "force-dynamic";

interface SearchParams {
  cinema?: string;
  date?: string;
  page?: string;
  search?: string;
}

const PAGE_SIZE = 50;

export default async function AdminScreeningsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const now = new Date();

  // Parse filters
  const selectedCinema = params.cinema || null;
  const selectedDate = params.date ? parseISO(params.date) : null;
  const searchQuery = params.search || null;
  const page = parseInt(params.page || "1", 10);
  const offset = (page - 1) * PAGE_SIZE;

  // Build date range
  const dateStart = selectedDate ? startOfDay(selectedDate) : startOfDay(now);
  const dateEnd = selectedDate ? endOfDay(selectedDate) : endOfDay(addDays(now, 7));

  // Build where conditions
  const conditions = [
    gte(screenings.datetime, dateStart),
    lte(screenings.datetime, dateEnd),
  ];

  if (selectedCinema) {
    conditions.push(eq(screenings.cinemaId, selectedCinema));
  }

  // Fetch screenings with film and cinema info
  const results = await db
    .select({
      id: screenings.id,
      datetime: screenings.datetime,
      format: screenings.format,
      screen: screenings.screen,
      eventType: screenings.eventType,
      bookingUrl: screenings.bookingUrl,
      film: {
        id: films.id,
        title: films.title,
        year: films.year,
        posterUrl: films.posterUrl,
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
    .where(and(...conditions))
    .orderBy(asc(screenings.datetime))
    .limit(PAGE_SIZE)
    .offset(offset);

  // Fetch cinema list for filter
  const allCinemas = await db
    .select({ id: cinemas.id, name: cinemas.name, shortName: cinemas.shortName })
    .from(cinemas)
    .where(eq(cinemas.isActive, true))
    .orderBy(cinemas.name);

  // Generate date options (today + next 7 days)
  const dateOptions = Array.from({ length: 8 }, (_, i) => {
    const date = addDays(now, i);
    return {
      value: format(date, "yyyy-MM-dd"),
      label: format(date, "EEE, MMM d"),
    };
  });

  // Build pagination URLs
  const buildUrl = (newPage: number) => {
    const searchParamsObj = new URLSearchParams();
    if (selectedCinema) searchParamsObj.set("cinema", selectedCinema);
    if (selectedDate) searchParamsObj.set("date", format(selectedDate, "yyyy-MM-dd"));
    searchParamsObj.set("page", String(newPage));
    return `/admin/screenings?${searchParamsObj.toString()}`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display text-text-primary">Screenings</h1>
          <p className="text-text-secondary mt-1">
            Browse and manage all screenings
          </p>
        </div>
        <Button variant="primary" size="sm">
          + Add Screening
        </Button>
      </div>

      {/* Filters */}
      <Card padding="sm">
        <div className="flex flex-wrap gap-4 items-center">
          {/* Cinema Filter */}
          <div className="flex-1 min-w-[200px]">
            <label className="text-xs text-text-tertiary block mb-1">Cinema</label>
            <div className="flex flex-wrap gap-2">
              <FilterLink
                href={`/admin/screenings${selectedDate ? `?date=${format(selectedDate, "yyyy-MM-dd")}` : ""}`}
                active={!selectedCinema}
              >
                All
              </FilterLink>
              {allCinemas.slice(0, 8).map((cinema) => (
                <FilterLink
                  key={cinema.id}
                  href={`/admin/screenings?cinema=${cinema.id}${selectedDate ? `&date=${format(selectedDate, "yyyy-MM-dd")}` : ""}`}
                  active={selectedCinema === cinema.id}
                >
                  {cinema.shortName || cinema.name}
                </FilterLink>
              ))}
            </div>
          </div>

          {/* Date Filter */}
          <div>
            <label className="text-xs text-text-tertiary block mb-1">Date</label>
            <div className="flex flex-wrap gap-2">
              <FilterLink
                href={`/admin/screenings${selectedCinema ? `?cinema=${selectedCinema}` : ""}`}
                active={!selectedDate}
              >
                Next 7 days
              </FilterLink>
              {dateOptions.slice(0, 5).map((opt) => (
                <FilterLink
                  key={opt.value}
                  href={`/admin/screenings?date=${opt.value}${selectedCinema ? `&cinema=${selectedCinema}` : ""}`}
                  active={!!selectedDate && format(selectedDate, "yyyy-MM-dd") === opt.value}
                >
                  {opt.label}
                </FilterLink>
              ))}
            </div>
          </div>
        </div>
      </Card>

      {/* Results */}
      <div className="space-y-2">
        <p className="text-sm text-text-tertiary">
          Showing {results.length} screenings
          {selectedCinema && ` at ${allCinemas.find(c => c.id === selectedCinema)?.name}`}
        </p>

        <div className="space-y-2">
          {results.map((screening) => (
            <ScreeningRow key={screening.id} screening={screening} />
          ))}
        </div>

        {results.length === 0 && (
          <Card className="text-center py-12">
            <Film className="w-12 h-12 text-text-tertiary mx-auto mb-4" />
            <p className="text-text-secondary">No screenings found</p>
            <p className="text-sm text-text-tertiary mt-1">
              Try adjusting your filters
            </p>
          </Card>
        )}
      </div>

      {/* Pagination */}
      {results.length === PAGE_SIZE && (
        <div className="flex justify-center gap-2">
          {page > 1 && (
            <Link
              href={buildUrl(page - 1)}
              className="inline-flex items-center gap-1 px-3 py-2 text-sm bg-background-secondary rounded hover:bg-background-hover"
            >
              <ChevronLeft className="w-4 h-4" />
              Previous
            </Link>
          )}
          <Link
            href={buildUrl(page + 1)}
            className="inline-flex items-center gap-1 px-3 py-2 text-sm bg-background-secondary rounded hover:bg-background-hover"
          >
            Next
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      )}
    </div>
  );
}

// Filter Link Component
function FilterLink({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "px-3 py-1.5 text-xs rounded-full transition-colors",
        active
          ? "bg-accent-primary text-white"
          : "bg-background-tertiary text-text-secondary hover:bg-background-hover"
      )}
    >
      {children}
    </Link>
  );
}

// Screening Row Component
function ScreeningRow({
  screening,
}: {
  screening: {
    id: string;
    datetime: Date;
    format: string | null;
    screen: string | null;
    eventType: string | null;
    bookingUrl: string | null;
    film: {
      id: string;
      title: string;
      year: number | null;
      posterUrl: string | null;
    };
    cinema: {
      id: string;
      name: string;
      shortName: string | null;
    };
  };
}) {
  return (
    <Card padding="sm" className="hover:border-border-default transition-colors">
      <div className="flex items-center gap-4">
        {/* Poster thumbnail */}
        <div className="w-12 h-16 bg-background-tertiary rounded overflow-hidden shrink-0">
          {screening.film.posterUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={screening.film.posterUrl}
              alt=""
              className="w-full h-full object-cover"
            />
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-2">
            <h3 className="font-medium text-text-primary truncate">
              {screening.film.title}
            </h3>
            {screening.film.year && (
              <span className="text-sm text-text-tertiary">
                ({screening.film.year})
              </span>
            )}
          </div>
          <div className="flex items-center gap-4 mt-1 text-sm text-text-secondary">
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              {format(screening.datetime, "EEE d MMM, HH:mm")}
            </span>
            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5" />
              {screening.cinema.shortName || screening.cinema.name}
            </span>
            {screening.format && (
              <span className="text-xs px-1.5 py-0.5 bg-background-tertiary rounded">
                {screening.format}
              </span>
            )}
            {screening.eventType && screening.eventType !== "standard" && (
              <span className="text-xs px-1.5 py-0.5 bg-accent-primary/10 text-accent-primary rounded">
                {screening.eventType}
              </span>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 shrink-0">
          {screening.bookingUrl && (
            <a
              href={screening.bookingUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 text-text-tertiary hover:text-text-primary"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
          )}
          <Button variant="ghost" size="sm">
            Edit
          </Button>
        </div>
      </div>
    </Card>
  );
}
