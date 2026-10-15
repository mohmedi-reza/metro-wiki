import React, { useState, useMemo } from 'react';
import { CableRun, CableCategory } from '../../types/cableSchedule';
import { SYSTEM_CABLING_RUNS } from '../../data/cablingData';
import { PortDiagnosticsModal } from './realistic/PortDiagnosticsModal';
import {
  Cable,
  Search,
  Filter,
  Download,
  Eye,
  Activity,
  ShieldCheck,
  Zap,
  ArrowRightLeft,
  CheckCircle2,
  HardDrive,
  FileSpreadsheet,
} from 'lucide-react';
import { cn } from '../../lib/utils';

interface CableScheduleTableProps {
  currentRackId?: string;
  onSelectRackAndTrace?: (rackId: string, cableId: string) => void;
  className?: string;
}

export const CableScheduleTable: React.FC<CableScheduleTableProps> = ({
  currentRackId,
  onSelectRackAndTrace,
  className,
}) => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<CableCategory | 'all'>('all');
  const [diagnosingCable, setDiagnosingCable] = useState<CableRun | null>(null);

  // Filtered cabling list
  const filteredCables = useMemo(() => {
    return SYSTEM_CABLING_RUNS.filter((cable) => {
      const matchesCategory = selectedCategory === 'all' || cable.category === selectedCategory;
      const term = searchTerm.toLowerCase();
      const matchesSearch =
        cable.id.toLowerCase().includes(term) ||
        cable.labelEn.toLowerCase().includes(term) ||
        cable.source.labelEn.toLowerCase().includes(term) ||
        cable.destination.labelEn.toLowerCase().includes(term) ||
        cable.specificationEn.toLowerCase().includes(term) ||
        cable.remarksEn.toLowerCase().includes(term);

      return matchesCategory && matchesSearch;
    });
  }, [searchTerm, selectedCategory]);

  // Export to CSV helper
  const handleExportCsv = () => {
    const headers = [
      'Cable ID',
      'Category',
      'Source Rack',
      'Source Slot/Port',
      'Destination Target',
      'Specification',
      'Length (m)',
      'Safety Level',
      'Signal Telemetry',
      'Status',
    ];

    const rows = filteredCables.map((c) => [
      c.id,
      c.category,
      c.source.rackId,
      `"${c.source.labelEn}"`,
      `"${c.destination.labelEn}"`,
      `"${c.specificationEn}"`,
      c.lengthMeters,
      c.safetyLevel,
      `"${c.telemetry.signalLevel}"`,
      c.status,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,\uFEFF' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `signaling_cable_schedule_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getCategoryBadge = (cat: CableCategory) => {
    switch (cat) {
      case 'fiber_optic':
        return { label: 'فیبر نوری SM', bg: 'bg-amber-50 text-amber-700 border-amber-200' };
      case 'ethernet_safenet':
        return { label: 'اترنت ایمن SIL4', bg: 'bg-purple-50 text-purple-700 border-purple-200' };
      case 'ethernet_diag':
        return { label: 'اترنت مانیتورینگ', bg: 'bg-sky-50 text-sky-700 border-sky-200' };
      case 'field_control':
        return { label: 'کابل فیلد سوزن/سیرکویت', bg: 'bg-orange-50 text-orange-700 border-orange-200' };
      case 'vital_relay':
        return { label: 'فرمان چراغ سیگنال', bg: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
      case 'power_feed':
        return { label: 'تغذیه ۲۴/۱۱۰ ولت', bg: 'bg-rose-50 text-rose-700 border-rose-200' };
      case 'earth_ground':
        return { label: 'شینه ارت و گراند', bg: 'bg-teal-50 text-teal-700 border-teal-200' };
      default:
        return { label: 'باس داده صنعتی', bg: 'bg-neutral-50 text-neutral-700 border-neutral-200' };
    }
  };

  return (
    <div className={cn("space-y-4 select-none", className)}>
      {/* Table Header & Search Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-neutral-200 shadow-2xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-neutral-900 text-white shrink-0">
              <Cable className="w-4 h-4" />
            </span>
            <div>
              <h3 className="font-bold text-sm sm:text-base text-neutral-900">
                دفترچه سرسیم‌بندی و برنامه کشش کابل‌ها (Cable Schedule & Wiring Matrix)
              </h3>
              <p className="text-xs text-neutral-500">
                ماتریس جامع ارتباطات نوری، اترنت صنعتی EN 50159، کابل‌های آرموردار فیلد و مدار زمین
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleExportCsv}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-xs font-semibold border border-neutral-300 transition-colors cursor-pointer shadow-2xs"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
              <span>خروجی اکسل (CSV)</span>
            </button>
          </div>
        </div>

        {/* Filter Controls Row */}
        <div className="flex flex-col md:flex-row md:items-center gap-2.5 pt-2 border-t border-neutral-100">
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 text-neutral-400 absolute right-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="جستجو در شناسه کابل، مبدا، مقصد، نوع فیبر، شماره پورت..."
              className="w-full pl-3 pr-8 py-1.5 rounded-xl border border-neutral-200 bg-neutral-50 focus:bg-white text-xs text-neutral-800 focus:outline-none focus:ring-2 focus:ring-sky-500 transition-all font-mono"
            />
          </div>

          {/* Category Chips */}
          <div className="flex items-center gap-1 overflow-x-auto pb-1 md:pb-0 text-xs">
            {[
              { id: 'all', label: 'همه کابل‌ها' },
              { id: 'fiber_optic', label: 'فیبر نوری' },
              { id: 'ethernet_safenet', label: 'اترنت ایمن' },
              { id: 'field_control', label: 'فیلد و سوزن' },
              { id: 'power_feed', label: 'تغذیه DC' },
              { id: 'earth_ground', label: 'ارت PE' },
            ].map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id as any)}
                className={cn(
                  "px-2.5 py-1 rounded-lg font-medium whitespace-nowrap transition-colors cursor-pointer text-[11px]",
                  selectedCategory === cat.id
                    ? "bg-neutral-900 text-white font-bold"
                    : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
                )}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-2xl border border-neutral-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs border-collapse">
            <thead>
              <tr className="bg-neutral-50/80 border-b border-neutral-200 text-neutral-600 font-semibold text-[11px]">
                <th className="p-3">شناسه و کد کابل</th>
                <th className="p-3">دسته‌بندی و ایمنی</th>
                <th className="p-3">مبدا (اتاق / رک / پورت)</th>
                <th className="p-3">مقصد (تجهیز هدف / فیلد)</th>
                <th className="p-3">مشخصات فیزیکی کابل</th>
                <th className="p-3">طول</th>
                <th className="p-3">سیگنال و تلمتری</th>
                <th className="p-3 text-center">عملیات مهندسی</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 font-mono text-[11px]">
              {filteredCables.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-neutral-400 font-sans">
                    موردی منطبق با عبارت جستجو یافت نشد.
                  </td>
                </tr>
              ) : (
                filteredCables.map((cable) => {
                  const badge = getCategoryBadge(cable.category);
                  const isCurrentRack =
                    currentRackId &&
                    (cable.source.rackId === currentRackId || cable.destination.rackId === currentRackId);

                  return (
                    <tr
                      key={cable.id}
                      className={cn(
                        "hover:bg-neutral-50/70 transition-colors",
                        isCurrentRack ? "bg-sky-50/30" : ""
                      )}
                    >
                      {/* ID & Color Dot */}
                      <td className="p-3 font-bold text-neutral-900">
                        <div className="flex items-center gap-1.5">
                          <span
                            className="w-2.5 h-2.5 rounded-full inline-block shrink-0 shadow-xs"
                            style={{ backgroundColor: cable.wireColor }}
                          />
                          <bdi dir="ltr">{cable.id}</bdi>
                        </div>
                      </td>

                      {/* Category & SIL */}
                      <td className="p-3">
                        <div className="flex flex-col gap-1 items-start font-sans">
                          <span
                            className={cn(
                              "text-[10px] px-1.5 py-0.5 rounded border font-semibold",
                              badge.bg
                            )}
                          >
                            {badge.label}
                          </span>
                          <bdi dir="ltr" className="text-[9px] font-mono text-neutral-500">
                            {cable.safetyLevel}
                          </bdi>
                        </div>
                      </td>

                      {/* Source */}
                      <td className="p-3 text-neutral-800">
                        <div className="space-y-0.5">
                          <bdi dir="ltr" className="font-bold block text-neutral-900 text-left">
                            {cable.source.rackId} • {cable.source.slot}
                          </bdi>
                          <bdi dir="ltr" className="text-[10px] text-neutral-500 block truncate max-w-[180px] text-left">
                            {cable.source.portOrPin}
                          </bdi>
                        </div>
                      </td>

                      {/* Destination */}
                      <td className="p-3 text-neutral-800">
                        <div className="space-y-0.5">
                          <bdi dir="ltr" className="font-bold block text-neutral-900 text-left">
                            {cable.destination.labelEn}
                          </bdi>
                          <bdi dir="ltr" className="text-[10px] text-neutral-500 block text-left">
                            {cable.destination.portOrPin}
                            {cable.destination.chainageOrLocation && ` (${cable.destination.chainageOrLocation})`}
                          </bdi>
                        </div>
                      </td>

                      {/* Cable Spec */}
                      <td className="p-3 text-neutral-600 max-w-[200px]">
                        <span className="truncate block" title={cable.specificationEn}>
                          {cable.specificationEn}
                        </span>
                      </td>

                      {/* Length */}
                      <td className="p-3 font-bold text-neutral-700">
                        {cable.lengthMeters} m
                      </td>

                      {/* Signal Telemetry */}
                      <td className="p-3">
                        <div className="space-y-0.5 text-[10px]">
                          <span className="text-emerald-600 font-bold block">
                            {cable.telemetry.signalLevel}
                          </span>
                          <span className="text-neutral-400 block">
                            Loss: {cable.telemetry.packetLossPct}% • Latency: {cable.telemetry.latencyMs || 0.3}ms
                          </span>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="p-3 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          {onSelectRackAndTrace && (
                            <button
                              type="button"
                              onClick={() => onSelectRackAndTrace(cable.source.rackId, cable.id)}
                              className="px-2 py-1 rounded bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-sans text-[10px] font-semibold transition-colors flex items-center gap-1 cursor-pointer"
                              title="مشاهده و ردیابی در نمای بصری رک"
                            >
                              <Eye className="w-3 h-3 text-sky-600" />
                              <span>ردیابی در رک</span>
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() => setDiagnosingCable(cable)}
                            className="px-2 py-1 rounded bg-sky-50 hover:bg-sky-100 text-sky-700 border border-sky-200 font-sans text-[10px] font-semibold transition-colors flex items-center gap-1 cursor-pointer"
                            title="اجرای آزمون پینگ و لوپ‌بک سیگنال"
                          >
                            <ArrowRightLeft className="w-3 h-3" />
                            <span>تست سیگنال</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer Summary */}
        <div className="p-3 bg-neutral-50 border-t border-neutral-200 flex flex-col sm:flex-row sm:items-center justify-between text-xs text-neutral-500 gap-2">
          <span>
            تعداد کابل‌های نمایش‌داده‌شده: <strong>{filteredCables.length}</strong> از <strong>{SYSTEM_CABLING_RUNS.length}</strong> مسیر
          </span>
          <span className="text-[11px] font-mono">
            استانداردهای سیم‌کشی: CENELEC EN 50126, EN 50159 Cat 1, IEC 62439 MRP
          </span>
        </div>
      </div>

      {/* Diagnostics Modal */}
      {diagnosingCable && (
        <PortDiagnosticsModal
          isOpen={!!diagnosingCable}
          onClose={() => setDiagnosingCable(null)}
          cable={diagnosingCable}
          port={{
            id: diagnosingCable.id,
            type: diagnosingCable.category === 'fiber_optic' ? 'SFP' : 'RJ45',
            labelEn: diagnosingCable.source.portOrPin,
            speed: diagnosingCable.telemetry.speedOrRate,
            status: 'active',
            connectedToEn: diagnosingCable.destination.labelEn,
            cableType: diagnosingCable.specificationEn,
          }}
        />
      )}
    </div>
  );
};
