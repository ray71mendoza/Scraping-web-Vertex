import React from "react";
import { cn } from "@/lib/utils";

interface ScoreGaugeProps {
  score: number;
  label?: string;
  size?: number;
  strokeWidth?: number;
  className?: string;
}

export function ScoreGauge({
  score,
  label = "Opportunity Score",
  size = 110,
  strokeWidth = 9,
  className,
}: ScoreGaugeProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.min(Math.max(score, 0), 100);
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  const getColor = (s: number) => {
    if (s >= 80) return "#ef4444"; // Red for high opportunity
    if (s >= 60) return "#f97316"; // Orange
    if (s >= 40) return "#eab308"; // Amber
    return "#22c55e"; // Green
  };

  const strokeColor = getColor(score);

  return (
    <div className={cn("flex flex-col items-center justify-center relative", className)}>
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="rgba(255, 255, 255, 0.08)"
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        {/* Progress bar */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          fill="transparent"
          style={{ transition: "stroke-dashoffset 1s ease-in-out" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <span className="text-2xl font-black font-mono tracking-tight text-white">
          {score}
        </span>
        <span className="text-[10px] uppercase font-semibold text-gray-400 -mt-0.5">
          /100
        </span>
      </div>
      {label && <span className="text-xs text-gray-400 mt-2 font-medium">{label}</span>}
    </div>
  );
}
