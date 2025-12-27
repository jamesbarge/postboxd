"use client";

/**
 * useUserSync Hook
 * Manages sync lifecycle between localStorage and server
 * - Initial sync on sign-in
 * - Debounced sync on store changes
 * - Online/offline awareness
 */

import { useEffect, useRef, useCallback } from "react";
import { useUser } from "@clerk/nextjs";
import { useFilmStatus } from "@/stores/film-status";
import { usePreferences } from "@/stores/preferences";
import { useFilters } from "@/stores/filters";
import {
  performFullSync,
  pushFilmStatuses,
  pushPreferences,
} from "@/lib/sync/user-sync-service";

// Debounce delay for sync (500ms)
const SYNC_DEBOUNCE_MS = 500;

export function useUserSync() {
  const { isSignedIn, isLoaded } = useUser();
  const filmStatusDebounceRef = useRef<NodeJS.Timeout | null>(null);
  const preferencesDebounceRef = useRef<NodeJS.Timeout | null>(null);
  const isSyncingRef = useRef(false);
  // Track if initial sync has been performed (using ref instead of global variable for SSR safety)
  const initialSyncPerformedRef = useRef(false);

  // Debounced film status push
  const debouncedPushFilmStatuses = useCallback(() => {
    if (filmStatusDebounceRef.current) {
      clearTimeout(filmStatusDebounceRef.current);
    }
    filmStatusDebounceRef.current = setTimeout(() => {
      if (!isSyncingRef.current) {
        pushFilmStatuses();
      }
    }, SYNC_DEBOUNCE_MS);
  }, []);

  // Debounced preferences push
  const debouncedPushPreferences = useCallback(() => {
    if (preferencesDebounceRef.current) {
      clearTimeout(preferencesDebounceRef.current);
    }
    preferencesDebounceRef.current = setTimeout(() => {
      if (!isSyncingRef.current) {
        pushPreferences();
      }
    }, SYNC_DEBOUNCE_MS);
  }, []);

  // Initial sync on sign-in
  useEffect(() => {
    if (!isLoaded) return;

    if (isSignedIn && !initialSyncPerformedRef.current) {
      console.log("[Sync] User signed in, performing initial sync...");
      isSyncingRef.current = true;
      initialSyncPerformedRef.current = true;

      performFullSync().finally(() => {
        isSyncingRef.current = false;
      });
    }

    // Reset flag on sign-out so next sign-in triggers sync
    if (!isSignedIn) {
      initialSyncPerformedRef.current = false;
    }
  }, [isSignedIn, isLoaded]);

  // Subscribe to film status changes
  useEffect(() => {
    if (!isSignedIn) return;

    const unsubscribe = useFilmStatus.subscribe((state, prevState) => {
      // Only trigger sync if films actually changed
      if (state.films !== prevState.films) {
        debouncedPushFilmStatuses();
      }
    });

    return () => {
      unsubscribe();
      if (filmStatusDebounceRef.current) {
        clearTimeout(filmStatusDebounceRef.current);
      }
    };
  }, [isSignedIn, debouncedPushFilmStatuses]);

  // Subscribe to preferences changes
  useEffect(() => {
    if (!isSignedIn) return;

    const unsubscribePrefs = usePreferences.subscribe((state, prevState) => {
      // Check if any preference changed (excluding functions)
      const changed =
        state.selectedCinemas !== prevState.selectedCinemas ||
        state.defaultView !== prevState.defaultView ||
        state.showRepertoryOnly !== prevState.showRepertoryOnly ||
        state.hidePastScreenings !== prevState.hidePastScreenings ||
        state.defaultDateRange !== prevState.defaultDateRange ||
        state.preferredFormats !== prevState.preferredFormats;

      if (changed) {
        debouncedPushPreferences();
      }
    });

    const unsubscribeFilters = useFilters.subscribe((state, prevState) => {
      // Check if any persisted filter changed
      const changed =
        state.cinemaIds !== prevState.cinemaIds ||
        state.formats !== prevState.formats ||
        state.programmingTypes !== prevState.programmingTypes ||
        state.decades !== prevState.decades ||
        state.genres !== prevState.genres ||
        state.timesOfDay !== prevState.timesOfDay ||
        state.hideSeen !== prevState.hideSeen ||
        state.hideNotInterested !== prevState.hideNotInterested;

      if (changed) {
        debouncedPushPreferences();
      }
    });

    return () => {
      unsubscribePrefs();
      unsubscribeFilters();
      if (preferencesDebounceRef.current) {
        clearTimeout(preferencesDebounceRef.current);
      }
    };
  }, [isSignedIn, debouncedPushPreferences]);

  // Online/offline awareness - sync when coming back online
  useEffect(() => {
    if (!isSignedIn) return;

    const handleOnline = () => {
      console.log("[Sync] Back online, performing sync...");
      performFullSync();
    };

    window.addEventListener("online", handleOnline);
    return () => window.removeEventListener("online", handleOnline);
  }, [isSignedIn]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (filmStatusDebounceRef.current) {
        clearTimeout(filmStatusDebounceRef.current);
      }
      if (preferencesDebounceRef.current) {
        clearTimeout(preferencesDebounceRef.current);
      }
    };
  }, []);
}
