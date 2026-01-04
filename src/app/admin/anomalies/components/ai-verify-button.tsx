"use client";

/**
 * AI Verify Button Component
 * Triggers AI analysis of an anomaly and displays the result inline
 *
 * Behavior:
 * - Synchronous call with 30s timeout
 * - Uses Haiku first, escalates to Sonnet if confidence < 0.7
 * - Returns informational analysis only (no action buttons)
 */

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sparkles, Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { cn } from "@/lib/cn";
import type { DetectedAnomaly } from "./anomaly-list";

interface AIVerifyButtonProps {
  cinemaId: string;
  anomaly: DetectedAnomaly;
}

type VerifyStatus = "idle" | "loading" | "success" | "error";

interface VerifyResult {
  analysis: string;
  confidence: number;
  model: "haiku" | "sonnet";
  suggestedAction?: string;
}

export function AIVerifyButton({ cinemaId, anomaly }: AIVerifyButtonProps) {
  const [status, setStatus] = useState<VerifyStatus>("idle");
  const [result, setResult] = useState<VerifyResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleClick() {
    if (status === "loading") return;

    setStatus("loading");
    setError(null);
    setResult(null);

    try {
      const response = await fetch("/api/admin/anomalies/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cinemaId,
          anomalyType: anomaly.type,
          todayCount: anomaly.todayCount,
          lastWeekCount: anomaly.lastWeekCount,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Verification failed");
      }

      const data = await response.json();
      setResult(data);
      setStatus("success");
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
    <div className="inline-flex flex-col">
      <Button
        variant="secondary"
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
            <Loader2 className="w-4 h-4 mr-1 animate-spin" />
            Analyzing...
          </>
        )}
        {status === "success" && (
          <>
            <CheckCircle className="w-4 h-4 mr-1" />
            Verified
          </>
        )}
        {status === "error" && (
          <>
            <AlertCircle className="w-4 h-4 mr-1" />
            Failed
          </>
        )}
        {status === "idle" && (
          <>
            <Sparkles className="w-4 h-4 mr-1" />
            AI Verify
          </>
        )}
      </Button>

      {/* Show result inline below the button */}
      {result && (
        <div className="mt-2 p-3 bg-accent-primary/5 border border-accent-primary/20 rounded-md text-sm max-w-md">
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="w-4 h-4 text-accent-primary" />
            <span className="font-medium text-text-primary">AI Analysis</span>
            <span className="text-xs text-text-tertiary">
              ({result.model}, {(result.confidence * 100).toFixed(0)}% confidence)
            </span>
          </div>
          <p className="text-text-secondary">{result.analysis}</p>
          {result.suggestedAction && (
            <p className="mt-2 text-text-tertiary italic">
              Suggestion: {result.suggestedAction}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
