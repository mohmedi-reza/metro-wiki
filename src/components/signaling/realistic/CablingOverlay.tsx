import React, { useState } from 'react';
import { CableRun } from '../../../types/cableSchedule';
import { SYSTEM_CABLING_RUNS } from '../../../data/cablingData';
import { cn } from '../../../lib/utils';
import { Activity, Zap, CheckCircle2, ArrowRightLeft, Radio, ExternalLink } from 'lucide-react';

interface CablingOverlayProps {
  rackId: string;
  onSelectCable?: (cable: CableRun) => void;
  onOpenPortDiagnostics?: (cable: CableRun) => void;
  selectedCableId?: string | null;
  className?: string;
}

export const CablingOverlay: React.FC<CablingOverlayProps> = ({
  rackId,
  onSelectCable,
  onOpenPortDiagnostics,
  selectedCableId,
  className,
}) => {
  const [hoveredCableId, setHoveredCableId] = useState<string | null>(null);

  // Filter cables that touch this rack
  const rackCables = SYSTEM_CABLING_RUNS.filter(
    (c) => c.source.rackId === rackId || c.destination.rackId === rackId
  );

  const activeCable = rackCables.find((c) => c.id === (hoveredCableId || selectedCableId));

  return (
    <div className={cn("relative w-full pointer-events-none select-none", className)}>
      {/* SVG Canvas drawing patch cords */}
      <svg
        className="w-full h-full absolute inset-0 overflow-visible"
        style={{ zIndex: 20 }}
      >
        <defs>
          <filter id="cableGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Draw realistic curved patch cables running along side duct channels */}
        {rackCables.map((cable, idx) => {
          const isSelected = cable.id === selectedCableId;
          const isHovered = cable.id === hoveredCableId;
          const isHighlighted = isSelected || isHovered;

          // Compute stylized Bezier curve anchors for rack elevation
          // Cables drop from port into right or left cable duct channel
          const isEven = idx % 2 === 0;
          const yStart = 60 + idx * 75;
          const yEnd = 140 + idx * 75;
          const ductX = isEven ? 24 : 96; // Left or right duct
          const portX = isEven ? 38 : 62;

          const pathD = `M ${portX} ${yStart} C ${ductX} ${yStart}, ${ductX} ${yEnd}, ${portX} ${yEnd}`;

          return (
            <g
              key={cable.id}
              className="pointer-events-auto cursor-pointer"
              onClick={() => onSelectCable && onSelectCable(cable)}
              onMouseEnter={() => setHoveredCableId(cable.id)}
              onMouseLeave={() => setHoveredCableId(null)}
            >
              {/* Shadow / Outer Shield */}
              <path
                d={pathD}
                fill="none"
                stroke="#09090b"
                strokeWidth={isHighlighted ? 9 : 6}
                strokeLinecap="round"
                opacity={0.8}
              />

              {/* Cable Outer Jacket */}
              <path
                d={pathD}
                fill="none"
                stroke={cable.wireColor}
                strokeWidth={isHighlighted ? 5 : 3.5}
                strokeLinecap="round"
                opacity={isHighlighted ? 1 : 0.85}
                filter={isHighlighted ? "url(#cableGlow)" : undefined}
              />

              {/* Data pulse animation when highlighted */}
              {isHighlighted && (
                <path
                  d={pathD}
                  fill="none"
                  stroke="#ffffff"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeDasharray="6 14"
                  className="animate-pulse"
                />
              )}
            </g>
          );
        })}
      </svg>

      {/* Floating Cable Telemetry Flyout Card */}
      {activeCable && (
        <div
          className="absolute top-4 left-4 z-40 bg-neutral-900/95 backdrop-blur-md border border-neutral-700 p-3 rounded-xl shadow-2xl text-white font-mono text-xs max-w-sm pointer-events-auto animate-in fade-in zoom-in-95"
        >
          <div className="flex items-center justify-between pb-1.5 mb-1.5 border-b border-neutral-800 gap-2">
            <div className="flex items-center gap-1.5">
              <span
                className="w-2.5 h-2.5 rounded-full inline-block shrink-0 shadow-sm"
                style={{ backgroundColor: activeCable.wireColor }}
              />
              <span className="font-bold text-sky-400">{activeCable.id}</span>
            </div>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 font-bold">
              {activeCable.safetyLevel}
            </span>
          </div>

          <p className="font-sans text-[11px] text-neutral-200 mb-2 font-medium">
            {activeCable.labelEn}
          </p>

          <div className="space-y-1 text-[10px] text-neutral-400 bg-neutral-950/80 p-2 rounded-lg border border-neutral-800">
            <div>
              <span className="text-neutral-500">مبدا:</span>{' '}
              <strong className="text-neutral-200">{activeCable.source.labelEn}</strong>
            </div>
            <div>
              <span className="text-neutral-500">مقصد:</span>{' '}
              <strong className="text-neutral-200">{activeCable.destination.labelEn}</strong>
            </div>
            <div>
              <span className="text-neutral-500">نوع کابل:</span>{' '}
              <span className="text-amber-300 font-semibold">{activeCable.specificationEn}</span>
            </div>
            <div className="pt-1 border-t border-neutral-800 flex items-center justify-between text-neutral-300">
              <span>سیگنال: {activeCable.telemetry.signalLevel}</span>
              <span className="text-emerald-400 font-bold">Loss: {activeCable.telemetry.packetLossPct}%</span>
            </div>
          </div>

          {onOpenPortDiagnostics && (
            <button
              type="button"
              onClick={() => onOpenPortDiagnostics(activeCable)}
              className="mt-2 w-full py-1.5 px-2 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-bold text-[10px] transition-colors flex items-center justify-center gap-1 cursor-pointer"
            >
              <ArrowRightLeft className="w-3 h-3" />
              <span>اجرای آزمون پینگ و لوپ‌بک سیگنال</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
};
