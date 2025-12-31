"use client";

import posthog from "posthog-js";
import { PostHogProvider as PHProvider, usePostHog } from "posthog-js/react";
import { useEffect, Suspense, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { useCookieConsent } from "@/stores/cookie-consent";

/**
 * Initialize PostHog with privacy-first defaults.
 * Tracking is disabled by default and only enabled after explicit consent.
 */
if (typeof window !== "undefined") {
  posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
    // Use reverse proxy to avoid ad blockers
    api_host: "/ingest",
    // UI host for PostHog toolbar and feature flags UI
    ui_host: "https://eu.posthog.com",
    // Capture pageviews manually for App Router compatibility
    capture_pageview: false,
    // Capture pageleaves for session replay accuracy
    capture_pageleave: true,

    // PRIVACY: Don't persist data until consent is given
    // This prevents cookies from being set before consent
    persistence: "memory",

    // PRIVACY: Opt out of tracking by default (PECR/UK GDPR compliance)
    opt_out_capturing_by_default: true,

    // Session Replay - record user sessions (only after consent)
    disable_session_recording: true, // Will be enabled after consent
    session_recording: {
      // Mask all text inputs for privacy
      maskAllInputs: true,
      // Mask sensitive text content
      maskTextSelector: "[data-ph-mask]",
    },

    // Autocapture settings (only active after consent)
    autocapture: {
      // Capture clicks, form submissions, etc.
      dom_event_allowlist: ["click", "submit", "change"],
      // Capture useful element attributes
      element_allowlist: ["button", "a", "input", "select", "textarea"],
    },

    // Performance - capture web vitals (only after consent)
    capture_performance: true,

    // Error tracking - capture exceptions (only after consent)
    capture_exceptions: true,

    // Enable debug mode in development
    loaded: (posthog) => {
      if (process.env.NODE_ENV === "development") {
        posthog.debug();
      }
    },
  });
}

/**
 * Component to manage consent state and update PostHog accordingly
 */
function PostHogConsentManager() {
  const posthogClient = usePostHog();
  const analyticsConsent = useCookieConsent((state) => state.analyticsConsent);
  const hasAppliedConsent = useRef(false);

  useEffect(() => {
    if (!posthogClient) return;

    // Only apply consent changes once per state change
    if (analyticsConsent === "accepted" && !hasAppliedConsent.current) {
      // User accepted - enable tracking with persistent storage
      posthogClient.opt_in_capturing();
      posthogClient.set_config({
        persistence: "localStorage+cookie",
        disable_session_recording: false,
      });
      hasAppliedConsent.current = true;
    } else if (analyticsConsent === "rejected") {
      // User rejected - ensure tracking is disabled
      posthogClient.opt_out_capturing();
      hasAppliedConsent.current = true;
    } else if (analyticsConsent === "pending") {
      // Reset for fresh consent
      hasAppliedConsent.current = false;
    }
  }, [posthogClient, analyticsConsent]);

  return null;
}

/**
 * Component to track pageviews with App Router
 * Only tracks if consent has been given
 */
function PostHogPageView() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const posthogClient = usePostHog();
  const canTrack = useCookieConsent((state) => state.canTrack());

  useEffect(() => {
    if (pathname && posthogClient && canTrack) {
      let url = window.origin + pathname;
      if (searchParams.toString()) {
        url = url + "?" + searchParams.toString();
      }
      posthogClient.capture("$pageview", { $current_url: url });
    }
  }, [pathname, searchParams, posthogClient, canTrack]);

  return null;
}

/**
 * Component to identify users with Clerk
 * Only identifies if consent has been given
 */
function PostHogUserIdentify() {
  const { user, isLoaded } = useUser();
  const posthogClient = usePostHog();
  const canTrack = useCookieConsent((state) => state.canTrack());

  useEffect(() => {
    if (!isLoaded || !posthogClient || !canTrack) return;

    if (user) {
      // Identify the user in PostHog
      posthogClient.identify(user.id, {
        email: user.primaryEmailAddress?.emailAddress,
        name: user.fullName,
        firstName: user.firstName,
        lastName: user.lastName,
        username: user.username,
        imageUrl: user.imageUrl,
        createdAt: user.createdAt,
      });
    } else {
      // User signed out - reset PostHog identity
      posthogClient.reset();
    }
  }, [user, isLoaded, posthogClient, canTrack]);

  return null;
}

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  return (
    <PHProvider client={posthog}>
      <PostHogConsentManager />
      <Suspense fallback={null}>
        <PostHogPageView />
      </Suspense>
      <PostHogUserIdentify />
      {children}
    </PHProvider>
  );
}
