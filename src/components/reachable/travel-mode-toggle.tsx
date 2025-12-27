/**
 * Travel Mode Toggle Component
 * Switch between transit, walking, and cycling
 */

"use client";

import { Train, Footprints, Bike } from "lucide-react";
import { cn } from "@/lib/cn";
import type { TravelMode } from "@/stores/reachable";

interface TravelModeToggleProps {
  value: TravelMode;
  onChange: (mode: TravelMode) => void;
}

const MODES: { mode: TravelMode; label: string; icon: React.ElementType; description: string }[] = [
  {
    mode: "transit",
    label: "Public Transport",
    icon: Train,
    description: "Tube, bus, rail",
  },
  {
    mode: "walking",
    label: "Walking",
    icon: Footprints,
    description: "On foot",
  },
  {
    mode: "bicycling",
    label: "Cycling",
    icon: Bike,
    description: "By bike",
  },
];

export function TravelModeToggle({ value, onChange }: TravelModeToggleProps) {
  return (
    <div className="flex gap-2">
      {MODES.map(({ mode, label, icon: Icon, description }) => {
        const isSelected = value === mode;
        return (
          <button
            key={mode}
            onClick={() => onChange(mode)}
            className={cn(
              "flex-1 flex flex-col items-center gap-1.5 px-4 py-3 rounded-lg border transition-colors",
              isSelected
                ? "bg-accent-primary/10 border-accent-primary text-accent-primary"
                : "bg-background-secondary border-border-default text-text-secondary hover:border-accent-primary/50 hover:text-text-primary"
            )}
          >
            <Icon className={cn("w-5 h-5", isSelected && "text-accent-primary")} />
            <span className="text-sm font-medium">{label}</span>
            <span className="text-xs text-text-tertiary hidden sm:block">
              {description}
            </span>
          </button>
        );
      })}
    </div>
  );
}
