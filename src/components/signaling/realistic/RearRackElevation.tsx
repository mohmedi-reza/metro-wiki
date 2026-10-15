import React, { useState } from 'react';
import { SignalingRackElevation, RackSubrack } from '../../../types/signalingRooms';
import { cn } from '../../../lib/utils';
import {
  Zap,
  ShieldCheck,
  Activity,
  Fan,
  Sliders,
  CheckCircle2,
  AlertTriangle,
  Info,
  Maximize2,
  HardDrive,
} from 'lucide-react';

interface RearRackElevationProps {
  rack: SignalingRackElevation;
  selectedSubrackId: string | null;
  onSelectSubrack: (subrackId: string) => void;
  className?: string;
}

export const RearRackElevation: React.FC<RearRackElevationProps> = ({
  rack,
  selectedSubrackId,
  onSelectSubrack,
  className,
}) => {
  const [hoveredSection, setHoveredSection] = useState<string | null>(null);
  const [selectedTerminal, setSelectedTerminal] = useState<string | null>(null);

  // Sort subracks descending by uStart
  const sortedSubracks = [...rack.subracks].sort((a, b) => b.uStart - a.uStart);

  return (
    <div className={cn("space-y-4 select-none", className)}>
      {/* Top Banner explaining Rear View */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs bg-neutral-900 text-neutral-300 p-3 rounded-xl border border-neutral-800 gap-2">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse shrink-0" />
          <span className="font-bold text-white flex items-center gap-1.5 flex-wrap">
            <span>نمای پشت رک صنعتی ۱۹ اینچ</span>
            <bdi dir="ltr" className="text-amber-300 font-mono text-[11px] px-1.5 py-0.5 rounded bg-neutral-850 border border-neutral-700">REAR ELEVATION</bdi>
          </span>
          <span dir="ltr" className="text-[11px] font-mono px-2 py-0.5 rounded bg-neutral-800 text-amber-300 border border-neutral-700">
            {rack.id} • 42U
          </span>
        </div>
        <div className="flex items-center gap-3 text-[11px] text-neutral-400 font-mono">
          <span>شینه شیلد و ارت PE • ترمینال‌های ورودی تغذیه • پورت‌های بک‌پلین DIN 41612</span>
        </div>
      </div>

      {/* RACK FRAME (REAR) */}
      <div className="relative mx-auto max-w-3xl bg-neutral-950 rounded-2xl border-4 border-neutral-800 p-2 sm:p-3 shadow-2xl overflow-hidden">
        
        {/* REAR ROOF SECTION: Exhaust Fans & Optical Cable Entry Brush Strip */}
        <div className="mb-2 p-2 rounded-xl bg-neutral-900 border border-neutral-800 space-y-1.5">
          <div className="flex items-center justify-between text-[10px] font-mono text-neutral-400">
            <div className="flex items-center gap-2">
              <Fan className="w-3.5 h-3.5 text-sky-400 animate-spin shrink-0" style={{ animationDuration: '3s' }} />
              <span className="text-white font-bold">واحد فن اگزوز سقفی (REAR EXHAUST HOOD)</span>
            </div>
            <span className="text-emerald-400 font-semibold">خروج هوای گرم: 28.4°C • ۴ فن سالم</span>
          </div>

          {/* Cable entry brush strip with bundle indications */}
          <div className="h-4 bg-neutral-950 rounded border border-neutral-800 flex items-center justify-between px-3 text-[8px] font-mono text-neutral-500">
            <span>◄ ورودی کابل نوری (BRUSH STRIP)</span>
            <div className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500" title="فیبر زرد SM" />
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
              <span className="w-1.5 h-1.5 rounded-full bg-purple-500" title="اترنت بنفش Cat.7" />
              <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500" title="شبکه عیب‌یابی آبی" />
            </div>
            <span>ورودی سینی کابل بالاسری ►</span>
          </div>
        </div>

        {/* 19-INCH INTERNAL MOUNTING BAY (REAR) */}
        <div className="flex bg-neutral-925 rounded-xl border-2 border-neutral-800 overflow-hidden">
          
          {/* LEFT REAR VERTICAL CABLE LACING BAR & EARTH COPPER STRIP */}
          <div className="w-9 sm:w-11 bg-neutral-900 border-e border-neutral-800 flex flex-col justify-between py-2 text-center font-mono text-[8px] sm:text-[9px] text-neutral-500 select-none shrink-0 relative">
            {/* Solid Copper Earth Strip */}
            <div className="absolute top-2 bottom-2 left-1 w-1.5 bg-amber-600/80 rounded-full border border-amber-500/50" title="شینه مسی عمودی ارت (Vertical Copper Earth Bar)" />
            
            {[42, 38, 34, 30, 26, 22, 18, 14, 10, 6, 2].map((u) => (
              <div key={u} className="flex flex-col items-center justify-center gap-0.5 ps-1">
                <span className="w-2 h-2 rounded-full border border-amber-400 bg-amber-950 text-[6px] text-amber-300 flex items-center justify-center font-bold" title="پیچ اتصال ارت M6 با واشر خورشیدی">
                  ⏚
                </span>
                <span>U{String(u).padStart(2, "0")}</span>
              </div>
            ))}
          </div>

          {/* MAIN REAR CHASSIS BAY: BACKPLANES, POWER TERMINALS & CABLE TRUNKS */}
          <div className="flex-1 p-2 space-y-2 overflow-x-hidden">
            {sortedSubracks.map((sub) => {
              const isSelected = sub.id === selectedSubrackId;

              return (
                <div
                  key={sub.id}
                  onClick={() => onSelectSubrack(sub.id)}
                  className={cn(
                    "rounded-xl border-2 p-2.5 transition-all cursor-pointer relative overflow-hidden bg-neutral-900",
                    isSelected
                      ? "border-amber-400 ring-2 ring-amber-400/30 shadow-lg shadow-amber-500/10"
                      : "border-neutral-800 hover:border-neutral-700"
                  )}
                >
                  {/* Subrack Rear Header Strip */}
                  <div className="flex items-center justify-between pb-1.5 mb-2 border-b border-neutral-800 text-[10px] font-mono">
                    <div className="flex items-center gap-2">
                      <span className="px-1.5 py-0.5 rounded bg-neutral-950 text-amber-400 font-bold border border-neutral-800">
                        REAR • U{sub.uStart}-{sub.uEnd}
                      </span>
                      <span className="text-white font-bold truncate">
                        {sub.titleEn || sub.title}
                      </span>
                    </div>
                    <span className="text-neutral-400">
                      بک‌پلین یوروکارد DIN 41612
                    </span>
                  </div>

                  {/* Rear Hardware Layout: Power Entry, Backplane Connectors & Earth Lug */}
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-2">
                    
                    {/* Left: Dual Redundant Power Terminal Block / IEC Inlets (Cols 1-4) */}
                    <div className="md:col-span-4 bg-neutral-950 p-2 rounded-lg border border-neutral-800 space-y-1.5">
                      <div className="flex items-center justify-between text-[9px] font-mono text-neutral-400">
                        <span className="font-bold text-neutral-300 flex items-center gap-1">
                          <Zap className="w-3 h-3 text-amber-400" />
                          <span>تغذیه دوگانه DC</span>
                        </span>
                        <span className="text-emerald-400">24V OK</span>
                      </div>

                      {/* Power Terminal Ferrules */}
                      <div className="space-y-1 bg-neutral-900/80 p-1.5 rounded border border-neutral-800 text-[8px] font-mono">
                        <div className="flex items-center justify-between">
                          <span className="text-rose-400 font-bold flex items-center gap-1">
                            <span className="w-2 h-2 rounded-full bg-rose-500 inline-block" />
                            <span>FEEDER A (+)</span>
                          </span>
                          <span className="text-neutral-300 font-bold">+24.18 V</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-neutral-400 flex items-center gap-1">
                            <span className="w-2 h-2 rounded-full bg-neutral-700 inline-block" />
                            <span>RETURN A (-)</span>
                          </span>
                          <span className="text-neutral-400">0.00 V</span>
                        </div>
                        <div className="flex items-center justify-between pt-0.5 border-t border-neutral-800">
                          <span className="text-rose-400 font-bold flex items-center gap-1">
                            <span className="w-2 h-2 rounded-full bg-rose-700 inline-block" />
                            <span>FEEDER B (+)</span>
                          </span>
                          <span className="text-neutral-300 font-bold">+24.15 V</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-neutral-400 flex items-center gap-1">
                            <span className="w-2 h-2 rounded-full bg-neutral-700 inline-block" />
                            <span>RETURN B (-)</span>
                          </span>
                          <span className="text-neutral-400">0.00 V</span>
                        </div>
                      </div>

                      {/* Earth Stud */}
                      <div className="flex items-center justify-between text-[8px] font-mono pt-1 border-t border-neutral-800 text-neutral-400">
                        <span className="flex items-center gap-1 text-emerald-400 font-bold">
                          <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
                          <span>CHASSIS EARTH</span>
                        </span>
                        <span>M6 Stud &lt; 0.1Ω</span>
                      </div>
                    </div>

                    {/* Center: Eurocard 96-Pin Backplane Connector Matrix (Cols 5-9) */}
                    <div className="md:col-span-5 bg-neutral-950 p-2 rounded-lg border border-neutral-800 flex flex-col justify-between">
                      <div className="flex items-center justify-between text-[9px] font-mono text-neutral-400 pb-1 border-b border-neutral-800">
                        <span className="font-bold text-neutral-300">
                          کانکتورهای بک‌پلین (DIN 41612)
                        </span>
                        <span className="text-amber-400">پین‌های طلاکاری شده</span>
                      </div>

                      {/* Slot connector pins simulation */}
                      <div className="grid grid-cols-6 gap-1 my-1">
                        {sub.components.map((comp, cIdx) => (
                          <div
                            key={cIdx}
                            className="bg-neutral-900 border border-neutral-800 hover:border-amber-400 p-1 rounded text-center text-[7px] font-mono transition-colors"
                            title={`کانکتور بک‌پلین ۹۶ پین ماژول: ${(comp as any).nameFa || comp.name}`}
                          >
                            <span className="text-neutral-500 block truncate">S{cIdx + 1}</span>
                            <div className="flex flex-col gap-0.5 items-center my-0.5">
                              <span className="w-full h-0.5 bg-amber-500/70 rounded-xxs" />
                              <span className="w-full h-0.5 bg-amber-500/70 rounded-xxs" />
                              <span className="w-full h-0.5 bg-amber-500/70 rounded-xxs" />
                            </div>
                            <span className="text-emerald-400 font-bold">96P</span>
                          </div>
                        ))}
                      </div>

                      <div className="flex items-center justify-between text-[8px] font-mono text-neutral-500 pt-1 border-t border-neutral-800">
                        <span>پروتکل: {sub.busProtocol}</span>
                        <span>سیگنال توازن 2oo3</span>
                      </div>
                    </div>

                    {/* Right: Rear Field Cable Clamp & Diagnostics (Cols 10-12) */}
                    <div className="md:col-span-3 bg-neutral-950 p-2 rounded-lg border border-neutral-800 flex flex-col justify-between text-[8px] font-mono">
                      <div className="space-y-1">
                        <span className="text-[9px] font-bold text-neutral-300 block pb-1 border-b border-neutral-800">
                          مهار کابل و لیبلینگ
                        </span>
                        <div className="text-neutral-400 space-y-0.5">
                          <p>بست ولکرو صنعتی</p>
                          <p>نوار کد رنگی EN 50155</p>
                          <p className="text-emerald-400 font-bold">بدون خمش بحرانی R&gt;50mm</p>
                        </div>
                      </div>

                      <div className="pt-1 border-t border-neutral-800 text-[8px] text-amber-300">
                        بازرسی دوره‌ای: تایید شده ✓
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* HEAVY DUTY FIELD TERMINAL BLOCKS (LOWER SECTION OF RACK) */}
            <div className="p-3 rounded-xl bg-neutral-900 border-2 border-neutral-800 space-y-2">
              <div className="flex items-center justify-between text-[10px] font-mono">
                <div className="flex items-center gap-2">
                  <span className="px-1.5 py-0.5 rounded bg-neutral-950 text-emerald-400 font-bold border border-neutral-800">
                    TERMINAL STRIP X100
                  </span>
                  <span className="text-white font-bold">
                    ردیف ترمینال‌های سرسیم‌بندی کابل‌های فیلد (Field Cable Interface Weidmüller WDU)
                  </span>
                </div>
                <span className="text-neutral-400">DIN-Rail Mounted</span>
              </div>

              {/* Terminal Block Strip Drawing */}
              <div className="bg-neutral-950 p-2 rounded-lg border border-neutral-800 overflow-hidden w-full">
                <div className="flex items-center gap-1 flex-wrap sm:flex-nowrap w-full">
                  {[
                    { num: "01", name: "+110V MOT", color: "bg-orange-500", label: "موتور سوزن SW-01" },
                    { num: "02", name: "-110V RET", color: "bg-neutral-600", label: "برگشت موتور سوزن" },
                    { num: "03", name: "IND-NOR", color: "bg-sky-500", label: "سنسور وضعیت عادی سوزن" },
                    { num: "04", name: "IND-REV", color: "bg-sky-600", label: "سنسور وضعیت معکوس سوزن" },
                    { num: "05", name: "SIG-G+", color: "bg-emerald-500", label: "خروجی چراغ سبز S-02" },
                    { num: "06", name: "SIG-Y+", color: "bg-amber-500", label: "خروجی چراغ زرد S-02" },
                    { num: "07", name: "SIG-R+", color: "bg-rose-500", label: "خروجی چراغ قرمز S-02" },
                    { num: "08", name: "SIG-COM", color: "bg-neutral-500", label: "مشترک چراغ‌ها 0V" },
                    { num: "09", name: "TC-TX-A", color: "bg-cyan-500", label: "ارسال مدار راه فرکانسی" },
                    { num: "10", name: "TC-TX-B", color: "bg-cyan-600", label: "برگشت مدار راه فرکانسی" },
                    { num: "11", name: "AX-PULSE", color: "bg-indigo-500", label: "پالس سنسور شمارنده محور" },
                    { num: "12", name: "AX-DIR", color: "bg-indigo-600", label: "تشخیص جهت حرکت قطار" },
                    { num: "PE", name: "EARTH", color: "bg-emerald-600", label: "اتصال به شینه ارت مرکزی" },
                  ].map((t) => (
                    <div
                      key={t.num}
                      onClick={() => setSelectedTerminal(t.num)}
                      className={cn(
                        "flex-1 min-w-[36px] bg-neutral-900 border rounded p-1 text-center font-mono cursor-pointer transition-all hover:scale-105",
                        selectedTerminal === t.num
                          ? "border-amber-400 ring-2 ring-amber-400/40 bg-neutral-850"
                          : "border-neutral-800 hover:border-neutral-700"
                      )}
                    >
                      <span className="text-[7px] text-neutral-500 block">{t.num}</span>
                      <span className={cn("w-full h-1 my-0.5 rounded-xxs block", t.color)} />
                      <span className="text-[7px] text-neutral-200 font-bold block truncate">
                        {t.name}
                      </span>
                    </div>
                  ))}
                </div>

                {selectedTerminal && (
                  <div className="mt-2 p-2 rounded bg-neutral-900 border border-neutral-800 text-[10px] font-mono text-neutral-300 flex items-center justify-between">
                    <div>
                      ترمینال انتخاب‌شده: <strong className="text-amber-400">X100:{selectedTerminal}</strong> • کابل ضدحریق آرموردار زرهی با مقطع ۲.۵mm²
                    </div>
                    <button
                      type="button"
                      onClick={() => setSelectedTerminal(null)}
                      className="text-neutral-500 hover:text-white px-1.5 py-0.5"
                    >
                      بستن
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* RIGHT REAR VERTICAL CABLE LACING BAR */}
          <div className="w-9 sm:w-11 bg-neutral-900 border-s border-neutral-800 flex flex-col justify-between py-2 text-center font-mono text-[8px] sm:text-[9px] text-neutral-500 select-none shrink-0">
            {[42, 38, 34, 30, 26, 22, 18, 14, 10, 6, 2].map((u) => (
              <div key={u} className="flex flex-col items-center justify-center gap-0.5">
                <span>U{String(u).padStart(2, "0")}</span>
                <span className="w-1.5 h-1.5 rounded-full bg-neutral-700" title="قلاب نگهدارنده کابل" />
              </div>
            ))}
          </div>
        </div>

        {/* REAR RACK BASE: Raised Floor Cutout & Earth Boss */}
        <div className="mt-2 p-2 rounded-xl bg-neutral-900 border border-neutral-800 flex flex-col sm:flex-row sm:items-center justify-between text-[9px] sm:text-[10px] font-mono text-neutral-400 gap-1">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-1.5 rounded-xs bg-amber-500 border border-amber-600 shrink-0" />
            <span className="text-white font-bold">اتصال کابل شیلد به شینه ارت اصلی (GROUND BOSS):</span>
            <span className="text-emerald-400">مقاومت بدنه به چاه ارت: ۰.۱۲ اهم</span>
          </div>
          <div className="text-neutral-500">
            ورودی کف کاذب اتاق سیگنالینگ (Plenum Rated)
          </div>
        </div>
      </div>
    </div>
  );
};
