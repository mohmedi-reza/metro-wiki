import React, { useState, useMemo, useRef, useEffect } from "react";
import {
  Server,
  Layers,
  ChevronLeft,
  ChevronRight,
  Search,
  Play,
  Info,
  Train,
  ArrowUpRight,
  LayoutGrid,
  Table as TableIcon,
  Shield,
  Activity,
  CheckCircle2,
  ExternalLink,
  Filter,
} from "lucide-react";
import {
  STATIONS_DATABASE,
  SIGNALING_ROOMS_DATABASE,
} from "../data/scadaData";
import { StationData } from "../types/scada";
import { cn } from "../lib/utils";
import { SignalingRoomRacksMap } from "./signaling/SignalingRoomRacksMap";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Tabs, TabsList, TabsTrigger } from "./ui/tabs";

interface StationAtlasPageProps {
  initialTab?: AtlasPrimaryTab;
  initialRoomId?: string;
  onSelectStationInSimulator?: (stationId: number) => void;
  onNavigateToArticle?: (articleId: string, sectionId?: string) => void;
  onBackToEncyclopedia?: () => void;
  onOpenSimulator?: () => void;
}

export type AtlasPrimaryTab = "racks" | "cards" | "table";

export const StationAtlasPage: React.FC<StationAtlasPageProps> = ({
  initialTab = "racks",
  initialRoomId = "SER-01",
  onSelectStationInSimulator,
  onNavigateToArticle,
  onBackToEncyclopedia,
  onOpenSimulator,
}) => {
  const [activeTab, setActiveTab] = useState<AtlasPrimaryTab>(initialTab);
  const [activeSignalingRoomId, setActiveSignalingRoomId] = useState<string>(initialRoomId);
  const [searchQuery, setSearchQuery] = useState("");
  const [platformFilter, setPlatformFilter] = useState<"all" | "island" | "side" | "ser">("all");
  const [selectedStationId, setSelectedStationId] = useState<number | null>(null);
  const stripScrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  useEffect(() => {
    if (initialRoomId) {
      setActiveSignalingRoomId(initialRoomId);
    }
  }, [initialRoomId]);

  const islandCount = useMemo(
    () => STATIONS_DATABASE.filter((s) => s.platformType === "island").length,
    []
  );
  const sideCount = useMemo(
    () => STATIONS_DATABASE.filter((s) => s.platformType === "side").length,
    []
  );
  const serCount = SIGNALING_ROOMS_DATABASE.length;

  // Filtered stations based on search query and category filter
  const filteredStations = useMemo(() => {
    return STATIONS_DATABASE.filter((st) => {
      // Platform filter
      if (platformFilter === "island" && st.platformType !== "island") return false;
      if (platformFilter === "side" && st.platformType !== "side") return false;
      if (platformFilter === "ser" && !st.signalingRoom) return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesName = st.name.toLowerCase().includes(q);
        const matchesPinglish = st.pinglishName.toLowerCase().includes(q);
        const matchesAlias = st.alias ? st.alias.toLowerCase().includes(q) : false;
        const matchesId = String(st.id) === q || `s${st.id}` === q;
        const matchesChainage = st.chainage.includes(q);
        const matchesRoom = st.signalingRoom
          ? st.signalingRoom.id.toLowerCase().includes(q) ||
            st.signalingRoom.title.toLowerCase().includes(q)
          : false;

        return (
          matchesName ||
          matchesPinglish ||
          matchesAlias ||
          matchesId ||
          matchesChainage ||
          matchesRoom
        );
      }

      return true;
    });
  }, [platformFilter, searchQuery]);

  const scrollStrip = (direction: "left" | "right") => {
    if (stripScrollRef.current) {
      const offset = direction === "left" ? -280 : 280;
      stripScrollRef.current.scrollBy({ left: offset, behavior: "smooth" });
    }
  };

  const handleStationClick = (stId: number) => {
    setSelectedStationId(stId);
    const station = STATIONS_DATABASE.find((s) => s.id === stId);
    if (station?.signalingRoom) {
      setActiveSignalingRoomId(station.signalingRoom.id);
    }
    if (activeTab === "cards") {
      const element = document.getElementById(`station-card-${stId}`);
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }
  };

  const openSignalingRoomMap = (roomId: string) => {
    setActiveSignalingRoomId(roomId);
    setActiveTab("racks");
    window.scrollTo({ top: 380, behavior: "smooth" });
  };

  return (
    <div className="flex-1 w-full bg-white text-black overflow-y-auto scroll-smooth">
      {/* Top Breadcrumb & Page Banner */}
      <div className="border-b border-neutral-100 bg-neutral-50/60">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-neutral-500">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onBackToEncyclopedia}
                className="hover:text-black transition-colors font-medium cursor-pointer"
              >
                دانشنامک
              </button>
              <span>/</span>
              <span className="text-black font-semibold">اطلس ایستگاه‌ها و زیرساخت خط ۱</span>
            </div>

            <div className="flex items-center gap-2">
              {onOpenSimulator && (
                <button
                  type="button"
                  onClick={onOpenSimulator}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-black text-white hover:bg-neutral-800 text-xs font-semibold transition-all cursor-pointer shadow-2xs"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>اجرای شبیه‌ساز CTC</span>
                </button>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 tracking-tight">
              اطلس جامع ایستگاه‌ها و چیدمان رک‌های اتاق‌های سیگنالینگ (SER / CER)
            </h1>
            <p className="text-sm text-neutral-600 leading-relaxed max-w-3xl">
              نقشه فنی معماری سالن‌های تجهیزات علائم الکترونیکی، نمای فیزیکی رک‌های ۱۹ اینچ (U01-U42)،
              پروتکل‌های شبکه امن CENELEC EN 50159، رینگ خودترمیم نوری MRP و مشخصات ساختاری ۲۰ ایستگاه خط ۱.
            </p>
          </div>

          {/* Minimal Metric Overview Cards - shown only on stations cards or table views */}
          {activeTab !== "racks" && (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
              <div className="p-3.5 rounded-xl bg-white border border-neutral-200/80 shadow-2xs space-y-1">
                <span className="text-[11px] font-medium text-neutral-500 block">طول کل مسیر خط ۱</span>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-xl font-extrabold font-mono text-neutral-900">۲۰.۲</span>
                  <span className="text-xs text-neutral-500">کیلومتر (۲۰ ایستگاه)</span>
                </div>
              </div>

              <div
                onClick={() => {
                  setActiveTab("racks");
                }}
                className="p-3.5 rounded-xl bg-white border border-neutral-200/80 shadow-2xs space-y-1 hover:border-black transition-colors cursor-pointer group"
              >
                <span className="text-[11px] font-medium text-neutral-500 group-hover:text-black flex items-center justify-between">
                  <span>مراکز سیگنالینگ (SER/CER)</span>
                  <span className="text-[10px] text-neutral-400 group-hover:text-black">مشاهده رک‌ها ←</span>
                </span>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-xl font-extrabold font-mono text-neutral-900">{serCount}</span>
                  <span className="text-xs text-neutral-500">مرکز و سالن علائم</span>
                </div>
              </div>

              <div
                onClick={() => {
                  setActiveTab("cards");
                  setPlatformFilter("island");
                }}
                className="p-3.5 rounded-xl bg-white border border-neutral-200/80 shadow-2xs space-y-1 hover:border-black transition-colors cursor-pointer group"
              >
                <span className="text-[11px] font-medium text-neutral-500 group-hover:text-black flex items-center justify-between">
                  <span>سکوهای جزیره‌ای (Island)</span>
                  <span className="text-[10px] text-neutral-400 group-hover:text-black">فیلتر ←</span>
                </span>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-xl font-extrabold font-mono text-neutral-900">{islandCount}</span>
                  <span className="text-xs text-neutral-500">سکو در وسط خط ۱ و ۲</span>
                </div>
              </div>

              <div
                onClick={() => {
                  setActiveTab("cards");
                  setPlatformFilter("side");
                }}
                className="p-3.5 rounded-xl bg-white border border-neutral-200/80 shadow-2xs space-y-1 hover:border-black transition-colors cursor-pointer group"
              >
                <span className="text-[11px] font-medium text-neutral-500 group-hover:text-black flex items-center justify-between">
                  <span>سکوهای کناری (Side)</span>
                  <span className="text-[10px] text-neutral-400 group-hover:text-black">فیلتر ←</span>
                </span>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-xl font-extrabold font-mono text-neutral-900">{sideCount}</span>
                  <span className="text-xs text-neutral-500">سکو در طرفین ریل‌ها</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Primary View Switcher Shadcn Tabs Bar */}
        <div className="w-full">
          <Tabs
            value={activeTab}
            onValueChange={(val) => setActiveTab(val as AtlasPrimaryTab)}
            className="w-full"
          >
            <TabsList className="w-full grid grid-cols-1 md:grid-cols-3 h-auto p-1 bg-neutral-100 rounded-2xl gap-1 border border-neutral-200 shadow-2xs">
              <TabsTrigger
                value="racks"
                className="py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 truncate cursor-pointer transition-all"
              >
                <Server className="w-4 h-4 shrink-0 text-sky-600" />
                <span className="truncate">نقشه رک‌ها و سالن‌های علائم (SER / CER)</span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded shrink-0 bg-neutral-200/80 text-neutral-700">
                  ۸ اتاق
                </span>
              </TabsTrigger>

              <TabsTrigger
                value="cards"
                className="py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 truncate cursor-pointer transition-all"
              >
                <LayoutGrid className="w-4 h-4 shrink-0 text-emerald-600" />
                <span className="truncate">مشخصات فنی ایستگاه‌ها</span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded shrink-0 bg-neutral-200/80 text-neutral-700">
                  ۲۰ ایستگاه
                </span>
              </TabsTrigger>

              <TabsTrigger
                value="table"
                className="py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 truncate cursor-pointer transition-all"
              >
                <TableIcon className="w-4 h-4 shrink-0 text-amber-600" />
                <span className="truncate">ماتریس ساختار خط ۱</span>
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Section 1: Interactive Linear Schematic Line Strip (shown on stations and table views) */}
        {activeTab !== "racks" && (
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <h2 className="text-base font-bold text-neutral-900 flex items-center gap-2">
                  <Train className="w-4 h-4 text-neutral-700" />
                  <span>دیاگرام خطی و نواری ایستگاه‌های خط ۱</span>
                </h2>
                <p className="text-xs text-neutral-500">
                  پیمایش افقی پیوسته از پایانه شمالی (قدس) تا پایانه جنوبی (دفاع مقدس). کلیک روی هر ایستگاه یا نشان SER رک‌ها و مشخصات آن را باز می‌کند.
                </p>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => scrollStrip("right")}
                  className="p-1.5 rounded-lg border border-neutral-200 hover:bg-neutral-100 text-neutral-600 transition-colors cursor-pointer"
                  title="حرکت به سمت شمال (راست)"
                  aria-label="حرکت به سمت شمال"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => scrollStrip("left")}
                  className="p-1.5 rounded-lg border border-neutral-200 hover:bg-neutral-100 text-neutral-600 transition-colors cursor-pointer"
                  title="حرکت به سمت جنوب (چپ)"
                  aria-label="حرکت به سمت جنوب"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Scrollable schematic line */}
            <div
              ref={stripScrollRef}
              className="w-full overflow-x-auto pb-4 pt-2 scrollbar-thin border border-neutral-200 rounded-xl bg-neutral-50/50 p-4 select-none"
            >
              <div className="min-w-[1750px] relative">
                {/* Connecting Track Line */}
                <div className="absolute top-1/2 -translate-y-1/2 left-4 right-4 h-1 bg-neutral-300 rounded-full" />

                {/* Station Nodes */}
                <div className="relative flex items-center justify-between px-2">
                  {STATIONS_DATABASE.map((st) => {
                    const isSelected = selectedStationId === st.id;
                    const isIsland = st.platformType === "island";
                    const hasSER = Boolean(st.signalingRoom);

                    return (
                      <button
                        key={st.id}
                        type="button"
                        onClick={() => handleStationClick(st.id)}
                        className={cn(
                          "group flex flex-col items-center gap-2 focus:outline-hidden transition-transform cursor-pointer relative z-10",
                          isSelected && "scale-105"
                        )}
                      >
                        {/* Top Badges: Island / SER */}
                        <div className="h-5 flex items-center gap-1">
                          {hasSER && (
                            <span
                              onClick={(e) => {
                                e.stopPropagation();
                                if (st.signalingRoom) {
                                  openSignalingRoomMap(st.signalingRoom.id);
                                }
                              }}
                              title="مشاهده نقشه رک‌های این اتاق"
                              className="text-[9px] px-1 py-0.2 rounded-sm bg-neutral-900 text-white font-mono font-bold hover:bg-black transition-colors cursor-pointer"
                            >
                              SER
                            </span>
                          )}
                          <span
                            className={cn(
                              "text-[9px] px-1 py-0.2 rounded-sm font-mono border",
                              isIsland
                                ? "bg-neutral-100 text-neutral-800 border-neutral-300"
                                : "bg-white text-neutral-500 border-neutral-200"
                            )}
                          >
                            {isIsland ? "جزیره‌ای" : "کناری"}
                          </span>
                        </div>

                        {/* Station Node Point on the line */}
                        <div
                          className={cn(
                            "w-6 h-6 rounded-full flex items-center justify-center font-mono text-[10px] font-bold border-2 transition-all",
                            isSelected
                              ? "bg-black text-white border-black ring-4 ring-neutral-200"
                              : "bg-white text-neutral-700 border-neutral-400 group-hover:border-black group-hover:text-black"
                          )}
                        >
                          {String(st.id).padStart(2, "0")}
                        </div>

                        {/* Station Name & Chainage */}
                        <div className="text-center w-20">
                          <span className="block text-xs font-bold text-neutral-900 truncate group-hover:text-black">
                            {st.name}
                          </span>
                          <span className="block text-[10px] font-mono text-neutral-400">
                            {st.chainage}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </section>
        )}

        {/* =========================================================================
            TAB 1: RACKS & NETWORK MAP VIEW (Primary demanded view)
        ========================================================================= */}
        {activeTab === "racks" && (
          <section className="space-y-6">
            <SignalingRoomRacksMap
              initialRoomId={activeSignalingRoomId}
              onSelectStationInSimulator={onSelectStationInSimulator}
            />
          </section>
        )}

        {/* =========================================================================
            TAB 2: DETAILED STATION CARDS VIEW
        ========================================================================= */}
        {activeTab === "cards" && (
          <section className="space-y-6">
            {/* Minimal Shadcn Controls Bar: Search & Select Filter */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pb-3 border-b border-neutral-100">
              {/* Search Input */}
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 text-neutral-400 absolute start-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="جستجوی نام ایستگاه، کد، کیلومتراژ یا اتاق SER..."
                  className="w-full ps-9 pe-8 py-2 bg-neutral-50 hover:bg-neutral-100/70 focus:bg-white border border-neutral-200 focus:border-neutral-900 rounded-xl text-xs transition-colors focus:outline-hidden"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    className="absolute end-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-black text-xs px-1 cursor-pointer"
                  >
                    ×
                  </button>
                )}
              </div>

              {/* Minimal Platform Filter Dropdown & Clear Filter */}
              <div className="flex items-center gap-2 self-stretch sm:self-auto">
                <div className="w-60 shrink-0">
                  <Select
                    value={platformFilter}
                    onValueChange={(val) => setPlatformFilter(val as any)}
                  >
                    <SelectTrigger className="h-9 bg-neutral-50/70 hover:bg-neutral-100 rounded-xl">
                      <div className="flex items-center gap-1.5 truncate">
                        <Filter className="w-3.5 h-3.5 text-neutral-500 shrink-0" />
                        <span className="truncate">
                          {platformFilter === "all"
                            ? `همه ایستگاه‌ها (${STATIONS_DATABASE.length})`
                            : platformFilter === "island"
                            ? `سکوهای جزیره‌ای (${islandCount})`
                            : platformFilter === "side"
                            ? `سکوهای کناری (${sideCount})`
                            : `دارای اتاق SER (${serCount})`}
                        </span>
                      </div>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">
                        <div className="flex items-center justify-between gap-3 w-full text-right">
                          <span>همه ایستگاه‌ها</span>
                          <span className="text-[10px] text-neutral-500 font-mono">({STATIONS_DATABASE.length})</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="island">
                        <div className="flex items-center justify-between gap-3 w-full text-right">
                          <span>سکوهای جزیره‌ای (Island)</span>
                          <span className="text-[10px] text-neutral-500 font-mono">({islandCount})</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="side">
                        <div className="flex items-center justify-between gap-3 w-full text-right">
                          <span>سکوهای کناری (Side)</span>
                          <span className="text-[10px] text-neutral-500 font-mono">({sideCount})</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="ser">
                        <div className="flex items-center justify-between gap-3 w-full text-right">
                          <span>دارای سالن سیگنالینگ (SER)</span>
                          <span className="text-[10px] text-neutral-500 font-mono">({serCount})</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {platformFilter !== "all" && (
                  <button
                    type="button"
                    onClick={() => setPlatformFilter("all")}
                    className="h-9 px-2.5 rounded-xl border border-neutral-200 bg-white hover:bg-neutral-100 text-neutral-600 text-xs transition-colors shrink-0 cursor-pointer"
                    title="حذف فیلتر"
                  >
                    حذف فیلتر
                  </button>
                )}
              </div>
            </div>

            {/* Results Summary */}
            <div className="flex items-center justify-between text-xs text-neutral-500">
              <span>نمایش {filteredStations.length} ایستگاه از مجموع ۲۰ ایستگاه</span>
              {platformFilter !== "all" && (
                <button
                  type="button"
                  onClick={() => setPlatformFilter("all")}
                  className="text-neutral-500 hover:text-black underline cursor-pointer"
                >
                  حذف فیلترها
                </button>
              )}
            </div>

            {/* Detailed Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredStations.map((station) => {
                const isIsland = station.platformType === "island";
                const isSelected = selectedStationId === station.id;

                return (
                  <div
                    key={station.id}
                    id={`station-card-${station.id}`}
                    className={cn(
                      "p-4 rounded-xl border transition-all space-y-3 bg-white",
                      isSelected
                        ? "border-black ring-2 ring-neutral-200 shadow-sm"
                        : "border-neutral-200/90 hover:border-neutral-300 hover:shadow-2xs"
                    )}
                  >
                    {/* Card Header */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-extrabold text-neutral-400">
                            #{String(station.id).padStart(2, "0")}
                          </span>
                          <h3 className="text-sm font-extrabold text-neutral-900">
                            {station.name}
                          </h3>
                        </div>
                        <span className="text-[11px] font-mono text-neutral-500 block">
                          {station.pinglishName}
                        </span>
                      </div>

                      <span
                        className={cn(
                          "px-2 py-0.5 rounded-full text-[10px] font-semibold border",
                          isIsland
                            ? "bg-neutral-100 text-neutral-800 border-neutral-300"
                            : "bg-neutral-50 text-neutral-600 border-neutral-200"
                        )}
                      >
                        {isIsland ? "سکوی جزیره‌ای" : "سکوی کناری"}
                      </span>
                    </div>

                    {/* Metadata & Key Metrics */}
                    <div className="text-xs text-neutral-600 space-y-1 pt-1 border-t border-neutral-100">
                      <div className="flex items-center justify-between">
                        <span className="text-neutral-400">کیلومتراژ:</span>
                        <span className="font-mono font-bold text-neutral-900">
                          {station.chainage}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-neutral-400">سقف سرعت سکو:</span>
                        <span className="font-mono text-neutral-700">
                          {station.speedLimit} km/h
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-neutral-400">فرمان درب‌های قطار:</span>
                        <span className="font-semibold text-neutral-800">
                          {isIsland ? "سمت چپ (Left Doors)" : "سمت راست (Right Doors)"}
                        </span>
                      </div>
                    </div>

                    {/* Infrastructure Badges */}
                    <div className="flex flex-wrap gap-1 text-[10px]">
                      {station.hasCrossover && (
                        <span className="px-1.5 py-0.5 rounded-sm bg-neutral-100 text-neutral-700 font-medium">
                          کراس‌اور دوبل X
                        </span>
                      )}
                      {station.hasBranchingSwitch && (
                        <span className="px-1.5 py-0.5 rounded-sm bg-neutral-100 text-neutral-700 font-medium">
                          سوزن انشعابی کلیدی
                        </span>
                      )}
                      {station.hasDepotConnection && (
                        <span className="px-1.5 py-0.5 rounded-sm bg-neutral-100 text-neutral-700 font-medium">
                          انشعاب خط دپوی کاوه
                        </span>
                      )}
                    </div>

                    {/* Signaling Room Box */}
                    {station.signalingRoom ? (
                      <div className="p-2.5 rounded-lg bg-neutral-50 border border-neutral-200/80 space-y-1.5 text-xs">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5">
                            <Server className="w-3.5 h-3.5 text-neutral-700" />
                            <span className="font-bold text-neutral-900">
                              {station.signalingRoom.id}
                            </span>
                          </div>
                          <span className="text-[10px] font-mono text-neutral-500">
                            {station.signalingRoom.rackCount} رک تجهیزات
                          </span>
                        </div>
                        <p className="text-[11px] text-neutral-600 leading-snug">
                          {station.signalingRoom.title}
                        </p>
                        
                        {/* Jump directly to Racks map */}
                        <button
                          type="button"
                          onClick={() => openSignalingRoomMap(station.signalingRoom!.id)}
                          className="w-full mt-1.5 py-1 px-2 rounded-md bg-neutral-900 text-white text-[11px] font-semibold hover:bg-neutral-800 transition-colors flex items-center justify-center gap-1 cursor-pointer"
                        >
                          <Server className="w-3 h-3" />
                          <span>مشاهده چیدمان رک‌ها و شبکه {station.signalingRoom.id}</span>
                          <ArrowUpRight className="w-3 h-3" />
                        </button>
                      </div>
                    ) : (
                      <div className="text-[11px] text-neutral-400 py-1">
                        فاقد اتاق تجهیزات مستقل (تحت پوشش SER مجاور)
                      </div>
                    )}

                    {/* Action: Open in Simulator */}
                    {onSelectStationInSimulator && (
                      <button
                        type="button"
                        onClick={() => onSelectStationInSimulator(station.id)}
                        className="w-full py-1.5 px-3 rounded-lg border border-neutral-200 hover:border-black hover:bg-neutral-50 text-xs font-semibold text-neutral-800 hover:text-black flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                      >
                        <Play className="w-3 h-3 fill-current text-neutral-700" />
                        <span>مشاهده در شبیه‌ساز CTC</span>
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* =========================================================================
            TAB 3: TECHNICAL STRUCTURE MATRIX TABLE VIEW
        ========================================================================= */}
        {activeTab === "table" && (
          <section className="space-y-4">
            <div className="border border-neutral-200 rounded-xl overflow-hidden bg-white shadow-2xs">
              <div className="overflow-x-auto">
                <table className="w-full text-right text-xs">
                  <thead className="bg-neutral-50 border-b border-neutral-200 text-neutral-600 font-semibold">
                    <tr>
                      <th className="py-3 px-4">کد</th>
                      <th className="py-3 px-4">نام ایستگاه</th>
                      <th className="py-3 px-4">نوع سکو</th>
                      <th className="py-3 px-4">کیلومتراژ</th>
                      <th className="py-3 px-4">اتاق سیگنالینگ (SER)</th>
                      <th className="py-3 px-4">تجهیزات خطوط و سوزن‌ها</th>
                      <th className="py-3 px-4 text-center">عملیات</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100 text-neutral-700">
                    {filteredStations.map((station) => {
                      const isIsland = station.platformType === "island";

                      return (
                        <tr
                          key={station.id}
                          className="hover:bg-neutral-50/80 transition-colors"
                        >
                          <td className="py-3 px-4 font-mono font-bold text-neutral-400">
                            #{String(station.id).padStart(2, "0")}
                          </td>
                          <td className="py-3 px-4">
                            <span className="font-bold text-neutral-900 block">
                              {station.name}
                            </span>
                            <span className="text-[10px] font-mono text-neutral-400">
                              {station.pinglishName}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <span
                              className={cn(
                                "px-2 py-0.5 rounded-full text-[10px] font-semibold border",
                                isIsland
                                  ? "bg-neutral-100 text-neutral-800 border-neutral-300"
                                  : "bg-neutral-50 text-neutral-600 border-neutral-200"
                              )}
                            >
                              {isIsland ? "جزیره‌ای (درب چپ)" : "کناری (درب راست)"}
                            </span>
                          </td>
                          <td className="py-3 px-4 font-mono font-semibold text-neutral-800">
                            {station.chainage}
                          </td>
                          <td className="py-3 px-4">
                            {station.signalingRoom ? (
                              <button
                                type="button"
                                onClick={() => openSignalingRoomMap(station.signalingRoom!.id)}
                                className="inline-flex items-center gap-1 font-mono font-bold px-2 py-0.5 rounded-sm bg-neutral-900 text-white text-[11px] hover:bg-neutral-800 transition-colors cursor-pointer"
                              >
                                <span>{station.signalingRoom.id}</span>
                                <ArrowUpRight className="w-3 h-3" />
                              </button>
                            ) : (
                              <span className="text-neutral-400 text-[11px]">تحت پوشش SER مجاور</span>
                            )}
                          </td>
                          <td className="py-3 px-4 text-[11px] text-neutral-600">
                            {station.hasCrossover && "کراس‌اور دوبل • "}
                            {station.hasBranchingSwitch && "سوزن انشعابی • "}
                            {station.hasDepotConnection && "انشعاب دپو • "}
                            {!station.hasCrossover &&
                              !station.hasBranchingSwitch &&
                              !station.hasDepotConnection &&
                              "بلاک مستقیم دوخطه"}
                          </td>
                          <td className="py-3 px-4 text-center">
                            {onSelectStationInSimulator && (
                              <button
                                type="button"
                                onClick={() => onSelectStationInSimulator(station.id)}
                                className="px-2.5 py-1 rounded-md bg-neutral-100 hover:bg-black hover:text-white text-[11px] font-semibold transition-colors cursor-pointer"
                              >
                                شبیه‌ساز
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        )}
      </div>
    </div>
  );
};
