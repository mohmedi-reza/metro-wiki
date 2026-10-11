import React, { useState } from "react";
import {
  SignalingRackElevation,
  RackSubrack,
  RackSubrackCategory,
} from "../../types/signalingRooms";
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
} from "lucide-react";

interface VisualRackDrawingProps {
  rack: SignalingRackElevation;
  selectedSubrackId: string | null;
  onSelectSubrack: (subrackId: string) => void;
  className?: string;
  isInteractive?: boolean;
}

export const VisualRackDrawing: React.FC<VisualRackDrawingProps> = ({
  rack,
  selectedSubrackId,
  onSelectSubrack,
  className,
  isInteractive = true,
}) => {
  const [zoomMode, setZoomMode] = useState<"compact" | "detailed">("detailed");
  const [hoveredSubrackId, setHoveredSubrackId] = useState<string | null>(null);

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
          ? "کانال هدایت کابل و پنل تهویه مشبک (Air Vented Panel & Cable Duct)"
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

  // Visual card slots renderer based on category
  const renderSubrackFaceplate = (sub: RackSubrack, isSelected: boolean) => {
    switch (sub.category) {
      case "processing":
        // 2oo3 Triple Modular Redundancy CPU modules
        return (
          <div className="flex-1 flex gap-1.5 p-1.5 bg-neutral-900/90 rounded-md border border-neutral-700/80 overflow-x-auto">
            {["VPU-A (CPU 1)", "VPU-B (CPU 2)", "VPU-C (CPU 3)"].map((cpu, idx) => (
              <div
                key={idx}
                className="flex-1 min-w-[70px] bg-gradient-to-b from-neutral-800 to-neutral-900 border border-neutral-600/60 rounded p-1.5 flex flex-col justify-between text-[9px] font-mono shadow-inner"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sky-400">{cpu.split(" ")[0]}</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                </div>
                <div className="space-y-0.5 my-1">
                  <div className="flex items-center justify-between text-[8px] text-neutral-400">
                    <span>RUN:</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_4px_#10b981]" />
                  </div>
                  <div className="flex items-center justify-between text-[8px] text-neutral-400">
                    <span>VOTE:</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-sky-400" />
                  </div>
                  <div className="flex items-center justify-between text-[8px] text-neutral-400">
                    <span>ERR:</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-neutral-600" />
                  </div>
                </div>
                <div className="border-t border-neutral-700 pt-1 flex items-center justify-between text-[7px] text-neutral-400">
                  <span className="bg-neutral-950 px-1 py-0.2 rounded border border-neutral-700">RJ45</span>
                  <span className="bg-amber-950/80 text-amber-300 px-1 py-0.2 rounded border border-amber-800">SFP</span>
                </div>
              </div>
            ))}
            {/* Voter / Sync module */}
            <div className="w-20 bg-neutral-950 border border-emerald-500/40 rounded p-1.5 flex flex-col justify-between text-[8px] font-mono">
              <span className="text-emerald-400 font-bold text-center">2oo3 VOTER</span>
              <div className="p-1 rounded bg-neutral-900 text-center border border-neutral-800 text-[8px] text-emerald-300 font-bold">
                SIL-4 OK
              </div>
              <div className="text-center text-[7px] text-neutral-500">SYNC BUS A/B</div>
            </div>
          </div>
        );

      case "point_machine":
        // Point machine motor drivers
        return (
          <div className="flex-1 flex gap-1.5 p-1.5 bg-neutral-900/90 rounded-md border border-amber-900/50 overflow-x-auto">
            {["PMC-01 (سوزن ۱)", "PMC-02 (سوزن ۲)", "PMC-03 (سوزن ۳)", "PMC-04 (سوزن ۴)"].map((pmc, idx) => (
              <div
                key={idx}
                className="flex-1 min-w-[65px] bg-neutral-850 border border-neutral-700 rounded p-1 flex flex-col justify-between text-[8px] font-mono"
              >
                <div className="flex items-center justify-between">
                  <span className="text-amber-400 font-bold">{pmc.split(" ")[0]}</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                </div>
                <div className="space-y-0.5 my-0.5">
                  <div className="flex items-center justify-between text-[7px] text-neutral-400">
                    <span>NORM (N):</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  </div>
                  <div className="flex items-center justify-between text-[7px] text-neutral-400">
                    <span>REV (R):</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-neutral-600" />
                  </div>
                </div>
                <div className="text-[7px] text-neutral-400 text-center bg-neutral-950 rounded py-0.5 border border-neutral-800">
                  110V DC • 5.2A
                </div>
              </div>
            ))}
          </div>
        );

      case "io":
        // Field Electronic Controller (FEC) Input/Output banks
        return (
          <div className="flex-1 flex gap-1 p-1.5 bg-neutral-900/90 rounded-md border border-emerald-900/40 overflow-x-auto">
            {[1, 2, 3, 4, 5, 6].map((ch) => (
              <div
                key={ch}
                className="flex-1 min-w-[45px] bg-neutral-850 border border-neutral-700 rounded p-1 flex flex-col justify-between text-[8px] font-mono"
              >
                <div className="text-center font-bold text-emerald-400">DI/DO-{ch}</div>
                {/* 8-dot LED status grid */}
                <div className="grid grid-cols-4 gap-0.5 p-1 bg-neutral-950 rounded border border-neutral-800 my-0.5">
                  {[...Array(8)].map((_, dotIdx) => (
                    <span
                      key={dotIdx}
                      className={cn(
                        "w-1 h-1 rounded-full",
                        dotIdx % 2 === 0 ? "bg-emerald-400" : "bg-neutral-600"
                      )}
                    />
                  ))}
                </div>
                <span className="text-[7px] text-neutral-400 text-center">ISOL 2.5kV</span>
              </div>
            ))}
          </div>
        );

      case "signal_driver":
        // Signal lamp controller
        return (
          <div className="flex-1 flex gap-1.5 p-1.5 bg-neutral-900/90 rounded-md border border-purple-900/40 overflow-x-auto">
            {["VSC-S01", "VSC-S02", "VSC-S03"].map((vsc, idx) => (
              <div
                key={idx}
                className="flex-1 min-w-[70px] bg-neutral-850 border border-neutral-700 rounded p-1.5 flex flex-col justify-between text-[8px] font-mono"
              >
                <span className="text-purple-300 font-bold">{vsc}</span>
                <div className="flex items-center justify-around py-1 bg-neutral-950 rounded my-0.5">
                  <span className="w-2 h-2 rounded-full bg-red-500 shadow-[0_0_4px_#ef4444]" title="Red Aspect" />
                  <span className="w-2 h-2 rounded-full bg-amber-500/40" title="Yellow Aspect" />
                  <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_4px_#10b981]" title="Green Aspect" />
                </div>
                <span className="text-[7px] text-neutral-400 text-center">Current Sense OK</span>
              </div>
            ))}
          </div>
        );

      case "track_circuit":
        // Audio frequency track circuits (MAFTC)
        return (
          <div className="flex-1 flex gap-1.5 p-1.5 bg-neutral-900/90 rounded-md border border-cyan-900/40 overflow-x-auto">
            {["TCX-01 (فرستنده)", "TCR-01 (گیرنده)", "TCX-02 (فرستنده)", "TCR-02 (گیرنده)"].map((tc, idx) => (
              <div
                key={idx}
                className="flex-1 min-w-[65px] bg-neutral-850 border border-neutral-700 rounded p-1 flex flex-col justify-between text-[8px] font-mono"
              >
                <span className="text-cyan-300 font-bold truncate">{tc.split(" ")[0]}</span>
                <div className="p-1 rounded bg-neutral-950 border border-neutral-800 text-center my-0.5">
                  <span className="text-[7px] text-emerald-400 font-bold">CLEAR (آزاد)</span>
                </div>
                <span className="text-[7px] text-neutral-400 text-center">F{idx + 1} • FSK</span>
              </div>
            ))}
          </div>
        );

      case "network_switch":
        // Industrial Gigabit Switch (Hirschmann MACH1000)
        return (
          <div className="flex-1 p-2 bg-neutral-950 rounded-md border border-indigo-900/60 flex flex-col justify-between font-mono">
            <div className="flex items-center justify-between text-[9px]">
              <span className="text-indigo-400 font-bold">HIRSCHMANN MACH1000 • 24P+4SFP</span>
              <span className="text-emerald-400 text-[8px]">MRP RING MASTER • ACTIVE</span>
            </div>
            {/* RJ45 Ports Matrix */}
            <div className="grid grid-cols-12 gap-0.5 my-1 p-1 bg-neutral-900 rounded border border-neutral-800">
              {[...Array(24)].map((_, pIdx) => (
                <div
                  key={pIdx}
                  className="h-3.5 bg-neutral-950 rounded-xs border border-neutral-700 flex flex-col items-center justify-center text-[6px] text-neutral-400"
                >
                  <span
                    className={cn(
                      "w-1 h-1 rounded-full",
                      pIdx < 16 ? "bg-emerald-400" : "bg-neutral-600"
                    )}
                  />
                </div>
              ))}
            </div>
            {/* 4 Optical SFP cages */}
            <div className="flex items-center justify-between text-[7px] text-neutral-400 border-t border-neutral-800 pt-1">
              <span>SFP-1 (رینگ غرب): <strong className="text-emerald-400">1Gbps TX</strong></span>
              <span>SFP-2 (رینگ شرق): <strong className="text-emerald-400">1Gbps RX</strong></span>
              <span className="bg-indigo-950 px-1 py-0.2 rounded text-indigo-300">VLAN 10-40</span>
            </div>
          </div>
        );

      case "patch_panel":
        // Fiber Optic Distribution Frame (ODF)
        return (
          <div className="flex-1 p-2 bg-neutral-900 rounded-md border border-neutral-700 flex flex-col justify-between font-mono">
            <div className="flex items-center justify-between text-[9px]">
              <span className="text-neutral-300 font-bold">ODF 48-CORE OPTICAL DISTRIBUTION</span>
              <span className="text-neutral-500 text-[8px]">SC/APC SINGLE-MODE</span>
            </div>
            {/* Fiber adapter rows */}
            <div className="flex gap-1 overflow-x-auto py-1">
              {[...Array(12)].map((_, cIdx) => (
                <div
                  key={cIdx}
                  className="px-1.5 py-0.5 rounded bg-neutral-950 border border-neutral-800 text-[7px] text-emerald-400 text-center shrink-0"
                >
                  F{cIdx + 1}-{cIdx + 2}
                </div>
              ))}
            </div>
            <div className="flex items-center justify-between text-[7px] text-neutral-500 border-t border-neutral-800 pt-0.5">
              <span>کابل اصلی تونل ۱</span>
              <span>کابل اصلی تونل ۲</span>
              <span>دپوی کاوه</span>
            </div>
          </div>
        );

      case "power_supply":
        // Power Distribution Unit & DC Converters
        return (
          <div className="flex-1 p-2 bg-gradient-to-r from-neutral-950 via-neutral-900 to-neutral-950 rounded-md border border-yellow-900/50 flex flex-col justify-between font-mono">
            <div className="flex items-center justify-between text-[9px]">
              <span className="text-yellow-400 font-bold">PDU & 24VDC REDUNDANT POWER</span>
              <div className="flex items-center gap-2">
                <span className="text-emerald-400 text-[8px] bg-emerald-950 px-1 py-0.2 rounded border border-emerald-800">
                  UPS A: 231V
                </span>
                <span className="text-emerald-400 text-[8px] bg-emerald-950 px-1 py-0.2 rounded border border-emerald-800">
                  UPS B: 230V
                </span>
              </div>
            </div>
            {/* Breaker switches */}
            <div className="flex items-center gap-2 py-1">
              {["Q1 (فیدر اصلی)", "Q2 (فیدر کمکی)", "Q3 (DC/DC A)", "Q4 (DC/DC B)"].map((b, idx) => (
                <div
                  key={idx}
                  className="flex-1 p-1 bg-neutral-950 rounded border border-neutral-800 flex items-center justify-between text-[7px]"
                >
                  <span className="text-neutral-400">{b.split(" ")[0]}</span>
                  <span className="px-1 py-0.2 rounded bg-emerald-500 text-black font-bold">ON</span>
                </div>
              ))}
            </div>
            <div className="flex items-center justify-between text-[7px] text-neutral-400 border-t border-neutral-850 pt-0.5">
              <span>باس خروجی: <strong>24.2V DC (دیود اورینگ فعال)</strong></span>
              <span>چاه ارت: <strong>0.75Ω</strong></span>
            </div>
          </div>
        );

      case "server_node":
        // OCC Server Node
        return (
          <div className="flex-1 p-2 bg-neutral-950 rounded-md border border-sky-900/60 flex flex-col justify-between font-mono">
            <div className="flex items-center justify-between text-[9px]">
              <span className="text-sky-400 font-bold">{sub.titleEn}</span>
              <span className="text-emerald-400 text-[8px]">STATUS: MASTER ACTIVE</span>
            </div>
            <div className="grid grid-cols-4 gap-1 py-1">
              <div className="p-1 bg-neutral-900 rounded border border-neutral-800 text-[7px] text-center">
                <span className="text-neutral-400 block">CPU LOAD</span>
                <strong className="text-emerald-400">14%</strong>
              </div>
              <div className="p-1 bg-neutral-900 rounded border border-neutral-800 text-[7px] text-center">
                <span className="text-neutral-400 block">RAM</span>
                <strong className="text-sky-400">4.2/32 GB</strong>
              </div>
              <div className="p-1 bg-neutral-900 rounded border border-neutral-800 text-[7px] text-center">
                <span className="text-neutral-400 block">EN 50159</span>
                <strong className="text-emerald-400">CRC-32 OK</strong>
              </div>
              <div className="p-1 bg-neutral-900 rounded border border-neutral-800 text-[7px] text-center">
                <span className="text-neutral-400 block">LATENCY</span>
                <strong className="text-emerald-400">&lt; 8 ms</strong>
              </div>
            </div>
          </div>
        );

      default:
        // Generic industrial equipment faceplate
        return (
          <div className="flex-1 p-2 bg-neutral-900 rounded-md border border-neutral-700 flex items-center justify-between text-xs font-mono">
            <span className="text-neutral-300 font-bold">{sub.title}</span>
            <span className="text-neutral-500 text-[10px]">{sub.modelCode}</span>
          </div>
        );
    }
  };

  return (
    <div className={cn("space-y-3", className)}>
      {/* Top Controls: Zoom Mode, Dimension Label, Grounding status */}
      <div className="flex items-center justify-between text-xs text-neutral-500 bg-neutral-100 p-2.5 rounded-xl border border-neutral-200">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-neutral-700" />
          <span className="font-bold text-neutral-800">
            ترسیم نقشه فنی ۴۲ یونیت: <strong>{rack.name}</strong> ({rack.id})
          </span>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-white border border-neutral-300 text-neutral-700 font-bold">
            {rack.totalU}U • {rack.dimensions}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setZoomMode(zoomMode === "detailed" ? "compact" : "detailed")}
            className="px-2.5 py-1 rounded-lg bg-white hover:bg-neutral-200 border border-neutral-300 text-[11px] font-semibold text-neutral-800 transition-colors cursor-pointer flex items-center gap-1"
            title="تغییر بزرگنمایی"
          >
            {zoomMode === "detailed" ? (
              <>
                <ZoomOut className="w-3.5 h-3.5" />
                <span>نمای فشرده (Fit)</span>
              </>
            ) : (
              <>
                <ZoomIn className="w-3.5 h-3.5" />
                <span>نمای بزرگ و تفصیلی</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* RACK CABINET FRAME - 19 INCH INDUSTRIAL RITTAL TS8 */}
      <div className="relative mx-auto max-w-3xl bg-neutral-950 rounded-2xl border-4 border-neutral-800 p-2 sm:p-3 shadow-2xl overflow-hidden">
        
        {/* RACK ROOF: Ventilation Fan Unit & Exhaust Grille */}
        <div className="mb-2 p-2 rounded-xl bg-neutral-900 border border-neutral-800 flex items-center justify-between text-[10px] font-mono text-neutral-400">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-white font-bold">سیستم تهویه سقفی رک (RITTAL ROOF FAN UNIT)</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-emerald-400">۴ فن دمنده فعال • 24.5°C</span>
            <span className="text-neutral-500">فیلتر IP54</span>
          </div>
        </div>

        {/* 19-INCH INTERNAL MOUNTING BAY */}
        <div className="flex bg-neutral-925 rounded-xl border-2 border-neutral-800 overflow-hidden">
          
          {/* LEFT MOUNTING RAIL WITH U-MARKINGS */}
          <div className="w-8 sm:w-10 bg-neutral-900 border-e border-neutral-800 flex flex-col justify-between py-1 text-center font-mono text-[9px] text-neutral-500 select-none shrink-0">
            {[42, 40, 38, 36, 34, 32, 30, 28, 26, 24, 22, 20, 18, 16, 14, 12, 10, 8, 6, 4, 2, 1].map((u) => (
              <div key={u} className="flex items-center justify-center gap-0.5 py-0.5">
                <span className="w-1 h-1 rounded-full bg-neutral-700" />
                <span>U{String(u).padStart(2, "0")}</span>
              </div>
            ))}
          </div>

          {/* MAIN CHASSIS BAY: SUBRACKS AND BLANKING PANELS */}
          <div className="flex-1 p-1.5 space-y-1.5 overflow-x-hidden">
            {rackBlocks.map((block, idx) => {
              if (block.type === "blank") {
                return (
                  <div
                    key={idx}
                    className="p-1 rounded-lg bg-neutral-900/60 border border-dashed border-neutral-800/80 text-center font-mono text-[9px] text-neutral-600 flex items-center justify-between px-3 select-none"
                    style={{ minHeight: `${Math.max(block.heightU * (zoomMode === "detailed" ? 14 : 9), 24)}px` }}
                  >
                    <span>U{block.uEnd}-U{block.uStart}</span>
                    <span>{block.purpose}</span>
                    <span>{block.heightU}U Blank</span>
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
                    "rounded-xl border-2 transition-all cursor-pointer relative overflow-hidden flex flex-col",
                    zoomMode === "detailed" ? "p-2.5 sm:p-3" : "p-1.5",
                    isSelected
                      ? "bg-neutral-900 border-sky-400 ring-4 ring-sky-500/20 shadow-lg shadow-sky-500/10"
                      : isHovered
                      ? "bg-neutral-900/95 border-neutral-600 shadow-md"
                      : "bg-neutral-925 border-neutral-750 hover:border-neutral-650"
                  )}
                  style={{
                    minHeight: `${Math.max(
                      sub.heightU * (zoomMode === "detailed" ? 28 : 18),
                      zoomMode === "detailed" ? 95 : 60
                    )}px`,
                  }}
                >
                  {/* Subrack Header Strip */}
                  <div className="flex items-center justify-between pb-1.5 mb-1.5 border-b border-neutral-800 shrink-0 gap-2">
                    <div className="flex items-center gap-2 truncate">
                      {/* Left Unit Badge */}
                      <span className="font-mono text-[10px] font-black px-2 py-0.5 rounded-md bg-neutral-950 text-sky-400 border border-neutral-800 shrink-0">
                        U{sub.uStart}-U{sub.uEnd} ({sub.heightU}U)
                      </span>

                      {/* Subrack Title */}
                      <h4 className="font-bold text-xs sm:text-sm text-white truncate">
                        {sub.title}
                      </h4>

                      {/* Model Code */}
                      <span className="text-[10px] font-mono text-neutral-400 hidden sm:inline">
                        [{sub.modelCode}]
                      </span>
                    </div>

                    {/* Right Badges */}
                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-emerald-950/80 text-emerald-300 border border-emerald-800 font-bold">
                        {sub.safetyLevel}
                      </span>
                      {isSelected && (
                        <span className="w-2 h-2 rounded-full bg-sky-400 animate-ping" />
                      )}
                    </div>
                  </div>

                  {/* High-Fidelity Module Faceplate Slot View */}
                  {renderSubrackFaceplate(sub, isSelected)}

                  {/* Subrack Footer Status / Hardware Count */}
                  <div className="flex items-center justify-between pt-1.5 mt-1.5 border-t border-neutral-800/80 text-[10px] font-mono text-neutral-400 shrink-0">
                    <div className="flex items-center gap-3">
                      <span>باس: <strong className="text-neutral-200">{sub.busProtocol}</strong></span>
                      <span>تغذیه: <strong className="text-neutral-200">{sub.powerSpec}</strong></span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-sky-300 font-bold">
                        {sub.components.reduce((acc, c) => acc + c.count, 0)} کارت سخت‌افزاری
                      </span>
                      <span className="text-neutral-500">کلیک برای باز کردن جزییات ←</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* RIGHT MOUNTING RAIL WITH U-MARKINGS */}
          <div className="w-8 sm:w-10 bg-neutral-900 border-s border-neutral-800 flex flex-col justify-between py-1 text-center font-mono text-[9px] text-neutral-500 select-none shrink-0">
            {[42, 40, 38, 36, 34, 32, 30, 28, 26, 24, 22, 20, 18, 16, 14, 12, 10, 8, 6, 4, 2, 1].map((u) => (
              <div key={u} className="flex items-center justify-center gap-0.5 py-0.5">
                <span>U{String(u).padStart(2, "0")}</span>
                <span className="w-1 h-1 rounded-full bg-neutral-700" />
              </div>
            ))}
          </div>
        </div>

        {/* RACK BASE: Grounding Busbar & Cable Ingress */}
        <div className="mt-2 p-2 rounded-xl bg-neutral-900 border border-neutral-800 flex items-center justify-between text-[10px] font-mono text-neutral-400">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-1.5 rounded-xs bg-amber-500 border border-amber-600" />
            <span className="text-white font-bold">شینه ارت مسی رک (COPPER EARTH BUSBAR)</span>
            <span className="text-emerald-400">مقاومت: ۰.۷۵ اهم (&lt; ۱.۰Ω)</span>
          </div>
          <div>
            <span className="text-neutral-400">ورودی کابل‌ها از کف‌پوش کاذب (Raised Floor)</span>
          </div>
        </div>
      </div>
    </div>
  );
};
