import React, { useState } from "react";
import {
  SignalingRackElevation,
  RackSubrack,
  RackSubrackCategory,
} from "../../types/signalingRooms";
import { HardwareModuleCard, HardwarePort } from "../../types/realisticHardware";
import { CableRun } from "../../types/cableSchedule";
import { RealisticFaceplateRenderer } from "./realistic/RealisticFaceplateRenderer";
import { RealisticHardwareInspectorModal } from "./realistic/RealisticHardwareInspectorModal";
import { RearRackElevation } from "./realistic/RearRackElevation";
import { RackZoomPanCanvas } from "./realistic/RackZoomPanCanvas";
import { CablingOverlay } from "./realistic/CablingOverlay";
import { PortDiagnosticsModal } from "./realistic/PortDiagnosticsModal";
import { RealisticCaptiveScrew } from "./realistic/RealisticHardwareComponents";
import { cn } from "../../lib/utils";
import {
  Cpu,
  Zap,
  Activity,
  Layers,
  CheckCircle2,
  AlertTriangle,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Info,
  Sliders,
  ShieldCheck,
  Radio,
  Network,
  Cable,
  Eye,
  Wind,
  Disc,
} from "lucide-react";

interface VisualRackDrawingProps {
  rack: SignalingRackElevation;
  selectedSubrackId: string | null;
  onSelectSubrack: (subrackId: string) => void;
  onSelectCard?: (card: HardwareModuleCard, subrack: RackSubrack) => void;
  highlightedCableId?: string | null;
  className?: string;
  isInteractive?: boolean;
}

export const VisualRackDrawing: React.FC<VisualRackDrawingProps> = ({
  rack,
  selectedSubrackId,
  onSelectSubrack,
  onSelectCard,
  highlightedCableId,
  className,
  isInteractive = true,
}) => {
  const [elevationView, setElevationView] = useState<"front" | "rear">("front");
  const [showCabling, setShowCabling] = useState<boolean>(true);
  const [rackViewScope, setRackViewScope] = useState<"full_rack" | "focus_subrack">("full_rack");
  const [hoveredSubrackId, setHoveredSubrackId] = useState<string | null>(null);
  const [inspectingCard, setInspectingCard] = useState<HardwareModuleCard | null>(null);
  const [inspectingSubrack, setInspectingSubrack] = useState<RackSubrack | null>(null);
  const [diagnosingPort, setDiagnosingPort] = useState<HardwarePort | null>(null);
  const [diagnosingCable, setDiagnosingCable] = useState<CableRun | null>(null);

  // Active subrack object
  const activeSubrack = rack.subracks.find((s) => s.id === selectedSubrackId) || rack.subracks[0] || null;

  // Sort subracks descending by uStart (U42 down to U01)
  const sortedSubracks = [...rack.subracks].sort((a, b) => b.uStart - a.uStart);

  // Build the 42U rack item map with gap fillers
  const rackBlocks: Array<
    | { type: "subrack"; data: RackSubrack }
    | { type: "blank"; uStart: number; uEnd: number; heightU: number; purpose: string }
  > = [];

  let currentU = 42;
  sortedSubracks.forEach((sub) => {
    // If there is a gap between currentU and sub.uEnd
    if (currentU > sub.uEnd) {
      const gapHeight = currentU - sub.uEnd;
      const purpose =
        gapHeight >= 2
          ? "پنل تهویه مشبک و کانال هدایت پچ‌کورد (Air Vented Panel & Cable Duct)"
          : "پنل بلنک محافظ ۱ یونیت (1U Blanking Panel)";
      rackBlocks.push({
        type: "blank",
        uStart: currentU,
        uEnd: sub.uEnd + 1,
        heightU: gapHeight,
        purpose,
      });
    }

    rackBlocks.push({
      type: "subrack",
      data: sub,
    });

    currentU = sub.uStart - 1;
  });

  // If there's any remaining gap down to U01
  if (currentU >= 1) {
    rackBlocks.push({
      type: "blank",
      uStart: currentU,
      uEnd: 1,
      heightU: currentU,
      purpose: "فضای رزرو پایینی، ترمینال‌های ورودی ارت و فیلترهای کف رک",
    });
  }

  // Visual card slots renderer with authentic English labels, LEDs, and interactive cards
  const renderSubrackFaceplate = (sub: RackSubrack, isSelected: boolean) => {
    return (
      <RealisticFaceplateRenderer
        subrack={sub}
        compact={rackViewScope === "full_rack"}
        selectedCardId={inspectingCard?.id || null}
        onCardClick={(card) => {
          onSelectSubrack(sub.id);
          setInspectingCard(card);
          setInspectingSubrack(sub);
          if (onSelectCard) {
            onSelectCard(card, sub);
          }
        }}
      />
    );
  };

  return (
    <div className={cn("space-y-3", className)}>
      {/* Top Details & Specification Strip */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs bg-neutral-100 p-2.5 rounded-xl border border-neutral-200 gap-2">
        <div className="flex items-center gap-2 flex-wrap">
          <Layers className="w-4 h-4 text-neutral-700" />
          <span className="font-bold text-neutral-800 flex items-center gap-1.5 flex-wrap">
            <span>نقشه فیزیکی رک ۴۲ یونیت:</span>
            <bdi dir="ltr" className="font-mono font-bold text-neutral-900 bg-white px-2 py-0.5 rounded border border-neutral-300">
              {rack.id}
            </bdi>
            <span className="text-neutral-600 font-normal">({rack.name})</span>
          </span>
          <span dir="ltr" className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-white border border-neutral-300 text-neutral-700 font-bold">
            {rack.totalU}U • {rack.dimensions}
          </span>
        </div>

        {/* View Mode Scope Toggle (Full Rack vs Zoomed Subrack) */}
        <div className="flex items-center gap-1.5">
          <div className="flex items-center bg-white p-0.5 rounded-lg border border-neutral-300 text-[11px] font-mono">
            <button
              type="button"
              onClick={() => setRackViewScope("full_rack")}
              className={cn(
                "px-2.5 py-1 rounded-md transition-all cursor-pointer font-bold",
                rackViewScope === "full_rack"
                  ? "bg-neutral-900 text-white shadow-2xs"
                  : "text-neutral-600 hover:text-neutral-900"
              )}
            >
              نمای کامل رک (42U)
            </button>
            <button
              type="button"
              onClick={() => setRackViewScope("focus_subrack")}
              className={cn(
                "px-2.5 py-1 rounded-md transition-all cursor-pointer font-bold flex items-center gap-1",
                rackViewScope === "focus_subrack"
                  ? "bg-sky-700 text-white shadow-2xs"
                  : "text-neutral-600 hover:text-neutral-900"
              )}
            >
              <ZoomIn className="w-3.5 h-3.5" />
              <span>زوم ساب‌رک فعال</span>
            </button>
          </div>
        </div>
      </div>

      {/* RACK ZOOM & PAN CAD CANVAS WRAPPER */}
      <RackZoomPanCanvas
        elevationView={elevationView}
        onChangeElevationView={(view) => setElevationView(view)}
        showCabling={showCabling}
        onToggleCabling={() => setShowCabling(!showCabling)}
      >
        {elevationView === "rear" ? (
          /* ========================================================================= */
          /* REAR ELEVATION VIEW                                                       */
          /* ========================================================================= */
          <RearRackElevation
            rack={rack}
            selectedSubrackId={selectedSubrackId}
            onSelectSubrack={onSelectSubrack}
          />
        ) : rackViewScope === "focus_subrack" && activeSubrack ? (
          /* ========================================================================= */
          /* FOCUSED SUBRACK HIGH-RESOLUTION DETAILED VIEW                             */
          /* ========================================================================= */
          <div className="mx-auto max-w-4xl bg-neutral-950 rounded-2xl border-4 border-sky-600/70 p-4 shadow-2xl space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-neutral-800 text-xs">
              <div className="flex items-center gap-2">
                <span dir="ltr" className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-sky-950 text-sky-400 border border-sky-800">
                  U{activeSubrack.uStart}-U{activeSubrack.uEnd} ({activeSubrack.heightU}U)
                </span>
                <h3 className="font-bold text-white text-sm">
                  {activeSubrack.title}
                </h3>
                <span dir="ltr" className="text-neutral-400 font-mono text-[11px]">
                  [{activeSubrack.modelCode}]
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span dir="ltr" className="text-xs font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 font-bold border border-emerald-800">
                  {activeSubrack.safetyLevel}
                </span>
                <button
                  type="button"
                  onClick={() => setRackViewScope("full_rack")}
                  className="px-2.5 py-1 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs transition-colors cursor-pointer"
                >
                  بازگشت به رک کامل ←
                </button>
              </div>
            </div>

            {/* Subrack Quick Switcher Bar */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-neutral-800 text-[11px] font-mono scrollbar-none">
              <span className="text-neutral-400 shrink-0 text-xs font-sans">انتخاب ساب‌رک:</span>
              {rack.subracks.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => onSelectSubrack(s.id)}
                  className={cn(
                    "px-2.5 py-1 rounded-lg border transition-all cursor-pointer shrink-0 flex items-center gap-1",
                    s.id === activeSubrack.id
                      ? "bg-sky-500 text-white border-sky-400 font-bold shadow-md shadow-sky-500/30"
                      : "bg-neutral-900 text-neutral-400 border-neutral-800 hover:text-white hover:border-neutral-700"
                  )}
                >
                  <span className="text-[10px] opacity-75">U{s.uStart}-{s.uEnd}:</span>
                  <span className="truncate max-w-[120px]">{s.title}</span>
                </button>
              ))}
            </div>

            {/* High-Res Faceplate with generous width and height */}
            <div className="py-2 w-full">
              {renderSubrackFaceplate(activeSubrack, true)}
            </div>

            <div className="pt-2 border-t border-neutral-800/80 flex items-center justify-between text-xs font-mono text-neutral-400">
              <div className="flex items-center gap-3">
                <span>باس ارتباطی: <strong dir="ltr" className="text-neutral-200">{activeSubrack.busProtocol}</strong></span>
                <span>تغذیه: <strong dir="ltr" className="text-neutral-200">{activeSubrack.powerSpec}</strong></span>
              </div>
              <span className="text-sky-400 font-bold">
                جهت بازرسی پین‌ها و تست برد، روی هر ماژول کلیک کنید
              </span>
            </div>
          </div>
        ) : (
          /* ========================================================================= */
          /* FRONT ELEVATION VIEW: AUTHENTIC 19-INCH INDUSTRIAL RITTAL TS8 CHASSIS     */
          /* ========================================================================= */
          <div className="relative mx-auto max-w-4xl bg-[#0f1117] rounded-2xl border-4 border-neutral-800 shadow-2xl p-2 sm:p-4 overflow-visible">
            
            {/* CABLING OVERLAY (PATCH CORDS & FIBER RUNS) */}
            {showCabling && (
              <CablingOverlay
                rackId={rack.id}
                selectedCableId={highlightedCableId}
                onSelectCable={(cable) => {
                  setDiagnosingCable(cable);
                  if (cable.source.subrackId) {
                    onSelectSubrack(cable.source.subrackId);
                  }
                }}
                onOpenPortDiagnostics={(cable) => {
                  setDiagnosingCable(cable);
                  setDiagnosingPort({
                    id: cable.id,
                    type: cable.category === "fiber_optic" ? "SFP" : "RJ45",
                    labelEn: cable.source.portOrPin,
                    speed: cable.telemetry.speedOrRate,
                    status: "active",
                    connectedToEn: cable.destination.labelEn,
                    cableType: cable.specificationEn,
                  });
                }}
              />
            )}

            {/* RACK ROOF: Heavy Steel Top Canopy with Quad Fans & M12 Eye Bolts */}
            <div className="mb-3 p-2.5 rounded-xl bg-gradient-to-r from-neutral-900 via-[#181a22] to-neutral-900 border-2 border-neutral-700 flex flex-col sm:flex-row sm:items-center justify-between text-[10px] font-mono text-neutral-300 gap-2 relative z-10 shadow-lg">
              {/* Left Eyebolt & Status */}
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-3.5 h-3.5 rounded-full border-2 border-neutral-500 bg-neutral-950 flex items-center justify-center shadow-xs" title="M12 Lifting Eyebolt">
                  <span className="w-1.5 h-1.5 rounded-full bg-neutral-700" />
                </div>
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399] animate-pulse shrink-0" />
                <span className="text-white font-bold tracking-wider">
                  ROOF EXHAUST FAN TRAY (۴ فن سانتریفیوژ دور بالا)
                </span>
              </div>

              {/* Middle Fan Grilles Visual */}
              <div className="flex items-center justify-center gap-3 py-0.5">
                {[1, 2, 3, 4].map((fan) => (
                  <div
                    key={fan}
                    className="w-6 h-6 rounded-full bg-neutral-950 border border-neutral-600 flex items-center justify-center relative shadow-inner"
                    title={`Exhaust Fan #${fan}: 2850 RPM - Active`}
                  >
                    <Disc className="w-4 h-4 text-neutral-400 animate-spin" style={{ animationDuration: "2s" }} />
                  </div>
                ))}
              </div>

              {/* Right Eyebolt & Telemetry */}
              <div className="flex items-center justify-between sm:justify-end gap-3 text-neutral-400">
                <span className="text-emerald-400 font-mono font-bold bg-black/60 px-2 py-0.5 rounded border border-emerald-900">
                  TEMP: 24.5 °C • 2850 RPM
                </span>
                <div className="w-3.5 h-3.5 rounded-full border-2 border-neutral-500 bg-neutral-950 flex items-center justify-center shadow-xs" title="M12 Lifting Eyebolt">
                  <span className="w-1.5 h-1.5 rounded-full bg-neutral-700" />
                </div>
              </div>
            </div>

            {/* 19-INCH INTERNAL CHASSIS BAY: EIA-310-D RAILS & SUBRACKS */}
            <div className="flex bg-[#0a0b0e] rounded-xl border-2 border-neutral-700/90 overflow-hidden relative z-10 shadow-inner">
              
              {/* LEFT VERTICAL 19" EIA-310-D MOUNTING RAIL */}
              <div className="w-10 sm:w-12 bg-gradient-to-r from-[#1c1e26] via-[#161820] to-[#121318] border-e-2 border-neutral-700 flex flex-col justify-between py-1 text-center font-mono text-[8px] sm:text-[9px] text-neutral-400 select-none shrink-0 relative">
                {/* Vertical Cable Channel Wire Duct Slots */}
                <div className="absolute top-0 bottom-0 right-0 w-1 bg-neutral-950 border-s border-neutral-800" title="کانال شیاردار هدایت کابل (Vertical Cable Duct)" />

                {Array.from({ length: 42 }, (_, i) => 42 - i).map((u) => (
                  <div
                    key={u}
                    className="flex items-center justify-between px-1 py-[2.5px] hover:text-white hover:bg-neutral-800/40 transition-colors"
                  >
                    {/* Triple cage nut square holes per EIA-310-D */}
                    <div className="flex flex-col gap-[2px]">
                      <span className="w-1.5 h-1 bg-neutral-900 rounded-xxs border border-neutral-700" />
                      <span className="w-1.5 h-1 bg-neutral-900 rounded-xxs border border-neutral-700" />
                      <span className="w-1.5 h-1 bg-neutral-900 rounded-xxs border border-neutral-700" />
                    </div>
                    {/* Laser-etched U number */}
                    <span dir="ltr" className="font-bold text-[8px] text-neutral-400">
                      U{String(u).padStart(2, "0")}
                    </span>
                  </div>
                ))}
              </div>

              {/* MAIN CHASSIS BAY: SUBRACKS AND BLANKING PANELS */}
              <div className="flex-1 p-2 sm:p-3 space-y-2.5 overflow-x-hidden bg-[#060709]">
                {rackBlocks.map((block, idx) => {
                  if (block.type === "blank") {
                    return (
                      <div
                        key={idx}
                        className="rounded-lg bg-gradient-to-b from-[#181a20] via-[#13141a] to-[#0f1014] border border-neutral-700 flex items-center justify-between px-3 py-1.5 text-center font-mono text-[9px] text-neutral-400 select-none shadow-xs"
                        style={{ minHeight: `${Math.max(block.heightU * 24, 32)}px` }}
                      >
                        {/* Left M6 Screw */}
                        <RealisticCaptiveScrew size={10} type="slotted" angle={45} />

                        {/* Perforated Louvers Pattern */}
                        <div className="flex-1 flex flex-col items-center justify-center px-4">
                          <div className="w-full flex justify-center gap-1.5 mb-1 opacity-40">
                            {[...Array(12)].map((_, i) => (
                              <span key={i} className="w-3 h-[1px] bg-neutral-400 rounded-full" />
                            ))}
                          </div>
                          <div className="flex items-center gap-2">
                            <span dir="ltr" className="text-neutral-500 font-bold">U{block.uEnd}-U{block.uStart}</span>
                            <span className="text-neutral-400 truncate max-w-[280px]">{block.purpose}</span>
                            <span dir="ltr" className="text-sky-400 font-bold">[{block.heightU}U BLANK]</span>
                          </div>
                        </div>

                        {/* Right M6 Screw */}
                        <RealisticCaptiveScrew size={10} type="slotted" angle={135} />
                      </div>
                    );
                  }

                  const sub = block.data;
                  const isSelected = sub.id === selectedSubrackId;
                  const isHovered = sub.id === hoveredSubrackId;

                  return (
                    <div
                      key={sub.id}
                      onClick={() => isInteractive && onSelectSubrack(sub.id)}
                      onMouseEnter={() => setHoveredSubrackId(sub.id)}
                      onMouseLeave={() => setHoveredSubrackId(null)}
                      className={cn(
                        "rounded-xl border-2 transition-all cursor-pointer relative overflow-hidden flex flex-col p-2 sm:p-2.5",
                        isSelected
                          ? "bg-[#161822] border-sky-400 ring-4 ring-sky-500/20 shadow-2xl shadow-sky-500/20"
                          : isHovered
                          ? "bg-[#14161f] border-neutral-500 shadow-xl"
                          : "bg-[#101218] border-neutral-800 hover:border-neutral-600"
                      )}
                    >
                      {/* Subrack Top Identification Banner */}
                      <div className="flex items-center justify-between pb-1.5 mb-1.5 border-b border-neutral-700/80 shrink-0 gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          {/* Unit Range */}
                          <span dir="ltr" className="font-mono text-[9px] sm:text-[10px] font-black px-2 py-0.5 rounded bg-neutral-950 text-sky-400 border border-neutral-800 shrink-0">
                            U{sub.uStart}-{sub.uEnd} ({sub.heightU}U)
                          </span>

                          {/* Subrack Persian/English Name */}
                          <h4 className="font-bold text-xs sm:text-sm text-white truncate">
                            {sub.title}
                          </h4>

                          <span dir="ltr" className="text-[9px] font-mono text-neutral-400 hidden md:inline truncate">
                            [{sub.modelCode}]
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onSelectSubrack(sub.id);
                              setRackViewScope("focus_subrack");
                            }}
                            title="باز کردن این ساب‌رک در نمای عریض و حداکثر تفکیک‌پذیری"
                            className="px-2 py-0.5 rounded bg-sky-950/80 hover:bg-sky-900 text-sky-300 border border-sky-700/80 text-[8px] sm:text-[9px] font-mono flex items-center gap-1 cursor-pointer transition-colors shadow-2xs"
                          >
                            <ZoomIn className="w-3 h-3" />
                            <span>زوم عریض HD</span>
                          </button>
                          <span dir="ltr" className="text-[9px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 font-bold">
                            {sub.safetyLevel}
                          </span>
                          {isSelected && (
                            <span className="w-2 h-2 rounded-full bg-sky-400 animate-ping" />
                          )}
                        </div>
                      </div>

                      {/* Physical Eurocard Subrack with real components */}
                      {renderSubrackFaceplate(sub, isSelected)}

                      {/* Subrack Bottom Technical Bar */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between pt-1.5 mt-1.5 border-t border-neutral-800/80 text-[9px] sm:text-[10px] font-mono text-neutral-400 shrink-0 gap-1">
                        <div className="flex items-center gap-2 truncate">
                          <span>باس: <strong dir="ltr" className="text-neutral-200">{sub.busProtocol}</strong></span>
                          <span>• تغذیه: <strong dir="ltr" className="text-neutral-200">{sub.powerSpec}</strong></span>
                        </div>

                        <div className="flex items-center justify-between sm:justify-end gap-2">
                          <span className="text-sky-300 font-bold shrink-0">
                            {sub.components.reduce((acc, c) => acc + c.count, 0)} کارت ماژولار
                          </span>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onSelectSubrack(sub.id);
                              setRackViewScope("focus_subrack");
                            }}
                            className="text-sky-400 hover:text-sky-200 text-[8px] sm:text-[9px] font-bold cursor-pointer transition-colors"
                          >
                            نمای تفصیلی ساب‌رک ←
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* RIGHT VERTICAL 19" EIA-310-D MOUNTING RAIL */}
              <div className="w-10 sm:w-12 bg-gradient-to-r from-[#121318] via-[#161820] to-[#1c1e26] border-s-2 border-neutral-700 flex flex-col justify-between py-1 text-center font-mono text-[8px] sm:text-[9px] text-neutral-400 select-none shrink-0 relative">
                {/* Vertical Cable Channel Wire Duct Slots */}
                <div className="absolute top-0 bottom-0 left-0 w-1 bg-neutral-950 border-e border-neutral-800" title="کانال شیاردار هدایت کابل (Vertical Cable Duct)" />

                {Array.from({ length: 42 }, (_, i) => 42 - i).map((u) => (
                  <div
                    key={u}
                    className="flex items-center justify-between px-1 py-[2.5px] hover:text-white hover:bg-neutral-800/40 transition-colors"
                  >
                    {/* Laser-etched U number */}
                    <span dir="ltr" className="font-bold text-[8px] text-neutral-400">
                      U{String(u).padStart(2, "0")}
                    </span>
                    {/* Triple cage nut square holes per EIA-310-D */}
                    <div className="flex flex-col gap-[2px]">
                      <span className="w-1.5 h-1 bg-neutral-900 rounded-xxs border border-neutral-700" />
                      <span className="w-1.5 h-1 bg-neutral-900 rounded-xxs border border-neutral-700" />
                      <span className="w-1.5 h-1 bg-neutral-900 rounded-xxs border border-neutral-700" />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* RACK PLINTH BASE (100mm Heavy Steel Base with Grounding Busbar) */}
            <div className="mt-3 p-2.5 rounded-xl bg-gradient-to-r from-neutral-900 via-[#161820] to-neutral-900 border-2 border-neutral-700 flex flex-col sm:flex-row sm:items-center justify-between text-[10px] font-mono text-neutral-300 gap-2 relative z-10 shadow-lg">
              {/* Copper Grounding Earth Busbar */}
              <div className="flex items-center gap-2">
                <div className="h-4 px-2 rounded-xs bg-gradient-to-r from-amber-600 via-amber-500 to-amber-700 border border-amber-400 text-black font-black flex items-center gap-1 shadow-md">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 border border-black" title="Earthing" />
                  <span className="text-[8px] tracking-tight">COPPER EARTH BAR (PE)</span>
                </div>
                <span className="text-emerald-400 font-bold">
                  اتصال به سیستم ارتینگ مرکزی (R &lt; 0.5 Ω)
                </span>
              </div>

              <div className="flex items-center gap-3 text-neutral-400 text-[9px]">
                <span>ورودی کابل‌ها از کف (BRUSH GLAND ENTRY)</span>
                <span className="px-2 py-0.5 rounded bg-black text-neutral-200 border border-neutral-700">
                  IP54 INDUSTRIAL ENCLOSURE
                </span>
              </div>
            </div>
          </div>
        )}
      </RackZoomPanCanvas>

      {/* DETAILED CARD HARDWARE INSPECTION MODAL */}
      <RealisticHardwareInspectorModal
        card={inspectingCard}
        isOpen={!!inspectingCard}
        onClose={() => setInspectingCard(null)}
        subrackTitle={inspectingSubrack?.title}
        subrackU={inspectingSubrack ? `U${inspectingSubrack.uStart}-U${inspectingSubrack.uEnd}` : undefined}
      />

      {/* PORT DIAGNOSTICS MODAL */}
      <PortDiagnosticsModal
        port={diagnosingPort}
        cable={diagnosingCable}
        isOpen={!!diagnosingPort}
        onClose={() => {
          setDiagnosingPort(null);
          setDiagnosingCable(null);
        }}
      />
    </div>
  );
};
