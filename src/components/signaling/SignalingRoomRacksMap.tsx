import React, { useState, useMemo } from "react";
import {
  Server,
  Network,
  Cpu,
  Layers,
  ShieldCheck,
  Zap,
  Search,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Activity,
  Radio,
  Sliders,
  CheckCircle2,
  AlertTriangle,
  Info,
  Maximize2,
  Hash,
} from "lucide-react";
import { cn } from "../../lib/utils";
import { SIGNALING_ROOMS_DETAILED_DATA } from "../../data/signalingRoomsData";
import {
  SignalingRoomDetail,
  SignalingRackElevation,
  RackSubrack,
  RackSubrackCategory,
} from "../../types/signalingRooms";

interface SignalingRoomRacksMapProps {
  initialRoomId?: string;
  onSelectStationInSimulator?: (stationId: number) => void;
  className?: string;
}

export const SignalingRoomRacksMap: React.FC<SignalingRoomRacksMapProps> = ({
  initialRoomId = "SER-01",
  onSelectStationInSimulator,
  className,
}) => {
  const [selectedRoomId, setSelectedRoomId] = useState<string>(initialRoomId);
  const [selectedSubrackId, setSelectedSubrackId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<RackSubrackCategory | "all">("all");
  const [showNetworkDetails, setShowNetworkDetails] = useState<boolean>(true);

  // Current room data
  const currentRoom = useMemo<SignalingRoomDetail>(() => {
    return (
      SIGNALING_ROOMS_DETAILED_DATA.find((r) => r.id === selectedRoomId) ||
      SIGNALING_ROOMS_DETAILED_DATA[0]
    );
  }, [selectedRoomId]);

  // Selected subrack data for inspector pane
  const activeSubrack = useMemo<RackSubrack | null>(() => {
    if (!selectedSubrackId) {
      // Default to first subrack of first rack
      return currentRoom.racks[0]?.subracks[0] || null;
    }
    for (const rack of currentRoom.racks) {
      const found = rack.subracks.find((s) => s.id === selectedSubrackId);
      if (found) return found;
    }
    return currentRoom.racks[0]?.subracks[0] || null;
  }, [selectedSubrackId, currentRoom]);

  // Helper for category styling & Persian labels
  const getCategoryMeta = (cat: RackSubrackCategory) => {
    switch (cat) {
      case "processing":
        return {
          label: "پردازشگر ایمن 2oo3",
          bg: "bg-blue-50 text-blue-700 border-blue-200",
          badgeColor: "bg-blue-600",
        };
      case "io":
        return {
          label: "ورودی/خروجی فیلد FEC",
          bg: "bg-emerald-50 text-emerald-700 border-emerald-200",
          badgeColor: "bg-emerald-600",
        };
      case "point_machine":
        return {
          label: "کنترلر سوزن PMC",
          bg: "bg-amber-50 text-amber-700 border-amber-200",
          badgeColor: "bg-amber-600",
        };
      case "signal_driver":
        return {
          label: "درایور سیگنال VSC",
          bg: "bg-purple-50 text-purple-700 border-purple-200",
          badgeColor: "bg-purple-600",
        };
      case "track_circuit":
        return {
          label: "مدار راه فرکانسی MAFTC",
          bg: "bg-cyan-50 text-cyan-700 border-cyan-200",
          badgeColor: "bg-cyan-600",
        };
      case "axle_counter":
        return {
          label: "محور شمار MH-AX",
          bg: "bg-teal-50 text-teal-700 border-teal-200",
          badgeColor: "bg-teal-600",
        };
      case "network_switch":
        return {
          label: "سوئیچ شبکه صنعتی",
          bg: "bg-indigo-50 text-indigo-700 border-indigo-200",
          badgeColor: "bg-indigo-600",
        };
      case "patch_panel":
        return {
          label: "پچ‌پنل و ترمینال ODF",
          bg: "bg-neutral-100 text-neutral-700 border-neutral-300",
          badgeColor: "bg-neutral-600",
        };
      case "diagnostic":
        return {
          label: "ثبات وقایع DiagRC",
          bg: "bg-rose-50 text-rose-700 border-rose-200",
          badgeColor: "bg-rose-600",
        };
      case "lcp_panel":
        return {
          label: "پانل کنترل محلی LCP",
          bg: "bg-orange-50 text-orange-700 border-orange-200",
          badgeColor: "bg-orange-600",
        };
      case "power_supply":
        return {
          label: "توزیع توان PDC / تغذیه",
          bg: "bg-slate-100 text-slate-800 border-slate-300",
          badgeColor: "bg-slate-700",
        };
      case "server_node":
        return {
          label: "سرورهای مرکزی OCC",
          bg: "bg-sky-50 text-sky-700 border-sky-200",
          badgeColor: "bg-sky-600",
        };
      default:
        return {
          label: "تجهیزات صنعتی",
          bg: "bg-neutral-50 text-neutral-600 border-neutral-200",
          badgeColor: "bg-neutral-500",
        };
    }
  };

  // Check if subrack matches current filter or search
  const isSubrackMatching = (sub: RackSubrack) => {
    if (selectedCategory !== "all" && sub.category !== selectedCategory) {
      return false;
    }
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    return (
      sub.title.toLowerCase().includes(term) ||
      sub.titleEn.toLowerCase().includes(term) ||
      sub.modelCode.toLowerCase().includes(term) ||
      sub.description.toLowerCase().includes(term) ||
      sub.busProtocol.toLowerCase().includes(term) ||
      sub.components.some(
        (c) =>
          c.name.toLowerCase().includes(term) ||
          c.nameEn.toLowerCase().includes(term)
      )
    );
  };

  return (
    <div className={cn("space-y-6 select-none", className)}>
      {/* 1. Header Banner & Room Tabs */}
      <div className="bg-white rounded-2xl border border-neutral-200 p-5 shadow-2xs space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-neutral-900 text-white">
                <Server className="w-4 h-4" />
              </span>
              <h2 className="text-lg font-bold text-neutral-900">
                نقشه مهندسی اتاق‌های سیگنالینگ، چیدمان رک‌ها و پروتکل‌های شبکه
              </h2>
            </div>
            <p className="text-xs text-neutral-500 leading-relaxed">
              مشخصات جامع رک‌های ۱۹ اینچ (Rack Elevations U01-U42)، بردهای پردازشی SIL-4،
              سوییچ‌های صنعتی رینگ فیبر نوری و پروتکل‌های ارتباطی (CENELEC EN 50159 / IEC 62439 MRP)
            </p>
          </div>

          {/* Quick simulator jump */}
          {onSelectStationInSimulator && (
            <button
              type="button"
              onClick={() => onSelectStationInSimulator(currentRoom.stationId)}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-neutral-900 text-white text-xs font-semibold hover:bg-neutral-800 transition-colors cursor-pointer self-start md:self-auto shrink-0 shadow-2xs"
            >
              <Activity className="w-3.5 h-3.5" />
              <span>پایش منطقه این اتاق در CTC Simulator</span>
              <ExternalLink className="w-3.5 h-3.5 opacity-70" />
            </button>
          )}
        </div>

        {/* Room Switcher Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none border-t border-neutral-100 pt-4">
          {SIGNALING_ROOMS_DETAILED_DATA.map((room) => {
            const isSelected = room.id === selectedRoomId;
            return (
              <button
                key={room.id}
                type="button"
                onClick={() => {
                  setSelectedRoomId(room.id);
                  setSelectedSubrackId(null);
                }}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer flex items-center gap-2 border",
                  isSelected
                    ? "bg-neutral-900 text-white border-neutral-900 shadow-2xs"
                    : "bg-white text-neutral-600 border-neutral-200 hover:bg-neutral-50 hover:text-neutral-900"
                )}
              >
                <span
                  className={cn(
                    "text-[10px] font-mono px-1 py-0.2 rounded-sm",
                    isSelected ? "bg-neutral-800 text-white" : "bg-neutral-100 text-neutral-700"
                  )}
                >
                  {room.id}
                </span>
                <span>{room.stationName}</span>
                <span className="text-[10px] font-mono opacity-70">
                  ({room.racks.length} رک)
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Room Overview Info Bar */}
      <div className="bg-neutral-50 rounded-2xl border border-neutral-200 p-4 space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-3 border-b border-neutral-200/70">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-extrabold font-mono px-2 py-0.5 rounded-md bg-neutral-900 text-white">
                {currentRoom.id}
              </span>
              <h3 className="text-base font-bold text-neutral-900">{currentRoom.title}</h3>
              <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" />
                {currentRoom.silLevel}
              </span>
            </div>
            <p className="text-xs text-neutral-600">
              موقعیت: {currentRoom.location} | کیلومتراژ: <span className="font-mono">{currentRoom.chainage}</span> | معماری اینترلاکینگ: {currentRoom.interlockingType}
            </p>
          </div>

          {/* Quick Metrics */}
          <div className="flex items-center gap-3 text-xs text-neutral-600 font-mono">
            <div className="bg-white px-2.5 py-1.5 rounded-lg border border-neutral-200 shadow-2xs">
              <span className="text-neutral-400 block text-[10px]">تعداد سوزن‌ها</span>
              <span className="font-bold text-neutral-900">{currentRoom.controlledEquipmentSummary.switchesCount} سوزن</span>
            </div>
            <div className="bg-white px-2.5 py-1.5 rounded-lg border border-neutral-200 shadow-2xs">
              <span className="text-neutral-400 block text-[10px]">سیگنال‌ها</span>
              <span className="font-bold text-neutral-900">{currentRoom.controlledEquipmentSummary.signalsCount} چراغ</span>
            </div>
            <div className="bg-white px-2.5 py-1.5 rounded-lg border border-neutral-200 shadow-2xs">
              <span className="text-neutral-400 block text-[10px]">تراک و بلاک</span>
              <span className="font-bold text-neutral-900">{currentRoom.controlledEquipmentSummary.tracksCount} تراک</span>
            </div>
            <div className="bg-white px-2.5 py-1.5 rounded-lg border border-neutral-200 shadow-2xs">
              <span className="text-neutral-400 block text-[10px]">رک‌های اتاق</span>
              <span className="font-bold text-neutral-900">{currentRoom.racks.length} رک ۱۹ اینچ</span>
            </div>
          </div>
        </div>

        {/* Zone description */}
        <div className="text-xs text-neutral-600 flex items-start gap-2">
          <Info className="w-4 h-4 text-neutral-400 shrink-0 mt-0.5" />
          <span>
            <strong>محدوده تحت پوشش اتاق:</strong> {currentRoom.controlledEquipmentSummary.coverageZone}
          </span>
        </div>
      </div>

      {/* 3. Industrial Network Architecture & Protocols Section (Collapsible) */}
      <div className="bg-white rounded-2xl border border-neutral-200 shadow-2xs overflow-hidden">
        <button
          type="button"
          onClick={() => setShowNetworkDetails(!showNetworkDetails)}
          className="w-full px-5 py-3.5 bg-neutral-50/70 border-b border-neutral-200 flex items-center justify-between text-right cursor-pointer hover:bg-neutral-100/70 transition-colors"
        >
          <div className="flex items-center gap-2.5">
            <Network className="w-4 h-4 text-neutral-700" />
            <span className="text-sm font-bold text-neutral-900">
              معماری شبکه صنعتی و پروتکل‌های ارتباطی اتاق {currentRoom.id}
            </span>
            <span className="text-[11px] text-neutral-500 font-mono hidden sm:inline">
              ({currentRoom.networkArchitecture.protocols.length} پروتکل فعال • رینگ خودترمیم نوری)
            </span>
          </div>

          <div className="flex items-center gap-2 text-xs text-neutral-500">
            <span>{showNetworkDetails ? "بستن جزئیات شبکه" : "مشاهده پروتکل‌ها و سخت‌افزار شبکه"}</span>
            {showNetworkDetails ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </div>
        </button>

        {showNetworkDetails && (
          <div className="p-5 space-y-5">
            {/* Summary badges */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="p-3 rounded-xl bg-neutral-50 border border-neutral-200 space-y-1">
                <span className="text-[10px] font-bold text-neutral-400 block">توپولوژی ستون فقرات نوری (Backbone)</span>
                <p className="text-xs text-neutral-800 font-medium leading-relaxed">
                  {currentRoom.networkArchitecture.backboneRing}
                </p>
              </div>

              <div className="p-3 rounded-xl bg-neutral-50 border border-neutral-200 space-y-1">
                <span className="text-[10px] font-bold text-neutral-400 block">فیلدباس محلی (Local Fieldbus)</span>
                <p className="text-xs text-neutral-800 font-medium leading-relaxed">
                  {currentRoom.networkArchitecture.fieldbusTopology}
                </p>
              </div>

              <div className="p-3 rounded-xl bg-neutral-50 border border-neutral-200 space-y-1">
                <span className="text-[10px] font-bold text-neutral-400 block">استاندارد لایه ایمنی (Safety Standard)</span>
                <p className="text-xs text-neutral-800 font-medium leading-relaxed">
                  {currentRoom.networkArchitecture.safetyStandard}
                </p>
              </div>
            </div>

            {/* Protocols Matrix */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-neutral-900">
                پروتکل‌های ارتباطی و لایه‌های انتقال داده در اتاق {currentRoom.id}:
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {currentRoom.networkArchitecture.protocols.map((proto, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-xl border border-neutral-200/90 bg-white space-y-2 shadow-2xs hover:border-neutral-300 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-0.5">
                        <span className="text-xs font-bold text-neutral-900 block">{proto.name}</span>
                        <span className="text-[10px] font-mono text-neutral-500 block">
                          استاندارد: {proto.standard} | لایه: {proto.layer}
                        </span>
                      </div>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-sm bg-neutral-100 text-neutral-700 font-semibold shrink-0">
                        {proto.speed}
                      </span>
                    </div>

                    <p className="text-xs text-neutral-600 leading-relaxed">
                      {proto.description}
                    </p>

                    <div className="text-[11px] font-mono bg-neutral-50 p-2 rounded-md border border-neutral-200/60 text-neutral-700 space-y-0.5">
                      <div>بستر فیزیکی: <strong>{proto.medium}</strong></div>
                      <div>مکانیزم افزونگی: <strong>{proto.redundancyType}</strong></div>
                      <div>اطلاعات بسته: <span className="text-neutral-600">{proto.packetInfo}</span></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Network Hardware in Room */}
            {currentRoom.networkArchitecture.hardware.length > 0 && (
              <div className="space-y-2 pt-2 border-t border-neutral-100">
                <h4 className="text-xs font-bold text-neutral-900">
                  تجهیزات سخت‌افزاری شبکه مستقر در اتاق:
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {currentRoom.networkArchitecture.hardware.map((hw, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl border border-neutral-200 bg-neutral-50/50 space-y-1 text-xs"
                    >
                      <div className="font-bold text-neutral-900">{hw.name}</div>
                      <div className="text-[11px] font-mono text-neutral-500">
                        {hw.model} • {hw.manufacturer}
                      </div>
                      <div className="text-[11px] text-neutral-600 leading-relaxed pt-1">
                        {hw.role}
                      </div>
                      <div className="text-[10px] font-mono text-neutral-500 pt-1 border-t border-neutral-200/60">
                        پورت‌ها: {hw.portsCount} | افزونگی: {hw.redundancy}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 4. Filter & Search Controls for Rack Components */}
      <div className="bg-white rounded-xl border border-neutral-200 p-3 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-neutral-400 absolute right-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="جستجوی اجزای رک (مثال: VPU, PMC, TCX, TCR, MH-AX, FCI, Hirschmann, LCP, 380V)..."
            className="w-full pr-9 pl-4 py-1.5 text-xs rounded-lg border border-neutral-200 bg-neutral-50/50 focus:bg-white focus:outline-hidden focus:border-black transition-colors"
          />
        </div>

        {/* Category filter */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          <button
            type="button"
            onClick={() => setSelectedCategory("all")}
            className={cn(
              "px-2.5 py-1 rounded-md text-[11px] font-semibold cursor-pointer transition-colors whitespace-nowrap",
              selectedCategory === "all"
                ? "bg-neutral-900 text-white"
                : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
            )}
          >
            همه اجزا
          </button>
          <button
            type="button"
            onClick={() => setSelectedCategory("processing")}
            className={cn(
              "px-2.5 py-1 rounded-md text-[11px] font-semibold cursor-pointer transition-colors whitespace-nowrap",
              selectedCategory === "processing"
                ? "bg-blue-600 text-white"
                : "bg-blue-50 text-blue-700 hover:bg-blue-100"
            )}
          >
            پردازشگر VPU
          </button>
          <button
            type="button"
            onClick={() => setSelectedCategory("point_machine")}
            className={cn(
              "px-2.5 py-1 rounded-md text-[11px] font-semibold cursor-pointer transition-colors whitespace-nowrap",
              selectedCategory === "point_machine"
                ? "bg-amber-600 text-white"
                : "bg-amber-50 text-amber-700 hover:bg-amber-100"
            )}
          >
            کنترلر سوزن PMC
          </button>
          <button
            type="button"
            onClick={() => setSelectedCategory("track_circuit")}
            className={cn(
              "px-2.5 py-1 rounded-md text-[11px] font-semibold cursor-pointer transition-colors whitespace-nowrap",
              selectedCategory === "track_circuit"
                ? "bg-cyan-600 text-white"
                : "bg-cyan-50 text-cyan-700 hover:bg-cyan-100"
            )}
          >
            مدار راه MAFTC
          </button>
          <button
            type="button"
            onClick={() => setSelectedCategory("axle_counter")}
            className={cn(
              "px-2.5 py-1 rounded-md text-[11px] font-semibold cursor-pointer transition-colors whitespace-nowrap",
              selectedCategory === "axle_counter"
                ? "bg-teal-600 text-white"
                : "bg-teal-50 text-teal-700 hover:bg-teal-100"
            )}
          >
            محور شمار MH-AX
          </button>
          <button
            type="button"
            onClick={() => setSelectedCategory("lcp_panel")}
            className={cn(
              "px-2.5 py-1 rounded-md text-[11px] font-semibold cursor-pointer transition-colors whitespace-nowrap",
              selectedCategory === "lcp_panel"
                ? "bg-orange-600 text-white"
                : "bg-orange-50 text-orange-700 hover:bg-orange-100"
            )}
          >
            پانل LCP
          </button>
        </div>
      </div>

      {/* 5. Physical Racks Elevation (Side-by-side Racks View) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <h3 className="text-base font-bold text-neutral-900 flex items-center gap-2">
              <Layers className="w-4 h-4 text-neutral-700" />
              <span>نقشه نمای فیزیکی رک‌های ۱۹ اینچ سالن علائم (Rack Front Elevations - 42U)</span>
            </h3>
            <p className="text-xs text-neutral-500">
              کلیک روی هر ساب‌رک جزئیات فنی دقیق، کارت‌های داخلی، ولتاژ و پروتکل‌ها را در کادر بازرسی نمایش می‌دهد.
            </p>
          </div>

          <span className="text-xs font-mono text-neutral-500 hidden sm:inline">
            استاندارد رک: ۱۹ اینچ صنعتی Rittal TS8 • ارتفاع: 42U
          </span>
        </div>

        {/* Racks Grid Container */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {currentRoom.racks.map((rack) => (
            <div
              key={rack.id}
              className="bg-neutral-900 text-neutral-100 rounded-2xl p-3.5 border-2 border-neutral-800 shadow-md flex flex-col justify-between"
            >
              {/* Rack Top Header */}
              <div className="space-y-1 pb-2.5 border-b border-neutral-800 text-center">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-sm bg-neutral-800 text-neutral-300 font-bold">
                    {rack.id}
                  </span>
                  <span className="text-[10px] font-mono text-neutral-400">
                    42U Cabinet
                  </span>
                </div>
                <h4 className="text-xs font-bold text-white truncate" title={rack.name}>
                  {rack.name}
                </h4>
                <span className="text-[10px] text-neutral-400 font-mono block truncate">
                  {rack.nameEn}
                </span>
              </div>

              {/* Cabinet Interior (42U Bay) */}
              <div className="my-3 bg-neutral-950 rounded-xl p-2 border border-neutral-800 flex flex-col gap-1.5 min-h-[460px]">
                {rack.subracks.map((sub) => {
                  const isSelected = activeSubrack?.id === sub.id;
                  const isMatching = isSubrackMatching(sub);
                  const meta = getCategoryMeta(sub.category);

                  return (
                    <div
                      key={sub.id}
                      onClick={() => setSelectedSubrackId(sub.id)}
                      className={cn(
                        "rounded-lg p-2.5 border transition-all cursor-pointer relative group flex flex-col justify-between",
                        isSelected
                          ? "ring-2 ring-white border-white bg-neutral-800 shadow-lg scale-[1.01]"
                          : isMatching
                          ? "bg-neutral-900 border-neutral-700/80 hover:border-neutral-500 hover:bg-neutral-800/80"
                          : "bg-neutral-950/60 border-neutral-900 opacity-40 hover:opacity-80"
                      )}
                      style={{
                        minHeight: `${Math.max(sub.heightU * 16, 52)}px`,
                      }}
                    >
                      {/* Subrack Top Bar: U-Slot Range & Category Badge */}
                      <div className="flex items-center justify-between text-[10px] pb-1 border-b border-neutral-800">
                        <div className="flex items-center gap-1 font-mono text-neutral-400">
                          <span className="text-neutral-500">U{sub.uStart}-U{sub.uEnd}</span>
                          <span className="text-neutral-600">({sub.heightU}U)</span>
                        </div>

                        <span
                          className={cn(
                            "text-[9px] px-1.5 py-0.2 rounded-sm font-semibold",
                            meta.bg
                          )}
                        >
                          {meta.label}
                        </span>
                      </div>

                      {/* Subrack Title & Model Code */}
                      <div className="py-1">
                        <h5 className="text-xs font-bold text-white leading-tight">
                          {sub.title}
                        </h5>
                        <span className="text-[10px] font-mono text-neutral-400 block truncate">
                          {sub.modelCode}
                        </span>
                      </div>

                      {/* Status Indicators (LEDs) */}
                      <div className="flex items-center justify-between pt-1 border-t border-neutral-850 text-[9px] font-mono">
                        <div className="flex items-center gap-1.5">
                          {sub.ledIndicators.slice(0, 4).map((led, lIdx) => (
                            <div
                              key={lIdx}
                              className="flex items-center gap-0.5"
                              title={`${led.label}: ${led.state}`}
                            >
                              <span
                                className={cn(
                                  "w-1.5 h-1.5 rounded-full inline-block",
                                  led.color === "green" && "bg-emerald-400 shadow-emerald-400/50 shadow-xs",
                                  led.color === "red" && "bg-rose-500 shadow-rose-500/50 shadow-xs",
                                  led.color === "yellow" && "bg-amber-400 shadow-amber-400/50 shadow-xs",
                                  led.color === "blue" && "bg-sky-400 shadow-sky-400/50 shadow-xs"
                                )}
                              />
                              <span className="text-[8px] text-neutral-400">
                                {led.label}
                              </span>
                            </div>
                          ))}
                        </div>

                        <span className="text-[9px] font-mono text-neutral-400">
                          {sub.safetyLevel}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Rack Bottom Specs */}
              <div className="pt-2 border-t border-neutral-800 text-[10px] font-mono text-neutral-400 space-y-0.5">
                <div>ابعاد: {rack.dimensions}</div>
                <div className="truncate">تغذیه: {rack.powerFeed}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 6. Dedicated Sub-rack Inspector / Technical Component Drilldown */}
      {activeSubrack && (
        <div className="bg-white rounded-2xl border-2 border-neutral-900 p-6 shadow-sm space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-4 border-b border-neutral-200">
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-md bg-neutral-900 text-white">
                  ساب‌رک U{activeSubrack.uStart}-U{activeSubrack.uEnd} ({activeSubrack.heightU}U)
                </span>
                <h4 className="text-base font-bold text-neutral-900">{activeSubrack.title}</h4>
                <span
                  className={cn(
                    "text-xs px-2.5 py-0.5 rounded-full font-semibold border",
                    getCategoryMeta(activeSubrack.category).bg
                  )}
                >
                  {getCategoryMeta(activeSubrack.category).label}
                </span>
                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-sm bg-emerald-50 text-emerald-800 border border-emerald-200">
                  {activeSubrack.safetyLevel}
                </span>
              </div>
              <span className="text-xs font-mono text-neutral-500 block">
                {activeSubrack.titleEn} • کد مستند و مدل: <strong className="text-neutral-800">{activeSubrack.modelCode}</strong>
              </span>
            </div>

            <div className="text-xs font-mono bg-neutral-50 px-3 py-2 rounded-xl border border-neutral-200 space-y-0.5">
              <div>تغذیه و توان: <strong>{activeSubrack.powerSpec}</strong></div>
              <div>گذرگاه و پروتکل: <strong>{activeSubrack.busProtocol}</strong></div>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <span className="text-xs font-bold text-neutral-900 block">
              شرح کارکرد مهندسی در سالن علائم:
            </span>
            <p className="text-xs text-neutral-700 leading-relaxed bg-neutral-50 p-3.5 rounded-xl border border-neutral-200/80">
              {activeSubrack.description}
            </p>
          </div>

          {/* Internal Cards and Components Table */}
          <div className="space-y-2">
            <span className="text-xs font-bold text-neutral-900 block">
              کارت‌ها، ماژول‌ها و تجهیزات سخت‌افزاری داخلی این ساب‌رک:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {activeSubrack.components.map((comp, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl border border-neutral-200 bg-white space-y-1 shadow-2xs hover:border-neutral-300 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-neutral-900">{comp.name}</span>
                    <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded-sm bg-neutral-100 text-neutral-700">
                      {comp.count}× عدد
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-neutral-400 block">
                    {comp.nameEn}
                  </span>
                  <p className="text-[11px] text-neutral-600 leading-relaxed pt-1 border-t border-neutral-100">
                    {comp.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Connectors & LED Indicators */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-neutral-100">
            {/* LED Status Indicators */}
            <div className="space-y-1.5">
              <span className="text-xs font-bold text-neutral-900 block">
                نشانگرهای دیداری روی پانل (Front Panel Status LEDs):
              </span>
              <div className="flex flex-wrap gap-2">
                {activeSubrack.ledIndicators.map((led, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-neutral-50 border border-neutral-200 text-xs font-mono"
                  >
                    <span
                      className={cn(
                        "w-2 h-2 rounded-full",
                        led.color === "green" && "bg-emerald-500",
                        led.color === "red" && "bg-rose-500",
                        led.color === "yellow" && "bg-amber-400",
                        led.color === "blue" && "bg-sky-500"
                      )}
                    />
                    <span className="font-bold text-neutral-800">{led.label}</span>
                    <span className="text-[10px] text-neutral-400">({led.state})</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Ports and Connectors */}
            {activeSubrack.ports && activeSubrack.ports.length > 0 && (
              <div className="space-y-1.5">
                <span className="text-xs font-bold text-neutral-900 block">
                  پورت‌ها و ترمینال‌های اتصال (I/O Connectors):
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {activeSubrack.ports.map((port, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 rounded-md bg-neutral-50 border border-neutral-200 text-xs font-mono text-neutral-700"
                    >
                      {port}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
