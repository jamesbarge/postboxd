/**
 * Admin Agents Page
 * View and trigger data quality agents
 */

import { Card, CardContent } from "@/components/ui/card";
import { Bot, Link2, Activity, Sparkles } from "lucide-react";
import { AgentCard } from "./components/agent-card";

export const dynamic = "force-dynamic";

interface AgentInfo {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  endpoint: string;
  estimatedTime: string;
}

const agents: AgentInfo[] = [
  {
    id: "links",
    name: "Link Validator",
    description: "Verify booking URLs are valid and point to correct screenings. Checks a sample of upcoming screenings for broken or redirect links.",
    icon: <Link2 className="w-6 h-6" />,
    endpoint: "/api/admin/agents/links",
    estimatedTime: "~15-30s",
  },
  {
    id: "health",
    name: "Scraper Health",
    description: "Monitor scraper output for anomalies like sudden count drops, unusual time patterns, or missing data. Flags potential scraper issues.",
    icon: <Activity className="w-6 h-6" />,
    endpoint: "/api/admin/agents/health",
    estimatedTime: "~30-60s",
  },
  {
    id: "enrich",
    name: "Enrichment",
    description: "Match unmatched films to TMDB entries. Uses AI to handle difficult cases like repertory films, foreign titles, and event-wrapped screenings.",
    icon: <Sparkles className="w-6 h-6" />,
    endpoint: "/api/admin/agents/enrich",
    estimatedTime: "~30-60s",
  },
];

export default function AdminAgentsPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-display text-text-primary">AI Agents</h1>
        <p className="text-text-secondary mt-1">
          Run data quality agents to verify links, check scraper health, and enrich film metadata
        </p>
      </div>

      {/* Info Card */}
      <Card className="bg-accent-primary/5 border-accent-primary/20">
        <CardContent>
          <div className="flex items-start gap-3">
            <Bot className="w-5 h-5 text-accent-primary shrink-0 mt-0.5" />
            <div>
              <h3 className="font-medium text-text-primary">About Agents</h3>
              <p className="text-sm text-text-secondary mt-1">
                These agents use Claude AI to analyze data quality issues. They run synchronously
                with a 30-second timeout. Results are informational only - no automatic changes
                are made to the database when run from this dashboard.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Agent Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {agents.map((agent) => (
          <AgentCard key={agent.id} agent={agent} />
        ))}
      </div>
    </div>
  );
}
