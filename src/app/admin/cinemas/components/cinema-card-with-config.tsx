"use client";

/**
 * Cinema Card with Config Modal
 * Client wrapper that handles opening the config modal
 */

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Building2, Settings } from "lucide-react";
import { cn } from "@/lib/cn";
import { CinemaConfigModal } from "./cinema-config-modal";

interface CinemaCardProps {
  cinema: {
    id: string;
    name: string;
    shortName: string | null;
    chain: string | null;
    website: string;
    lastScrapedAt: string | null; // Serialized from server
    dataSourceType: "scrape" | "api" | "manual" | null;
    screeningCount: number;
  };
  tier: "top" | "standard";
}

export function CinemaCardWithConfig({ cinema, tier }: CinemaCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const lastScraped = cinema.lastScrapedAt
    ? new Date(cinema.lastScrapedAt).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "Never";

  return (
    <>
      <Card
        className={cn(tier === "top" && "border-l-4 border-l-accent-primary")}
      >
        <div className="p-4">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-text-primary truncate">
                {cinema.shortName || cinema.name}
              </h3>
              <p className="text-xs text-text-tertiary mt-0.5">
                {cinema.chain || "Independent"}
              </p>
            </div>
            <Building2 className="w-5 h-5 text-text-tertiary shrink-0" />
          </div>

          <div className="mt-3 space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-text-tertiary">Screenings</span>
              <span className="font-mono text-text-primary">
                {cinema.screeningCount}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-tertiary">Last scraped</span>
              <span className="text-text-secondary">{lastScraped}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-tertiary">Source</span>
              <span className="text-text-secondary capitalize">
                {cinema.dataSourceType || "Unknown"}
              </span>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-border-subtle flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="flex-1"
              onClick={() => setIsModalOpen(true)}
            >
              <Settings className="w-4 h-4 mr-1" />
              Configure
            </Button>
          </div>
        </div>
      </Card>

      <CinemaConfigModal
        cinemaId={cinema.id}
        cinemaName={cinema.shortName || cinema.name}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
}
