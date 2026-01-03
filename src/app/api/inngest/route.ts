import { serve } from "inngest/next";
import { inngest } from "@/inngest/client";
import { functions } from "@/inngest/functions";

/**
 * Inngest API Route
 * Serves the Inngest functions for background job processing
 *
 * This route handles:
 * - Function registration with Inngest
 * - Receiving events from Inngest to trigger functions
 * - Health checks from Inngest
 */
export const { GET, POST, PUT } = serve({
  client: inngest,
  functions,
});
