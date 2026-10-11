import React, { useState } from "react";
import {
  X,
  MapPin,
  Server,
  Layers,
  ArrowRightLeft,
  ShieldCheck,
  Cpu,
  Radio,
  ExternalLink,
  Sliders,
  CheckCircle2,
  Maximize2,
  Info,
  ChevronRight,
  Eye,
  Train,
  SlidersHorizontal,
} from "lucide-react";
import {
  STATIONS_DATABASE,
  SIGNALING_ROOMS_DATABASE,
} from "../data/scadaData";
import { StationData, SignalingRoomInfo } from "../types/scada";

interface StationAtlasModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectStationInSimulator?: (stationId: number) => void;
  onNavigateToArticle?: (articleId: string, sectionId?: string) => void;
}

export const StationAtlasModal: React.FC<StationAtlasModalProps> = ({
  isOpen,
  onClose,
  onSelectStationInSimulator,
  onNavigateToArticle,
}) => {
  const [activeTab, setActiveTab] = useState<"map" | "stations" | "rooms" | "guide">("map");
  const [platformFilter, setPlatformFilter] = useState<"all" | "island" | "side" | "ser">("all");
  const [selectedStation, setSelectedStation] = useState<StationData>(STATIONS_DATABASE[6]); // Kaveh default
  const [selectedRoom, setSelectedRoom] = useState<SignalingRoomInfo | null>(
    STATIONS_DATABASE[6].signalingRoom || null
  );

  if (!isOpen) return null;

  // Filtered station list
  const filteredStations = STATIONS_DATABASE.filter((st) => {
    if (platformFilter === "island") return st.platformType === "island";
    if (platformFilter === "side") return st.platformType === "side";
    if (platformFilter === "ser") return Boolean(st.signalingRoom);
    return true;
  });

  const islandCount = STATIONS_DATABASE.filter((s) => s.platformType === "island").length;
  const sideCount = STATIONS_DATABASE.filter((s) => s.platformType === "side").length;
  const serCount = SIGNALING_ROOMS_DATABASE.length;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-2 sm:p-4 bg-black/75 backdrop-blur-xs select-none">
      <div className="relative w-full max-w-6xl max-h-[92vh] flex flex-col bg-white rounded-2xl shadow-2xl border border-neutral-200 overflow-hidden font-sans text-right text-xs">
        {/* Header */}
        <div className="px-5 py-3.5 bg-neutral-900 text-white flex items-center justify-between border-b border-neutral-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-extrabold text-white">
                  اطلس جامع ایستگاه‌ها، سکوهای جزیره‌ای و اتاق‌های سیگنالینگ (SER / CER)
                </h2>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono font-semibold border border-emerald-500/30">
                  خط ۱ مترو اصفهان
                </span>
              </div>
              <p className="text-[11px] text-neutral-400">
                ماتریس ساختار ۲۱ ایستگاه، تفکیک سکوهای جزیره‌ای در برابر کناری و مکان‌یابی اتاق‌های اینترلاکینگ و کنترل محلی LCP
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg bg-neutral-800 text-neutral-400 hover:text-white hover:bg-neutral-700 transition-colors cursor-pointer"
            aria-label="بستن پنجره"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Top Summary Bar */}
        <div className="px-5 py-2.5 bg-neutral-100 border-b border-neutral-200 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
          <div className="flex items-center gap-2 p-2 rounded-lg bg-white border border-neutral-200/70 shadow-2xs">
            <MapPin className="w-4 h-4 text-neutral-700 shrink-0" />
            <div>
              <span className="text-[10px] text-neutral-500 block">کل ایستگاه‌های خط ۱</span>
              <span className="font-extrabold text-neutral-900 font-mono">۲۰ ایستگاه مسافربری</span>
            </div>
          </div>

          <div className="flex items-center gap-2 p-2 rounded-lg bg-cyan-50/80 border border-cyan-200 shadow-2xs">
            <Layers className="w-4 h-4 text-cyan-600 shrink-0" />
            <div>
              <span className="text-[10px] text-cyan-700 block">سکوهای جزیره‌ای (Island)</span>
              <span className="font-extrabold text-cyan-900 font-mono">
                {islandCount} ایستگاه (وسط خط ۱ و ۲)
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 p-2 rounded-lg bg-amber-50/80 border border-amber-200 shadow-2xs">
            <SlidersHorizontal className="w-4 h-4 text-amber-600 shrink-0" />
            <div>
              <span className="text-[10px] text-amber-700 block">سکوهای کناری (Side)</span>
              <span className="font-extrabold text-amber-900 font-mono">
                {sideCount} ایستگاه (طرفین ریل‌ها)
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 p-2 rounded-lg bg-emerald-50/80 border border-emerald-200 shadow-2xs">
            <Server className="w-4 h-4 text-emerald-600 shrink-0" />
            <div>
              <span className="text-[10px] text-emerald-700 block">اتاق‌های سیگنالینگ (SER/CER)</span>
              <span className="font-extrabold text-emerald-900 font-mono">
                {serCount} مرکز و اتاق تجهیزات
              </span>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center justify-between px-5 pt-3 pb-2 border-b border-neutral-200 bg-white">
          <div className="flex items-center gap-1.5 p-1 bg-neutral-100 rounded-xl">
            <button
              type="button"
              onClick={() => setActiveTab("map")}
              className={`px-3 py-1.5 rounded-lg font-bold text-xs transition-all cursor-pointer ${
                activeTab === "map"
                  ? "bg-white text-black shadow-xs"
                  : "text-neutral-600 hover:text-black"
              }`}
            >
              نقشه و دیاگرام شماتیک
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("stations")}
              className={`px-3 py-1.5 rounded-lg font-bold text-xs transition-all cursor-pointer ${
                activeTab === "stations"
                  ? "bg-white text-black shadow-xs"
                  : "text-neutral-600 hover:text-black"
              }`}
            >
              فهرست و ماتریس ۲۰ ایستگاه
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("rooms")}
              className={`px-3 py-1.5 rounded-lg font-bold text-xs transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === "rooms"
                  ? "bg-white text-black shadow-xs"
                  : "text-neutral-600 hover:text-black"
              }`}
            >
              <span>اتاق‌های سیگنالینگ (SER/CER)</span>
              <span className="px-1.5 py-0.2 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-mono">
                {serCount}
              </span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("guide")}
              className={`px-3 py-1.5 rounded-lg font-bold text-xs transition-all cursor-pointer ${
                activeTab === "guide"
                  ? "bg-white text-black shadow-xs"
                  : "text-neutral-600 hover:text-black"
              }`}
            >
              راهنمای مهندسی سکوها و درب‌ها
            </button>
          </div>

          {onNavigateToArticle && (
            <button
              type="button"
              onClick={() => {
                onClose();
                onNavigateToArticle("railway-signaling", "station-technical-matrix");
              }}
              className="text-neutral-600 hover:text-black text-xs font-semibold flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-neutral-100 transition-colors cursor-pointer"
            >
              <span>مشاهده در متن دانشنامه</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Tab 1: Schematic Interactive Map */}
        {activeTab === "map" && (
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {/* Legend & Filter Controls */}
            <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2">
                <span className="font-bold text-neutral-800">فیلتر نمایش سکوها:</span>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setPlatformFilter("all")}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-colors cursor-pointer ${
                      platformFilter === "all"
                        ? "bg-neutral-900 text-white"
                        : "bg-white text-neutral-600 border border-neutral-200 hover:bg-neutral-100"
                    }`}
                  >
                    همه (۲۰)
                  </button>
                  <button
                    type="button"
                    onClick={() => setPlatformFilter("island")}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-colors cursor-pointer ${
                      platformFilter === "island"
                        ? "bg-cyan-600 text-white"
                        : "bg-white text-cyan-800 border border-cyan-200 hover:bg-cyan-50"
                    }`}
                  >
                    سکو جزیره‌ای ({islandCount})
                  </button>
                  <button
                    type="button"
                    onClick={() => setPlatformFilter("side")}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-colors cursor-pointer ${
                      platformFilter === "side"
                        ? "bg-amber-600 text-white"
                        : "bg-white text-amber-800 border border-amber-200 hover:bg-amber-50"
                    }`}
                  >
                    سکو کناری ({sideCount})
                  </button>
                  <button
                    type="button"
                    onClick={() => setPlatformFilter("ser")}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-colors cursor-pointer ${
                      platformFilter === "ser"
                        ? "bg-emerald-600 text-white"
                        : "bg-white text-emerald-800 border border-emerald-200 hover:bg-emerald-50"
                    }`}
                  >
                    اتاق سیگنالینگ ({serCount})
                  </button>
                </div>
              </div>

              {/* Visual Legend */}
              <div className="flex items-center gap-3 text-[11px] text-neutral-600">
                <div className="flex items-center gap-1.5">
                  <span className="w-3.5 h-2 rounded-xs bg-cyan-100 border border-cyan-400" />
                  <span>سکوی جزیره‌ای (میان خط ۱ و ۲)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3.5 h-2 rounded-xs bg-amber-100 border border-amber-400" />
                  <span>سکوی کناری (طرفین خطوط)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  <span>اتاق سیگنالینگ (SER/CER)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <ArrowRightLeft className="w-3 h-3 text-indigo-600" />
                  <span>کراس‌اور تغییر خط</span>
                </div>
              </div>
            </div>

            {/* Scrollable Schematic SVG Ribbon */}
            <div className="border border-neutral-200 rounded-xl bg-slate-900 p-4 overflow-x-auto shadow-inner text-white">
              <div className="text-[11px] text-slate-400 pb-2 flex items-center justify-between">
                <span>نمای شماتیک افقی خط ۱ (شمال به جنوب: ایستگاه ۰۱ قدس در سمت راست ◄ ایستگاه ۲۰ دفاع مقدس در سمت چپ)</span>
                <span className="font-mono text-emerald-400">طول کل: ۲۱/۱۱۴ کیلومتر</span>
              </div>

              <div className="min-w-[1400px] py-4 relative">
                {/* Horizontal Tracks */}
                {/* Line 1 (Track 1) Northbound */}
                <div className="absolute top-[48px] left-0 right-0 h-[3px] bg-slate-600" />
                <span className="absolute top-[32px] right-2 text-[10px] font-mono text-cyan-400 font-bold">
                  خط ۱ (به سمت قدس - شمال) ◄
                </span>

                {/* Line 2 (Track 2) Southbound */}
                <div className="absolute top-[120px] left-0 right-0 h-[3px] bg-slate-600" />
                <span className="absolute top-[128px] right-2 text-[10px] font-mono text-emerald-400 font-bold">
                  خط ۲ (به سمت صفه - جنوب) ►
                </span>

                {/* 20 Stations Nodes along the ribbon */}
                <div className="flex justify-between items-center relative z-10 pt-2 pb-6">
                  {/* Reversed array so Station 1 is at the right (RTL North) and Station 20 at left (South) */}
                  {[...STATIONS_DATABASE].reverse().map((st) => {
                    const isSelected = selectedStation.id === st.id;
                    const isIsland = st.platformType === "island";
                    const hasSER = Boolean(st.signalingRoom);

                    const isDimmed =
                      (platformFilter === "island" && !isIsland) ||
                      (platformFilter === "side" && isIsland) ||
                      (platformFilter === "ser" && !hasSER);

                    return (
                      <div
                        key={`ribbon-st-${st.id}`}
                        onClick={() => setSelectedStation(st)}
                        className={`flex flex-col items-center w-16 cursor-pointer group transition-all duration-150 ${
                          isDimmed ? "opacity-30 hover:opacity-75" : "opacity-100"
                        }`}
                      >
                        {/* SER Room Indicator Above Track 1 if exists */}
                        <div className="h-6 flex items-center justify-center">
                          {hasSER ? (
                            <span
                              className={`px-1.5 py-0.5 rounded-full text-[9px] font-mono font-bold flex items-center gap-0.5 ${
                                st.signalingRoom?.type === "CER"
                                  ? "bg-purple-600 text-white shadow-xs animate-pulse"
                                  : "bg-emerald-600 text-white"
                              }`}
                              title={st.signalingRoom?.title}
                            >
                              <Server className="w-2.5 h-2.5" />
                              {st.signalingRoom?.type === "CER" ? "CER" : "SER"}
                            </span>
                          ) : (
                            <span className="h-4" />
                          )}
                        </div>

                        {/* Top Platform (If Side Platform) */}
                        <div className="h-4 flex items-center justify-center">
                          {!isIsland ? (
                            <div
                              className={`w-11 h-2 rounded-xs border transition-colors ${
                                isSelected
                                  ? "bg-amber-400 border-white shadow-xs"
                                  : "bg-amber-500/30 border-amber-400/60"
                              }`}
                              title="سکوی طرفین (خط ۱)"
                            />
                          ) : (
                            <span className="h-2" />
                          )}
                        </div>

                        {/* Track 1 Node */}
                        <div
                          className={`w-3.5 h-3.5 rounded-full my-1 border-2 transition-transform group-hover:scale-125 ${
                            isSelected
                              ? "bg-white border-cyan-400 shadow-md scale-110"
                              : "bg-slate-800 border-slate-400"
                          }`}
                        />

                        {/* Island Platform (Between Tracks) */}
                        <div className="h-8 flex items-center justify-center">
                          {isIsland ? (
                            <div
                              className={`w-12 h-5 rounded-xs border flex items-center justify-center transition-all ${
                                isSelected
                                  ? "bg-cyan-500 text-white border-white shadow-md scale-105"
                                  : "bg-cyan-950/90 text-cyan-300 border-cyan-500/60"
                              }`}
                              title="سکوی جزیره‌ای (میان خط ۱ و ۲)"
                            >
                              <span className="text-[8px] font-bold font-sans">جزیره</span>
                            </div>
                          ) : (
                            <div className="w-0.5 h-6 bg-slate-700/50" />
                          )}
                        </div>

                        {/* Track 2 Node */}
                        <div
                          className={`w-3.5 h-3.5 rounded-full my-1 border-2 transition-transform group-hover:scale-125 ${
                            isSelected
                              ? "bg-white border-emerald-400 shadow-md scale-110"
                              : "bg-slate-800 border-slate-400"
                          }`}
                        />

                        {/* Bottom Platform (If Side Platform) */}
                        <div className="h-4 flex items-center justify-center">
                          {!isIsland ? (
                            <div
                              className={`w-11 h-2 rounded-xs border transition-colors ${
                                isSelected
                                  ? "bg-amber-400 border-white shadow-xs"
                                  : "bg-amber-500/30 border-amber-400/60"
                              }`}
                              title="سکوی طرفین (خط ۲)"
                            />
                          ) : (
                            <span className="h-2" />
                          )}
                        </div>

                        {/* Station Name & Number */}
                        <div className="mt-2 text-center">
                          <span
                            className={`font-mono text-[9.5px] block font-bold ${
                              isSelected ? "text-cyan-400" : "text-slate-400"
                            }`}
                          >
                            {st.id.toString().padStart(2, "0")}
                          </span>
                          <span
                            className={`text-[10px] block font-bold truncate max-w-[62px] ${
                              isSelected ? "text-white" : "text-slate-300"
                            }`}
                          >
                            {st.name}
                          </span>
                          <span className="text-[8.5px] text-slate-500 font-mono block">
                            {st.chainage}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Selected Station Detailed Card */}
            <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-200 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2 md:col-span-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-7 h-7 rounded-lg bg-neutral-900 text-white font-mono font-bold flex items-center justify-center text-xs">
                      {selectedStation.id.toString().padStart(2, "0")}
                    </span>
                    <div>
                      <h3 className="font-extrabold text-sm text-neutral-900">
                        ایستگاه {selectedStation.fullName}
                      </h3>
                      <p className="text-[11px] text-neutral-500 font-mono">
                        {selectedStation.pinglishName} | کیلومتراژ: {selectedStation.chainage}
                      </p>
                    </div>
                  </div>

                  <span
                    className={`px-2.5 py-1 rounded-full text-xs font-bold border ${
                      selectedStation.platformType === "island"
                        ? "bg-cyan-100 text-cyan-800 border-cyan-300"
                        : "bg-amber-100 text-amber-800 border-amber-300"
                    }`}
                  >
                    {selectedStation.platformType === "island" ? "سکوی جزیره‌ای (Island)" : "سکوی کناری (Side)"}
                  </span>
                </div>

                <p className="text-neutral-700 text-xs leading-relaxed">
                  {selectedStation.platformDescription}
                </p>

                {/* Signaling Equipment Room Details if available */}
                {selectedStation.signalingRoom ? (
                  <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-200 space-y-1.5 mt-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 font-bold text-emerald-900 text-xs">
                        <Server className="w-3.5 h-3.5 text-emerald-700" />
                        <span>{selectedStation.signalingRoom.title}</span>
                      </div>
                      <span className="text-[10px] px-2 py-0.5 rounded-sm bg-emerald-200 text-emerald-900 font-mono font-bold">
                        {selectedStation.signalingRoom.id}
                      </span>
                    </div>
                    <p className="text-[11px] text-emerald-950 leading-relaxed">
                      {selectedStation.signalingRoom.description}
                    </p>
                    <div className="pt-1 flex flex-wrap gap-1">
                      {selectedStation.signalingRoom.equipment.map((eq, i) => (
                        <span
                          key={i}
                          className="px-1.5 py-0.5 rounded-sm bg-white text-emerald-800 text-[10px] border border-emerald-200 font-medium"
                        >
                          • {eq}
                        </span>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="p-2.5 bg-neutral-100 rounded-lg border border-neutral-200 text-neutral-500 text-[11px] flex items-center gap-2">
                    <Info className="w-3.5 h-3.5" />
                    <span>
                      این ایستگاه دارای اتاق مستقل اینترلاکینگ نیست و تجهیزات تراک آن تحت فرمان نزدیک‌ترین اتاق سیگنالینگ (SER) کنترل می‌شود.
                    </span>
                  </div>
                )}
              </div>

              {/* Action Buttons & Quick Attributes */}
              <div className="flex flex-col justify-between p-3 bg-white rounded-lg border border-neutral-200/80 space-y-3">
                <div className="space-y-2 text-[11px]">
                  <span className="font-bold text-neutral-800 block text-xs">امکانات ایستگاه:</span>
                  <div className="flex items-center justify-between text-neutral-600">
                    <span>کراس‌اور تغییر خط:</span>
                    <span className="font-bold">
                      {selectedStation.hasCrossover ? "دارد ✓" : "ندارد ✕"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-neutral-600">
                    <span>سوزن انشعابی تقاطعی:</span>
                    <span className="font-bold">
                      {selectedStation.hasBranchingSwitch ? "دارد ✓" : "ندارد ✕"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-neutral-600">
                    <span>کلیدهای توقف اضطراری ESP:</span>
                    <span className="font-bold text-emerald-700">۲ شستی در طرفین</span>
                  </div>
                  <div className="flex items-center justify-between text-neutral-600">
                    <span>پانل کنترل محلی (LCP):</span>
                    <span className="font-bold">
                      {selectedStation.signalingRoom?.lcpAvailable ? "مستقر در SER ✓" : "ندارد"}
                    </span>
                  </div>
                </div>

                {onSelectStationInSimulator && (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onSelectStationInSimulator(selectedStation.id);
                    }}
                    className="w-full py-2 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-sm active:scale-95"
                  >
                    <Train className="w-3.5 h-3.5" />
                    <span>مشاهده زنده در شبیه‌ساز CTC</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: 20 Stations Directory & Matrix */}
        {activeTab === "stations" && (
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-neutral-500">
                نمایش {filteredStations.length} ایستگاه از ۲۰ ایستگاه خط ۱
              </span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setPlatformFilter("all")}
                  className={`px-2.5 py-1 rounded-md text-xs font-semibold cursor-pointer ${
                    platformFilter === "all" ? "bg-black text-white" : "bg-neutral-100 text-neutral-700 hover:bg-neutral-200"
                  }`}
                >
                  همه
                </button>
                <button
                  type="button"
                  onClick={() => setPlatformFilter("island")}
                  className={`px-2.5 py-1 rounded-md text-xs font-semibold cursor-pointer ${
                    platformFilter === "island" ? "bg-cyan-600 text-white" : "bg-cyan-50 text-cyan-800 hover:bg-cyan-100"
                  }`}
                >
                  فقط سکو جزیره‌ای ({islandCount})
                </button>
                <button
                  type="button"
                  onClick={() => setPlatformFilter("side")}
                  className={`px-2.5 py-1 rounded-md text-xs font-semibold cursor-pointer ${
                    platformFilter === "side" ? "bg-amber-600 text-white" : "bg-amber-50 text-amber-800 hover:bg-amber-100"
                  }`}
                >
                  فقط سکو کناری ({sideCount})
                </button>
              </div>
            </div>

            <div className="border border-neutral-200 rounded-xl overflow-hidden shadow-2xs">
              <table className="w-full text-right text-xs">
                <thead className="bg-neutral-100 text-neutral-700 border-b border-neutral-200 font-bold">
                  <tr>
                    <th className="py-2.5 px-3">شماره</th>
                    <th className="py-2.5 px-3">نام ایستگاه</th>
                    <th className="py-2.5 px-3">کد پینگلیش SCADA</th>
                    <th className="py-2.5 px-3">کیلومتراژ</th>
                    <th className="py-2.5 px-3">نوع سکو</th>
                    <th className="py-2.5 px-3">اتاق سیگنالینگ (SER/CER)</th>
                    <th className="py-2.5 px-3">کراس‌اور / انشعاب</th>
                    <th className="py-2.5 px-3 text-center">عملیات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-200/70">
                  {filteredStations.map((st) => (
                    <tr
                      key={`st-row-${st.id}`}
                      className="hover:bg-neutral-50 transition-colors cursor-pointer"
                      onClick={() => {
                        setSelectedStation(st);
                        setActiveTab("map");
                      }}
                    >
                      <td className="py-2.5 px-3 font-mono font-bold text-neutral-900">
                        {st.id.toString().padStart(2, "0")}
                      </td>
                      <td className="py-2.5 px-3 font-bold text-neutral-900">
                        {st.fullName}
                      </td>
                      <td className="py-2.5 px-3 font-mono text-neutral-600">
                        {st.pinglishName}
                      </td>
                      <td className="py-2.5 px-3 font-mono text-neutral-600">
                        {st.chainage}
                      </td>
                      <td className="py-2.5 px-3">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10.5px] font-bold ${
                            st.platformType === "island"
                              ? "bg-cyan-100 text-cyan-800 border border-cyan-200"
                              : "bg-amber-100 text-amber-800 border border-amber-200"
                          }`}
                        >
                          {st.platformType === "island" ? "جزیره‌ای (Island)" : "طرفین (Side)"}
                        </span>
                      </td>
                      <td className="py-2.5 px-3">
                        {st.signalingRoom ? (
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                              st.signalingRoom.type === "CER"
                                ? "bg-purple-100 text-purple-800 border border-purple-200"
                                : "bg-emerald-100 text-emerald-800 border border-emerald-200"
                            }`}
                          >
                            <Server className="w-2.5 h-2.5" />
                            {st.signalingRoom.id}
                          </span>
                        ) : (
                          <span className="text-neutral-400 text-[11px]">—</span>
                        )}
                      </td>
                      <td className="py-2.5 px-3 text-[11px] text-neutral-600">
                        {st.hasCrossover && <span className="text-indigo-600 font-semibold me-1.5">• کراس‌اور</span>}
                        {st.hasBranchingSwitch && <span className="text-purple-600 font-semibold">• سوزن انشعاب</span>}
                        {!st.hasCrossover && !st.hasBranchingSwitch && <span className="text-neutral-400">بلاک مستقیم</span>}
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (onSelectStationInSimulator) {
                              onClose();
                              onSelectStationInSimulator(st.id);
                            }
                          }}
                          className="px-2 py-1 rounded bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-[10.5px] font-semibold transition-colors cursor-pointer"
                        >
                          پرش به نقشه
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 3: Detailed Signaling Rooms (SER/CER) Directory */}
        {activeTab === "rooms" && (
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200 text-neutral-700 leading-relaxed text-xs">
              <h4 className="font-extrabold text-neutral-900 flex items-center gap-1.5 mb-1">
                <Server className="w-4 h-4 text-emerald-600" />
                معماری اتاق‌های سیگنالینگ و مراکز اینترلاکینگ خط ۱ (CER / SER / LCP)
              </h4>
              <p>
                اتاق‌های تجهیزات سیگنالینگ ایستگاهی (SER - Signal Equipment Room) و مرکز کنترل مرکزی (CER/OCC) مکان استقرار راک‌های حیاتی سیستم اینترلاکینگ الکترونیکی (<span className="font-semibold text-black">EIL</span>)، ساب‌رک‌های عملگر کنار خط (<span className="font-semibold text-black">TFC</span>)، کامپیوترهای پانل کنترل محلی (<span className="font-semibold text-black">LCP</span>) و لینک‌های فیبر نوری CTC هستند.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {SIGNALING_ROOMS_DATABASE.map((room) => {
                const isSelected = selectedRoom?.id === room.id;
                const station = STATIONS_DATABASE.find((s) => s.id === room.stationId);

                return (
                  <div
                    key={room.id}
                    onClick={() => setSelectedRoom(room)}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer space-y-2.5 ${
                      isSelected
                        ? "bg-emerald-50/50 border-emerald-400 shadow-sm"
                        : "bg-white border-neutral-200 hover:border-neutral-300"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span
                          className={`w-7 h-7 rounded-lg font-mono font-bold text-xs flex items-center justify-center ${
                            room.type === "CER"
                              ? "bg-purple-600 text-white"
                              : "bg-emerald-600 text-white"
                          }`}
                        >
                          {room.type}
                        </span>
                        <div>
                          <h5 className="font-bold text-neutral-900 text-xs">{room.title}</h5>
                          <span className="text-[10px] text-neutral-500 font-mono">
                            کد اتاق: {room.id} | ایستگاه: {room.stationName}
                          </span>
                        </div>
                      </div>

                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-neutral-100 font-mono text-neutral-700 font-semibold">
                        {room.rackCount} رک فنی
                      </span>
                    </div>

                    <p className="text-[11px] text-neutral-600 leading-relaxed">
                      {room.description}
                    </p>

                    <div className="pt-1 border-t border-neutral-200/60 flex flex-wrap items-center justify-between gap-1 text-[10.5px]">
                      <span className="text-neutral-500">
                        پانل محلی LCP:{" "}
                        <strong className="text-neutral-900 font-semibold">
                          {room.lcpAvailable ? "مستقر و فعال ✓" : "ندارد"}
                        </strong>
                      </span>

                      {onSelectStationInSimulator && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onClose();
                            onSelectStationInSimulator(room.stationId);
                          }}
                          className="text-emerald-700 hover:text-emerald-800 font-bold flex items-center gap-1 cursor-pointer"
                        >
                          <span>مشاهده در CTC</span>
                          <ChevronRight className="w-3.5 h-3.5 rotate-180" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Tab 4: Platform Engineering Guide (جزیره‌ای vs کناری) */}
        {activeTab === "guide" && (
          <div className="flex-1 overflow-y-auto p-4 space-y-4 leading-relaxed text-xs text-neutral-800">
            {/* Island vs Side Comparison Card */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-cyan-50/70 border border-cyan-200 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-cyan-600" />
                  <h4 className="font-bold text-cyan-950 text-xs">
                    ویژگی‌های سکوی جزیره‌ای (Island Platform) در خط ۱
                  </h4>
                </div>
                <p className="text-[11.5px] text-cyan-900">
                  در سکوی جزیره‌ای، سکوی مسافرگیری در مرکز قرار داشته و ریل خط ۱ و ریل خط ۲ در دو طرف آن قرار دارند.
                </p>
                <ul className="list-disc list-inside space-y-1 text-[11px] text-cyan-950">
                  <li>
                    <strong>۹ ایستگاه خط ۱ جزیره‌ای هستند:</strong> کاوه، شهدا، تختی، امام حسین، انقلاب، سی و سه پل، دکتر شریعتی، آزادی، دانشگاه.
                  </li>
                  <li>
                    <strong>سیستم باز شدن درب قطار (Door Control):</strong> در ایستگاه‌های جزیره‌ای، درب‌های سمت <strong>چپ</strong> کابین راهبر هنگام توقف باز می‌شوند (سیستم ATO بر اساس ترانسپوندر B0 فرمان باز شدن درب‌های چپ را صادر می‌کند).
                  </li>
                  <li>
                    <strong>مزیت عملیاتی:</strong> تسهیل تبادل مسافر میان قطارهای رفت و برگشت بدون نیاز به پل یا زیرگذر و دسترسی سریع به پله‌های برقی خروجی.
                  </li>
                </ul>
              </div>

              <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-amber-600" />
                  <h4 className="font-bold text-amber-950 text-xs">
                    ویژگی‌های سکوی کناری (Side Platform) در خط ۱
                  </h4>
                </div>
                <p className="text-[11.5px] text-amber-900">
                  در سکوی کناری، هر خط دارای سکوی مستقل در سمت بیرونی خود است و خطوط ریلی در وسط واقع شده‌اند.
                </p>
                <ul className="list-disc list-inside space-y-1 text-[11px] text-amber-950">
                  <li>
                    <strong>۱۱ ایستگاه خط ۱ کناری هستند:</strong> قدس، بهارستان، گلستان، مفتح، علیخانی، جابر، چمران، باهنر، کارگر، کوی امام، دفاع مقدس.
                  </li>
                  <li>
                    <strong>سیستم باز شدن درب قطار (Door Control):</strong> در ایستگاه‌های کناری، درب‌های سمت <strong>راست</strong> کابین راهبر در جهت حرکت باز می‌شوند.
                  </li>
                  <li>
                    <strong>کلیدهای توقف اضطراری (ESP):</strong> در سکوهای کناری، کلیدهای ESP هر سکو مستقل بوده و فشردن کلید سکوی خط ۱ تنها خط ۱ را قرمز می‌کند.
                  </li>
                </ul>
              </div>
            </div>

            {/* Emergency and Stopping Architecture */}
            <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-200 space-y-2">
              <h4 className="font-bold text-neutral-900 text-xs flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                استاندارد طول سکوها و توقف دقیق (Precision Stopping)
              </h4>
              <p className="text-[11.5px] text-neutral-700">
                کلیه سکوهای خط ۱ به طول استاندارد <strong>۱۰۰ متر</strong> جهت پذیرش قطارهای ۵ واگنه طراحی شده‌اند. سیستم هدایت خودکار (ATO) با تکیه بر بازخوانی ۳ ترانسپوندر متوالی سکو (B1 در فاصله ۳۲۰ متری، B2 در ۲۰ متری، B3 در ۲ متری و B0 پای نقطه توقف نهایی)، قطار را با خطای کمتر از <strong>۲۵ سانتی‌متر</strong> متوقف می‌سازد تا درب‌های ناوگان دقیقاً منطبق بر نشانه سکو باز شوند.
              </p>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="px-5 py-2.5 bg-neutral-100 border-t border-neutral-200 flex items-center justify-between text-xs text-neutral-500">
          <span>استاندارد مستندات مهندسی مهاران EUR01881 و راهنمای کاربری اینترلاکینگ خط ۱</span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-neutral-900 text-white font-bold hover:bg-black transition-colors cursor-pointer"
          >
            بستن اطلس
          </button>
        </div>
      </div>
    </div>
  );
};
