"use client";

/**
 * Dismiss Button Component
 * Dismisses an anomaly until the cinema is re-scraped (data changes)
 *
 * Implementation: Stores dismissed state in localStorage with the current count.
 * When the count changes (after re-scrape), the dismissal is automatically invalidated.
 */

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { X, Check } from "lucide-react";
import { cn } from "@/lib/cn";

interface DismissButtonProps {
  cinemaId: string;
  todayCount: number;
  onDismiss?: () => void;
}

export interface DismissedAnomaly {
  cinemaId: string;
  dismissedAt: string;
  countAtDismissal: number;
}

export const STORAGE_KEY = "dismissed-anomalies";

// Get dismissed anomalies from localStorage
export function getDismissedAnomalies(): DismissedAnomaly[] {
  if (typeof window === "undefined") return [];
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

// Save dismissed anomalies to localStorage
function saveDismissedAnomalies(anomalies: DismissedAnomaly[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(anomalies));
}

// Check if an anomaly is dismissed (and still valid)
// If the count changed (re-scrape happened), auto-clear the stale dismissal
export function isAnomalyDismissed(cinemaId: string, todayCount: number): boolean {
  const dismissed = getDismissedAnomalies();
  const entry = dismissed.find(d => d.cinemaId === cinemaId);

  if (!entry) return false;

  // Dismissal is valid only if count hasn't changed (no new scrape)
  if (entry.countAtDismissal === todayCount) {
    return true;
  }

  // Count changed - clear stale dismissal
  undismissAnomaly(cinemaId);
  return false;
}

// Remove a dismissal
export function undismissAnomaly(cinemaId: string): void {
  const dismissed = getDismissedAnomalies();
  const filtered = dismissed.filter(d => d.cinemaId !== cinemaId);
  saveDismissedAnomalies(filtered);
}

// Dismiss an anomaly
export function dismissAnomaly(cinemaId: string, todayCount: number): void {
  const dismissed = getDismissedAnomalies();
  const filtered = dismissed.filter(d => d.cinemaId !== cinemaId);
  filtered.push({
    cinemaId,
    dismissedAt: new Date().toISOString(),
    countAtDismissal: todayCount,
  });
  saveDismissedAnomalies(filtered);
}

export function DismissButton({ cinemaId, todayCount, onDismiss }: DismissButtonProps) {
  const [isDismissed, setIsDismissed] = useState(false);

  // Check if already dismissed on mount
  useEffect(() => {
    setIsDismissed(isAnomalyDismissed(cinemaId, todayCount));
  }, [cinemaId, todayCount]);

  function handleClick() {
    dismissAnomaly(cinemaId, todayCount);
    setIsDismissed(true);
    onDismiss?.();
  }

  if (isDismissed) {
    return (
      <Button
        variant="ghost"
        size="sm"
        disabled
        className="text-green-600"
      >
        <Check className="w-4 h-4 mr-1" />
        Dismissed
      </Button>
    );
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleClick}
    >
      <X className="w-4 h-4 mr-1" />
      Dismiss
    </Button>
  );
}
