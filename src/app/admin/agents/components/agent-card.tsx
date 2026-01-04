"use client";

/**
 * Agent Card Component
 * Displays agent info and provides trigger button with inline results
 */

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Play, Loader2, CheckCircle, XCircle, Clock } from "lucide-react";
import { cn } from "@/lib/cn";

interface AgentInfo {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  endpoint: string;
  estimatedTime: string;
}

interface AgentResult {
  success: boolean;
  summary: string;
  details?: string[];
  tokensUsed?: number;
  executionTimeMs?: number;
  error?: string;
}

type AgentStatus = "idle" | "running" | "success" | "error";

export function AgentCard({ agent }: { agent: AgentInfo }) {
  const [status, setStatus] = useState<AgentStatus>("idle");
  const [result, setResult] = useState<AgentResult | null>(null);

  async function handleRun() {
    if (status === "running") return;

    setStatus("running");
    setResult(null);

    try {
      const response = await fetch(agent.endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Agent execution failed");
      }

      setResult(data);
      setStatus("success");
    } catch (err) {
      setResult({
        success: false,
        summary: "Failed to run agent",
        error: err instanceof Error ? err.message : "Unknown error",
      });
      setStatus("error");
    }
  }

  return (
    <Card className="flex flex-col">
      <CardContent className="flex-1">
        {/* Header */}
        <div className="flex items-start gap-3 mb-4">
          <div className="p-2 rounded-lg bg-accent-primary/10 text-accent-primary">
            {agent.icon}
          </div>
          <div className="flex-1">
            <h3 className="font-medium text-text-primary">{agent.name}</h3>
            <p className="text-xs text-text-tertiary flex items-center gap-1 mt-0.5">
              <Clock className="w-3 h-3" />
              {agent.estimatedTime}
            </p>
          </div>
        </div>

        {/* Description */}
        <p className="text-sm text-text-secondary mb-4">
          {agent.description}
        </p>

        {/* Trigger Button */}
        <Button
          variant={status === "running" ? "secondary" : "primary"}
          size="sm"
          onClick={handleRun}
          disabled={status === "running"}
          className="w-full"
        >
          {status === "running" ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Running...
            </>
          ) : (
            <>
              <Play className="w-4 h-4 mr-2" />
              Run Agent
            </>
          )}
        </Button>

        {/* Results */}
        {result && (
          <div
            className={cn(
              "mt-4 p-3 rounded-lg text-sm",
              result.success
                ? "bg-green-500/10 border border-green-500/20"
                : "bg-red-500/10 border border-red-500/20"
            )}
          >
            <div className="flex items-center gap-2 mb-2">
              {result.success ? (
                <CheckCircle className="w-4 h-4 text-green-600" />
              ) : (
                <XCircle className="w-4 h-4 text-red-600" />
              )}
              <span
                className={cn(
                  "font-medium",
                  result.success ? "text-green-700" : "text-red-700"
                )}
              >
                {result.success ? "Completed" : "Failed"}
              </span>
            </div>

            <p className="text-text-secondary">{result.summary}</p>

            {result.details && result.details.length > 0 && (
              <ul className="mt-2 space-y-1">
                {result.details.slice(0, 5).map((detail, i) => (
                  <li key={i} className="text-xs text-text-tertiary">
                    • {detail}
                  </li>
                ))}
                {result.details.length > 5 && (
                  <li className="text-xs text-text-tertiary italic">
                    ... and {result.details.length - 5} more
                  </li>
                )}
              </ul>
            )}

            {result.executionTimeMs && (
              <p className="text-xs text-text-tertiary mt-2">
                Completed in {(result.executionTimeMs / 1000).toFixed(1)}s
                {result.tokensUsed && ` • ${result.tokensUsed} tokens`}
              </p>
            )}

            {result.error && (
              <p className="text-xs text-red-600 mt-2">{result.error}</p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
