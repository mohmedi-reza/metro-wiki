import React from "react";
import { cn } from "../lib/utils";

interface MetroLogoProps {
  className?: string;
  size?: "sm" | "md" | "lg";
}

export const MetroLogo: React.FC<MetroLogoProps> = ({ className, size = "md" }) => {
  const sizeClasses = {
    sm: "w-7 h-7",
    md: "w-8 h-8",
    lg: "w-10 h-10",
  };

  return (
    <div
      className={cn(
        "relative flex items-center justify-center bg-black text-white rounded-md select-none shrink-0 overflow-hidden group-hover:scale-105 transition-transform duration-200",
        sizeClasses[size],
        className
      )}
      aria-label="لوگوی قطار مترو"
    >
      {/* Sleek SVG Minimalist Metro Train Front Elevation */}
      <svg
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-5 h-5 text-white"
      >
        {/* Pantograph / Antenna line on top */}
        <path
          d="M16 3V6M12 6H20"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
        />

        {/* Train aerodynamic cabin body */}
        <rect
          x="6.5"
          y="6.5"
          width="19"
          height="19"
          rx="4"
          stroke="currentColor"
          strokeWidth="1.75"
        />

        {/* Windshield Panoramic Glass */}
        <rect
          x="9.5"
          y="9.5"
          width="13"
          height="7"
          rx="1.5"
          fill="currentColor"
        />

        {/* Center headlamp */}
        <circle cx="16" cy="19.5" r="1.25" fill="currentColor" />

        {/* Twin lower headlights */}
        <circle cx="10" cy="21.5" r="1" fill="currentColor" />
        <circle cx="22" cy="21.5" r="1" fill="currentColor" />

        {/* Bogie / Track rails under carriage */}
        <path
          d="M8 28.5L24 28.5"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
        />
        <path
          d="M11 25.5L10 28.5M21 25.5L22 28.5"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
};
