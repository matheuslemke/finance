import React from "react";
import { cn } from "@/lib/utils";

interface ChipProps {
  text: string;
  bgColor?: string;
  textColor?: string;
  className?: string;
  style?: React.CSSProperties;
}

export function Chip({ 
  text, 
  bgColor = "bg-blue-100", 
  textColor = "text-blue-800",
  className,
  style
}: ChipProps) {
  return (
    <span 
      className={cn(
        "inline-flex items-center justify-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        bgColor,
        textColor,
        className
      )}
      style={style}
    >
      {text}
    </span>
  );
} 