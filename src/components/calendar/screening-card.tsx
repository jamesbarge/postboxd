/**
 * Screening Card Component
 * Displays a single screening with film poster, title, cinema, time, and format
 * Uses design system primitives for badges and buttons
 *
 * Accessibility: Proper aria-labels, focus states, and keyboard navigation
 */

"use client";

import Link from "next/link";
import Image from "next/image";
import { format } from "date-fns";
import { cn } from "@/lib/cn";
import { Button, FormatBadge, EventBadge } from "@/components/ui";
import { ExternalLink, Heart, Eye } from "lucide-react";
import { useFilmStatus } from "@/stores/film-status";
import { useState, useEffect } from "react";

interface ScreeningCardProps {
  screening: {
    id: string;
    datetime: Date;
    format?: string | null;
    screen?: string | null;
    eventType?: string | null;
    eventDescription?: string | null;
    bookingUrl: string;
    film: {
      id: string;
      title: string;
      year?: number | null;
      directors: string[];
      posterUrl?: string | null;
      runtime?: number | null;
      isRepertory: boolean;
    };
    cinema: {
      id: string;
      name: string;
      shortName?: string | null;
    };
  };
}

export function ScreeningCard({ screening }: ScreeningCardProps) {
  const { film, cinema, datetime, format: screeningFormat, eventType } = screening;
  const time = format(new Date(datetime), "HH:mm");
  const formattedDate = format(new Date(datetime), "EEEE d MMMM");

  const { getStatus, setStatus } = useFilmStatus();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const status = mounted ? getStatus(film.id) : null;

  const handleStatusClick = (e: React.MouseEvent, newStatus: "want_to_see" | "seen") => {
    e.preventDefault();
    e.stopPropagation();
    // Toggle off if already set to this status
    setStatus(film.id, status === newStatus ? null : newStatus);
  };

  return (
    <article
      className={cn(
        "group relative flex flex-col rounded-xl overflow-hidden cursor-pointer h-full",
        "bg-background-secondary/30 border border-white/[0.06]",
        // Enhanced hover state
        "hover:border-accent-gold/30 hover:bg-background-secondary/60",
        "hover:shadow-xl hover:shadow-black/30",
        "hover:scale-[1.02] hover:-translate-y-1 transform-gpu",
        "transition-all duration-300 ease-out",
        // Focus-within for keyboard navigation
        "focus-within:ring-2 focus-within:ring-accent-gold/50 focus-within:ring-offset-2 focus-within:ring-offset-background-primary"
      )}
      aria-label={`${film.title} screening at ${cinema.name}, ${formattedDate} at ${time}`}
    >
      {/* Poster - Full width, prominent */}
      <Link
        href={`/film/${film.id}`}
        className="block relative aspect-[2/3] w-full overflow-hidden focus:outline-none"
        tabIndex={-1}
        aria-hidden="true"
      >
        {film.posterUrl && !film.posterUrl.includes('poster-placeholder') ? (
          <Image
            src={film.posterUrl}
            alt=""
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-110"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
          />
        ) : (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={`/api/poster-placeholder?title=${encodeURIComponent(film.title)}${film.year ? `&year=${film.year}` : ""}`}
            alt=""
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
        )}

        {/* Gradient overlay for better text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover:opacity-70 transition-opacity" />

        {/* Time badge - floating on poster */}
        <div className="absolute top-3 right-3">
          <time
            dateTime={new Date(datetime).toISOString()}
            className="inline-flex items-center px-2.5 py-1 rounded-lg bg-black/70 backdrop-blur-sm font-mono text-sm font-semibold text-accent-gold border border-accent-gold/20"
          >
            {time}
          </time>
        </div>

        {/* Status buttons - floating top left */}
        {mounted && (
          <div className="absolute top-3 left-3 flex items-center gap-1">
            <button
              onClick={(e) => handleStatusClick(e, "want_to_see")}
              className={cn(
                "p-1.5 rounded-lg backdrop-blur-sm transition-all",
                status === "want_to_see"
                  ? "bg-pink-500/30 text-pink-400"
                  : "bg-black/50 text-white/60 hover:text-pink-400 hover:bg-pink-500/20"
              )}
              title={status === "want_to_see" ? "Remove from watchlist" : "Add to watchlist"}
              aria-label={status === "want_to_see" ? "Remove from watchlist" : "Add to watchlist"}
            >
              <Heart className={cn("w-4 h-4", status === "want_to_see" && "fill-current")} />
            </button>
            <button
              onClick={(e) => handleStatusClick(e, "seen")}
              className={cn(
                "p-1.5 rounded-lg backdrop-blur-sm transition-all",
                status === "seen"
                  ? "bg-green-500/30 text-green-400"
                  : "bg-black/50 text-white/60 hover:text-green-400 hover:bg-green-500/20"
              )}
              title={status === "seen" ? "Unmark as seen" : "Mark as seen"}
              aria-label={status === "seen" ? "Unmark as seen" : "Mark as seen"}
            >
              <Eye className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Cinema badge - bottom of poster */}
        <div className="absolute bottom-3 left-3 right-3">
          <span className="inline-block px-2 py-1 rounded-md bg-black/60 backdrop-blur-sm text-xs font-medium text-text-primary truncate max-w-full">
            {cinema.shortName || cinema.name}
          </span>
        </div>
      </Link>

      {/* Content - Below poster */}
      <div className="flex flex-col flex-1 p-4">
        {/* Title */}
        <Link
          href={`/film/${film.id}`}
          className="focus:outline-none focus-visible:underline focus-visible:decoration-accent-gold"
        >
          <h3 className="font-display text-base sm:text-lg text-text-primary group-hover:text-accent-gold transition-colors line-clamp-2 leading-tight">
            {film.title}
            {film.year && (
              <span className="text-text-tertiary font-body text-xs ml-1.5">
                ({film.year})
              </span>
            )}
          </h3>
        </Link>

        {/* Director */}
        {film.directors.length > 0 && (
          <p className="text-xs text-text-secondary mt-1 line-clamp-1">
            {film.directors.slice(0, 2).join(", ")}
          </p>
        )}

        {/* Badges - compact row */}
        {(screeningFormat || eventType || film.runtime) && (
          <div className="flex flex-wrap items-center gap-1.5 mt-2" role="list" aria-label="Screening details">
            {screeningFormat && (
              <span role="listitem">
                <FormatBadge format={screeningFormat} />
              </span>
            )}
            {eventType && (
              <span role="listitem">
                <EventBadge type={eventType} />
              </span>
            )}
            {film.runtime && (
              <span className="text-xs text-text-tertiary">
                {film.runtime}m
              </span>
            )}
          </div>
        )}

        {/* Book Button - Full width at bottom */}
        <div className="mt-auto pt-3">
          <a
            href={screening.bookingUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full focus:outline-none"
            aria-label={`Book tickets for ${film.title} at ${cinema.name} (opens in new tab)`}
          >
            <Button
              size="sm"
              variant="primary"
              className="w-full justify-center"
              rightIcon={<ExternalLink className="w-3.5 h-3.5" aria-hidden="true" />}
            >
              Book
              <span className="sr-only"> (opens in new tab)</span>
            </Button>
          </a>
        </div>
      </div>
    </article>
  );
}
