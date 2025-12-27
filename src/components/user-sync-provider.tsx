"use client";

/**
 * UserSyncProvider
 * Manages sync lifecycle for signed-in users
 * Wrap this around the app to enable automatic sync
 */

import { useUserSync } from "@/hooks/useUserSync";

interface UserSyncProviderProps {
  children: React.ReactNode;
}

export function UserSyncProvider({ children }: UserSyncProviderProps) {
  // Initialize sync hook - handles all sync logic
  useUserSync();

  // This provider is purely for side effects (sync)
  // It doesn't provide any context values
  return <>{children}</>;
}
