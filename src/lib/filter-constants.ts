/**
 * Filter Constants and Helpers
 * Extracted from stores/filters.ts for reuse without importing the store
 */

// ============================================================================
// Types
// ============================================================================

export type TimeOfDay = "morning" | "afternoon" | "evening" | "late_night";
export type ProgrammingType = "repertory" | "new_release" | "special_event" | "preview";

// ============================================================================
// Constants
// ============================================================================

export const DECADES = [
  "Pre-1950",
  "1950s",
  "1960s",
  "1970s",
  "1980s",
  "1990s",
  "2000s",
  "2010s",
  "2020s",
] as const;

export const COMMON_GENRES = [
  "Drama",
  "Comedy",
  "Horror",
  "Documentary",
  "Sci-Fi",
  "Action",
  "Thriller",
  "Romance",
  "Animation",
] as const;

export const FORMAT_OPTIONS = [
  { value: "35mm", label: "35mm" },
  { value: "70mm", label: "70mm" },
  { value: "70mm_imax", label: "70mm IMAX" },
  { value: "imax", label: "IMAX" },
  { value: "imax_laser", label: "IMAX Laser" },
  { value: "dolby_cinema", label: "Dolby Cinema" },
] as const;

// Time presets for common screening windows
export const TIME_PRESETS = [
  { label: "Morning", shortLabel: "AM", from: 0, to: 11, description: "Before 12pm" },
  { label: "Afternoon", shortLabel: "Aft", from: 12, to: 16, description: "12pm - 5pm" },
  { label: "Evening", shortLabel: "Eve", from: 17, to: 20, description: "5pm - 9pm" },
  { label: "Late", shortLabel: "Late", from: 21, to: 23, description: "After 9pm" },
] as const;

// ============================================================================
// Helper Functions
// ============================================================================

export function getTimeOfDayLabel(time: TimeOfDay): string {
  const labels: Record<TimeOfDay, string> = {
    morning: "Morning (before 12pm)",
    afternoon: "Afternoon (12pm-5pm)",
    evening: "Evening (5pm-9pm)",
    late_night: "Late Night (after 9pm)",
  };
  return labels[time];
}

export function getTimeOfDayFromHour(hour: number): TimeOfDay {
  if (hour < 12) return "morning";
  if (hour < 17) return "afternoon";
  if (hour < 21) return "evening";
  return "late_night";
}

export function getProgrammingTypeLabel(type: ProgrammingType): string {
  const labels: Record<ProgrammingType, string> = {
    repertory: "Repertory / Classic",
    new_release: "New Release",
    special_event: "Special Event",
    preview: "Preview / Premiere",
  };
  return labels[type];
}

/** Check if a cinema is independent (BFI is treated as independent despite having a chain value) */
export function isIndependentCinema(chain: string | null): boolean {
  return chain === null || chain === "BFI";
}

// Format hour to 12h display (e.g., 14 -> "2pm", 9 -> "9am")
export function formatHour(hour: number): string {
  if (hour === 0) return "12am";
  if (hour === 12) return "12pm";
  if (hour < 12) return `${hour}am`;
  return `${hour - 12}pm`;
}

// Format time range for display
export function formatTimeRange(from: number | null, to: number | null): string {
  if (from === null && to === null) return "Any Time";
  if (from !== null && to === null) return `After ${formatHour(from)}`;
  if (from === null && to !== null) return `Before ${formatHour(to + 1)}`;
  if (from === to) return formatHour(from!);
  return `${formatHour(from!)} - ${formatHour(to! + 1)}`;
}

// Check if a time range matches a preset
export function matchesTimePreset(
  from: number | null,
  to: number | null,
  preset: typeof TIME_PRESETS[number]
): boolean {
  return from === preset.from && to === preset.to;
}
