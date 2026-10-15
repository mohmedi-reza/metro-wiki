import React, { useState, useEffect } from 'react';
import { HardwarePort } from '../../../types/realisticHardware';
import { CableRun } from '../../../types/cableSchedule';
import { cn } from '../../../lib/utils';
import {
  Activity,
  Zap,
  CheckCircle2,
  AlertTriangle,
  Play,
  RotateCcw,
  X,
  Radio,
  Sliders,
  ShieldCheck,
  Cpu,
  Layers,
  ArrowRightLeft,
} from 'lucide-react';

interface PortDiagnosticsModalProps {
  port: HardwarePort | null;
  cable?: CableRun | null;
  isOpen: boolean;
  onClose: () => void;
}

export const PortDiagnosticsModal: React.FC<PortDiagnosticsModalProps> = ({
  port,
  cable,
  isOpen,
  onClose,
}) => {
  const [testRunning, setTestRunning] = useState<boolean>(false);
  const [testProgress, setTestProgress] = useState<number>(0);
  const [packetsSent, setPacketsSent] = useState<number>(100);
  const [packetsReceived, setPacketsReceived] = useState<number>(100);
  const [crcErrors, setCrcErrors] = useState<number>(0);
  const [latencyMs, setLatencyMs] = useState<number>(0.28);
  const [opticalTxDbm, setOpticalTxDbm] = useState<number>(-3.15);
  const [opticalRxDbm, setOpticalRxDbm] = useState<number>(-4.22);
  const [eyeHeightMv, setEyeHeightMv] = useState<number>(780);

  // Auto loopback simulation
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (testRunning) {
      interval = setInterval(() => {
        setTestProgress((prev) => {
          if (prev >= 100) {
            setTestRunning(false);
            return 100;
          }
          setPacketsSent((p) => p + 25);
          setPacketsReceived((p) => p + 25);
          setLatencyMs(Number((0.25 + Math.random() * 0.08).toFixed(2)));
          setOpticalTxDbm(Number((-3.1 - Math.random() * 0.1).toFixed(2)));
          setOpticalRxDbm(Number((-4.2 - Math.random() * 0.1).toFixed(2)));
          return prev + 10;
        });
      }, 300);
    }
    return () => clearInterval(interval);
  }, [testRunning]);

  if (!isOpen || !port) return null;

  const handleStartTest = () => {
    setTestProgress(0);
    setPacketsSent(0);
    setPacketsReceived(0);
    setCrcErrors(0);
    setTestRunning(true);
  };

  const isFiber = port.type === 'SFP' || port.type === 'SFP+' || port.type === 'LC_DUPLEX' || port.type === 'SC_APC';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in select-none">
      <div className="relative w-full max-w-2xl bg-neutral-925 rounded-2xl border-2 border-neutral-700 shadow-2xl overflow-hidden flex flex-col text-neutral-100 max-h-[92vh]">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between p-3.5 sm:p-4 bg-neutral-900 border-b border-neutral-800 shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="p-2 rounded-xl bg-sky-500/10 border border-sky-500/30 text-sky-400">
              <ArrowRightLeft className="w-4 h-4" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm sm:text-base text-white truncate">
                  عیب‌یابی پورت و آزمون لوپ‌بک سیگنال (Port Loopback Diagnostic)
                </h3>
                <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-sky-950 text-sky-300 border border-sky-800">
                  {port.type}
                </span>
              </div>
              <p className="text-[11px] font-mono text-neutral-400 truncate">
                {port.labelEn} • {port.speed}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 font-mono text-xs">
          
          {/* Target Port Status & Connected Target */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="bg-neutral-950 p-3 rounded-xl border border-neutral-800 space-y-1.5">
              <span className="text-[10px] text-neutral-500 uppercase tracking-wider block">
                موقعیت و شناسه پورت فیزیکی
              </span>
              <p className="font-bold text-white text-sm">{port.labelEn}</p>
              <p className="text-neutral-400 text-[11px]">{port.connectedToEn}</p>
              <div className="flex items-center gap-2 pt-1 text-[10px]">
                <span className="text-emerald-400 font-bold">وضعیت لینک: {port.status.toUpperCase()}</span>
                <span className="text-neutral-500">•</span>
                <span className="text-neutral-300">{port.speed}</span>
              </div>
            </div>

            <div className="bg-neutral-950 p-3 rounded-xl border border-neutral-800 space-y-1.5">
              <span className="text-[10px] text-neutral-500 uppercase tracking-wider block">
                مشخصات کابل و مدیا فیزیکی
              </span>
              <p className="font-bold text-amber-400 text-sm">
                {cable?.specificationEn || port.cableType}
              </p>
              <div className="text-neutral-400 text-[10px] space-y-0.5">
                <p>طول کابل برآورد شده: {cable?.lengthMeters ? `${cable.lengthMeters} متر` : '۱.۸ متر (پچ‌کورد)'}</p>
                <p>استاندارد ایمنی: {cable?.safetyLevel || 'CENELEC SIL-4 Fail-Safe'}</p>
              </div>
            </div>
          </div>

          {/* Real-time Oscilloscope / Eye Diagram Simulation */}
          <div className="bg-neutral-950 p-3.5 rounded-xl border border-neutral-800 space-y-2">
            <div className="flex items-center justify-between text-[11px]">
              <span className="font-bold text-neutral-300 flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-emerald-400" />
                <span>نمودار الگوی چشم سیگنال دیفرانسیلی (Eye Diagram Pattern):</span>
              </span>
              <span className="text-emerald-400 font-bold">
                Jitter &lt; 22ps • BER &lt; 10⁻¹²
              </span>
            </div>

            {/* SVG Eye Diagram Simulation */}
            <div className="h-28 bg-neutral-900/90 rounded-lg border border-neutral-800 relative overflow-hidden flex items-center justify-center">
              {/* Grid Lines */}
              <div className="absolute inset-0 grid grid-cols-6 grid-rows-4 pointer-events-none opacity-20">
                {[...Array(24)].map((_, i) => (
                  <div key={i} className="border border-sky-400/40" />
                ))}
              </div>

              {/* Animated Wave Lines */}
              <svg className="w-full h-full p-2" viewBox="0 0 500 100" preserveAspectRatio="none">
                <path
                  d="M 0 50 Q 125 10, 250 50 T 500 50"
                  fill="none"
                  stroke="#38bdf8"
                  strokeWidth="2"
                  opacity={testRunning ? "0.9" : "0.5"}
                  className={testRunning ? "animate-pulse" : ""}
                />
                <path
                  d="M 0 50 Q 125 90, 250 50 T 500 50"
                  fill="none"
                  stroke="#10b981"
                  strokeWidth="2"
                  opacity={testRunning ? "0.9" : "0.5"}
                />
                <path
                  d="M 0 20 Q 250 10, 500 20"
                  fill="none"
                  stroke="#a855f7"
                  strokeWidth="1.5"
                  strokeDasharray="4 4"
                />
                <path
                  d="M 0 80 Q 250 90, 500 80"
                  fill="none"
                  stroke="#a855f7"
                  strokeWidth="1.5"
                  strokeDasharray="4 4"
                />
              </svg>

              <div className="absolute bottom-1 right-2 text-[9px] text-neutral-400 bg-neutral-950/80 px-2 py-0.5 rounded border border-neutral-800">
                ارتفاع بازشدگی چشم (Eye Opening): <strong className="text-sky-300">{eyeHeightMv} mV</strong>
              </div>
            </div>
          </div>

          {/* Test Telemetry Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <div className="bg-neutral-950 p-2.5 rounded-xl border border-neutral-800 text-center">
              <span className="text-[10px] text-neutral-500 block">بسته‌های ارسالی (TX)</span>
              <span className="text-base font-bold text-white mt-0.5 block">{packetsSent.toLocaleString()}</span>
              <span className="text-[9px] text-emerald-400">100% Delivered</span>
            </div>

            <div className="bg-neutral-950 p-2.5 rounded-xl border border-neutral-800 text-center">
              <span className="text-[10px] text-neutral-500 block">بسته‌های دریافتی (RX)</span>
              <span className="text-base font-bold text-white mt-0.5 block">{packetsReceived.toLocaleString()}</span>
              <span className="text-[9px] text-emerald-400">0 Dropped</span>
            </div>

            <div className="bg-neutral-950 p-2.5 rounded-xl border border-neutral-800 text-center">
              <span className="text-[10px] text-neutral-500 block">خطای CRC ۳۲ بیتی</span>
              <span className="text-base font-bold text-emerald-400 mt-0.5 block">{crcErrors}</span>
              <span className="text-[9px] text-neutral-400">EN 50159 Valid</span>
            </div>

            <div className="bg-neutral-950 p-2.5 rounded-xl border border-neutral-800 text-center">
              <span className="text-[10px] text-neutral-500 block">تاخیر رفت و برگشت (RTT)</span>
              <span className="text-base font-bold text-sky-400 mt-0.5 block">{latencyMs} ms</span>
              <span className="text-[9px] text-neutral-400">Real-Time Safe</span>
            </div>
          </div>

          {/* Optical Specific Readouts */}
          {isFiber && (
            <div className="bg-neutral-950 p-3 rounded-xl border border-neutral-800 flex items-center justify-between text-[11px]">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                <span className="font-bold text-neutral-300">سنسور توان نوری DDM SFP:</span>
              </div>
              <div className="flex items-center gap-4">
                <span>توان فرستنده (TX): <strong className="text-amber-400">{opticalTxDbm} dBm</strong></span>
                <span>توان گیرنده (RX): <strong className="text-amber-400">{opticalRxDbm} dBm</strong></span>
                <span className="text-emerald-400 font-bold">حاشیه ایمنی: +14.2 dB ✓</span>
              </div>
            </div>
          )}

          {/* Test Execution Bar & Buttons */}
          <div className="bg-neutral-900 p-3 rounded-xl border border-neutral-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-1 flex-1 min-w-0">
              <div className="flex items-center justify-between text-[10px] text-neutral-400">
                <span>پیشرفت آزمون تزریق پالس لوپ‌بک:</span>
                <span className="font-bold text-sky-400">{testProgress}%</span>
              </div>
              <div className="w-full h-2 bg-neutral-950 rounded-full overflow-hidden border border-neutral-800">
                <div
                  className="h-full bg-gradient-to-r from-sky-500 via-indigo-500 to-emerald-400 transition-all duration-300"
                  style={{ width: `${testProgress}%` }}
                />
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={handleStartTest}
                disabled={testRunning}
                className="px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-neutral-950 font-bold transition-colors disabled:opacity-50 cursor-pointer flex items-center gap-1.5 shadow-md shadow-sky-500/20"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>{testRunning ? 'در حال ارسال پکت...' : 'شروع آزمون لوپ‌بک'}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setTestProgress(0);
                  setPacketsSent(100);
                  setPacketsReceived(100);
                  setTestRunning(false);
                }}
                className="p-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-white transition-colors cursor-pointer"
                title="بازنشانی"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 bg-neutral-900 border-t border-neutral-800 flex items-center justify-between text-[10px] text-neutral-400 shrink-0 font-mono">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>مطابق با استاندارد CENELEC EN 50159 و EN 50128 SIL 4</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-white font-semibold transition-colors cursor-pointer"
          >
            بستن پنجره
          </button>
        </div>
      </div>
    </div>
  );
};
