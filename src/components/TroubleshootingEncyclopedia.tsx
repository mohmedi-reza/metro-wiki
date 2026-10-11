import React, { useState, useMemo } from "react";
import {
  TROUBLESHOOTING_INCIDENTS_DATABASE,
  TroubleshootingIncident,
  IncidentCategory,
  IncidentSeverity,
} from "../data/troubleshootingData";
import {
  Search,
  AlertOctagon,
  AlertTriangle,
  Info,
  ShieldAlert,
  Wrench,
  CheckCircle2,
  Copy,
  Check,
  ChevronDown,
  ChevronLeft,
  Server,
  BookOpen,
  Filter,
  Layers,
  Sparkles,
  Activity,
  Cpu,
  Network,
  Zap,
  Train,
  Clock,
  Printer,
  RotateCcw,
} from "lucide-react";
import { cn } from "../lib/utils";

interface TroubleshootingEncyclopediaProps {
  onNavigateToArticle?: (articleId: string, sectionId?: string) => void;
  onOpenRacksMap?: (tab?: "racks" | "cards" | "table") => void;
  className?: string;
}

const CATEGORIES: { label: string; value: IncidentCategory | "all"; icon: React.FC<{ className?: string }> }[] = [
  { label: "همه حوزه‌ها", value: "all", icon: Layers },
  { label: "سیگنالینگ و اینترلاکینگ", value: "سیگنالینگ و اینترلاکینگ", icon: Cpu },
  { label: "شبکه و مخابرات", value: "شبکه و مخابرات", icon: Network },
  { label: "ناوگان و ATP", value: "ناوگان و ATP", icon: Train },
  { label: "تجهیزات خط و رک‌ها", value: "تجهیزات خط و رک‌ها", icon: Server },
  { label: "تغذیه و توان", value: "تغذیه و توان", icon: Zap },
];

const SEVERITIES: { label: string; value: IncidentSeverity | "all"; color: string }[] = [
  { label: "همه سطوح", value: "all", color: "neutral" },
  { label: "بحرانی (Critical)", value: "بحرانی (Critical)", color: "rose" },
  { label: "شدید (Major)", value: "شدید (Major)", color: "amber" },
  { label: "متوسط (Moderate)", value: "متوسط (Moderate)", color: "sky" },
];

export const TroubleshootingEncyclopedia: React.FC<TroubleshootingEncyclopediaProps> = ({
  onNavigateToArticle,
  onOpenRacksMap,
  className,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<IncidentCategory | "all">("all");
  const [selectedSeverity, setSelectedSeverity] = useState<IncidentSeverity | "all">("all");
  const [expandedIncidentId, setExpandedIncidentId] = useState<string | null>("inc-point-failure-10s");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Filtered incidents
  const filteredIncidents = useMemo(() => {
    return TROUBLESHOOTING_INCIDENTS_DATABASE.filter((inc) => {
      // Category filter
      if (selectedCategory !== "all" && inc.category !== selectedCategory) {
        return false;
      }
      // Severity filter
      if (selectedSeverity !== "all" && inc.severity !== selectedSeverity) {
        return false;
      }
      // Search filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesCode = inc.code.toLowerCase().includes(q);
        const matchesTitle = inc.title.toLowerCase().includes(q);
        const matchesTitleEn = inc.titleEn.toLowerCase().includes(q);
        const matchesComponent = inc.affectedComponents.some((c) => c.toLowerCase().includes(q));
        const matchesCause = inc.rootCausesReasoning.primaryCause.toLowerCase().includes(q);
        const matchesStandard = inc.safetyStandardClause?.toLowerCase().includes(q);
        return matchesCode || matchesTitle || matchesTitleEn || matchesComponent || matchesCause || matchesStandard;
      }
      return true;
    });
  }, [searchQuery, selectedCategory, selectedSeverity]);

  // Copy technical incident card summary to clipboard
  const handleCopyReport = (incident: TroubleshootingIncident) => {
    const reportText = `[گزارش فنی رخداد ${incident.code}]
عنوان: ${incident.title} (${incident.titleEn})
حوزه: ${incident.category} | سطح شدت: ${incident.severity}
استاندارد: ${incident.safetyStandardClause || "N/A"}
علت ریشه‌ای: ${incident.rootCausesReasoning.primaryCause}
دلیل فیزیکی/منطقی: ${incident.rootCausesReasoning.underlyingPhysicsOrLogic}
واکنش خودکار: ${incident.failSafeAutomatedReaction.systemAction}
وضعیت سرعت قطار: ${incident.failSafeAutomatedReaction.trainSpeedEffect}`;

    navigator.clipboard.writeText(reportText);
    setCopiedId(incident.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getSeverityBadgeClass = (sev: IncidentSeverity) => {
    switch (sev) {
      case "بحرانی (Critical)":
        return "bg-rose-50 text-rose-700 border-rose-200";
      case "شدید (Major)":
        return "bg-amber-50 text-amber-700 border-amber-200";
      case "متوسط (Moderate)":
        return "bg-sky-50 text-sky-700 border-sky-200";
      default:
        return "bg-neutral-50 text-neutral-700 border-neutral-200";
    }
  };

  return (
    <div className={cn("space-y-6 pb-16 min-w-0 max-w-full overflow-hidden", className)}>
      {/* 1. Header Banner & Metric Overview */}
      <div className="bg-white rounded-3xl border border-neutral-200 p-5 sm:p-7 shadow-xs space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5 min-w-0">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-xl bg-rose-600 text-white">
                <ShieldAlert className="w-4 h-4" />
              </span>
              <h2 className="text-lg sm:text-xl font-extrabold text-neutral-900 truncate">
                دانشنامه جامع عیب‌یابی، استدلال خطاها و تحلیل ریشه‌ای (RCA)
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed max-w-3xl break-words">
              مرجع استدلالی تمام خطاهای شبکه، سیگنالینگ، اینترلاکینگ، رک‌های سالن علائم، مدارهای راه و ناوگان خط ۱ بر مبنای استانداردهای CENELEC EN 50126/EN 50128/EN 50129 و منطق Fail-Safe.
            </p>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 shrink-0 text-center">
            <div className="p-3 rounded-2xl bg-neutral-50 border border-neutral-200/80">
              <span className="text-[11px] text-neutral-500 font-semibold block">کل سناریوها</span>
              <span className="text-lg font-black font-mono text-neutral-900">
                {TROUBLESHOOTING_INCIDENTS_DATABASE.length}
              </span>
            </div>
            <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200/80">
              <span className="text-[11px] text-rose-700 font-semibold block">سطح بحرانی</span>
              <span className="text-lg font-black font-mono text-rose-900">
                {TROUBLESHOOTING_INCIDENTS_DATABASE.filter((i) => i.severity.includes("بحرانی")).length}
              </span>
            </div>
            <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200/80 col-span-2 sm:col-span-1">
              <span className="text-[11px] text-emerald-700 font-semibold block">استاندارد ایمنی</span>
              <span className="text-xs font-black font-mono text-emerald-900 block mt-1">SIL 4 Fail-Safe</span>
            </div>
          </div>
        </div>

        {/* Search Bar & Filters */}
        <div className="space-y-3 pt-2 border-t border-neutral-100">
          <div className="relative">
            <Search className="w-4 h-4 text-neutral-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="جستجو بر اساس کد خطا (مثال: ERR-PNT-01)، نام تجهیز، علامت ظاهری یا دلیل ریشه‌ای..."
              className="w-full pr-10 pl-4 py-2.5 rounded-xl border border-neutral-200 bg-neutral-50/50 hover:bg-white focus:bg-white text-xs sm:text-sm focus:outline-hidden focus:ring-2 focus:ring-black/10 transition-all text-neutral-900"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-neutral-400 hover:text-black cursor-pointer px-1"
              >
                پاک کردن
              </button>
            )}
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
            <span className="text-[11px] font-semibold text-neutral-400 shrink-0 ml-1">حوزه:</span>
            {CATEGORIES.map((cat) => {
              const Icon = cat.icon;
              const isSelected = selectedCategory === cat.value;
              return (
                <button
                  key={cat.value}
                  type="button"
                  onClick={() => setSelectedCategory(cat.value)}
                  className={cn(
                    "px-3 py-1.5 rounded-xl font-medium transition-all shrink-0 flex items-center gap-1.5 cursor-pointer text-xs border",
                    isSelected
                      ? "bg-neutral-900 text-white border-neutral-900 shadow-2xs font-bold"
                      : "bg-white text-neutral-600 border-neutral-200 hover:bg-neutral-50 hover:text-black"
                  )}
                >
                  <Icon className={cn("w-3.5 h-3.5", isSelected ? "text-white" : "text-neutral-400")} />
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>

          {/* Severity Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
            <span className="text-[11px] font-semibold text-neutral-400 shrink-0 ml-1">شدت:</span>
            {SEVERITIES.map((sev) => {
              const isSelected = selectedSeverity === sev.value;
              return (
                <button
                  key={sev.value}
                  type="button"
                  onClick={() => setSelectedSeverity(sev.value)}
                  className={cn(
                    "px-2.5 py-1 rounded-lg font-medium transition-all shrink-0 cursor-pointer text-[11px] border",
                    isSelected
                      ? "bg-black text-white border-black font-bold"
                      : "bg-neutral-50 text-neutral-600 border-neutral-200 hover:bg-neutral-100"
                  )}
                >
                  {sev.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 2. Results Header */}
      <div className="flex items-center justify-between text-xs text-neutral-500 px-1">
        <span>
          نمایش {filteredIncidents.length} رخداد از مجموع {TROUBLESHOOTING_INCIDENTS_DATABASE.length} مورد
        </span>
        {(selectedCategory !== "all" || selectedSeverity !== "all" || searchQuery) && (
          <button
            type="button"
            onClick={() => {
              setSelectedCategory("all");
              setSelectedSeverity("all");
              setSearchQuery("");
            }}
            className="text-neutral-800 hover:underline cursor-pointer flex items-center gap-1"
          >
            <RotateCcw className="w-3 h-3" />
            <span>بازنشانی فیلترها</span>
          </button>
        )}
      </div>

      {/* 3. Incidents List & Deep Engineering Accordion */}
      <div className="space-y-4 min-w-0">
        {filteredIncidents.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-3xl border border-neutral-200 space-y-3">
            <AlertOctagon className="w-8 h-8 text-neutral-300 mx-auto" />
            <h3 className="text-sm font-bold text-neutral-800">هیچ رخدادی با فیلترهای جاری یافت نشد</h3>
            <p className="text-xs text-neutral-500 max-w-sm mx-auto">
              عبارت جستجو را تغییر دهید یا فیلتر دسته‌بندی و شدت را به حالت پیش‌فرض بازگردانید.
            </p>
          </div>
        ) : (
          filteredIncidents.map((incident) => {
            const isExpanded = expandedIncidentId === incident.id;
            const isCopied = copiedId === incident.id;

            return (
              <div
                key={incident.id}
                className={cn(
                  "rounded-2xl border transition-all overflow-hidden bg-white shadow-2xs min-w-0 break-words",
                  isExpanded ? "border-neutral-900 ring-2 ring-neutral-900/10" : "border-neutral-200 hover:border-neutral-300"
                )}
              >
                {/* Incident Card Header */}
                <div
                  onClick={() => setExpandedIncidentId(isExpanded ? null : incident.id)}
                  className="p-4 sm:p-5 flex items-start justify-between gap-3 cursor-pointer hover:bg-neutral-50/70 transition-colors"
                >
                  <div className="flex items-start gap-3 min-w-0 flex-1">
                    {/* Error Code Pill */}
                    <div className="px-2.5 py-1 rounded-xl bg-neutral-900 text-white font-mono font-bold text-xs shrink-0 mt-0.5 tracking-wider shadow-2xs">
                      {incident.code}
                    </div>

                    <div className="space-y-1 min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          className={cn(
                            "text-[10px] font-semibold px-2 py-0.5 rounded-md border",
                            getSeverityBadgeClass(incident.severity)
                          )}
                        >
                          {incident.severity}
                        </span>
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-neutral-100 text-neutral-700">
                          {incident.category}
                        </span>
                        {incident.safetyStandardClause && (
                          <span className="text-[10px] font-mono text-neutral-400 bg-neutral-50 px-1.5 py-0.5 rounded border border-neutral-200/60 hidden sm:inline-block">
                            {incident.safetyStandardClause}
                          </span>
                        )}
                      </div>

                      <h3 className="text-sm sm:text-base font-extrabold text-neutral-900 leading-snug break-words">
                        {incident.title}
                      </h3>
                      <p className="text-xs font-sans text-neutral-400 font-mono tracking-tight hidden sm:block truncate">
                        {incident.titleEn}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 mt-1">
                    <span className="text-xs text-neutral-400 hidden md:inline">
                      {isExpanded ? "بستن تحلیل" : "تحلیل ریشه‌ای"}
                    </span>
                    <div
                      className={cn(
                        "p-1.5 rounded-lg text-neutral-500 transition-transform",
                        isExpanded ? "rotate-90 text-black" : ""
                      )}
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </div>
                  </div>
                </div>

                {/* Expanded Deep Analysis Details */}
                {isExpanded && (
                  <div className="p-4 sm:p-6 border-t border-neutral-100 bg-neutral-50/40 space-y-6 animate-in fade-in duration-100 min-w-0">
                    {/* 1. Root Cause Analysis (استدلال کامل مهندسی) */}
                    <div className="p-4 rounded-2xl bg-white border border-neutral-200 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-neutral-900 flex items-center gap-1.5">
                          <Activity className="w-4 h-4 text-rose-600" />
                          <span>تحلیل استدلالی علل ریشه‌ای (Root Cause Analysis - RCA):</span>
                        </span>
                        <button
                          type="button"
                          onClick={() => handleCopyReport(incident)}
                          className="px-2.5 py-1 rounded-md bg-neutral-100 hover:bg-neutral-200 text-neutral-700 text-[11px] font-medium flex items-center gap-1 transition-colors cursor-pointer"
                        >
                          {isCopied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                          <span>{isCopied ? "کپی شد" : "کپی خلاصه گزارش"}</span>
                        </button>
                      </div>

                      <div className="space-y-2 text-xs sm:text-sm text-neutral-800 leading-relaxed">
                        <div className="p-3 rounded-xl bg-neutral-50 border border-neutral-200/70">
                          <strong className="text-neutral-900 block mb-0.5">علت اولیه (Primary Cause):</strong>
                          <p className="text-neutral-700 leading-relaxed text-justify">
                            {incident.rootCausesReasoning.primaryCause}
                          </p>
                        </div>

                        <div className="p-3 rounded-xl bg-amber-50/60 border border-amber-200/70">
                          <strong className="text-amber-950 block mb-0.5">
                            استدلال فیزیکی و منطق ایمنی ریلی (Underlying Physics / Logic):
                          </strong>
                          <p className="text-amber-900 leading-relaxed text-justify">
                            {incident.rootCausesReasoning.underlyingPhysicsOrLogic}
                          </p>
                        </div>

                        <div className="p-3 rounded-xl bg-neutral-50 border border-neutral-200/70">
                          <strong className="text-neutral-900 block mb-0.5">
                            عوامل به وجود آورنده در خط ۱ (Why It Happens):
                          </strong>
                          <p className="text-neutral-700 leading-relaxed text-justify">
                            {incident.rootCausesReasoning.whyItHappens}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* 2. Real-Time Symptoms & Alarms (علائم و آلارم‌ها) */}
                    <div className="p-4 rounded-2xl bg-white border border-neutral-200 space-y-2.5">
                      <span className="text-xs font-bold text-neutral-900 flex items-center gap-1.5">
                        <AlertTriangle className="w-4 h-4 text-amber-600" />
                        <span>علائم و آلارم‌های بلادرنگ در اتاق کنترل، کابین و سالن علائم:</span>
                      </span>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                        <div className="p-2.5 rounded-xl bg-neutral-50 border border-neutral-200/80">
                          <span className="text-[11px] font-bold text-neutral-500 block mb-0.5">
                            صفحه دیسپاچینگ مرکزی (CTC / OCC):
                          </span>
                          <span className="text-neutral-800 leading-relaxed">
                            {incident.symptomsAndAlarms.occDisplay}
                          </span>
                        </div>

                        {incident.symptomsAndAlarms.dmiDisplay && (
                          <div className="p-2.5 rounded-xl bg-neutral-50 border border-neutral-200/80">
                            <span className="text-[11px] font-bold text-neutral-500 block mb-0.5">
                              نمایشگر کابین راننده (DMI Onboard):
                            </span>
                            <span className="text-neutral-800 leading-relaxed">
                              {incident.symptomsAndAlarms.dmiDisplay}
                            </span>
                          </div>
                        )}

                        {incident.symptomsAndAlarms.hardwareLeds && (
                          <div className="p-2.5 rounded-xl bg-neutral-50 border border-neutral-200/80">
                            <span className="text-[11px] font-bold text-neutral-500 block mb-0.5">
                              چراغ‌های LED بر روی بردهای رک (Hardware LEDs):
                            </span>
                            <span className="text-neutral-800 leading-relaxed">
                              {incident.symptomsAndAlarms.hardwareLeds}
                            </span>
                          </div>
                        )}

                        {incident.symptomsAndAlarms.relayStates && (
                          <div className="p-2.5 rounded-xl bg-neutral-50 border border-neutral-200/80">
                            <span className="text-[11px] font-bold text-neutral-500 block mb-0.5">
                              وضعیت رله‌های ایمن ویتال (Vital Relays):
                            </span>
                            <span className="text-neutral-800 leading-relaxed">
                              {incident.symptomsAndAlarms.relayStates}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* 3. Automated Fail-Safe Reaction (واکنش خودکار خرابی-ایمن) */}
                    <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 space-y-2">
                      <span className="text-xs font-bold text-emerald-950 flex items-center gap-1.5">
                        <ShieldAlert className="w-4 h-4 text-emerald-700" />
                        <span>واکنش خودکار و تضمین ایمنی مسافران (Fail-Safe Automated Response):</span>
                      </span>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                        <div className="p-2.5 rounded-xl bg-white/80 border border-emerald-100">
                          <span className="text-[10px] font-bold text-emerald-800 block mb-0.5">اقدام سیستم:</span>
                          <span className="text-emerald-950 leading-relaxed">
                            {incident.failSafeAutomatedReaction.systemAction}
                          </span>
                        </div>
                        <div className="p-2.5 rounded-xl bg-white/80 border border-emerald-100">
                          <span className="text-[10px] font-bold text-emerald-800 block mb-0.5">سرعت قطارها:</span>
                          <span className="text-emerald-950 font-bold leading-relaxed">
                            {incident.failSafeAutomatedReaction.trainSpeedEffect}
                          </span>
                        </div>
                        <div className="p-2.5 rounded-xl bg-white/80 border border-emerald-100">
                          <span className="text-[10px] font-bold text-emerald-800 block mb-0.5">وضعیت چراغ‌ها:</span>
                          <span className="text-emerald-950 font-bold leading-relaxed">
                            {incident.failSafeAutomatedReaction.signalsState}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* 4. Step-by-Step Remediation Protocols (مراحل رفع عیب) */}
                    <div className="p-4 rounded-2xl bg-white border border-neutral-200 space-y-3">
                      <span className="text-xs font-bold text-neutral-900 flex items-center gap-1.5">
                        <Wrench className="w-4 h-4 text-neutral-800" />
                        <span>دستورالعمل گام‌به‌گام رفع عیب و ترابل‌شوتینگ (Field Remediation):</span>
                      </span>

                      <ol className="space-y-2.5">
                        {incident.stepByStepRemediation.map((step) => (
                          <li
                            key={step.step}
                            className="p-3 rounded-xl bg-neutral-50 border border-neutral-200/80 flex items-start gap-3 text-xs sm:text-sm"
                          >
                            <span className="w-6 h-6 rounded-lg bg-neutral-900 text-white font-mono font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                              {step.step}
                            </span>
                            <div className="space-y-1 flex-1 min-w-0">
                              <p className="font-semibold text-neutral-900 leading-relaxed text-justify">
                                {step.action}
                              </p>
                              <div className="flex items-center gap-3 flex-wrap text-xs pt-1">
                                {step.toolsRequired && (
                                  <span className="text-[11px] text-neutral-600 bg-white px-2 py-0.5 rounded border border-neutral-200 flex items-center gap-1">
                                    <Wrench className="w-3 h-3 text-neutral-400" />
                                    <span>ابزار: {step.toolsRequired}</span>
                                  </span>
                                )}
                                <span className="text-[11px] text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200 flex items-center gap-1 font-semibold">
                                  <AlertOctagon className="w-3 h-3 text-rose-600" />
                                  <span>احتیاط: {step.precautions}</span>
                                </span>
                              </div>
                            </div>
                          </li>
                        ))}
                      </ol>

                      {incident.postIncidentRecovery && (
                        <div className="p-3 rounded-xl bg-neutral-100/80 border border-neutral-200 text-xs text-neutral-700 flex items-start gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                          <div className="leading-relaxed">
                            <strong className="text-neutral-900 font-bold">اقدامات پس از بازیابی: </strong>
                            <span>{incident.postIncidentRecovery}</span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* 5. Direct Reference Navigation Bar */}
                    <div className="pt-2 flex items-center justify-between gap-3 flex-wrap border-t border-neutral-200">
                      <div className="flex items-center gap-2 flex-wrap">
                        {incident.relatedArticleId && (
                          <button
                            type="button"
                            onClick={() => onNavigateToArticle?.(incident.relatedArticleId!, incident.relatedSectionId)}
                            className="px-3.5 py-1.5 rounded-lg bg-neutral-900 hover:bg-black text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                          >
                            <BookOpen className="w-3.5 h-3.5" />
                            <span>مطالعه مبحث در دانشنامه</span>
                          </button>
                        )}

                        {incident.relatedRackId && (
                          <button
                            type="button"
                            onClick={() => onOpenRacksMap?.("racks")}
                            className="px-3 py-1.5 rounded-lg bg-sky-50 text-sky-800 hover:bg-sky-100 border border-sky-200 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                          >
                            <Server className="w-3.5 h-3.5" />
                            <span>بررسی رک مربوطه در اطلس</span>
                          </button>
                        )}
                      </div>

                      <div className="text-[11px] text-neutral-400 font-mono">
                        مرجع استاندارد: {incident.safetyStandardClause || "EN 50129 SIL 4"}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
