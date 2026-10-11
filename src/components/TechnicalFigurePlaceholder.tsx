import React, { useState } from "react";
import {
  Image as ImageIcon,
  Maximize2,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  CheckCircle2,
  Info,
  Layers,
  Activity,
  Cpu,
  ShieldAlert,
  Sliders,
  Radio,
  Workflow,
  Sparkles,
} from "lucide-react";
import { cn } from "../lib/utils";

export interface SchematicFigureProps {
  id?: string;
  figureNumber?: string; // e.g. "شکل ۱" or "Figure 1"
  title: string;
  subtitle?: string;
  category?: string; // e.g. "بلوک دیاگرام", "طرح شماتیک", "معماری سخت‌افزار", "نقشه ادوات"
  caption?: string; // explanatory text under image
  aspectRatio?: "video" | "wide" | "square" | "portrait";
  type?:
    | "block_diagram"
    | "hardware_rack"
    | "track_circuit"
    | "axle_counter"
    | "interlocking"
    | "atc_onboard"
    | "ctc_network"
    | "generic";
  blueprintSpec?: {
    standard?: string; // e.g. "CENELEC EN 50129 SIL 4"
    docCode?: string; // e.g. "EUR01881-MHR-ENT-SI-TSP-203"
    scale?: string; // e.g. "N.T.S (Not to Scale)"
    revision?: string; // e.g. "Rev B"
  };
}

export const TechnicalFigurePlaceholder: React.FC<SchematicFigureProps> = ({
  id,
  figureNumber = "شکل",
  title,
  subtitle,
  category = "طرح شماتیک مهندسی",
  caption,
  type = "generic",
  blueprintSpec,
}) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [activeLayer, setActiveLayer] = useState<"schematic" | "spec" | "pins">("schematic");

  const handleResetZoom = () => setZoomLevel(1);
  const handleZoomIn = () => setZoomLevel((prev) => Math.min(prev + 0.25, 2.5));
  const handleZoomOut = () => setZoomLevel((prev) => Math.max(prev - 0.25, 0.75));

  // Visual SVG Schematic rendering based on technical type
  const renderInteractiveSvgDiagram = () => {
    switch (type) {
      case "axle_counter":
        return (
          <svg
            viewBox="0 0 900 380"
            className="w-full h-full select-none"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <pattern id="grid-pattern-ac" width="20" height="20" patternUnits="userSpaceOnUse">
                <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#f1f5f9" strokeWidth="1" />
              </pattern>
              <linearGradient id="railGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#475569" />
                <stop offset="50%" stopColor="#64748b" />
                <stop offset="100%" stopColor="#334155" />
              </linearGradient>
            </defs>
            <rect width="900" height="380" fill="#f8fafc" />
            <rect width="900" height="380" fill="url(#grid-pattern-ac)" />

            {/* Outdoor Wayside Zone */}
            <rect x="25" y="25" width="260" height="330" rx="12" fill="#ffffff" stroke="#cbd5e1" strokeWidth="2" strokeDasharray="4 4" />
            <rect x="35" y="35" width="130" height="24" rx="4" fill="#0f172a" />
            <text x="100" y="51" fill="#ffffff" fontSize="11" fontWeight="bold" textAnchor="middle" fontFamily="Vazirmatn, sans-serif">
              بخش محوطه (Outdoor)
            </text>

            {/* Rails */}
            <line x1="45" y1="120" x2="265" y2="120" stroke="url(#railGrad)" strokeWidth="12" strokeLinecap="round" />
            <line x1="45" y1="160" x2="265" y2="160" stroke="url(#railGrad)" strokeWidth="12" strokeLinecap="round" />
            <text x="155" y="105" fill="#475569" fontSize="11" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">
              Running Rails (S49T / 1435mm)
            </text>

            {/* Wheel Flange Detecting Sensor */}
            <rect x="110" y="128" width="90" height="24" rx="4" fill="#0284c7" stroke="#0369a1" strokeWidth="2" />
            <circle cx="130" cy="140" r="5" fill="#38bdf8" />
            <circle cx="180" cy="140" r="5" fill="#38bdf8" />
            <text x="155" y="144" fill="#ffffff" fontSize="9" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">
              MH-AX SENSOR
            </text>
            <text x="155" y="178" fill="#0369a1" fontSize="10" fontWeight="600" textAnchor="middle" fontFamily="Vazirmatn, sans-serif">
              سنسور یکپارچه جان ریل
            </text>

            {/* FSK Transmission Line */}
            <path d="M 200 140 L 340 140 L 340 190 L 400 190" stroke="#0284c7" strokeWidth="3" strokeDasharray="6 3" />
            <circle cx="340" cy="190" r="4" fill="#0284c7" />
            <rect x="290" y="170" width="100" height="42" rx="6" fill="#e0f2fe" stroke="#38bdf8" />
            <text x="340" y="187" fill="#0369a1" fontSize="10" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">
              FSK Carrier Link
            </text>
            <text x="340" y="202" fill="#0284c7" fontSize="9" textAnchor="middle" fontFamily="Vazirmatn, sans-serif">
              تا ۴ کیلومتر برد خط
            </text>

            {/* Indoor SER Zone */}
            <rect x="400" y="25" width="475" height="330" rx="12" fill="#ffffff" stroke="#0f172a" strokeWidth="2" />
            <rect x="415" y="35" width="160" height="24" rx="4" fill="#0f172a" />
            <text x="495" y="51" fill="#ffffff" fontSize="11" fontWeight="bold" textAnchor="middle" fontFamily="Vazirmatn, sans-serif">
              سالن تجهیزات (SER Indoor)
            </text>

            {/* 3U Subrack Box */}
            <rect x="425" y="80" width="230" height="255" rx="8" fill="#f8fafc" stroke="#94a3b8" strokeWidth="2" />
            <rect x="435" y="92" width="210" height="26" rx="4" fill="#334155" />
            <text x="540" y="109" fill="#f8fafc" fontSize="11" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">
              MH-AX Indoor Sub-rack (3U)
            </text>

            {/* Dual Redundant Processing Channels */}
            <rect x="440" y="130" width="95" height="130" rx="6" fill="#ffffff" stroke="#0ea5e9" strokeWidth="2" />
            <text x="487" y="150" fill="#0369a1" fontSize="10" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">
              DSP Channel A
            </text>
            <circle cx="487" cy="170" r="8" fill="#22c55e" />
            <text x="487" y="195" fill="#64748b" fontSize="9" textAnchor="middle" fontFamily="sans-serif">
              Pulse Count: OK
            </text>
            <rect x="448" y="215" width="79" height="18" rx="3" fill="#e2e8f0" />
            <text x="487" y="227" fill="#334155" fontSize="8" textAnchor="middle" fontFamily="sans-serif">
              SIL 4 Safe Core
            </text>

            <rect x="545" y="130" width="95" height="130" rx="6" fill="#ffffff" stroke="#0ea5e9" strokeWidth="2" />
            <text x="592" y="150" fill="#0369a1" fontSize="10" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">
              DSP Channel B
            </text>
            <circle cx="592" cy="170" r="8" fill="#22c55e" />
            <text x="592" y="195" fill="#64748b" fontSize="9" textAnchor="middle" fontFamily="sans-serif">
              Pulse Count: OK
            </text>
            <rect x="553" y="215" width="79" height="18" rx="3" fill="#e2e8f0" />
            <text x="592" y="227" fill="#334155" fontSize="8" textAnchor="middle" fontFamily="sans-serif">
              SIL 4 Safe Core
            </text>

            {/* Voting / Cross-check Link */}
            <path d="M 535 170 L 545 170" stroke="#f59e0b" strokeWidth="3" />

            {/* Dual Ethernet to EIL */}
            <path d="M 655 160 L 725 160" stroke="#10b981" strokeWidth="3" />
            <path d="M 655 220 L 725 220" stroke="#10b981" strokeWidth="3" />
            <text x="690" y="150" fill="#059669" fontSize="9" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">
              ETH Port A
            </text>
            <text x="690" y="235" fill="#059669" fontSize="9" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">
              ETH Port B
            </text>

            {/* Electronic Interlocking (EIL) */}
            <rect x="725" y="115" width="135" height="155" rx="8" fill="#1e293b" stroke="#0f172a" strokeWidth="2" />
            <text x="792" y="145" fill="#ffffff" fontSize="12" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">
              EIL HOST
            </text>
            <text x="792" y="165" fill="#94a3b8" fontSize="10" textAnchor="middle" fontFamily="Vazirmatn, sans-serif">
              اینترلاکینگ الکترونیکی
            </text>
            <rect x="740" y="185" width="105" height="24" rx="4" fill="#047857" />
            <text x="792" y="201" fill="#ecfdf5" fontSize="10" fontWeight="bold" textAnchor="middle" fontFamily="Vazirmatn, sans-serif">
              وضعیت بلاک: آزاد
            </text>
            <text x="792" y="240" fill="#64748b" fontSize="8" textAnchor="middle" fontFamily="sans-serif">
              2oo3 Maharan VPU
            </text>
          </svg>
        );

      case "track_circuit":
        return (
          <svg
            viewBox="0 0 900 380"
            className="w-full h-full select-none"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <pattern id="grid-pattern-tc" width="20" height="20" patternUnits="userSpaceOnUse">
                <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#f1f5f9" strokeWidth="1" />
              </pattern>
            </defs>
            <rect width="900" height="380" fill="#f8fafc" />
            <rect width="900" height="380" fill="url(#grid-pattern-tc)" />

            {/* Rails */}
            <rect x="30" y="140" width="840" height="14" rx="4" fill="#475569" />
            <rect x="30" y="200" width="840" height="14" rx="4" fill="#475569" />
            <text x="70" y="125" fill="#334155" fontSize="11" fontWeight="bold" fontFamily="sans-serif">
              Rail A (Track 1500VDC Return)
            </text>
            <text x="70" y="235" fill="#334155" fontSize="11" fontWeight="bold" fontFamily="sans-serif">
              Rail B (Signaling Audio Frequency)
            </text>

            {/* Tuning Units (TU) - Boundary demarcation */}
            <g transform="translate(180, 110)">
              <rect x="0" y="0" width="80" height="135" rx="8" fill="#e0e7ff" stroke="#4f46e5" strokeWidth="2" />
              <text x="40" y="25" fill="#3730a3" fontSize="11" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">
                TU 1
              </text>
              <text x="40" y="45" fill="#4338ca" fontSize="9" textAnchor="middle" fontFamily="sans-serif">
                LC Resonance
              </text>
              <line x1="20" y1="35" x2="20" y2="95" stroke="#4f46e5" strokeWidth="3" />
              <line x1="60" y1="35" x2="60" y2="95" stroke="#4f46e5" strokeWidth="3" />
              <text x="40" y="120" fill="#6b7280" fontSize="9" textAnchor="middle" fontFamily="Vazirmatn, sans-serif">
                مرز بلاک صوتی
              </text>
            </g>

            <g transform="translate(640, 110)">
              <rect x="0" y="0" width="80" height="135" rx="8" fill="#e0e7ff" stroke="#4f46e5" strokeWidth="2" />
              <text x="40" y="25" fill="#3730a3" fontSize="11" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">
                TU 2
              </text>
              <text x="40" y="45" fill="#4338ca" fontSize="9" textAnchor="middle" fontFamily="sans-serif">
                LC Resonance
              </text>
              <line x1="20" y1="35" x2="20" y2="95" stroke="#4f46e5" strokeWidth="3" />
              <line x1="60" y1="35" x2="60" y2="95" stroke="#4f46e5" strokeWidth="3" />
              <text x="40" y="120" fill="#6b7280" fontSize="9" textAnchor="middle" fontFamily="Vazirmatn, sans-serif">
                مرز بلاک صوتی
              </text>
            </g>

            {/* Train Wheelset (Shunt) */}
            <g transform="translate(380, 125)">
              <rect x="0" y="0" width="24" height="40" rx="4" fill="#0f172a" />
              <rect x="116" y="0" width="24" height="40" rx="4" fill="#0f172a" />
              <rect x="0" y="65" width="24" height="40" rx="4" fill="#0f172a" />
              <rect x="116" y="65" width="24" height="40" rx="4" fill="#0f172a" />
              <line x1="24" y1="20" x2="116" y2="20" stroke="#dc2626" strokeWidth="6" />
              <line x1="24" y1="85" x2="116" y2="85" stroke="#dc2626" strokeWidth="6" />
              <rect x="35" y="40" width="70" height="24" rx="4" fill="#fef2f2" stroke="#dc2626" strokeWidth="1.5" />
              <text x="70" y="56" fill="#b91c1c" fontSize="9" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">
                0.06Ω Shunt
              </text>
            </g>

            {/* Transmitter (TCX) & Receiver (TCR) in SER */}
            <g transform="translate(60, 270)">
              <rect x="0" y="0" width="200" height="90" rx="8" fill="#ffffff" stroke="#0f172a" strokeWidth="2" />
              <text x="100" y="24" fill="#0f172a" fontSize="11" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">
                TCX Transmitter (Saloon)
              </text>
              <text x="100" y="42" fill="#475569" fontSize="10" textAnchor="middle" fontFamily="sans-serif">
                Carrier F1 (1699Hz) + ATP Code
              </text>
              <rect x="25" y="55" width="150" height="22" rx="4" fill="#f1f5f9" />
              <text x="100" y="70" fill="#0284c7" fontSize="10" fontWeight="600" textAnchor="middle" fontFamily="sans-serif">
                Class-D Amplifier Output
              </text>
              <path d="M 160 0 L 160 -80 L 190 -80" stroke="#0284c7" strokeWidth="2" strokeDasharray="4 2" />
            </g>

            <g transform="translate(640, 270)">
              <rect x="0" y="0" width="200" height="90" rx="8" fill="#ffffff" stroke="#0f172a" strokeWidth="2" />
              <text x="100" y="24" fill="#0f172a" fontSize="11" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">
                TCR Receiver (Saloon)
              </text>
              <text x="100" y="42" fill="#475569" fontSize="10" textAnchor="middle" fontFamily="sans-serif">
                Dual 2oo2 Safe Processing
              </text>
              <rect x="25" y="55" width="150" height="22" rx="4" fill="#fee2e2" />
              <text x="100" y="70" fill="#b91c1c" fontSize="10" fontWeight="bold" textAnchor="middle" fontFamily="Vazirmatn, sans-serif">
                رله مدار راه: اشغال (Drop)
              </text>
              <path d="M 60 0 L 60 -80 L 30 -80" stroke="#b91c1c" strokeWidth="2" strokeDasharray="4 2" />
            </g>
          </svg>
        );

      case "atc_onboard":
        return (
          <svg
            viewBox="0 0 900 380"
            className="w-full h-full select-none"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <pattern id="grid-pattern-atc" width="20" height="20" patternUnits="userSpaceOnUse">
                <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#f1f5f9" strokeWidth="1" />
              </pattern>
            </defs>
            <rect width="900" height="380" fill="#f8fafc" />
            <rect width="900" height="380" fill="url(#grid-pattern-atc)" />

            {/* Train Cabin Frame */}
            <path d="M 60 310 L 60 90 Q 60 60 120 60 L 780 60 Q 840 60 840 90 L 840 310 Z" fill="#ffffff" stroke="#0f172a" strokeWidth="3" />
            <text x="450" y="45" fill="#0f172a" fontSize="13" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">
              On-board Architecture (Leading Driver Cabin - Train Control Unit)
            </text>

            {/* DMI Display */}
            <g transform="translate(100, 95)">
              <rect x="0" y="0" width="180" height="150" rx="8" fill="#1e293b" stroke="#0f172a" strokeWidth="2" />
              <rect x="10" y="10" width="160" height="90" rx="4" fill="#0f172a" />
              <circle cx="90" cy="55" r="35" fill="none" stroke="#334155" strokeWidth="6" />
              <path d="M 65 70 A 35 35 0 0 1 115 70" fill="none" stroke="#22c55e" strokeWidth="6" />
              <text x="90" y="55" fill="#ffffff" fontSize="16" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">
                52
              </text>
              <text x="90" y="70" fill="#94a3b8" fontSize="9" textAnchor="middle" fontFamily="sans-serif">
                km/h (Target: 70)
              </text>
              <text x="90" y="125" fill="#f8fafc" fontSize="11" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">
                DMI Touch Screen
              </text>
              <text x="90" y="140" fill="#94a3b8" fontSize="9" textAnchor="middle" fontFamily="Vazirmatn, sans-serif">
                واسط ماشین-راهبر
              </text>
            </g>

            {/* 2oo3 Vital Processing Unit (VPU) */}
            <g transform="translate(320, 85)">
              <rect x="0" y="0" width="260" height="170" rx="10" fill="#f8fafc" stroke="#2563eb" strokeWidth="2" />
              <rect x="10" y="10" width="240" height="26" rx="4" fill="#1e40af" />
              <text x="130" y="27" fill="#ffffff" fontSize="11" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">
                VPU: 2oo3 Processing Kernel (SIL 4)
              </text>

              <g transform="translate(20, 50)">
                <rect x="0" y="0" width="60" height="60" rx="4" fill="#ffffff" stroke="#3b82f6" />
                <text x="30" y="28" fill="#1e40af" fontSize="10" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">CPU A</text>
                <circle cx="30" cy="45" r="5" fill="#22c55e" />
              </g>
              <g transform="translate(100, 50)">
                <rect x="0" y="0" width="60" height="60" rx="4" fill="#ffffff" stroke="#3b82f6" />
                <text x="30" y="28" fill="#1e40af" fontSize="10" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">CPU B</text>
                <circle cx="30" cy="45" r="5" fill="#22c55e" />
              </g>
              <g transform="translate(180, 50)">
                <rect x="0" y="0" width="60" height="60" rx="4" fill="#ffffff" stroke="#3b82f6" />
                <text x="30" y="28" fill="#1e40af" fontSize="10" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">CPU C</text>
                <circle cx="30" cy="45" r="5" fill="#22c55e" />
              </g>

              <rect x="20" y="125" width="220" height="30" rx="4" fill="#dbeafe" />
              <text x="130" y="144" fill="#1e40af" fontSize="10" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">
                Distance-to-Go Curve Generator
              </text>
            </g>

            {/* Inputs & Actuators */}
            <g transform="translate(620, 95)">
              <rect x="0" y="0" width="190" height="150" rx="8" fill="#ffffff" stroke="#475569" strokeWidth="2" />
              <text x="95" y="25" fill="#0f172a" fontSize="11" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">
                Traction & Braking Interface
              </text>
              <line x1="15" y1="35" x2="175" y2="35" stroke="#e2e8f0" strokeWidth="1" />
              <text x="25" y="60" fill="#334155" fontSize="10" fontFamily="sans-serif">⚡ Emergency Brake (EB)</text>
              <text x="25" y="85" fill="#334155" fontSize="10" fontFamily="sans-serif">🛑 Service Brake (SB)</text>
              <text x="25" y="110" fill="#334155" fontSize="10" fontFamily="sans-serif">🚆 ATO Traction Notch (0-100%)</text>
              <text x="25" y="135" fill="#334155" fontSize="10" fontFamily="sans-serif">🚪 Door Interlocking Safe Loop</text>
            </g>

            {/* Bottom Under-frame Sensors */}
            <g transform="translate(120, 275)">
              <rect x="0" y="0" width="140" height="40" rx="4" fill="#0f172a" />
              <text x="70" y="24" fill="#38bdf8" fontSize="10" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">
                Pick-up Coils (Bogie)
              </text>
            </g>
            <g transform="translate(300, 275)">
              <rect x="0" y="0" width="140" height="40" rx="4" fill="#0f172a" />
              <text x="70" y="24" fill="#38bdf8" fontSize="10" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">
                Doppler Radar (Speed)
              </text>
            </g>
            <g transform="translate(480, 275)">
              <rect x="0" y="0" width="140" height="40" rx="4" fill="#0f172a" />
              <text x="70" y="24" fill="#38bdf8" fontSize="10" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">
                Balise Antenna (ATSD)
              </text>
            </g>
            <g transform="translate(660, 275)">
              <rect x="0" y="0" width="140" height="40" rx="4" fill="#0f172a" />
              <text x="70" y="24" fill="#38bdf8" fontSize="10" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">
                Axle Tachometers
              </text>
            </g>
          </svg>
        );

      case "interlocking":
        return (
          <svg
            viewBox="0 0 900 380"
            className="w-full h-full select-none"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <pattern id="grid-pattern-il" width="20" height="20" patternUnits="userSpaceOnUse">
                <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#f1f5f9" strokeWidth="1" />
              </pattern>
            </defs>
            <rect width="900" height="380" fill="#f8fafc" />
            <rect width="900" height="380" fill="url(#grid-pattern-il)" />

            {/* Track Switch Layout (Cross-over) */}
            <g transform="translate(60, 80)">
              <line x1="0" y1="40" x2="780" y2="40" stroke="#334155" strokeWidth="8" strokeLinecap="round" />
              <line x1="0" y1="120" x2="780" y2="120" stroke="#334155" strokeWidth="8" strokeLinecap="round" />
              <text x="20" y="25" fill="#475569" fontSize="11" fontWeight="bold" fontFamily="sans-serif">Line 1 (North-South Mainline)</text>
              <text x="20" y="145" fill="#475569" fontSize="11" fontWeight="bold" fontFamily="sans-serif">Line 2 (South-North Mainline)</text>

              {/* Diagonal Crossover */}
              <line x1="260" y1="40" x2="520" y2="120" stroke="#e11d48" strokeWidth="8" strokeLinecap="round" />

              {/* Switch Points */}
              <circle cx="260" cy="40" r="10" fill="#f43f5e" stroke="#9f1239" strokeWidth="3" />
              <text x="260" y="15" fill="#be123c" fontSize="10" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">Point P01 (Normal)</text>

              <circle cx="520" cy="120" r="10" fill="#f43f5e" stroke="#9f1239" strokeWidth="3" />
              <text x="520" y="150" fill="#be123c" fontSize="10" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">Point P02 (Reverse)</text>

              {/* Signal Heads */}
              <g transform="translate(180, 5)">
                <rect x="0" y="0" width="16" height="32" rx="4" fill="#0f172a" />
                <circle cx="8" cy="8" r="5" fill="#22c55e" />
                <circle cx="8" cy="24" r="5" fill="#334155" />
                <text x="8" y="-5" fill="#059669" fontSize="9" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">S101 (Green)</text>
              </g>

              <g transform="translate(600, 85)">
                <rect x="0" y="0" width="16" height="32" rx="4" fill="#0f172a" />
                <circle cx="8" cy="8" r="5" fill="#334155" />
                <circle cx="8" cy="24" r="5" fill="#dc2626" />
                <text x="8" y="44" fill="#b91c1c" fontSize="9" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">S102 (Red)</text>
              </g>
            </g>

            {/* Interlocking Safety Layers Card */}
            <g transform="translate(60, 240)">
              <rect x="0" y="0" width="780" height="100" rx="8" fill="#ffffff" stroke="#0f172a" strokeWidth="2" />
              <rect x="15" y="15" width="160" height="70" rx="6" fill="#f0fdf4" stroke="#86efac" />
              <text x="95" y="38" fill="#15803d" fontSize="11" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">۱. درخواست مسیر</text>
              <text x="95" y="60" fill="#166534" fontSize="9" textAnchor="middle" fontFamily="Vazirmatn, sans-serif">بررسی عدم تعارض و قفل</text>

              <rect x="210" y="15" width="160" height="70" rx="6" fill="#eff6ff" stroke="#93c5fd" />
              <text x="290" y="38" fill="#1d4ed8" fontSize="11" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">۲. تنظیم موقعیت سوزن</text>
              <text x="290" y="60" fill="#1e40af" fontSize="9" textAnchor="middle" fontFamily="Vazirmatn, sans-serif">تست قفل مکانیکی و الکتریسیته</text>

              <rect x="405" y="15" width="160" height="70" rx="6" fill="#fef3c7" stroke="#fcd34d" />
              <text x="485" y="38" fill="#b45309" fontSize="11" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">۳. Flank & Overlap</text>
              <text x="485" y="60" fill="#92400e" fontSize="9" textAnchor="middle" fontFamily="Vazirmatn, sans-serif">حفاظت جانبی و حاشیه توقف</text>

              <rect x="600" y="15" width="165" height="70" rx="6" fill="#faf5ff" stroke="#d8b4fe" />
              <text x="682" y="38" fill="#7e22ce" fontSize="11" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">۴. باز شدن سیگنال</text>
              <text x="682" y="60" fill="#6b21a8" fontSize="9" textAnchor="middle" fontFamily="Vazirmatn, sans-serif">تزریق کدهای سرعت ATP به ریل</text>
            </g>
          </svg>
        );

      case "ctc_network":
        return (
          <svg
            viewBox="0 0 900 380"
            className="w-full h-full select-none"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <pattern id="grid-pattern-ctc" width="20" height="20" patternUnits="userSpaceOnUse">
                <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#f1f5f9" strokeWidth="1" />
              </pattern>
            </defs>
            <rect width="900" height="380" fill="#f8fafc" />
            <rect width="900" height="380" fill="url(#grid-pattern-ctc)" />

            {/* OCC Central Dispatching Zone */}
            <g transform="translate(60, 30)">
              <rect x="0" y="0" width="780" height="130" rx="10" fill="#ffffff" stroke="#0f172a" strokeWidth="2" />
              <rect x="15" y="15" width="200" height="24" rx="4" fill="#0f172a" />
              <text x="115" y="31" fill="#ffffff" fontSize="11" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">
                OCC Central Dispatching (CTC)
              </text>

              {/* 4 Workstations */}
              <rect x="250" y="20" width="110" height="85" rx="6" fill="#f8fafc" stroke="#cbd5e1" />
              <text x="305" y="45" fill="#0f172a" fontSize="10" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">Workstation 1</text>
              <text x="305" y="65" fill="#64748b" fontSize="9" textAnchor="middle" fontFamily="Vazirmatn, sans-serif">پانل کنترل خط</text>

              <rect x="380" y="20" width="110" height="85" rx="6" fill="#f8fafc" stroke="#cbd5e1" />
              <text x="435" y="45" fill="#0f172a" fontSize="10" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">Workstation 2</text>
              <text x="435" y="65" fill="#64748b" fontSize="9" textAnchor="middle" fontFamily="Vazirmatn, sans-serif">گراف حرکت (TG)</text>

              <rect x="510" y="20" width="110" height="85" rx="6" fill="#f8fafc" stroke="#cbd5e1" />
              <text x="565" y="45" fill="#0f172a" fontSize="10" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">Workstation 3</text>
              <text x="565" y="65" fill="#64748b" fontSize="9" textAnchor="middle" fontFamily="Vazirmatn, sans-serif">عیب‌یابی Diag</text>

              <rect x="640" y="20" width="110" height="85" rx="6" fill="#f8fafc" stroke="#cbd5e1" />
              <text x="695" y="45" fill="#0f172a" fontSize="10" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">Workstation 4</text>
              <text x="695" y="65" fill="#64748b" fontSize="9" textAnchor="middle" fontFamily="Vazirmatn, sans-serif">برنامه‌ریز حرکت</text>
            </g>

            {/* Dual Redundant Optical Fiber Ring */}
            <g transform="translate(60, 180)">
              <ellipse cx="390" cy="40" rx="360" ry="25" fill="none" stroke="#2563eb" strokeWidth="4" />
              <ellipse cx="390" cy="40" rx="350" ry="20" fill="none" stroke="#0ea5e9" strokeWidth="3" strokeDasharray="6 3" />
              <rect x="310" y="25" width="160" height="28" rx="4" fill="#0284c7" />
              <text x="390" y="43" fill="#ffffff" fontSize="11" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">
                Dual SDH/Ethernet Fiber Ring
              </text>
            </g>

            {/* Field Station Nodes */}
            <g transform="translate(60, 260)">
              <g transform="translate(20, 0)">
                <rect x="0" y="0" width="130" height="80" rx="6" fill="#ffffff" stroke="#475569" strokeWidth="2" />
                <text x="65" y="25" fill="#0f172a" fontSize="10" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">SER Qods</text>
                <text x="65" y="45" fill="#64748b" fontSize="9" textAnchor="middle" fontFamily="sans-serif">TFC Node 01</text>
                <circle cx="65" cy="62" r="5" fill="#22c55e" />
              </g>
              <g transform="translate(220, 0)">
                <rect x="0" y="0" width="130" height="80" rx="6" fill="#ffffff" stroke="#475569" strokeWidth="2" />
                <text x="65" y="25" fill="#0f172a" fontSize="10" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">SER Kaveh</text>
                <text x="65" y="45" fill="#64748b" fontSize="9" textAnchor="middle" fontFamily="sans-serif">Depot Junction</text>
                <circle cx="65" cy="62" r="5" fill="#22c55e" />
              </g>
              <g transform="translate(420, 0)">
                <rect x="0" y="0" width="130" height="80" rx="6" fill="#ffffff" stroke="#475569" strokeWidth="2" />
                <text x="65" y="25" fill="#0f172a" fontSize="10" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">SER Shohada</text>
                <text x="65" y="45" fill="#64748b" fontSize="9" textAnchor="middle" fontFamily="sans-serif">TFC Node 10</text>
                <circle cx="65" cy="62" r="5" fill="#22c55e" />
              </g>
              <g transform="translate(620, 0)">
                <rect x="0" y="0" width="130" height="80" rx="6" fill="#ffffff" stroke="#475569" strokeWidth="2" />
                <text x="65" y="25" fill="#0f172a" fontSize="10" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">SER Soffeh</text>
                <text x="65" y="45" fill="#64748b" fontSize="9" textAnchor="middle" fontFamily="sans-serif">TFC Node 21</text>
                <circle cx="65" cy="62" r="5" fill="#22c55e" />
              </g>
            </g>
          </svg>
        );

      default:
        return (
          <svg
            viewBox="0 0 900 380"
            className="w-full h-full select-none"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <pattern id="grid-pattern-gen" width="20" height="20" patternUnits="userSpaceOnUse">
                <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#f1f5f9" strokeWidth="1" />
              </pattern>
            </defs>
            <rect width="900" height="380" fill="#f8fafc" />
            <rect width="900" height="380" fill="url(#grid-pattern-gen)" />

            {/* Central Engineering Box */}
            <rect x="80" y="60" width="740" height="260" rx="12" fill="#ffffff" stroke="#0f172a" strokeWidth="2" />
            <line x1="80" y1="110" x2="820" y2="110" stroke="#e2e8f0" strokeWidth="2" />

            <circle cx="115" cy="85" r="12" fill="#0f172a" />
            <text x="115" y="89" fill="#ffffff" fontSize="11" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">
              EN
            </text>
            <text x="140" y="90" fill="#0f172a" fontSize="13" fontWeight="bold" fontFamily="Vazirmatn, sans-serif">
              {title}
            </text>

            {/* Technical Sub-blocks */}
            <g transform="translate(110, 140)">
              <rect x="0" y="0" width="190" height="140" rx="8" fill="#f8fafc" stroke="#94a3b8" />
              <text x="95" y="30" fill="#0f172a" fontSize="11" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">
                Subsystem Interface
              </text>
              <circle cx="95" cy="65" r="18" fill="#e0f2fe" stroke="#0284c7" strokeWidth="2" />
              <text x="95" y="70" fill="#0369a1" fontSize="11" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">I/O</text>
              <text x="95" y="115" fill="#64748b" fontSize="9" textAnchor="middle" fontFamily="Vazirmatn, sans-serif">
                پروتکل‌های ورودی و خروجی
              </text>
            </g>

            <g transform="translate(350, 140)">
              <rect x="0" y="0" width="200" height="140" rx="8" fill="#f8fafc" stroke="#2563eb" strokeWidth="2" />
              <text x="100" y="30" fill="#1e40af" fontSize="11" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">
                Fail-Safe Processing (SIL 4)
              </text>
              <rect x="30" y="50" width="140" height="35" rx="4" fill="#dbeafe" />
              <text x="100" y="72" fill="#1e40af" fontSize="10" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">
                2oo3 / 2oo2 Architecture
              </text>
              <text x="100" y="115" fill="#64748b" fontSize="9" textAnchor="middle" fontFamily="Vazirmatn, sans-serif">
                هسته پردازشی ایمن
              </text>
            </g>

            <g transform="translate(600, 140)">
              <rect x="0" y="0" width="190" height="140" rx="8" fill="#f8fafc" stroke="#94a3b8" />
              <text x="95" y="30" fill="#0f172a" fontSize="11" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">
                Field Actuators
              </text>
              <circle cx="95" cy="65" r="18" fill="#fef2f2" stroke="#dc2626" strokeWidth="2" />
              <text x="95" y="70" fill="#b91c1c" fontSize="11" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">ACT</text>
              <text x="95" y="115" fill="#64748b" fontSize="9" textAnchor="middle" fontFamily="Vazirmatn, sans-serif">
                عملگرها و تجهیزات میدانی
              </text>
            </g>

            {/* Connecting buses */}
            <line x1="300" y1="210" x2="350" y2="210" stroke="#0284c7" strokeWidth="4" />
            <line x1="550" y1="210" x2="600" y2="210" stroke="#0284c7" strokeWidth="4" />
          </svg>
        );
    }
  };

  return (
    <figure
      id={id}
      className={cn(
        "my-8 rounded-xl border border-neutral-300 bg-white overflow-hidden shadow-xs transition-all",
        isFullscreen ? "fixed inset-4 z-50 rounded-2xl shadow-2xl flex flex-col m-0" : ""
      )}
    >
      {/* Header bar */}
      <div className="px-4 py-2.5 bg-neutral-900 text-white flex flex-wrap items-center justify-between gap-2 border-b border-neutral-800">
        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-neutral-800 text-neutral-200 text-xs font-mono font-bold">
            <ImageIcon className="w-3.5 h-3.5 text-neutral-400" />
            <span>{figureNumber}</span>
          </div>
          <div>
            <span className="text-xs md:text-sm font-bold text-white block">
              {title}
            </span>
            {subtitle && (
              <span className="text-[11px] text-neutral-400 block -mt-0.5">
                {subtitle}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Layer switcher */}
          <div className="hidden sm:inline-flex items-center bg-neutral-800 rounded p-0.5 text-[11px]">
            <button
              type="button"
              onClick={() => setActiveLayer("schematic")}
              className={cn(
                "px-2 py-0.5 rounded transition-colors",
                activeLayer === "schematic"
                  ? "bg-white text-black font-semibold shadow-2xs"
                  : "text-neutral-400 hover:text-white"
              )}
            >
              طرح شماتیک
            </button>
            <button
              type="button"
              onClick={() => setActiveLayer("spec")}
              className={cn(
                "px-2 py-0.5 rounded transition-colors",
                activeLayer === "spec"
                  ? "bg-white text-black font-semibold shadow-2xs"
                  : "text-neutral-400 hover:text-white"
              )}
            >
              مشخصات فنی
            </button>
          </div>

          {/* Zoom controls */}
          <div className="flex items-center gap-1 bg-neutral-800 rounded px-1 py-0.5 text-neutral-300">
            <button
              type="button"
              onClick={handleZoomIn}
              title="بزرگنمایی"
              className="p-1 hover:text-white transition-colors"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={handleResetZoom}
              title="اندازه پیش‌فرض"
              className="text-[10px] font-mono px-1 hover:text-white"
            >
              {Math.round(zoomLevel * 100)}%
            </button>
            <button
              type="button"
              onClick={handleZoomOut}
              title="کوچک‌نمایی"
              className="p-1 hover:text-white transition-colors"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Fullscreen toggle */}
          <button
            type="button"
            onClick={() => setIsFullscreen(!isFullscreen)}
            title={isFullscreen ? "خروج از تمام‌صفحه" : "نمایش تمام‌صفحه"}
            className="p-1.5 rounded bg-neutral-800 text-neutral-300 hover:text-white transition-colors"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Canvas / Visual Diagram Body */}
      <div
        className={cn(
          "relative w-full bg-neutral-50 overflow-auto border-b border-neutral-200 transition-all",
          isFullscreen ? "flex-1 min-h-0" : "h-[300px] md:h-[380px]"
        )}
      >
        <div
          className="w-full h-full min-w-[700px] flex items-center justify-center p-4 transition-transform duration-150 origin-center"
          style={{ transform: `scale(${zoomLevel})` }}
        >
          {activeLayer === "schematic" ? (
            renderInteractiveSvgDiagram()
          ) : (
            <div className="w-full max-w-2xl bg-white p-6 rounded-xl border border-neutral-300 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-neutral-200 pb-3">
                <span className="text-xs font-bold text-neutral-800 uppercase tracking-wider flex items-center gap-1.5">
                  <ShieldAlert className="w-4 h-4 text-emerald-600" />
                  <span>برگه استاندارد و مشخصات مهندسی</span>
                </span>
                <span className="text-[11px] font-mono bg-neutral-100 px-2 py-0.5 rounded text-neutral-700">
                  {blueprintSpec?.docCode || "EUR01881-MHR-ENT-SI-TSP"}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-2.5 bg-neutral-50 rounded border border-neutral-200">
                  <span className="text-neutral-500 block text-[10px]">استاندارد ایمنی:</span>
                  <span className="font-bold text-neutral-900">
                    {blueprintSpec?.standard || "CENELEC EN 50126/50128/50129 (SIL 4)"}
                  </span>
                </div>
                <div className="p-2.5 bg-neutral-50 rounded border border-neutral-200">
                  <span className="text-neutral-500 block text-[10px]">شناسه مدرک و نسخه:</span>
                  <span className="font-bold text-neutral-900 font-mono">
                    {blueprintSpec?.revision || "Revision Final Report B"}
                  </span>
                </div>
                <div className="p-2.5 bg-neutral-50 rounded border border-neutral-200">
                  <span className="text-neutral-500 block text-[10px]">مقیاس نقشه‌کشی:</span>
                  <span className="font-bold text-neutral-900">
                    {blueprintSpec?.scale || "N.T.S (شماتیک مفهومی و بلوک دیاگرام تفضیلی)"}
                  </span>
                </div>
                <div className="p-2.5 bg-neutral-50 rounded border border-neutral-200">
                  <span className="text-neutral-500 block text-[10px]">پروژه و کارفرما:</span>
                  <span className="font-bold text-neutral-900">
                    خط ۱ قطار شهری اصفهان / فولاد تکنیک
                  </span>
                </div>
              </div>
              <div className="text-xs text-neutral-600 leading-relaxed text-justify bg-neutral-50/70 p-3 rounded border border-neutral-100">
                این طرح گرافیکی بر اساس اسناد طراحی تفضیلی شرکت مهاران و استانداردهای کمیته اروپایی استانداردسازی الکتروتکنیکال برای بالاترین رده یکپارچگی ایمنی مدل‌سازی شده است.
              </div>
            </div>
          )}
        </div>

        {/* Blueprint watermark tag */}
        <div className="absolute bottom-2 left-2 pointer-events-none bg-neutral-900/80 backdrop-blur-xs text-white text-[10px] font-mono px-2 py-1 rounded">
          {category} • {blueprintSpec?.standard || "CENELEC SIL 4"}
        </div>
      </div>

      {/* Caption & Explanation Footer */}
      <figcaption className="p-3.5 bg-neutral-50/80 text-xs text-neutral-700 leading-relaxed flex items-start gap-2.5">
        <Info className="w-4 h-4 text-neutral-600 shrink-0 mt-0.5" />
        <div className="flex-1">
          <strong className="text-neutral-900 font-bold ml-1">{figureNumber}:</strong>
          <span>{caption || subtitle || title}</span>
        </div>
      </figcaption>
    </figure>
  );
};
