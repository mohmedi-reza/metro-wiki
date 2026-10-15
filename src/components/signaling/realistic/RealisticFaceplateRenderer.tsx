import React, { useState } from "react";
import { RackSubrack } from "../../../types/signalingRooms";
import {
  HardwareModuleCard,
  HardwarePort,
} from "../../../types/realisticHardware";
import { getSubrackHardwareCards } from "./hardwareCatalog";
import { cn } from "../../../lib/utils";
import {
  RealisticCaptiveScrew,
  RealisticEjectorHandle,
  RealisticLed,
  RealisticRj45Socket,
  RealisticSfpSocket,
  RealisticDsubSocket,
  RealisticTerminalBlock,
  RealisticToggleSwitch,
  RealisticTestPoint,
  RealisticMcbBreaker,
  RealisticRackMountingEar,
} from "./RealisticHardwareComponents";
import {
  Activity,
  Zap,
  ShieldCheck,
  Cpu,
  Layers,
  Thermometer,
  Gauge,
  Sliders,
  ExternalLink,
} from "lucide-react";

interface RealisticFaceplateRendererProps {
  subrack: RackSubrack;
  onCardClick?: (card: HardwareModuleCard) => void;
  selectedCardId?: string | null;
  compact?: boolean;
}

/**
 * Extracts crisp, authentic industrial silkscreen markings for Eurocard faceplates.
 * Matches real railway interlocking cards (Siemens Sicas, Alstom Smartlock, Thales LockTrac).
 */
function getCardShortCode(card: HardwareModuleCard): { code: string; sub: string; role: "cpu" | "pwr" | "io" | "net" | "diag" } {
  const name = card.nameEn.toUpperCase();
  const id = card.id.toUpperCase();

  if (name.includes("POWER") || name.includes("PSU") || id.includes("PSU")) {
    return { code: "PSU-24V", sub: "24/5V DC", role: "pwr" };
  }
  if (name.includes("PROCESSOR") || name.includes("CPU") || name.includes("VPU")) {
    const ch = name.includes("CHANNEL 2") || name.includes("CPU-B") ? "B" : "A";
    return { code: `VPU-${ch}`, sub: "SIL 4 2oo2", role: "cpu" };
  }
  if (name.includes("VOTER") || name.includes("WATCHDOG") || name.includes("WDT")) {
    return { code: "WDT-VOT", sub: "2oo3 VOTE", role: "cpu" };
  }
  if (name.includes("OUTPUT") || name.includes("VOM")) {
    return { code: "VOM-08", sub: "8x 24V/2A", role: "io" };
  }
  if (name.includes("INPUT") || name.includes("DIM")) {
    return { code: "DIM-16", sub: "16x 24V", role: "io" };
  }
  if (name.includes("FIBER") || name.includes("OPTICAL") || id.includes("FIB")) {
    return { code: "FIB-SW", sub: "1000LX DUP", role: "net" };
  }
  if (name.includes("NETWORK") || name.includes("ETHERNET") || name.includes("SWITCH")) {
    return { code: "ETH-SW", sub: "MANAGED", role: "net" };
  }
  if (name.includes("DIAGNOSTIC") || name.includes("LOGGER") || name.includes("NTP")) {
    return { code: "DIAG-LOG", sub: "NTP/REC", role: "diag" };
  }
  if (name.includes("BATTERY") || name.includes("CHARGER")) {
    return { code: "BATT-CHG", sub: "24V/10A", role: "pwr" };
  }
  if (name.includes("INVERTER")) {
    return { code: "INV-230", sub: "2kVA AC", role: "pwr" };
  }
  if (name.includes("DISTRIBUTION") || name.includes("PDU")) {
    return { code: "DC-DIST", sub: "PDU BUS", role: "pwr" };
  }

  // Fallback
  const firstWord = card.nameEn.split(" ")[0] || "CARD";
  return { code: firstWord.slice(0, 7).toUpperCase(), sub: card.slotNumber.slice(0, 7), role: "diag" };
}

export const RealisticFaceplateRenderer: React.FC<RealisticFaceplateRendererProps> = ({
  subrack,
  onCardClick,
  selectedCardId,
  compact = false,
}) => {
  const cards = getSubrackHardwareCards(subrack);
  const [hoveredCard, setHoveredCard] = useState<HardwareModuleCard | null>(null);

  // Finish style: "gunmetal" (Dark Industrial Anodized) or "aluminum" (Classic Natural Anodized Silver)
  const [finishStyle, setFinishStyle] = useState<"gunmetal" | "aluminum">("gunmetal");

  // Toggle unlatch simulation on ejector handles
  const [unlatchedCardIds, setUnlatchedCardIds] = useState<Record<string, boolean>>({});

  // Toggle switch states for power cards
  const [toggleSwitches, setToggleSwitches] = useState<Record<string, boolean>>({});

  const toggleHandleLatch = (cardId: string) => {
    setUnlatchedCardIds((prev) => ({
      ...prev,
      [cardId]: !prev[cardId],
    }));
  };

  const handleToggleSwitch = (cardId: string) => {
    setToggleSwitches((prev) => ({
      ...prev,
      [cardId]: prev[cardId] === undefined ? false : !prev[cardId],
    }));
  };

  // Helper to render MCBs for Power Distribution Subracks
  const isPdu = subrack.category === "power_supply";

  // Calculate 84 HP allocation so all cards fit exactly 100% with ZERO horizontal scrolling
  const totalAllocatedHp = cards.reduce((sum, c) => sum + (c.widthHp || 8), 0);
  const effectiveTotalHp = Math.max(totalAllocatedHp, 84);
  const remainingBlankHp = Math.max(0, 84 - totalAllocatedHp);

  return (
    <div className="relative w-full select-none" dir="ltr">
      {/* 19-INCH INDUSTRIAL SUBRACK CRATE (DIN 41494 / IEC 60297-3-101) */}
      <div className="relative bg-[#0d0e12] rounded-xl border-2 border-neutral-700 shadow-2xl flex flex-col overflow-hidden w-full">
        
        {/* SUBRACK TOP EXTRUDED ALUMINUM BEAM WITH 84HP GUIDE MARKS */}
        <div className="h-6 bg-gradient-to-r from-neutral-800 via-neutral-700 to-neutral-800 border-b border-neutral-600 flex items-center justify-between px-2 sm:px-3 text-[9px] font-mono text-neutral-300 shadow-inner shrink-0">
          <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
            <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_6px_#34d399] shrink-0" />
            <span className="font-bold tracking-wider text-neutral-100 uppercase truncate text-[9px] sm:text-[10px]">
              {subrack.titleEn || subrack.title}
            </span>
            <span className="text-neutral-400 text-[8px] hidden md:inline shrink-0">
              [{subrack.modelCode}]
            </span>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Finish Style Switcher */}
            <div className="hidden sm:flex items-center gap-1 bg-black/40 px-1.5 py-0.5 rounded border border-neutral-600 text-[8px]">
              <span className="text-neutral-400">FINISH:</span>
              <button
                type="button"
                onClick={() => setFinishStyle("gunmetal")}
                className={cn(
                  "px-1.5 py-0.2 rounded transition-colors cursor-pointer",
                  finishStyle === "gunmetal" ? "bg-neutral-800 text-sky-400 font-bold" : "text-neutral-400 hover:text-white"
                )}
              >
                GUNMETAL
              </button>
              <button
                type="button"
                onClick={() => setFinishStyle("aluminum")}
                className={cn(
                  "px-1.5 py-0.2 rounded transition-colors cursor-pointer",
                  finishStyle === "aluminum" ? "bg-neutral-300 text-neutral-900 font-bold" : "text-neutral-400 hover:text-white"
                )}
              >
                ALUMINUM
              </button>
            </div>

            <span className="text-neutral-400 text-[8px] hidden xs:inline">84 HP • 19" EUROCARD</span>
            <span className="font-bold px-1.5 py-0.2 rounded bg-emerald-950 text-emerald-400 border border-emerald-700 text-[8px]">
              {subrack.safetyLevel}
            </span>
          </div>
        </div>

        {/* 84HP CARD GUIDE TICK MARKS (IEC 60297 Slot Guides) */}
        <div className="h-1 bg-[#1b1d24] border-b border-neutral-800 flex justify-between px-5 overflow-hidden shrink-0">
          {Array.from({ length: 42 }).map((_, i) => (
            <span key={i} className="w-[1px] h-full bg-neutral-700/60" />
          ))}
        </div>

        {/* MAIN MODULAR CARD BAY WITH 19" LEFT & RIGHT MOUNTING EARS (STRICTLY NO SCROLLBAR) */}
        <div className="flex items-stretch bg-[#08090b] overflow-hidden p-1 relative w-full">
          
          {/* Left 19" Mounting Ear with M6 Screws */}
          <RealisticRackMountingEar heightU={subrack.heightU} side="left" />

          {/* Cards Bay - Strictly 100% width, NO horizontal scrolling */}
          <div
            className={cn(
              "flex-1 flex items-stretch gap-[1.5px] bg-[#0c0d11] px-0.5 py-1 overflow-hidden w-full",
              compact ? "min-h-[175px] max-h-[195px]" : "min-h-[250px] max-h-[290px]"
            )}
          >
            {cards.map((card) => {
              const isSelected = card.id === selectedCardId;
              const isHovered = hoveredCard?.id === card.id;
              const isLatched = !unlatchedCardIds[card.id];
              const isSwitchOn = toggleSwitches[card.id] ?? true;

              // Proportional width based on 84HP so ALL cards fit side-by-side with NO SCROLL
              const cardWidthPercent = ((card.widthHp || 8) / effectiveTotalHp) * 100;
              const isNarrow = (card.widthHp || 8) <= 6;
              const { code: shortCode, sub: subCode, role } = getCardShortCode(card);

              // Aluminum or Gunmetal styling with subtle metallic chamfer
              const cardFaceplateTheme =
                finishStyle === "aluminum"
                  ? isSelected
                    ? "bg-gradient-to-b from-[#f8fafc] via-[#e2e8f0] to-[#cbd5e1] text-neutral-900 border-sky-500 ring-2 ring-sky-500/50 shadow-xl"
                    : isHovered
                    ? "bg-gradient-to-b from-[#f1f5f9] via-[#e2e8f0] to-[#cbd5e1] text-neutral-900 border-neutral-400 shadow-md"
                    : "bg-gradient-to-b from-[#e2e8f0] via-[#cbd5e1] to-[#94a3b8] text-neutral-900 border-neutral-400"
                  : isSelected
                  ? "bg-gradient-to-b from-[#222736] via-[#181b24] to-[#10121a] text-white border-sky-400 ring-2 ring-sky-500/60 shadow-xl"
                  : isHovered
                  ? "bg-gradient-to-b from-[#1f232f] via-[#161820] to-[#0e1015] text-white border-neutral-400 shadow-lg"
                  : "bg-gradient-to-b from-[#191b22] via-[#13141a] to-[#0b0c10] text-white border-neutral-700/80";

              return (
                <div
                  key={card.id}
                  onClick={() => onCardClick && onCardClick(card)}
                  onMouseEnter={() => setHoveredCard(card)}
                  onMouseLeave={() => setHoveredCard(null)}
                  className={cn(
                    "relative rounded-xs border transition-all cursor-pointer flex flex-col justify-between p-1 select-none shrink-0 group overflow-hidden",
                    cardFaceplateTheme
                  )}
                  style={{
                    width: `${cardWidthPercent}%`,
                    minWidth: 0,
                  }}
                >
                  {/* EMC Side Spring Grounding Fingers along the vertical edge */}
                  <div className="absolute top-2 bottom-2 left-0 w-[1.5px] bg-neutral-600/40 flex flex-col justify-around pointer-events-none">
                    <span className="w-0.5 h-1 bg-neutral-400 rounded-r-xxs" />
                    <span className="w-0.5 h-1 bg-neutral-400 rounded-r-xxs" />
                    <span className="w-0.5 h-1 bg-neutral-400 rounded-r-xxs" />
                  </div>

                  {/* ======================================================= */}
                  {/* ZONE 1: TOP FASTENER & AUTHENTIC LASER CARD SILKSCREEN */}
                  {/* ======================================================= */}
                  <div className="shrink-0 flex flex-col items-center pb-1 border-b border-black/30 gap-0.5">
                    {/* Top Captive Screw with knurled collar */}
                    <div className="w-full flex items-center justify-between">
                      <RealisticCaptiveScrew size={compact ? 7 : 9} type="slotted" angle={25} />
                      <span className="text-[6.5px] font-mono font-bold px-0.5 rounded bg-black/60 text-sky-400 border border-neutral-700 truncate">
                        {card.slotNumber.replace("SLOT ", "#")}
                      </span>
                    </div>

                    {/* Laser-Etched DIN Card Acronym Code (High Legibility!) */}
                    <div className="text-center w-full overflow-hidden">
                      <div
                        className={cn(
                          "font-mono font-black tracking-wider leading-none uppercase truncate text-center",
                          isNarrow ? "text-[8px]" : "text-[9.5px]",
                          finishStyle === "aluminum" ? "text-neutral-900" : "text-white"
                        )}
                        title={card.nameEn}
                      >
                        {shortCode}
                      </div>
                      <div
                        className={cn(
                          "text-[6px] font-mono font-bold tracking-tight opacity-75 truncate text-center",
                          finishStyle === "aluminum" ? "text-neutral-700" : "text-sky-300"
                        )}
                      >
                        {subCode}
                      </div>
                    </div>

                    {/* SIL Safety Badge */}
                    {!isNarrow && (
                      <span className="text-[5.5px] font-mono font-bold px-1 rounded bg-emerald-950 text-emerald-300 border border-emerald-700 leading-tight">
                        {card.safetyLevel.split(" ")[0]}
                      </span>
                    )}
                  </div>

                  {/* ======================================================= */}
                  {/* ZONE 2: DIAGNOSTIC LED ARRAY (Optical Light-Pipes)     */}
                  {/* ======================================================= */}
                  <div className="shrink-0 my-0.5 bg-[#060709] p-0.5 rounded-xxs border border-neutral-800/90 w-full overflow-hidden">
                    <div className="flex flex-col gap-[2px]">
                      {card.leds.slice(0, compact ? 2 : 4).map((led, lIdx) => (
                        <RealisticLed
                          key={lIdx}
                          led={led}
                          size="xs"
                          showLabel={!isNarrow}
                          layout="horizontal"
                        />
                      ))}
                    </div>
                  </div>

                  {/* ======================================================= */}
                  {/* ZONE 3: PHYSICAL HARDWARE INTERFACE (Role-Specific)     */}
                  {/* ======================================================= */}
                  <div className="my-auto flex-1 flex flex-col items-center justify-center py-1 w-full overflow-hidden gap-1">
                    
                    {/* Role A: CPU / Processing / Communication Modules -> RJ45 / SFP / DB9 */}
                    {(role === "cpu" || role === "net" || role === "diag") && card.ports.length > 0 && (
                      <div className="flex flex-col items-center justify-center gap-1 w-full overflow-hidden">
                        {card.ports.slice(0, compact ? 1 : 2).map((port) => {
                          if (port.type === "RJ45") {
                            return (
                              <RealisticRj45Socket
                                key={port.id}
                                port={port}
                                scale={compact || isNarrow ? "micro" : "compact"}
                              />
                            );
                          }
                          if (port.type === "SFP" || port.type === "SFP+" || port.type === "LC_DUPLEX") {
                            return (
                              <RealisticSfpSocket
                                key={port.id}
                                port={port}
                                scale={compact || isNarrow ? "micro" : "compact"}
                              />
                            );
                          }
                          if (port.type === "DB9") {
                            return (
                              <RealisticDsubSocket
                                key={port.id}
                                port={port}
                                scale={compact || isNarrow ? "compact" : "normal"}
                              />
                            );
                          }
                          return null;
                        })}
                      </div>
                    )}

                    {/* Role B: Power Supply / PDU Cards -> Toggle Switch, Test Points, Terminals */}
                    {role === "pwr" && (
                      <div className="flex flex-col items-center justify-center gap-1 w-full overflow-hidden">
                        {isPdu ? (
                          <div className="flex flex-col items-center gap-0.5">
                            <RealisticMcbBreaker label="Q1" rating="16A" isOn={true} />
                            {!compact && !isNarrow && (
                              <RealisticMcbBreaker label="Q2" rating="16A" isOn={true} />
                            )}
                          </div>
                        ) : (
                          <>
                            <RealisticToggleSwitch
                              label="PWR"
                              isUp={isSwitchOn}
                              onToggle={() => handleToggleSwitch(card.id)}
                            />
                            {!compact && (
                              <div className="flex items-center justify-center gap-1">
                                <RealisticTestPoint label="+5V" color="yellow" />
                                <RealisticTestPoint label="GND" color="black" />
                              </div>
                            )}
                            {card.terminals && card.terminals.length > 0 && (
                              <RealisticTerminalBlock
                                terminals={card.terminals}
                                maxPins={isNarrow ? 2 : 3}
                              />
                            )}
                          </>
                        )}
                      </div>
                    )}

                    {/* Role C: Field I/O Modules (VOM / DIM) -> Pluggable Terminal Blocks */}
                    {role === "io" && card.terminals && card.terminals.length > 0 && (
                      <div className="w-full flex flex-col items-center justify-center gap-1">
                        <RealisticTerminalBlock
                          terminals={card.terminals}
                          maxPins={isNarrow ? 2 : compact ? 3 : 5}
                        />
                        {!compact && (
                          <div className="flex items-center gap-1 text-[6px] font-mono text-neutral-400">
                            <span>ISOL: 2.5kV</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* ======================================================= */}
                  {/* ZONE 4: BOTTOM EJECTOR HANDLE & FASTENER               */}
                  {/* ======================================================= */}
                  <div className="shrink-0 flex items-center justify-between pt-1 border-t border-black/30 gap-0.5 w-full">
                    {/* Bottom Captive Screw */}
                    <RealisticCaptiveScrew size={compact ? 7 : 9} type="slotted" angle={70} />

                    {/* Temp or Barcode */}
                    {!isNarrow && (
                      <span className="text-[5.5px] font-mono opacity-60 truncate">
                        {card.coreTemperature}
                      </span>
                    )}

                    {/* IEEE 1101.10 Ejector Handle with Red Release Latch */}
                    <RealisticEjectorHandle
                      position="bottom"
                      size={compact ? "sm" : "md"}
                      isLatched={isLatched}
                      onToggleLatch={() => toggleHandleLatch(card.id)}
                    />
                  </div>
                </div>
              );
            })}

            {/* Eurocard Blanking Filler Panel if remaining HP > 0 */}
            {remainingBlankHp > 0 && (
              <div
                className="bg-gradient-to-b from-[#181a22] via-[#121319] to-[#0d0e13] rounded-xs border border-neutral-700/80 flex flex-col justify-between p-1 select-none overflow-hidden"
                style={{
                  width: `${(remainingBlankHp / effectiveTotalHp) * 100}%`,
                  minWidth: 0,
                }}
                title={`Blindplatte / Blanking Faceplate (${remainingBlankHp} HP Free)`}
              >
                <div className="flex justify-center">
                  <RealisticCaptiveScrew size={compact ? 7 : 9} type="slotted" angle={45} />
                </div>
                <div className="text-center font-mono text-[6.5px] text-neutral-400 rotate-90 sm:rotate-0 truncate">
                  {remainingBlankHp}HP BLANK
                </div>
                <div className="flex justify-center">
                  <RealisticCaptiveScrew size={compact ? 7 : 9} type="slotted" angle={135} />
                </div>
              </div>
            )}
          </div>

          {/* Right 19" Mounting Ear with M6 Screws */}
          <RealisticRackMountingEar heightU={subrack.heightU} side="right" />
        </div>

        {/* SUBRACK BOTTOM GUIDE RAIL WITH EXTRUDED ALUMINUM BEVEL */}
        <div className="h-1.5 bg-gradient-to-r from-neutral-800 via-neutral-700 to-neutral-800 border-t border-neutral-600 flex justify-between px-5 items-center shrink-0">
          {Array.from({ length: 42 }).map((_, i) => (
            <span key={i} className="w-[1px] h-1 bg-neutral-500/70" />
          ))}
        </div>
      </div>

      {/* Floating Interactive Engineering HUD Tooltip on Hover */}
      {hoveredCard && (
        <div className="absolute -top-12 left-1/2 -translate-x-1/2 z-40 bg-neutral-900/95 backdrop-blur-md px-3 py-1.5 rounded-xl border border-sky-500/70 shadow-2xl flex items-center gap-3 text-xs font-mono text-white pointer-events-none animate-in fade-in duration-100 whitespace-nowrap">
          <span className="w-2 h-2 rounded-full bg-sky-400 animate-ping" />
          <span className="font-bold text-sky-400">{hoveredCard.nameEn}</span>
          <span className="text-neutral-400">[{hoveredCard.modelEn}]</span>
          <span className="text-emerald-400 font-bold bg-emerald-950 px-1.5 py-0.2 rounded border border-emerald-800 text-[10px]">
            {hoveredCard.safetyLevel}
          </span>
          <span className="text-amber-300 text-[10px]">{hoveredCard.coreTemperature}</span>
          <span className="text-neutral-400 text-[10px] hidden sm:inline">کلیک = بازرسی ۱:۱</span>
        </div>
      )}
    </div>
  );
};
