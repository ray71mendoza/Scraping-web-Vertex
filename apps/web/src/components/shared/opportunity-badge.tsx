import React from "react";
import { OpportunityLevel } from "@vertex/shared";
import { cn } from "@/lib/utils";

interface OpportunityBadgeProps {
  tier: OpportunityLevel | string;
  score?: number;
  className?: string;
}

export function OpportunityBadge({ tier, score, className }: OpportunityBadgeProps) {
  const configs: Record<
    string,
    { label: string; bg: string; text: string; border: string; dot: string }
  > = {
    VERY_HIGH: {
      label: "Oportunidad Crítica",
      bg: "bg-red-500/10",
      text: "text-red-400",
      border: "border-red-500/30",
      dot: "bg-red-500",
    },
    HIGH: {
      label: "Oportunidad Alta",
      bg: "bg-orange-500/10",
      text: "text-orange-400",
      border: "border-orange-500/30",
      dot: "bg-orange-500",
    },
    MEDIUM: {
      label: "Oportunidad Media",
      bg: "bg-amber-500/10",
      text: "text-amber-400",
      border: "border-amber-500/30",
      dot: "bg-amber-500",
    },
    LOW: {
      label: "Oportunidad Baja",
      bg: "bg-emerald-500/10",
      text: "text-emerald-400",
      border: "border-emerald-500/30",
      dot: "bg-emerald-500",
    },
  };

  const config = configs[tier] || configs.MEDIUM;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border transition-all duration-200",
        config.bg,
        config.text,
        config.border,
        className
      )}
    >
      <span className={cn("w-1.5 h-1.5 rounded-full animate-pulse", config.dot)} />
      {config.label}
      {typeof score === "number" && (
        <span className="opacity-75 font-mono ml-0.5">({score}/100)</span>
      )}
    </span>
  );
}
