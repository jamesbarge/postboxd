"use client";

/**
 * UserSyncProvider
 * Manages sync lifecycle for signed-in users
 * Wrap this around the app to enable automatic sync
 *
 * The useUserSync hook handles all sync:
 * - Film statuses (watchlist, seen, not interested)
 * - User preferences
 * - Filter settings
 * - Festival follows and schedule
 */

import { useUserSync } from "@/hooks/useUserSync";

interface UserSyncProviderProps {
  children: React.ReactNode;
}

export function UserSyncProvider({ children }: UserSyncProviderProps) {
  // Initialize unified sync hook - handles all sync logic
  useUserSync();

  // This provider is purely for side effects (sync)
  // It doesn't provide any context values
  return <>{children}</>;
}
