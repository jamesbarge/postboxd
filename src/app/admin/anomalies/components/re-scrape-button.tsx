"use client";

/**
 * Re-scrape Button Component
 * Triggers a scraper for a specific cinema and shows loading/success state
 */

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw, Check, AlertCircle } from "lucide-react";
import { cn } from "@/lib/cn";

interface ReScrapeButtonProps {
  cinemaId: string;
  variant?: "ghost" | "secondary";
}

type ScrapeStatus = "idle" | "loading" | "success" | "error";

export function ReScrapeButton({ cinemaId, variant = "ghost" }: ReScrapeButtonProps) {
  const [status, setStatus] = useState<ScrapeStatus>("idle");
  const [error, setError] = useState<string | null>(null);

  async function handleClick() {
    if (status === "loading") return;

    setStatus("loading");
    setError(null);

    try {
      const response = await fetch("/api/admin/scrape", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cinemaId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to start scraper");
      }

      setStatus("success");

      // Reset to idle after 3 seconds
      setTimeout(() => setStatus("idle"), 3000);
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Unknown error");

      // Reset to idle after 5 seconds
      setTimeout(() => {
        setStatus("idle");
        setError(null);
      }, 5000);
    }
  }

  return (
    <Button
      variant={variant}
      size="sm"
      onClick={handleClick}
      disabled={status === "loading"}
      className={cn(
        status === "success" && "text-green-600",
        status === "error" && "text-red-600"
      )}
      title={error || undefined}
    >
      {status === "loading" && (
        <>
          <RefreshCw className="w-4 h-4 mr-1 animate-spin" />
          Queueing...
        </>
      )}
      {status === "success" && (
        <>
          <Check className="w-4 h-4 mr-1" />
          Queued
        </>
      )}
      {status === "error" && (
        <>
          <AlertCircle className="w-4 h-4 mr-1" />
          Failed
        </>
      )}
      {status === "idle" && "Re-scrape"}
    </Button>
  );
}
