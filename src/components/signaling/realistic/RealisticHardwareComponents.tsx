import React from "react";
import { cn } from "../../../lib/utils";
import { HardwarePort, HardwareLed, HardwareTerminalPin } from "../../../types/realisticHardware";

/* ========================================================================= */
/* 1. REALISTIC CAPTIVE SCREW (M2.5 Eurocard Knurled Collar Screw)           */
/* ========================================================================= */
export const RealisticCaptiveScrew: React.FC<{
  size?: number;
  type?: "slotted" | "phillips";
  angle?: number;
  className?: string;
}> = ({ size = 10, type = "slotted", angle = 35, className }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      className={cn("shrink-0 drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]", className)}
    >
      <defs>
        <radialGradient id={`screwBezel-${angle}`} cx="35%" cy="35%" r="65%">
          <stop offset="0%" stopColor="#f3f4f6" />
          <stop offset="40%" stopColor="#9ca3af" />
          <stop offset="80%" stopColor="#4b5563" />
          <stop offset="100%" stopColor="#1f2937" />
        </radialGradient>
        <linearGradient id={`screwSlot-${angle}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#090d16" />
          <stop offset="100%" stopColor="#030712" />
        </linearGradient>
      </defs>
      {/* Outer black insulating washer collar */}
      <circle cx="12" cy="12" r="11.5" fill="#18181b" stroke="#3f3f46" strokeWidth="0.8" />
      {/* Knurled nickel collar */}
      <circle cx="12" cy="12" r="9.5" fill={`url(#screwBezel-${angle})`} stroke="#374151" strokeWidth="0.6" />
      {/* Screw dome */}
      <circle cx="12" cy="12" r="7" fill={`url(#screwBezel-${angle})`} stroke="#1f2937" strokeWidth="0.4" />
      {/* Screw Slot */}
      {type === "slotted" ? (
        <rect
          x="4.5"
          y="10.8"
          width="15"
          height="2.4"
          rx="0.5"
          fill={`url(#screwSlot-${angle})`}
          transform={`rotate(${angle} 12 12)`}
        />
      ) : (
        <g transform={`rotate(${angle} 12 12)`}>
          <rect x="5" y="10.8" width="14" height="2.4" rx="0.4" fill={`url(#screwSlot-${angle})`} />
          <rect x="10.8" y="5" width="2.4" height="14" rx="0.4" fill={`url(#screwSlot-${angle})`} />
        </g>
      )}
    </svg>
  );
};

/* ========================================================================= */
/* 2. IEEE 1101.10 ERGONOMIC INJECTOR / EJECTOR HANDLE                       */
/* ========================================================================= */
export const RealisticEjectorHandle: React.FC<{
  position?: "top" | "bottom";
  size?: "sm" | "md" | "lg";
  isLatched?: boolean;
  onToggleLatch?: () => void;
  className?: string;
}> = ({
  position = "bottom",
  size = "md",
  isLatched = true,
  onToggleLatch,
  className,
}) => {
  const isTop = position === "top";

  const sizeClasses = {
    sm: "w-4 h-5",
    md: "w-5 h-6",
    lg: "w-6 h-8",
  }[size];

  return (
    <div
      onClick={(e) => {
        e.stopPropagation();
        onToggleLatch?.();
      }}
      title="اهرم قفل و بیرون‌انداز کارت (IEEE 1101.10 Ejector Handle - کلیک جهت تست رهاسازی)"
      className={cn(
        "relative flex flex-col items-center justify-center cursor-pointer select-none transition-transform active:scale-90 shrink-0",
        isTop ? "rotate-180" : "",
        className
      )}
    >
      {/* Molded industrial nylon lever body */}
      <div
        className={cn(
          "bg-gradient-to-r from-neutral-800 via-neutral-700 to-neutral-900 rounded-b-sm border border-neutral-600 shadow-md flex flex-col items-center justify-between p-0.5 relative overflow-hidden",
          sizeClasses
        )}
      >
        {/* Steel pivot rivet pin */}
        <div className="w-1.5 h-1.5 rounded-full bg-neutral-200 border border-neutral-700 shadow-xs shrink-0" />

        {/* Grip ridges */}
        <div className="space-y-[1px] w-full px-0.5 my-auto">
          <div className="h-[1px] bg-neutral-500 rounded-full" />
          <div className="h-[1px] bg-neutral-500 rounded-full" />
        </div>

        {/* Red safety release push-button catch */}
        <div
          className={cn(
            "w-2.5 h-1.5 rounded-xxs border flex items-center justify-center transition-all shrink-0",
            isLatched
              ? "bg-rose-600 border-rose-400 shadow-[0_0_3px_rgba(225,29,72,0.9)]"
              : "bg-neutral-800 border-neutral-600"
          )}
        >
          <span className="w-1 h-[0.5px] bg-white/90 rounded-full" />
        </div>
      </div>
    </div>
  );
};

/* ========================================================================= */
/* 3. REALISTIC RECESSED 3MM / 2MM INDUSTRIAL ROUND LED WITH BEZEL           */
/* ========================================================================= */
export const RealisticLed: React.FC<{
  led: HardwareLed;
  showLabel?: boolean;
  size?: "xs" | "sm" | "md" | "lg";
  layout?: "horizontal" | "vertical" | "compact";
  className?: string;
}> = ({
  led,
  showLabel = true,
  size = "sm",
  layout = "horizontal",
  className,
}) => {
  const isOff = led.state === "off";

  const sizePixels = {
    xs: { outer: 6, inner: 4, text: "text-[6px]" },
    sm: { outer: 8, inner: 5, text: "text-[7px]" },
    md: { outer: 10, inner: 6, text: "text-[8px]" },
    lg: { outer: 13, inner: 8, text: "text-[9px]" },
  }[size];

  // Industrial LED glow and diffused resin dome
  const glowColors = {
    green: isOff
      ? "bg-emerald-950/70 border-neutral-800 text-neutral-600"
      : "bg-emerald-400 border-emerald-200 shadow-[0_0_6px_#10b981,0_0_2px_#34d399]",
    amber: isOff
      ? "bg-amber-950/70 border-neutral-800 text-neutral-600"
      : "bg-amber-400 border-amber-200 shadow-[0_0_6px_#f59e0b,0_0_2px_#fbbf24]",
    red: isOff
      ? "bg-rose-950/70 border-neutral-800 text-neutral-600"
      : "bg-rose-500 border-rose-200 shadow-[0_0_6px_#f43f5e,0_0_2px_#fb7185]",
    blue: isOff
      ? "bg-sky-950/70 border-neutral-800 text-neutral-600"
      : "bg-sky-400 border-sky-200 shadow-[0_0_6px_#38bdf8,0_0_2px_#7dd3fc]",
    white: isOff
      ? "bg-neutral-800 border-neutral-700 text-neutral-600"
      : "bg-neutral-100 border-white shadow-[0_0_6px_#ffffff,0_0_2px_#ffffff]",
  }[led.color];

  const animationClass =
    led.state === "pulsing"
      ? "animate-pulse"
      : led.state === "blinking_fast"
      ? "animate-ping opacity-90"
      : "";

  return (
    <div
      className={cn(
        "flex items-center gap-1 select-none font-mono shrink-0",
        layout === "vertical" ? "flex-col gap-0.5" : "justify-between w-full",
        className
      )}
      title={`${led.label}: ${led.meaningEn} (${led.state.toUpperCase()})`}
    >
      {showLabel && (
        <span
          className={cn(
            "font-mono font-bold tracking-tight text-neutral-300 uppercase truncate leading-none",
            sizePixels.text
          )}
        >
          {led.label}
        </span>
      )}

      {/* Chrome Collar / Anodized Bezel */}
      <div
        style={{ width: sizePixels.outer, height: sizePixels.outer }}
        className="relative rounded-full bg-gradient-to-br from-neutral-200 via-neutral-500 to-neutral-800 p-[1px] shadow-xs flex items-center justify-center shrink-0"
      >
        {/* Recessed resin lens */}
        <div
          style={{ width: sizePixels.inner, height: sizePixels.inner }}
          className={cn(
            "rounded-full border transition-all flex items-center justify-center relative overflow-hidden",
            glowColors,
            animationClass
          )}
        >
          {/* Specular curved reflection */}
          {!isOff && (
            <span className="absolute top-[0.5px] left-[0.5px] w-[1.5px] h-[1.5px] rounded-full bg-white/90 pointer-events-none" />
          )}
        </div>
      </div>
    </div>
  );
};

/* ========================================================================= */
/* 4. REALISTIC SHIELDED RJ45 8P8C JACK (With Metal Housing & Status LEDs)   */
/* ========================================================================= */
export const RealisticRj45Socket: React.FC<{
  port: HardwarePort;
  isPlugged?: boolean;
  onTogglePlug?: () => void;
  scale?: "micro" | "compact" | "normal" | "enlarged";
  className?: string;
}> = ({
  port,
  isPlugged = true,
  onTogglePlug,
  scale = "compact",
  className,
}) => {
  const dimensions = {
    micro: { outer: "w-7 h-6 p-0.5", inner: "h-3.5", pin: "w-[0.5px] h-1.5", led: "w-1 h-1" },
    compact: { outer: "w-8 h-7 p-0.5", inner: "h-4", pin: "w-[0.8px] h-2", led: "w-1.5 h-1.5" },
    normal: { outer: "w-10 h-9 p-0.5", inner: "h-5", pin: "w-1 h-2.5", led: "w-1.5 h-1.5" },
    enlarged: { outer: "w-14 h-12 p-1", inner: "h-7", pin: "w-1 h-3", led: "w-2 h-2" },
  }[scale];

  return (
    <div
      onClick={onTogglePlug}
      title={`${port.labelEn} • Speed: ${port.speed} • Status: ${port.status.toUpperCase()}\nکلیک جهت قطع/وصل پچ‌کورد`}
      className={cn(
        "group relative flex flex-col items-center select-none cursor-pointer transition-all shrink-0",
        className
      )}
    >
      {/* Outer Metal Shielded Jack Can (Nickel-Plated Steel) */}
      <div
        className={cn(
          "relative rounded-xs border border-neutral-400 shadow-md flex flex-col items-center justify-between overflow-hidden",
          "bg-gradient-to-b from-[#e5e7eb] via-[#9ca3af] to-[#4b5563]",
          dimensions.outer
        )}
      >
        {/* Stamped Spring Grounding Tabs on Top */}
        <div className="w-full flex justify-around px-0.5">
          <span className="w-1.5 h-0.5 bg-neutral-700 rounded-b-xs" />
          <span className="w-1.5 h-0.5 bg-neutral-700 rounded-b-xs" />
        </div>

        {/* Integrated Corner LEDs (Green = Link, Amber = Activity) */}
        <div className="w-full flex justify-between px-0.5">
          {/* Link LED */}
          <span
            className={cn(
              "rounded-full border border-black/70",
              dimensions.led,
              port.status === "active"
                ? "bg-emerald-400 shadow-[0_0_3px_#34d399]"
                : "bg-emerald-950"
            )}
            title="Link (Green)"
          />
          {/* Activity LED */}
          <span
            className={cn(
              "rounded-full border border-black/70",
              dimensions.led,
              port.status === "active"
                ? "bg-amber-400 shadow-[0_0_3px_#fbbf24] animate-pulse"
                : "bg-amber-950"
            )}
            title="Activity (Amber)"
          />
        </div>

        {/* Black PBT Jack Cavity Opening */}
        <div
          className={cn(
            "w-[88%] bg-[#08090b] rounded-xxs border border-neutral-700 flex flex-col items-center justify-between p-0.5 shadow-inner relative overflow-hidden",
            dimensions.inner
          )}
        >
          {/* Top Notch for RJ45 Locking Clip */}
          <div className="w-2.5 h-0.5 bg-[#15171d] rounded-b-xs border-b border-neutral-700" />

          {/* 8 Gold Phosphor-Bronze Pins */}
          <div className="flex gap-[1px] items-center justify-center my-auto">
            {[...Array(8)].map((_, i) => (
              <span
                key={i}
                className={cn(
                  "bg-gradient-to-b from-amber-300 via-amber-400 to-amber-600 rounded-xxs shadow-2xs",
                  dimensions.pin
                )}
              />
            ))}
          </div>

          {/* Plugged Cat6 Cable Boot Illusion if plugged */}
          {isPlugged && (
            <div className="absolute inset-x-0 bottom-0 top-0.5 bg-sky-800/90 border-t border-sky-400 flex items-center justify-center shadow-lg">
              <span className="text-[6px] font-mono text-white font-bold tracking-tighter truncate px-0.5">
                ETH
              </span>
            </div>
          )}
        </div>

        {/* Lower Rim */}
        <div className="w-full h-0.5 bg-neutral-600" />
      </div>

      {/* Silkscreen Port Label */}
      <span className="text-[7px] font-mono font-bold text-neutral-300 mt-0.5 text-center truncate max-w-[55px] tracking-tight">
        {port.labelEn}
      </span>
    </div>
  );
};

/* ========================================================================= */
/* 5. REALISTIC SFP / SFP+ OPTICAL TRANSCEIVER CAGE & DUPLEX LC CONNECTOR    */
/* ========================================================================= */
export const RealisticSfpSocket: React.FC<{
  port: HardwarePort;
  hasTransceiver?: boolean;
  scale?: "micro" | "compact" | "normal" | "enlarged";
  className?: string;
}> = ({
  port,
  hasTransceiver = true,
  scale = "compact",
  className,
}) => {
  const dimensions = {
    micro: { outer: "w-7 h-7 p-0.5", bore: "w-2 h-2" },
    compact: { outer: "w-8 h-8 p-0.5", bore: "w-2.5 h-2.5" },
    normal: { outer: "w-11 h-10 p-0.5", bore: "w-3 h-3" },
    enlarged: { outer: "w-14 h-14 p-1", bore: "w-4 h-4" },
  }[scale];

  // Blue bail latch = Single-mode (1310nm), Orange = Multi-mode (850nm)
  const isSingleMode = port.cableType?.toLowerCase().includes("single") || port.speed.includes("10G");
  const latchColor = isSingleMode ? "bg-sky-500 border-sky-300" : "bg-orange-500 border-orange-300";

  return (
    <div
      title={`${port.labelEn} • Optical Transceiver: ${isSingleMode ? "Single-Mode 1310nm" : "Multi-Mode 850nm"}\n${port.cableType}`}
      className={cn("group flex flex-col items-center select-none cursor-pointer shrink-0", className)}
    >
      {/* Zinc Die-Cast SFP Cage */}
      <div
        className={cn(
          "relative rounded-xs border border-neutral-400 shadow-md flex flex-col items-center justify-between overflow-hidden",
          "bg-gradient-to-b from-[#d1d5db] via-[#9ca3af] to-[#4b5563]",
          dimensions.outer
        )}
      >
        {/* EMI Perforation Spring Tabs */}
        <div className="w-full flex justify-between px-0.5">
          <span className="w-1 h-0.5 bg-neutral-800 rounded-b-xs" />
          <span className="w-1 h-0.5 bg-neutral-800 rounded-b-xs" />
        </div>

        {hasTransceiver ? (
          /* Inserted Transceiver with Bail Latch & Duplex LC Bores */
          <div className="w-full flex-1 bg-gradient-to-b from-[#262626] to-[#121212] rounded-xs border border-neutral-600 flex flex-col items-center justify-between p-0.5 my-0.5 relative shadow-inner">
            {/* Color-coded Bail Latch wire handle */}
            <div className={cn("w-[90%] h-1 rounded-xs border shadow-xs flex items-center justify-center", latchColor)}>
              <span className="w-2.5 h-[0.5px] bg-white/80" />
            </div>

            {/* Duplex LC Receptacle (TX / RX Ports) */}
            <div className="flex items-center justify-center gap-0.5 my-auto">
              <div className={cn("rounded-xxs bg-[#050507] border border-neutral-700 flex items-center justify-center relative", dimensions.bore)}>
                <span className="w-1 h-1 rounded-full bg-white border border-neutral-500 shadow-[0_0_3px_#38bdf8]" />
              </div>
              <div className={cn("rounded-xxs bg-[#050507] border border-neutral-700 flex items-center justify-center relative", dimensions.bore)}>
                <span className="w-1 h-1 rounded-full bg-white border border-neutral-500 shadow-[0_0_3px_#38bdf8]" />
              </div>
            </div>

            {/* Twin Yellow Fiber Cable Boot indicator */}
            <div className="flex gap-[1px]">
              <span className="w-1 h-0.5 bg-amber-400 rounded-t-xxs" />
              <span className="w-1 h-0.5 bg-amber-400 rounded-t-xxs" />
            </div>
          </div>
        ) : (
          <div className="w-full flex-1 bg-[#090a0d] rounded-xs border border-neutral-800 flex items-center justify-center">
            <span className="text-[6px] font-mono text-neutral-500">EMPTY</span>
          </div>
        )}

        <div className="w-full h-0.5 bg-neutral-700" />
      </div>

      {/* Silkscreen Label */}
      <span className="text-[7px] font-mono font-bold text-neutral-300 mt-0.5 text-center truncate max-w-[55px] tracking-tight">
        {port.labelEn}
      </span>
    </div>
  );
};

/* ========================================================================= */
/* 6. REALISTIC D-SUB 9 (DB-9) SERIAL CONNECTOR (RS-232 / RS-422 / RS-485)    */
/* ========================================================================= */
export const RealisticDsubSocket: React.FC<{
  port: HardwarePort;
  scale?: "compact" | "normal" | "enlarged";
  className?: string;
}> = ({ port, scale = "compact", className }) => {
  const isCompact = scale === "compact";
  const isEnlarged = scale === "enlarged";

  return (
    <div
      title={`${port.labelEn} • DB-9 Serial Communication Port (${port.speed})`}
      className={cn("flex flex-col items-center select-none cursor-pointer shrink-0", className)}
    >
      {/* DB-9 Metal Flange with Hex Jackscrews */}
      <div
        className={cn(
          "relative rounded-xs border border-neutral-400 shadow-md flex items-center justify-between p-0.5",
          "bg-gradient-to-b from-[#e5e7eb] via-[#9ca3af] to-[#6b7280]",
          isEnlarged ? "w-18 h-9 px-1" : isCompact ? "w-9 h-5 px-0.5" : "w-12 h-6 px-0.5"
        )}
      >
        {/* Left Hex Jack-Screw Standoff */}
        <div className="w-1.5 h-1.5 bg-gradient-to-br from-neutral-200 to-neutral-700 rounded-xxs border border-neutral-800 flex items-center justify-center shadow-xs">
          <div className="w-0.5 h-0.5 rounded-full bg-neutral-950" />
        </div>

        {/* Trapezoidal D-Shape Shell */}
        <div className="relative flex-1 mx-0.5 h-[85%] bg-gradient-to-b from-[#20222a] to-[#121318] rounded-xxs border border-neutral-700 flex flex-col items-center justify-center p-[1px] overflow-hidden">
          {/* Top 5 Gold Pins */}
          <div className="flex gap-[1px] mb-[1px]">
            {[...Array(5)].map((_, i) => (
              <span key={i} className="w-0.5 h-0.5 rounded-full bg-amber-400 shadow-2xs" />
            ))}
          </div>
          {/* Bottom 4 Gold Pins */}
          <div className="flex gap-[1px]">
            {[...Array(4)].map((_, i) => (
              <span key={i} className="w-0.5 h-0.5 rounded-full bg-amber-400 shadow-2xs" />
            ))}
          </div>
        </div>

        {/* Right Hex Jack-Screw Standoff */}
        <div className="w-1.5 h-1.5 bg-gradient-to-br from-neutral-200 to-neutral-700 rounded-xxs border border-neutral-800 flex items-center justify-center shadow-xs">
          <div className="w-0.5 h-0.5 rounded-full bg-neutral-950" />
        </div>
      </div>

      <span className="text-[7px] font-mono font-bold text-neutral-300 mt-0.5 text-center truncate max-w-[55px] tracking-tight">
        {port.labelEn}
      </span>
    </div>
  );
};

/* ========================================================================= */
/* 7. REALISTIC PHOENIX CONTACT / WAGO INDUSTRIAL TERMINAL BLOCK              */
/* ========================================================================= */
export const RealisticTerminalBlock: React.FC<{
  terminals: HardwareTerminalPin[];
  maxPins?: number;
  className?: string;
}> = ({ terminals, maxPins = 4, className }) => {
  const displayPins = terminals.slice(0, maxPins);

  return (
    <div className={cn("bg-[#070908] rounded-xs border border-neutral-700 p-0.5 select-none font-mono w-full overflow-hidden shrink-0", className)}>
      {/* Industrial Green Polyamide Terminal Block Body (RAL 6021) */}
      <div className="flex items-stretch gap-[1px] bg-[#1a4329] p-[1.5px] rounded-xxs border border-emerald-900 shadow-inner w-full overflow-hidden">
        {displayPins.map((t, idx) => (
          <div
            key={idx}
            title={`${t.pinNumber}: ${t.signalNameEn}\nولتاژ: ${t.voltageLevel} • سیم: ${t.wireColorName}`}
            className="flex-1 min-w-0 bg-[#225735] hover:bg-[#2b6f43] rounded-xxs border border-emerald-800 p-[1px] flex flex-col items-center justify-between transition-colors cursor-pointer"
          >
            {/* Clamping screw head on top */}
            <div className="w-1.5 h-1.5 rounded-full bg-gradient-to-br from-neutral-200 via-amber-200 to-amber-700 border border-neutral-900 flex items-center justify-center shadow-xs">
              <span className="w-1 h-[0.3px] bg-neutral-900 rotate-45" />
            </div>

            {/* Terminal number */}
            <span className="text-[5.5px] font-bold text-white leading-none my-[1px] truncate max-w-full">
              {t.pinNumber}
            </span>

            {/* Wire insertion funnel with ferrule wire */}
            <div
              className="w-1.5 h-1.5 rounded-full border border-black/80 flex items-center justify-center shadow-xs"
              style={{ backgroundColor: t.wireColor }}
            >
              <span className="w-0.5 h-0.5 rounded-full bg-amber-300" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

/* ========================================================================= */
/* 8. REALISTIC INDUSTRIAL TOGGLE SWITCH WITH HEX NUT COLLAR                 */
/* ========================================================================= */
export const RealisticToggleSwitch: React.FC<{
  label: string;
  isUp?: boolean;
  onToggle?: () => void;
  className?: string;
}> = ({ label, isUp = true, onToggle, className }) => {
  return (
    <div
      onClick={onToggle}
      title={`${label} (${isUp ? "UP / ON" : "DOWN / OFF"})\nکلیک جهت تغییر وضعیت`}
      className={cn(
        "flex flex-col items-center select-none cursor-pointer shrink-0 active:scale-95 transition-transform",
        className
      )}
    >
      {/* Hex Nut Bushing Base */}
      <div className="w-3.5 h-3.5 rounded-xxs bg-gradient-to-br from-neutral-300 via-neutral-500 to-neutral-700 border border-neutral-800 flex items-center justify-center shadow-md p-0.5">
        {/* Metal Toggle Bat */}
        <div
          className={cn(
            "w-1.5 rounded-full bg-gradient-to-t from-neutral-400 via-white to-neutral-300 border border-neutral-700 shadow-sm transition-all duration-150",
            isUp ? "h-3 -translate-y-0.5" : "h-2 translate-y-0.5 bg-neutral-500"
          )}
        />
      </div>
      <span className="text-[6.5px] font-mono font-bold text-neutral-300 mt-0.5 text-center truncate max-w-[48px]">
        {label}
      </span>
    </div>
  );
};

/* ========================================================================= */
/* 9. REALISTIC GOLD TEST POINT LOOP (TP +5V, TP GND)                        */
/* ========================================================================= */
export const RealisticTestPoint: React.FC<{
  label: string;
  value?: string;
  color?: "red" | "black" | "yellow";
  className?: string;
}> = ({ label, value, color = "yellow", className }) => {
  const collarColor = {
    red: "bg-rose-600 border-rose-400",
    black: "bg-neutral-900 border-neutral-600",
    yellow: "bg-amber-500 border-amber-300",
  }[color];

  return (
    <div
      title={`نقطه تست پین (Test Point): ${label} = ${value || "Active"}`}
      className={cn("flex flex-col items-center select-none font-mono shrink-0", className)}
    >
      <div className={cn("w-2 h-2 rounded-full border flex items-center justify-center shadow-xs", collarColor)}>
        {/* Gold Test Loop Ring */}
        <span className="w-1 h-1 rounded-full bg-amber-300 border border-amber-600" />
      </div>
      <span className="text-[6px] font-mono font-bold text-neutral-400 mt-0.5 truncate max-w-[40px]">
        {label}
      </span>
    </div>
  );
};

/* ========================================================================= */
/* 10. REALISTIC MINIATURE CIRCUIT BREAKER (MCB for PDU)                     */
/* ========================================================================= */
export const RealisticMcbBreaker: React.FC<{
  label: string;
  rating?: string;
  isOn?: boolean;
  onToggle?: () => void;
  className?: string;
}> = ({ label, rating = "16A", isOn = true, onToggle, className }) => {
  return (
    <div
      onClick={onToggle}
      title={`${label} (${rating}) • کلیک جهت قطع و وصل کلید مینیاتوری`}
      className={cn(
        "min-w-[36px] max-w-[42px] bg-gradient-to-b from-[#e5e7eb] via-[#d1d5db] to-[#9ca3af] border border-neutral-600 rounded-xxs p-0.5 flex flex-col justify-between text-center select-none shadow-md cursor-pointer active:scale-95 transition-transform shrink-0",
        className
      )}
    >
      <span className="text-[7px] font-mono font-bold text-neutral-900 truncate">
        {label}
      </span>

      {/* Flag status indicator window (Red = ON, Green = OFF) */}
      <div className="my-[1px] mx-auto w-2.5 h-1 rounded-xxs border border-neutral-700 overflow-hidden">
        <div className={cn("w-full h-full", isOn ? "bg-rose-600" : "bg-emerald-500")} />
      </div>

      {/* Molded toggle lever */}
      <div className="my-0.5 mx-auto w-3.5 h-5 bg-[#262626] rounded-xxs border border-neutral-800 p-[1px] flex flex-col justify-between shadow-inner">
        <div
          className={cn(
            "w-full h-2 rounded-xxs shadow-md border transition-all flex items-center justify-center text-[5px] font-black leading-none",
            isOn
              ? "bg-rose-600 border-rose-400 text-white translate-y-0"
              : "bg-neutral-600 border-neutral-400 text-neutral-300 translate-y-2"
          )}
        >
          {isOn ? "I" : "O"}
        </div>
      </div>

      <span className="text-[6px] font-mono font-bold text-neutral-800">
        {rating}
      </span>
    </div>
  );
};

/* ========================================================================= */
/* 11. REALISTIC 19" RACK MOUNTING EAR / BRACKET WITH M6 CAGE NUT BOLTS      */
/* ========================================================================= */
export const RealisticRackMountingEar: React.FC<{
  heightU: number;
  side: "left" | "right";
  className?: string;
}> = ({ heightU, side, className }) => {
  const isLeft = side === "left";

  return (
    <div
      className={cn(
        "w-5 sm:w-6 bg-gradient-to-r from-neutral-700 via-neutral-600 to-neutral-800 border-neutral-900 flex flex-col justify-between py-2 items-center select-none shrink-0 shadow-md",
        isLeft ? "border-r rounded-l-md" : "border-l rounded-r-md",
        className
      )}
      style={{ minHeight: `${heightU * 32}px` }}
    >
      {/* Top M6 Hex/Slotted Screw with Black Cup Washer */}
      <div className="w-3 h-3 rounded-full bg-neutral-900 border border-neutral-600 flex items-center justify-center shadow-xs">
        <RealisticCaptiveScrew size={8} type="slotted" angle={25} />
      </div>

      {/* Middle Stamped Identification / Height indicator */}
      <span className="rotate-90 text-[6.5px] font-mono font-bold text-neutral-400 tracking-wider">
        {heightU}U
      </span>

      {/* Bottom M6 Hex/Slotted Screw with Black Cup Washer */}
      <div className="w-3 h-3 rounded-full bg-neutral-900 border border-neutral-600 flex items-center justify-center shadow-xs">
        <RealisticCaptiveScrew size={8} type="slotted" angle={65} />
      </div>
    </div>
  );
};
