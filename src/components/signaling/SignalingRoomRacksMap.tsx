import React, { useState, useMemo, useEffect } from "react";
import {
  Server,
  Network,
  Cpu,
  Layers,
  ShieldCheck,
  Zap,
  Activity,
  ExternalLink,
  CheckCircle2,
  Maximize2,
  X,
  ArrowRight,
  ArrowLeft,
  Search,
  Radio,
  Sliders,
  Sparkles,
  FileText,
  Eye,
  LayoutGrid,
  Info,
} from "lucide-react";
import { cn } from "../../lib/utils";
import { SIGNALING_ROOMS_DETAILED_DATA } from "../../data/signalingRoomsData";
import {
  SignalingRoomDetail,
  SignalingRackElevation,
  RackSubrack,
  RackSubrackCategory,
  NetworkProtocolSpec,
} from "../../types/signalingRooms";
import { VisualRackDrawing } from "./VisualRackDrawing";

interface SignalingRoomRacksMapProps {
  initialRoomId?: string;
  onSelectStationInSimulator?: (stationId: number) => void;
  className?: string;
}

export type RackDisplayMode = "visual_drawing" | "text_detail" | "network_protocols" | "room_layout";

export const SignalingRoomRacksMap: React.FC<SignalingRoomRacksMapProps> = ({
  initialRoomId = "SER-01",
  onSelectStationInSimulator,
  className,
}) => {
  const [selectedRoomId, setSelectedRoomId] = useState<string>(initialRoomId);
  const [selectedRackId, setSelectedRackId] = useState<string | null>(null);
  const [selectedSubrackId, setSelectedSubrackId] = useState<string | null>(null);
  const [displayMode, setDisplayMode] = useState<RackDisplayMode>("visual_drawing");
  const [isFullModalOpen, setIsFullModalOpen] = useState<boolean>(false);
  const [modalTab, setModalTab] = useState<"visual" | "hardware" | "network" | "power_safety">("visual");
  const [searchFilter, setSearchFilter] = useState<string>("");

  // Sync initialRoomId if parent updates it
  useEffect(() => {
    if (initialRoomId) {
      setSelectedRoomId(initialRoomId);
      setSelectedRackId(null);
      setSelectedSubrackId(null);
    }
  }, [initialRoomId]);

  // Current room data
  const currentRoom = useMemo<SignalingRoomDetail>(() => {
    return (
      SIGNALING_ROOMS_DETAILED_DATA.find((r) => r.id === selectedRoomId) ||
      SIGNALING_ROOMS_DETAILED_DATA[0]
    );
  }, [selectedRoomId]);

  // Active rack data (defaults to first rack of room)
  const activeRack = useMemo<SignalingRackElevation>(() => {
    if (selectedRackId) {
      const found = currentRoom.racks.find((r) => r.id === selectedRackId);
      if (found) return found;
    }
    return currentRoom.racks[0] || null;
  }, [selectedRackId, currentRoom]);

  // Active subrack data (defaults to first subrack of active rack)
  const activeSubrack = useMemo<RackSubrack | null>(() => {
    if (!activeRack || activeRack.subracks.length === 0) return null;
    if (selectedSubrackId) {
      const found = activeRack.subracks.find((s) => s.id === selectedSubrackId);
      if (found) return found;
    }
    return activeRack.subracks[0];
  }, [selectedSubrackId, activeRack]);

  // Protocols associated with the active room/rack
  const rackAssociatedProtocols = useMemo<NetworkProtocolSpec[]>(() => {
    if (!activeRack || !currentRoom.networkArchitecture?.protocols) return [];
    const roomProtos = currentRoom.networkArchitecture.protocols;
    const rackText = (
      activeRack.id +
      " " +
      activeRack.name +
      " " +
      activeRack.nameEn +
      " " +
      activeRack.subracks
        .map((s) => `${s.busProtocol} ${s.title} ${s.modelCode} ${s.description}`)
        .join(" ")
    ).toLowerCase();

    const matched = roomProtos.filter((proto) => {
      const pName = proto.name.toLowerCase();
      const pDesc = proto.description.toLowerCase();
      const pStd = proto.standard.toLowerCase();
      const pMed = proto.medium.toLowerCase();

      if (rackText.includes("can") && (pName.includes("can") || pDesc.includes("can") || pStd.includes("can"))) return true;
      if (rackText.includes("maftc") || rackText.includes("tcx") || rackText.includes("tcr") || rackText.includes("مدار راه")) {
        if (pName.includes("مدار راه") || pDesc.includes("maftc") || pName.includes("fsk") || pMed.includes("rail")) return true;
      }
      if (rackText.includes("mh-ax") || rackText.includes("axle") || rackText.includes("محور شمار")) {
        if (pName.includes("محور شمار") || pDesc.includes("mh-ax") || pName.includes("axle")) return true;
      }
      if (rackText.includes("odf") || rackText.includes("optic") || rackText.includes("switch") || rackText.includes("mrp") || rackText.includes("نوری")) {
        if (pName.includes("رینگ نوری") || pName.includes("mrp") || pStd.includes("62439") || pMed.includes("fiber")) return true;
      }
      if (rackText.includes("cm") || rackText.includes("server") || rackText.includes("ctc")) {
        if (pName.includes("cm") || pName.includes("کنترل و پایش") || pName.includes("safety layer") || pStd.includes("50159")) return true;
      }
      if (rackText.includes("ptp") || rackText.includes("ntp") || rackText.includes("زمان") || rackText.includes("gps")) {
        if (pName.includes("زمان") || pName.includes("ptp") || pStd.includes("1588")) return true;
      }
      if (rackText.includes("50159") || rackText.includes("eil") || rackText.includes("vpu") || rackText.includes("اینترلاکینگ")) {
        if (pName.includes("ایمن ریلی") || pStd.includes("50159") || pName.includes("safety")) return true;
      }
      return false;
    });

    return matched.length > 0 ? matched : roomProtos;
  }, [activeRack, currentRoom]);

  // Aggregate stats
  const rackHardwareStats = useMemo(() => {
    if (!activeRack) return { totalModules: 0, totalCards: 0, sil4Count: 0 };
    let totalCards = 0;
    let sil4Count = 0;

    activeRack.subracks.forEach((sub) => {
      if (sub.safetyLevel.includes("SIL 4")) sil4Count++;
      sub.components.forEach((c) => {
        totalCards += c.count;
      });
    });

    return {
      totalModules: activeRack.subracks.length,
      totalCards,
      sil4Count,
    };
  }, [activeRack]);

  // Handle ESC key to close modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isFullModalOpen) {
        setIsFullModalOpen(false);
      }
    };
    if (isFullModalOpen) {
      window.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "unset";
    };
  }, [isFullModalOpen]);

  // Category styling helper
  const getCategoryMeta = (cat: RackSubrackCategory) => {
    switch (cat) {
      case "processing":
        return { label: "پردازشگر 2oo3", bg: "bg-blue-50 text-blue-700 border-blue-200" };
      case "io":
        return { label: "ورودی/خروجی فیلد FEC", bg: "bg-emerald-50 text-emerald-700 border-emerald-200" };
      case "point_machine":
        return { label: "کنترلر سوزن PMC", bg: "bg-amber-50 text-amber-700 border-amber-200" };
      case "signal_driver":
        return { label: "درایور سیگنال VSC", bg: "bg-purple-50 text-purple-700 border-purple-200" };
      case "track_circuit":
        return { label: "مدار راه MAFTC", bg: "bg-cyan-50 text-cyan-700 border-cyan-200" };
      case "axle_counter":
        return { label: "محور شمار MH-AX", bg: "bg-teal-50 text-teal-700 border-teal-200" };
      case "network_switch":
        return { label: "سوییچ شبکه صنعتی", bg: "bg-indigo-50 text-indigo-700 border-indigo-200" };
      case "patch_panel":
        return { label: "پچ‌پنل ODF", bg: "bg-neutral-100 text-neutral-700 border-neutral-300" };
      case "diagnostic":
        return { label: "رخدادنگار DiagRC", bg: "bg-rose-50 text-rose-700 border-rose-200" };
      case "lcp_panel":
        return { label: "پانل محلی LCP", bg: "bg-orange-50 text-orange-700 border-orange-200" };
      case "power_supply":
        return { label: "توزیع توان و UPS", bg: "bg-yellow-50 text-yellow-800 border-yellow-200" };
      case "server_node":
        return { label: "سرور مرکزی OCC", bg: "bg-sky-50 text-sky-700 border-sky-200" };
      default:
        return { label: "تجهیزات صنعتی", bg: "bg-neutral-50 text-neutral-600 border-neutral-200" };
    }
  };

  // Open full-screen modal
  const handleOpenRackModal = (tab: "visual" | "hardware" | "network" | "power_safety" = "visual") => {
    setModalTab(tab);
    setIsFullModalOpen(true);
  };

  // Navigate between racks inside room
  const handleNavigateRack = (direction: "next" | "prev") => {
    if (!activeRack) return;
    const currentIndex = currentRoom.racks.findIndex((r) => r.id === activeRack.id);
    if (currentIndex === -1) return;
    const newIndex =
      direction === "next"
        ? (currentIndex + 1) % currentRoom.racks.length
        : (currentIndex - 1 + currentRoom.racks.length) % currentRoom.racks.length;
    const nextRack = currentRoom.racks[newIndex];
    setSelectedRackId(nextRack.id);
    if (nextRack.subracks.length > 0) {
      setSelectedSubrackId(nextRack.subracks[0].id);
    }
  };

  return (
    <div className={cn("space-y-5 select-none", className)}>
      
      {/* 1. ROOM HEADER & NAVIGATION BAR */}
      <div className="bg-white rounded-2xl border border-neutral-200 p-4 sm:p-5 shadow-2xs space-y-4">
        
        {/* Top Info Row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="p-1 rounded-md bg-neutral-900 text-white">
                <Server className="w-3.5 h-3.5" />
              </span>
              <h2 className="text-base sm:text-lg font-bold text-neutral-900">
                {currentRoom.title}
              </h2>
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-md bg-sky-50 text-sky-700 border border-sky-200">
                {currentRoom.id}
              </span>
              <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">
                {currentRoom.silLevel}
              </span>
            </div>
            <p className="text-xs text-neutral-500">
              موقعیت: ایستگاه {currentRoom.stationName} • سیستم: {currentRoom.interlockingType} • تعداد: {currentRoom.racks.length} کابینت ۱۹ اینچ
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
            {onSelectStationInSimulator && (
              <button
                type="button"
                onClick={() => onSelectStationInSimulator(currentRoom.stationId)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-xs font-semibold transition-colors cursor-pointer border border-neutral-200"
              >
                <Activity className="w-3.5 h-3.5 text-emerald-600" />
                <span>پایش در شبیه‌ساز CTC</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => handleOpenRackModal("visual")}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-neutral-900 hover:bg-black text-white text-xs font-bold transition-all cursor-pointer shadow-2xs"
            >
              <Maximize2 className="w-3.5 h-3.5" />
              <span>مودال تمام‌صفحه رک</span>
            </button>
          </div>
        </div>

        {/* Clean, Horizontal Room Switcher */}
        <div className="pt-2 border-t border-neutral-100">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {SIGNALING_ROOMS_DETAILED_DATA.map((room) => {
              const isSelected = room.id === selectedRoomId;
              return (
                <button
                  key={room.id}
                  type="button"
                  onClick={() => {
                    setSelectedRoomId(room.id);
                    setSelectedRackId(null);
                    setSelectedSubrackId(null);
                  }}
                  className={cn(
                    "px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 border shrink-0",
                    isSelected
                      ? "bg-neutral-900 text-white border-neutral-900 shadow-xs"
                      : "bg-neutral-50 hover:bg-neutral-100 text-neutral-600 border-neutral-200 hover:text-neutral-900"
                  )}
                >
                  <span
                    className={cn(
                      "w-1.5 h-1.5 rounded-full",
                      isSelected ? "bg-emerald-400" : "bg-neutral-400"
                    )}
                  />
                  <span>{room.id}</span>
                  <span className="text-[11px] opacity-75 font-normal">
                    ({room.stationName.split(" ")[0]})
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Rack Cabinet Selector Chips in Current Room */}
        <div className="pt-2 border-t border-neutral-100 flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-neutral-700">انتخاب رک سالن:</span>
            <div className="flex items-center gap-1.5 flex-wrap">
              {currentRoom.racks.map((r) => {
                const isSelected = activeRack?.id === r.id;
                return (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => {
                      setSelectedRackId(r.id);
                      setSelectedSubrackId(r.subracks[0]?.id || null);
                    }}
                    className={cn(
                      "px-3 py-1 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer flex items-center gap-1.5 border",
                      isSelected
                        ? "bg-sky-600 text-white border-sky-600 shadow-2xs"
                        : "bg-white hover:bg-neutral-100 text-neutral-700 border-neutral-300"
                    )}
                  >
                    <span>{r.id}</span>
                    <span className="text-[10px] opacity-80 font-normal">
                      ({r.subracks.length} ساب‌رک)
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Display Mode Tabs (ترسیم بصری رک / جزییات متن و توضیحات / پروتکل‌ها) */}
          <div className="flex items-center gap-1 p-1 bg-neutral-100 rounded-xl text-xs font-semibold">
            <button
              type="button"
              onClick={() => setDisplayMode("visual_drawing")}
              className={cn(
                "px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5",
                displayMode === "visual_drawing"
                  ? "bg-white text-black font-bold shadow-2xs"
                  : "text-neutral-600 hover:text-black"
              )}
            >
              <Eye className="w-3.5 h-3.5 text-sky-600" />
              <span>ترسیم بصری رک (42U Visual)</span>
            </button>

            <button
              type="button"
              onClick={() => setDisplayMode("text_detail")}
              className={cn(
                "px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5",
                displayMode === "text_detail"
                  ? "bg-white text-black font-bold shadow-2xs"
                  : "text-neutral-600 hover:text-black"
              )}
            >
              <FileText className="w-3.5 h-3.5 text-amber-600" />
              <span>جزییات متن و کاتالوگ کارت‌ها</span>
            </button>

            <button
              type="button"
              onClick={() => setDisplayMode("network_protocols")}
              className={cn(
                "px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5",
                displayMode === "network_protocols"
                  ? "bg-white text-black font-bold shadow-2xs"
                  : "text-neutral-600 hover:text-black"
              )}
            >
              <Network className="w-3.5 h-3.5 text-indigo-600" />
              <span>پروتکل‌های شبکه</span>
            </button>

            <button
              type="button"
              onClick={() => setDisplayMode("room_layout")}
              className={cn(
                "px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5",
                displayMode === "room_layout"
                  ? "bg-white text-black font-bold shadow-2xs"
                  : "text-neutral-600 hover:text-black"
              )}
            >
              <LayoutGrid className="w-3.5 h-3.5 text-neutral-600" />
              <span>چیدمان سالن ({currentRoom.racks.length} رک)</span>
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MODE 1: VISUAL 42U RACK DRAWING + INTERACTIVE LIVE CARD INSPECTOR         */}
      {/* ========================================================================= */}
      {displayMode === "visual_drawing" && activeRack && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          
          {/* Left Column (lg:col-span-7): The Authentic 42U Visual Rack Drawing */}
          <div className="lg:col-span-7 bg-white p-4 rounded-2xl border border-neutral-200 shadow-2xs space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-neutral-100">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <h3 className="text-sm font-bold text-neutral-900">
                  ترسیم فیزیکی محفظه ۱۹ اینچ {activeRack.id} ({activeRack.name}):
                </h3>
              </div>
              <span className="text-xs text-neutral-400 font-mono">
                کلیک روی هر ساب‌رک = بازرسی بردهای داخلی
              </span>
            </div>

            {/* Visual 42U Component */}
            <VisualRackDrawing
              rack={activeRack}
              selectedSubrackId={activeSubrack?.id || null}
              onSelectSubrack={(subId) => setSelectedSubrackId(subId)}
              isInteractive={true}
            />
          </div>

          {/* Right Column (lg:col-span-5): The Interactive Subrack & Card Inspector */}
          <div className="lg:col-span-5 space-y-4">
            {activeSubrack ? (
              <div className="bg-white p-4 sm:p-5 rounded-2xl border border-neutral-200 shadow-2xs space-y-4 sticky top-4">
                
                {/* Inspector Header */}
                <div className="space-y-1.5 pb-3 border-b border-neutral-100">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-md bg-neutral-900 text-white">
                      U{activeSubrack.uStart}-U{activeSubrack.uEnd} ({activeSubrack.heightU}U)
                    </span>
                    <span className="text-xs font-mono px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 font-bold">
                      {activeSubrack.safetyLevel}
                    </span>
                  </div>

                  <h3 className="text-base font-extrabold text-neutral-900">
                    {activeSubrack.title}
                  </h3>
                  <span className="text-xs font-mono text-neutral-400 block">
                    {activeSubrack.titleEn} • کد فنی: <strong>{activeSubrack.modelCode}</strong>
                  </span>
                </div>

                {/* Subrack Specs Grid */}
                <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                  <div className="p-2.5 rounded-xl bg-neutral-50 border border-neutral-200 space-y-0.5">
                    <span className="text-neutral-400 block text-[10px]">باس ارتباطی:</span>
                    <strong className="text-neutral-900 text-[11px]">{activeSubrack.busProtocol}</strong>
                  </div>
                  <div className="p-2.5 rounded-xl bg-neutral-50 border border-neutral-200 space-y-0.5">
                    <span className="text-neutral-400 block text-[10px]">تغذیه و توان:</span>
                    <strong className="text-neutral-900 text-[11px]">{activeSubrack.powerSpec}</strong>
                  </div>
                </div>

                {/* Description */}
                <p className="text-xs text-neutral-600 leading-relaxed bg-sky-50/60 p-3 rounded-xl border border-sky-100">
                  {activeSubrack.description}
                </p>

                {/* Internal Cards Breakdown */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-neutral-800">بردهای الکترونیکی و کارت‌های داخلی:</span>
                    <span className="font-mono text-sky-700 font-semibold">
                      {activeSubrack.components.reduce((a, b) => a + b.count, 0)} کارت
                    </span>
                  </div>

                  <div className="space-y-2 max-h-64 overflow-y-auto pr-0.5">
                    {activeSubrack.components.map((comp, cIdx) => (
                      <div
                        key={cIdx}
                        className="p-2.5 rounded-xl bg-neutral-50 border border-neutral-200 text-xs space-y-1"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-neutral-900">{comp.name}</span>
                          <span className="font-mono font-bold px-1.5 py-0.2 rounded bg-neutral-200 text-neutral-800 text-[10px]">
                            {comp.count} عدد
                          </span>
                        </div>
                        <div className="text-[10px] font-mono text-neutral-500">{comp.nameEn}</div>
                        <p className="text-[11px] text-neutral-600 leading-snug">{comp.description}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Quick subrack navigation buttons */}
                <div className="pt-2 border-t border-neutral-100 flex items-center justify-between">
                  <span className="text-[11px] text-neutral-400">سایر ساب‌رک‌های این رک:</span>
                  <div className="flex items-center gap-1">
                    {activeRack.subracks.map((s) => (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => setSelectedSubrackId(s.id)}
                        className={cn(
                          "w-6 h-6 rounded-md text-[10px] font-mono font-bold transition-all cursor-pointer flex items-center justify-center border",
                          s.id === activeSubrack.id
                            ? "bg-neutral-900 text-white border-neutral-900"
                            : "bg-neutral-100 hover:bg-neutral-200 text-neutral-700 border-neutral-200"
                        )}
                        title={s.title}
                      >
                        U{s.uStart}
                      </button>
                    ))}
                  </div>
                </div>

              </div>
            ) : (
              <div className="p-8 rounded-2xl bg-neutral-50 border border-neutral-200 text-center space-y-2 text-neutral-500">
                <Info className="w-6 h-6 mx-auto text-neutral-400" />
                <p className="text-xs">یک ساب‌رک را برای مشاهده جزییات کارت‌ها انتخاب کنید.</p>
              </div>
            )}
          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* MODE 2: TEXTUAL HARDWARE & CARDS DOSSIER (مشخصات متنی و کاتالوگ کامل)     */}
      {/* ========================================================================= */}
      {displayMode === "text_detail" && activeRack && (
        <div className="bg-white p-5 rounded-2xl border border-neutral-200 shadow-2xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-neutral-100">
            <div className="space-y-0.5">
              <h3 className="text-base font-extrabold text-neutral-900">
                دوسیه مهندسی و کاتالوگ سخت‌افزاری رک {activeRack.id} ({activeRack.name})
              </h3>
              <p className="text-xs text-neutral-500">
                شامل کلیه ساب‌رک‌ها، ماژول‌ها، کارت‌های پردازش و بردهای الکترونیکی با سطوح ایمنی و پارت نامبرها
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold px-3 py-1 rounded-xl bg-neutral-100 border border-neutral-200 text-neutral-800">
                مجموع: {rackHardwareStats.totalModules} ساب‌رک • {rackHardwareStats.totalCards} کارت الکترونیکی
              </span>
            </div>
          </div>

          {/* Subracks & Cards List */}
          <div className="space-y-4">
            {activeRack.subracks.map((sub) => {
              const meta = getCategoryMeta(sub.category);

              return (
                <div
                  key={sub.id}
                  className="p-4 sm:p-5 rounded-2xl bg-neutral-50 border border-neutral-200 space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-neutral-200">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-md bg-neutral-900 text-white">
                        U{sub.uStart}-U{sub.uEnd} ({sub.heightU}U)
                      </span>
                      <h4 className="font-bold text-sm sm:text-base text-neutral-900">
                        {sub.title}
                      </h4>
                      <span className={cn("text-xs px-2 py-0.2 rounded-md font-semibold border", meta.bg)}>
                        {meta.label}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-xs font-mono">
                      <span className="text-neutral-500">کد: <strong>{sub.modelCode}</strong></span>
                      <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 font-bold">
                        {sub.safetyLevel}
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-neutral-700 leading-relaxed">
                    {sub.description}
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs font-mono pt-1">
                    <div className="p-2 rounded-lg bg-white border border-neutral-200">
                      <span className="text-neutral-400 block text-[10px]">باس انتقال داده:</span>
                      <span className="text-neutral-900 font-bold">{sub.busProtocol}</span>
                    </div>
                    <div className="p-2 rounded-lg bg-white border border-neutral-200">
                      <span className="text-neutral-400 block text-[10px]">مشخصات تغذیه:</span>
                      <span className="text-neutral-900 font-bold">{sub.powerSpec}</span>
                    </div>
                    <div className="p-2 rounded-lg bg-white border border-neutral-200">
                      <span className="text-neutral-400 block text-[10px]">چیدمان اسلات‌ها:</span>
                      <span className="text-neutral-900 font-bold">{sub.components.length} نوع ماژول</span>
                    </div>
                  </div>

                  {/* Components Table */}
                  <div className="space-y-1 pt-2">
                    <span className="text-xs font-bold text-neutral-800 block">
                      فهرست بردهای الکترونیکی و تجهیزات این ساب‌رک:
                    </span>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {sub.components.map((comp, idx) => (
                        <div
                          key={idx}
                          className="p-2.5 rounded-xl bg-white border border-neutral-200 text-xs space-y-1"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-neutral-900">{comp.name}</span>
                            <span className="font-mono font-bold px-2 py-0.5 rounded bg-sky-50 text-sky-700 border border-sky-200 text-[11px]">
                              {comp.count} عدد
                            </span>
                          </div>
                          <div className="text-[10px] font-mono text-neutral-500">{comp.nameEn}</div>
                          <p className="text-[11px] text-neutral-600 leading-snug">{comp.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODE 3: NETWORK PROTOCOLS & CENELEC ARCHITECTURE                         */}
      {/* ========================================================================= */}
      {displayMode === "network_protocols" && (
        <div className="bg-white p-5 rounded-2xl border border-neutral-200 shadow-2xs space-y-4">
          <div className="space-y-1 pb-3 border-b border-neutral-100">
            <h3 className="text-base font-extrabold text-neutral-900">
              پروتکل‌های شبکه صنعتی و استانداردهای ارتباطی سالن {currentRoom.title}
            </h3>
            <p className="text-xs text-neutral-500">
              معماری رینگ نوری خودترمیم MRP، لایه ایمن CENELEC EN 50159 و باس‌های فیلد صنعتی
            </p>
          </div>

          <div className="grid grid-cols-1 gap-3">
            {rackAssociatedProtocols.map((proto, idx) => (
              <div
                key={idx}
                className="p-4 rounded-xl bg-neutral-50 border border-neutral-200 space-y-2 text-xs"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    <h4 className="font-bold text-neutral-900 text-sm">{proto.name}</h4>
                  </div>
                  <span className="font-mono font-bold text-neutral-700 bg-white px-2 py-0.5 rounded border border-neutral-200 self-start sm:self-auto">
                    {proto.standard}
                  </span>
                </div>

                <p className="text-neutral-700 leading-relaxed">{proto.description}</p>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 font-mono text-[11px]">
                  <div className="p-2 rounded bg-white border border-neutral-200">
                    <span className="text-neutral-400 block text-[10px]">بستر فیزیکی:</span>
                    <span className="text-neutral-800 font-semibold">{proto.medium}</span>
                  </div>
                  <div className="p-2 rounded bg-white border border-neutral-200">
                    <span className="text-neutral-400 block text-[10px]">پهنای باند / سرعت:</span>
                    <span className="text-neutral-800 font-semibold">{proto.speed}</span>
                  </div>
                  <div className="p-2 rounded bg-white border border-neutral-200">
                    <span className="text-neutral-400 block text-[10px]">مکانیزم افزونگی:</span>
                    <span className="text-emerald-700 font-semibold">{proto.redundancyType}</span>
                  </div>
                  <div className="p-2 rounded bg-white border border-neutral-200">
                    <span className="text-neutral-400 block text-[10px]">لایه مدل OSI:</span>
                    <span className="text-neutral-800 font-semibold">{proto.layer}</span>
                  </div>
                </div>

                <div className="p-2.5 rounded-lg bg-sky-50 border border-sky-200 text-sky-900 text-[11px]">
                  <strong>ساختار تلگرام و اعتبارسنجی:</strong> {proto.packetInfo}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODE 4: ROOM LAYOUT & LINEUP OF ALL CABINETS                             */}
      {/* ========================================================================= */}
      {displayMode === "room_layout" && (
        <div className="bg-white p-5 rounded-2xl border border-neutral-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-neutral-100">
            <div className="space-y-0.5">
              <h3 className="text-base font-bold text-neutral-900">
                چیدمان فیزیکی محفظه‌های رک در سالن علائم ({currentRoom.racks.length} رک):
              </h3>
              <p className="text-xs text-neutral-500">
                کلیک روی هر کابینت برای سوئیچ فوری به نمای ترسیم ۴۲ یونیت
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {currentRoom.racks.map((r) => {
              const totalCards = r.subracks.reduce(
                (acc, s) => acc + s.components.reduce((cAcc, c) => cAcc + c.count, 0),
                0
              );
              const isSelected = activeRack?.id === r.id;

              return (
                <div
                  key={r.id}
                  onClick={() => {
                    setSelectedRackId(r.id);
                    setSelectedSubrackId(r.subracks[0]?.id || null);
                    setDisplayMode("visual_drawing");
                  }}
                  className={cn(
                    "p-4 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between space-y-3 group",
                    isSelected
                      ? "bg-sky-50/50 border-sky-500 shadow-md ring-2 ring-sky-200"
                      : "bg-white hover:bg-neutral-50 border-neutral-200 hover:border-neutral-400"
                  )}
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-black px-2 py-0.5 rounded bg-neutral-900 text-white">
                        {r.id}
                      </span>
                      <span className="text-[11px] font-mono text-neutral-500 font-bold bg-neutral-100 px-2 py-0.5 rounded">
                        {r.totalU}U • SIL 4
                      </span>
                    </div>

                    <h4 className="font-bold text-sm text-neutral-900 group-hover:text-sky-700 transition-colors">
                      {r.name}
                    </h4>
                    <span className="text-[11px] font-mono text-neutral-400 block truncate">
                      {r.nameEn}
                    </span>
                  </div>

                  <div className="py-2 border-t border-b border-neutral-100 space-y-1 text-xs">
                    <div className="flex items-center justify-between text-neutral-600">
                      <span>تعداد ساب‌رک‌ها:</span>
                      <strong className="font-mono text-neutral-900">{r.subracks.length} ساب‌رک</strong>
                    </div>
                    <div className="flex items-center justify-between text-neutral-600">
                      <span>کارت‌های سخت‌افزاری:</span>
                      <strong className="font-mono text-sky-700">{totalCards} کارت</strong>
                    </div>
                    <div className="flex items-center justify-between text-neutral-600">
                      <span>ابعاد کابینت:</span>
                      <span className="font-mono text-neutral-500 text-[11px]">{r.dimensions}</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    className="w-full py-1.5 px-3 rounded-xl bg-neutral-900 group-hover:bg-sky-600 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>مشاهده ترسیم بصری رک ←</span>
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. FULL-SCREEN MODAL (مودال تمام‌صفحه با ترسیم کامل و کاتالوگ کارت‌ها)        */}
      {/* ========================================================================= */}
      {isFullModalOpen && activeRack && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-2 sm:p-4 md:p-6 overflow-hidden animate-in fade-in duration-150"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-white border-2 border-neutral-900 text-neutral-900 w-full max-w-6xl h-[94vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden relative">
            
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-neutral-200 bg-neutral-50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-mono font-black px-2.5 py-1 rounded-md bg-neutral-900 text-white">
                    {activeRack.id}
                  </span>
                  <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded-md bg-white border border-neutral-200 text-neutral-700">
                    {activeRack.totalU}U صنعتی
                  </span>
                  <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800">
                    SIL-4 Hardware
                  </span>
                  <span className="text-xs text-neutral-500 font-mono hidden md:inline">
                    اتاق: {currentRoom.title} ({currentRoom.id})
                  </span>
                </div>

                <div className="flex items-baseline gap-2">
                  <h3 className="text-base sm:text-lg font-black text-neutral-900">
                    {activeRack.name}
                  </h3>
                  <span className="text-xs font-mono text-neutral-400 hidden sm:inline">
                    ({activeRack.nameEn})
                  </span>
                </div>
              </div>

              {/* Navigation & Close */}
              <div className="flex items-center gap-2 self-end sm:self-auto">
                <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-neutral-200">
                  <button
                    type="button"
                    onClick={() => handleNavigateRack("prev")}
                    className="p-1.5 rounded-lg text-neutral-600 hover:text-black hover:bg-neutral-100 transition-colors cursor-pointer"
                    title="رک قبلی"
                  >
                    <ArrowRight className="w-4 h-4" />
                  </button>
                  <span className="text-xs font-mono font-bold px-2 text-neutral-700">
                    {activeRack.id}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleNavigateRack("next")}
                    className="p-1.5 rounded-lg text-neutral-600 hover:text-black hover:bg-neutral-100 transition-colors cursor-pointer"
                    title="رک بعدی"
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => setIsFullModalOpen(false)}
                  className="p-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold text-xs flex items-center gap-1 transition-colors cursor-pointer"
                  title="بستن (Esc)"
                >
                  <X className="w-4 h-4" />
                  <span className="hidden sm:inline">بستن</span>
                </button>
              </div>
            </div>

            {/* Modal Tabs Bar */}
            <div className="px-4 sm:px-6 pt-2 border-b border-neutral-200 bg-white flex items-center gap-2 overflow-x-auto scrollbar-none shrink-0">
              <button
                type="button"
                onClick={() => setModalTab("visual")}
                className={cn(
                  "pb-2.5 px-3 text-xs sm:text-sm font-bold border-b-2 flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap",
                  modalTab === "visual"
                    ? "border-black text-black font-extrabold"
                    : "border-transparent text-neutral-500 hover:text-black"
                )}
              >
                <Eye className="w-4 h-4 text-sky-600" />
                <span>ترسیم شماتیک ۴۲ یونیت (42U Visual)</span>
              </button>

              <button
                type="button"
                onClick={() => setModalTab("hardware")}
                className={cn(
                  "pb-2.5 px-3 text-xs sm:text-sm font-bold border-b-2 flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap",
                  modalTab === "hardware"
                    ? "border-black text-black font-extrabold"
                    : "border-transparent text-neutral-500 hover:text-black"
                )}
              >
                <Cpu className="w-4 h-4 text-emerald-600" />
                <span>کاتالوگ بردهای سخت‌افزاری ({rackHardwareStats.totalCards} کارت)</span>
              </button>

              <button
                type="button"
                onClick={() => setModalTab("network")}
                className={cn(
                  "pb-2.5 px-3 text-xs sm:text-sm font-bold border-b-2 flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap",
                  modalTab === "network"
                    ? "border-black text-black font-extrabold"
                    : "border-transparent text-neutral-500 hover:text-black"
                )}
              >
                <Network className="w-4 h-4 text-indigo-600" />
                <span>پروتکل‌های ارتباطی ({rackAssociatedProtocols.length})</span>
              </button>

              <button
                type="button"
                onClick={() => setModalTab("power_safety")}
                className={cn(
                  "pb-2.5 px-3 text-xs sm:text-sm font-bold border-b-2 flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap",
                  modalTab === "power_safety"
                    ? "border-black text-black font-extrabold"
                    : "border-transparent text-neutral-500 hover:text-black"
                )}
              >
                <ShieldCheck className="w-4 h-4 text-amber-600" />
                <span>سیستم تغذیه و ایمنی SIL-4</span>
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 bg-neutral-50/50">
              
              {/* TAB 1: VISUAL 42U DRAWING IN MODAL */}
              {modalTab === "visual" && (
                <div className="space-y-4">
                  <VisualRackDrawing
                    rack={activeRack}
                    selectedSubrackId={activeSubrack?.id || null}
                    onSelectSubrack={(subId) => {
                      setSelectedSubrackId(subId);
                      setModalTab("hardware");
                    }}
                    isInteractive={true}
                  />
                </div>
              )}

              {/* TAB 2: HARDWARE CARDS SPECIFICATIONS IN MODAL */}
              {modalTab === "hardware" && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-xs text-neutral-500 pb-2 border-b border-neutral-200">
                    <span>
                      کابینت استاندارد صنعتی: <strong>{activeRack.cabinetType}</strong> ({activeRack.dimensions})
                    </span>
                    <span className="font-mono">
                      تغذیه: <strong>{activeRack.powerFeed}</strong>
                    </span>
                  </div>

                  <div className="space-y-4">
                    {activeRack.subracks.map((sub) => {
                      const meta = getCategoryMeta(sub.category);

                      return (
                        <div
                          key={sub.id}
                          className="bg-white rounded-2xl border border-neutral-200 p-4 sm:p-5 shadow-2xs space-y-3"
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-neutral-100">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-md bg-neutral-900 text-white">
                                U{sub.uStart}-U{sub.uEnd} ({sub.heightU}U)
                              </span>
                              <h4 className="font-bold text-sm sm:text-base text-neutral-900">
                                {sub.title}
                              </h4>
                              <span className={cn("text-xs px-2 py-0.2 rounded-md font-semibold border", meta.bg)}>
                                {meta.label}
                              </span>
                            </div>

                            <div className="flex items-center gap-2 text-xs font-mono">
                              <span className="text-neutral-500">کد: <strong>{sub.modelCode}</strong></span>
                              <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold">
                                {sub.safetyLevel}
                              </span>
                            </div>
                          </div>

                          <p className="text-xs text-neutral-700 leading-relaxed">
                            {sub.description}
                          </p>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 font-mono text-xs">
                            <div className="p-2 rounded-lg bg-neutral-50 border border-neutral-200">
                              <span className="text-neutral-400 block text-[10px]">باس ارتباطی:</span>
                              <strong>{sub.busProtocol}</strong>
                            </div>
                            <div className="p-2 rounded-lg bg-neutral-50 border border-neutral-200">
                              <span className="text-neutral-400 block text-[10px]">تغذیه:</span>
                              <strong>{sub.powerSpec}</strong>
                            </div>
                          </div>

                          {/* Components */}
                          <div className="space-y-1.5 pt-1">
                            <span className="text-xs font-bold text-neutral-800 block">
                              کارت‌های سخت‌افزاری ({sub.components.reduce((a, b) => a + b.count, 0)} عدد):
                            </span>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              {sub.components.map((comp, idx) => (
                                <div
                                  key={idx}
                                  className="p-2.5 rounded-xl bg-neutral-50 border border-neutral-200 text-xs space-y-1"
                                >
                                  <div className="flex items-center justify-between">
                                    <span className="font-bold text-neutral-900">{comp.name}</span>
                                    <span className="font-mono font-bold px-1.5 py-0.2 rounded bg-neutral-200 text-neutral-800 text-[10px]">
                                      {comp.count} عدد
                                    </span>
                                  </div>
                                  <div className="text-[10px] font-mono text-neutral-500">{comp.nameEn}</div>
                                  <p className="text-[11px] text-neutral-600 leading-snug">{comp.description}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* TAB 3: NETWORK PROTOCOLS IN MODAL */}
              {modalTab === "network" && (
                <div className="space-y-4">
                  <div className="space-y-3">
                    {rackAssociatedProtocols.map((proto, idx) => (
                      <div
                        key={idx}
                        className="p-4 rounded-2xl bg-white border border-neutral-200 space-y-2 text-xs"
                      >
                        <div className="flex items-center justify-between">
                          <h4 className="font-bold text-neutral-900 text-sm">{proto.name}</h4>
                          <span className="font-mono text-neutral-600 bg-neutral-100 px-2 py-0.5 rounded">
                            {proto.standard}
                          </span>
                        </div>
                        <p className="text-neutral-600">{proto.description}</p>
                        <div className="p-2 rounded bg-neutral-50 font-mono text-[11px] text-neutral-700">
                          بستر: {proto.medium} • سرعت: {proto.speed} • افزونگی: {proto.redundancyType}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 4: POWER & SIL-4 SAFETY IN MODAL */}
              {modalTab === "power_safety" && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
                    <div className="p-4 rounded-2xl bg-white border border-neutral-200 space-y-2.5">
                      <span className="font-bold text-neutral-900 block text-sm">تغذیه و توان اضطراری</span>
                      <div className="space-y-1.5 text-neutral-700">
                        <div>فیدر اصلی: <strong className="text-neutral-900">{activeRack.powerFeed}</strong></div>
                        <div>معماری UPS: <strong className="text-emerald-700">Dual 230V AC UPS (A+B)</strong></div>
                        <div>استقلال باتری: <strong className="text-neutral-900">۴ ساعت باتری SLA</strong></div>
                        <div>باس داخلی: <strong className="text-neutral-900">24V DC دوبل با دیود اورینگ</strong></div>
                      </div>
                    </div>

                    <div className="p-4 rounded-2xl bg-white border border-neutral-200 space-y-2.5">
                      <span className="font-bold text-neutral-900 block text-sm">ارتینگ و حفاظت SIL-4</span>
                      <div className="space-y-1.5 text-neutral-700">
                        <div>درجه ایمنی: <strong className="text-emerald-700">SIL 4 (EN 50129 / IEC 61508)</strong></div>
                        <div>مقاومت چاه ارت: <strong className="text-neutral-900">&lt; 1.0 Ohm</strong></div>
                        <div>ایزولاسیون گالوانیک: <strong className="text-neutral-900">2500V RMS</strong></div>
                        <div>صاعقه‌گیر: <strong className="text-neutral-900">SPD Type 1+2 کلاس B+C</strong></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

            </div>

            {/* Modal Footer */}
            <div className="p-3.5 border-t border-neutral-200 bg-neutral-50 flex items-center justify-between shrink-0">
              <span className="text-xs font-mono text-neutral-500">
                رک فعال: <strong>{activeRack.id}</strong> • {activeRack.subracks.length} ساب‌رک • {rackHardwareStats.totalCards} کارت
              </span>

              <button
                type="button"
                onClick={() => setIsFullModalOpen(false)}
                className="px-4 py-1.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white font-bold text-xs transition-colors cursor-pointer"
              >
                بستن پنجره
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};
