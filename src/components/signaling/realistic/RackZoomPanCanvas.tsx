import React, { useState, useRef, useEffect } from 'react';
import {
  ZoomIn,
  ZoomOut,
  Maximize2,
  Minimize2,
  RotateCcw,
  Move,
  Layers,
  Eye,
  Sliders,
  Cable,
} from 'lucide-react';
import { cn } from '../../../lib/utils';

interface RackZoomPanCanvasProps {
  children: React.ReactNode;
  elevationView: 'front' | 'rear';
  onChangeElevationView: (view: 'front' | 'rear') => void;
  showCabling: boolean;
  onToggleCabling: () => void;
  className?: string;
}

export const RackZoomPanCanvas: React.FC<RackZoomPanCanvasProps> = ({
  children,
  elevationView,
  onChangeElevationView,
  showCabling,
  onToggleCabling,
  className,
}) => {
  // Default scale 0.58 so the entire 42U rack (all subracks, fans, rails, and earth bar) fits on screen without scrolling
  const [scale, setScale] = useState<number>(0.58);
  const [position, setPosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  const containerRef = useRef<HTMLDivElement>(null);

  // Handle zoom in/out with clamp (0.3x to 2.5x)
  const handleZoom = (delta: number) => {
    setScale((prev) => Math.min(Math.max(Number((prev + delta).toFixed(2)), 0.3), 2.5));
  };

  // Reset zoom & pan to 100% CAD scale
  const handleReset = () => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  };

  // Fit to screen so all 42 units are completely visible without scrolling
  const handleFit = () => {
    setScale(0.55);
    setPosition({ x: 0, y: 0 });
  };

  // Mouse pan handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    // Only drag with left mouse button if not clicking an interactive button
    if (e.button === 0) {
      const target = e.target as HTMLElement;
      if (target.closest('button') || target.closest('select') || target.closest('[data-no-drag]')) {
        return;
      }
      setIsDragging(true);
      setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Mouse wheel zoom
  const handleWheel = (e: React.WheelEvent) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      const zoomDelta = e.deltaY < 0 ? 0.15 : -0.15;
      handleZoom(zoomDelta);
    }
  };

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative rounded-2xl border border-neutral-800 bg-neutral-950 overflow-hidden flex flex-col shadow-2xl transition-all select-none",
        isFullscreen ? "fixed inset-0 z-50 rounded-none border-none max-h-screen" : "min-h-[640px]",
        className
      )}
    >
      {/* Top Professional CAD/DCIM Canvas Toolbar */}
      <div className="flex flex-wrap items-center justify-between p-2.5 sm:p-3 bg-neutral-900 border-b border-neutral-800 text-neutral-300 gap-2 shrink-0 z-30">
        
        {/* Left: Elevation View Switcher (Front vs Rear) */}
        <div className="flex items-center gap-1 bg-neutral-950 p-1 rounded-xl border border-neutral-800 text-xs font-mono">
          <button
            type="button"
            onClick={() => onChangeElevationView('front')}
            className={cn(
              "px-3 py-1 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1.5",
              elevationView === 'front'
                ? "bg-sky-600 text-white shadow-sm"
                : "text-neutral-400 hover:text-white"
            )}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>نمای روبرو (Front)</span>
          </button>

          <button
            type="button"
            onClick={() => onChangeElevationView('rear')}
            className={cn(
              "px-3 py-1 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1.5",
              elevationView === 'rear'
                ? "bg-amber-600 text-white shadow-sm"
                : "text-neutral-400 hover:text-white"
            )}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>نمای پشت (Rear)</span>
          </button>
        </div>

        {/* Center: Cabling Overlay Toggle */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onToggleCabling}
            className={cn(
              "px-2.5 py-1 rounded-lg text-xs font-mono font-semibold border transition-all cursor-pointer flex items-center gap-1.5",
              showCabling
                ? "bg-indigo-950 text-indigo-300 border-indigo-700 shadow-sm shadow-indigo-900/50"
                : "bg-neutral-950 text-neutral-400 border-neutral-800 hover:text-white"
            )}
          >
            <Cable className="w-3.5 h-3.5" />
            <span>پچ‌کوردها و سیم‌کشی: {showCabling ? 'روشن' : 'خاموش'}</span>
          </button>
        </div>

        {/* Right: Zoom & Pan CAD Controls */}
        <div className="flex items-center gap-1 bg-neutral-950 p-1 rounded-xl border border-neutral-800 text-xs font-mono">
          <button
            type="button"
            onClick={() => handleZoom(-0.2)}
            title="بزرگنمایی کمتر (Zoom Out)"
            className="p-1.5 rounded-lg hover:bg-neutral-800 text-neutral-400 hover:text-white transition-colors cursor-pointer"
          >
            <ZoomOut className="w-4 h-4" />
          </button>

          <span className="px-2 py-0.5 text-[11px] font-bold text-neutral-300 min-w-[50px] text-center">
            {Math.round(scale * 100)}%
          </span>

          <button
            type="button"
            onClick={() => handleZoom(0.2)}
            title="بزرگنمایی بیشتر (Zoom In)"
            className="p-1.5 rounded-lg hover:bg-neutral-800 text-neutral-400 hover:text-white transition-colors cursor-pointer"
          >
            <ZoomIn className="w-4 h-4" />
          </button>

          <div className="w-px h-4 bg-neutral-800 mx-0.5" />

          <button
            type="button"
            onClick={handleFit}
            title="برازش تمام قد رک (Fit Full 42U to Screen)"
            className="px-2.5 py-1 rounded-lg hover:bg-neutral-800 text-[11px] text-sky-400 hover:text-white transition-colors cursor-pointer font-bold border border-neutral-700"
          >
            Fit 42U
          </button>

          <button
            type="button"
            onClick={handleReset}
            title="اندازه واقعی ۱۰۰٪ (100% CAD Scale)"
            className="p-1.5 rounded-lg hover:bg-neutral-800 text-neutral-400 hover:text-white transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={() => setIsFullscreen(!isFullscreen)}
            title={isFullscreen ? "خروج از تمام‌صفحه" : "نمایش تمام‌صفحه کانواس"}
            className="p-1.5 rounded-lg hover:bg-neutral-800 text-sky-400 hover:text-sky-300 transition-colors cursor-pointer"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Main Pan/Zoom Interactive Viewport */}
      <div
        className={cn(
          "flex-1 relative overflow-hidden bg-[radial-gradient(#262626_1px,transparent_1px)] [background-size:20px_20px] bg-neutral-950 p-4 flex items-center justify-center",
          isDragging ? "cursor-grabbing" : "cursor-grab"
        )}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
      >
        <div
          style={{
            transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
            transformOrigin: 'center center',
            transition: isDragging ? 'none' : 'transform 0.15s ease-out',
          }}
          className="w-full max-w-3xl"
        >
          {children}
        </div>

        {/* Viewport Hint Badge */}
        <div className="absolute bottom-3 left-3 z-30 flex items-center gap-2 bg-neutral-900/90 backdrop-blur-md px-2.5 py-1.5 rounded-xl border border-neutral-800 text-[10px] font-mono text-neutral-400 pointer-events-none">
          <Move className="w-3.5 h-3.5 text-neutral-500" />
          <span>درگ ماوس = جابجایی (Pan) • چرخ ماوس با کلید Ctrl = زوم</span>
        </div>
      </div>
    </div>
  );
};
