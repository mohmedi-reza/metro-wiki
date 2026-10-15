import React, { useState } from "react";
import {
  HardwareModuleCard,
  HardwarePort,
  HardwareLed,
  HardwareTerminalPin,
} from "../../../types/realisticHardware";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../../ui/tabs";
import { cn } from "../../../lib/utils";
import {
  RealisticCaptiveScrew,
  RealisticEjectorHandle,
  RealisticLed,
  RealisticRj45Socket,
  RealisticSfpSocket,
  RealisticDsubSocket,
  RealisticTerminalBlock,
  RealisticMcbBreaker,
} from "./RealisticHardwareComponents";
import {
  X,
  Cpu,
  Zap,
  Activity,
  Layers,
  ShieldCheck,
  Radio,
  Sliders,
  CheckCircle2,
  AlertTriangle,
  Play,
  RotateCcw,
  Sparkles,
  Search,
  ExternalLink,
  Disc,
  Gauge,
} from "lucide-react";

interface RealisticHardwareInspectorModalProps {
  card: HardwareModuleCard | null;
  isOpen: boolean;
  onClose: () => void;
  subrackTitle?: string;
  subrackU?: string;
}

export const RealisticHardwareInspectorModal: React.FC<RealisticHardwareInspectorModalProps> = ({
  card,
  isOpen,
  onClose,
  subrackTitle,
  subrackU,
}) => {
  if (!isOpen || !card) return null;

  const [activeTab, setActiveTab] = useState<"faceplate" | "pinout" | "diagnostics" | "safety">("faceplate");
  const [selectedPortId, setSelectedPortId] = useState<string | null>(
    card.ports.length > 0 ? card.ports[0].id : null
  );
  const [testModeActive, setTestModeActive] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<string | null>(null);

  // Multimeter probe simulation state
  const [activeTestPoint, setActiveTestPoint] = useState<string | null>(null);
  const [multimeterVoltage, setMultimeterVoltage] = useState<string | null>(null);

  // Toggle switch simulation
  const [switchState, setSwitchState] = useState<boolean>(true);
  const [isHandleLatched, setIsHandleLatched] = useState<boolean>(true);

  const selectedPort = card.ports.find((p) => p.id === selectedPortId) || card.ports[0] || null;

  // Handle probe touching a test point
  const handleProbeTestPoint = (label: string, voltage: string) => {
    setActiveTestPoint(label);
    setMultimeterVoltage(voltage);
  };

  // Run dynamic simulated hardware test
  const handleRunTest = (testType: string) => {
    setTestModeActive(testType);
    setTestResult("Executing hardware test sequence...");
    setTimeout(() => {
      if (testType === "pulse") {
        setTestResult(
          "SUCCESS: Dynamic pulse test passed across all channels. Anti-welding microsecond pulse response = 98.4 µs (Nominal 100 µs). Zero contact degradation."
        );
      } else if (testType === "lamp") {
        setTestResult(
          "SUCCESS: Lamp test completed. All LEDs (Green, Amber, Red, Blue) illuminated. Photodiode optical readback verified 100% luminance."
        );
      } else if (testType === "optical") {
        setTestResult(
          "SUCCESS: Optical SFP link interrogation complete. Laser bias = 14.2 mA. Optical TX = -3.8 dBm, RX Sensitivity = -12.4 dBm. Margin = 14.6 dB (Healthy)."
        );
      } else {
        setTestResult("SUCCESS: Watchdog refresh verified. Real-time deterministic cycle execution = 19.8 ms.");
      }
      setTestModeActive(null);
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-5xl max-h-[92vh] bg-[#101218] border-2 border-neutral-700 rounded-2xl shadow-2xl flex flex-col overflow-hidden text-neutral-100"
        dir="ltr"
      >
        {/* TOP MODAL HEADER STRIP */}
        <div className="p-3 sm:p-4 bg-[#161822] border-b border-neutral-700 flex items-start justify-between gap-3 shrink-0">
          <div className="space-y-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-sky-950 text-sky-400 border border-sky-800">
                {card.slotNumber}
              </span>
              <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800">
                {card.safetyLevel}
              </span>
              {subrackU && (
                <span className="font-mono text-[10px] text-neutral-400 px-2 py-0.5 rounded bg-neutral-800">
                  {subrackU}
                </span>
              )}
              <span className="font-mono text-[10px] text-neutral-400">
                MODEL: <strong className="text-white">{card.modelEn}</strong>
              </span>
            </div>

            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-black text-white tracking-tight truncate">
                {card.nameEn}
              </h2>
              {card.nameFa && (
                <span className="text-xs text-neutral-400 font-sans hidden sm:inline" dir="rtl">
                  ({card.nameFa})
                </span>
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-white transition-colors cursor-pointer shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* NAVIGATION TABS */}
        <div className="px-3 sm:px-5 pt-3 bg-[#13151e] border-b border-neutral-800 shrink-0">
          <Tabs
            value={activeTab}
            onValueChange={(val) => setActiveTab(val as any)}
            className="w-full"
          >
            <TabsList className="grid grid-cols-2 sm:grid-cols-4 h-auto p-1 bg-neutral-900 rounded-xl gap-1">
              <TabsTrigger
                value="faceplate"
                className="py-1.5 text-xs font-mono font-bold flex items-center justify-center gap-1.5 truncate"
              >
                <Cpu className="w-3.5 h-3.5 text-sky-400" />
                <span>Faceplate Zoom & Ports</span>
              </TabsTrigger>

              <TabsTrigger
                value="pinout"
                className="py-1.5 text-xs font-mono font-bold flex items-center justify-center gap-1.5 truncate"
              >
                <Layers className="w-3.5 h-3.5 text-amber-400" />
                <span>Terminal Pinout ({card.terminals.length})</span>
              </TabsTrigger>

              <TabsTrigger
                value="diagnostics"
                className="py-1.5 text-xs font-mono font-bold flex items-center justify-center gap-1.5 truncate"
              >
                <Activity className="w-3.5 h-3.5 text-emerald-400" />
                <span>LEDs & Live Test Bench</span>
              </TabsTrigger>

              <TabsTrigger
                value="safety"
                className="py-1.5 text-xs font-mono font-bold flex items-center justify-center gap-1.5 truncate"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />
                <span>CENELEC Specs</span>
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* MODAL BODY (SCROLLABLE) */}
        <div className="flex-1 p-3 sm:p-5 overflow-y-auto space-y-4 font-mono text-xs">
          
          {/* TAB 1: 1:1 ENLARGED PHYSICAL EUROCARD FACEPLATE */}
          {activeTab === "faceplate" && (
            <div className="space-y-4">
              
              {/* High-Fidelity Front Panel CAD Elevation */}
              <div className="p-4 rounded-2xl bg-[#090a0d] border-2 border-neutral-700 shadow-2xl flex flex-col md:flex-row items-stretch gap-5">
                
                {/* 1:1 SCALE VERTICAL EUROCARD PHYSICAL MODULE */}
                <div className="w-full md:w-64 bg-gradient-to-b from-[#242733] via-[#1a1c24] to-[#111217] rounded-lg border-2 border-neutral-600 shadow-2xl p-3 flex flex-col justify-between shrink-0 relative overflow-hidden">
                  
                  {/* Top M2.5 Captive Knurled Screw */}
                  <div className="flex items-center justify-between border-b border-neutral-700/80 pb-2">
                    <RealisticCaptiveScrew size={14} type="slotted" angle={25} />
                    <span className="text-[8px] font-mono font-bold px-2 py-0.5 rounded bg-black text-sky-400 border border-neutral-700">
                      {card.slotNumber}
                    </span>
                    <RealisticCaptiveScrew size={14} type="slotted" angle={115} />
                  </div>

                  {/* Laser-Etched Module Markings */}
                  <div className="text-center py-2 space-y-1">
                    <span className="text-[11px] font-black tracking-tight text-white block">
                      {card.nameEn}
                    </span>
                    <span className="text-[8px] text-neutral-400 block">
                      {card.modelEn} • {card.safetyLevel}
                    </span>
                  </div>

                  {/* Middle Physical Area: LEDs & Connectors */}
                  <div className="my-2 space-y-3 flex-1 flex flex-col justify-around py-2 bg-[#0c0d12] p-2 rounded-md border border-neutral-800">
                    
                    {/* Live LEDs */}
                    {card.leds.length > 0 && (
                      <div className="space-y-1 bg-black/60 p-2 rounded border border-neutral-800">
                        {card.leds.map((led, idx) => (
                          <RealisticLed key={idx} led={led} size="md" showLabel={true} />
                        ))}
                      </div>
                    )}

                    {/* Sockets (RJ45, SFP, DB-9) */}
                    {card.ports.length > 0 && (
                      <div className="flex flex-col items-center gap-2">
                        {card.ports.map((port) => {
                          const isSelected = selectedPort?.id === port.id;
                          return (
                            <div
                              key={port.id}
                              onClick={() => setSelectedPortId(port.id)}
                              className={cn(
                                "p-1.5 rounded-lg transition-all cursor-pointer w-full flex items-center justify-between border",
                                isSelected
                                  ? "bg-sky-950/80 border-sky-400 ring-2 ring-sky-500/50"
                                  : "bg-[#141620] border-neutral-700 hover:border-neutral-500"
                              )}
                            >
                              {port.type === "RJ45" ? (
                                <RealisticRj45Socket port={port} scale="normal" />
                              ) : port.type === "SFP" || port.type === "SFP+" ? (
                                <RealisticSfpSocket port={port} scale="normal" />
                              ) : (
                                <RealisticDsubSocket port={port} scale="normal" />
                              )}
                              <div className="text-right">
                                <span className="text-[9px] font-bold text-white block">
                                  {port.labelEn}
                                </span>
                                <span className="text-[8px] text-neutral-400 block">
                                  {port.speed}
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* Terminal Block */}
                    {card.terminals && card.terminals.length > 0 && (
                      <RealisticTerminalBlock terminals={card.terminals} maxPins={6} />
                    )}
                  </div>

                  {/* Bottom Footer: Captive Screws & IEEE Ejector Handle */}
                  <div className="flex items-center justify-between border-t border-neutral-700/80 pt-2">
                    <RealisticCaptiveScrew size={14} type="slotted" angle={70} />
                    <RealisticEjectorHandle
                      position="bottom"
                      isLatched={isHandleLatched}
                      onToggleLatch={() => setIsHandleLatched(!isHandleLatched)}
                    />
                    <RealisticCaptiveScrew size={14} type="slotted" angle={160} />
                  </div>
                </div>

                {/* Right Side: Selected Port Telemetry & Interactive Multimeter */}
                <div className="flex-1 space-y-4">
                  
                  {/* Selected Port Inspection Card */}
                  {selectedPort ? (
                    <div className="p-4 rounded-xl bg-neutral-900 border border-neutral-700 space-y-3">
                      <div className="flex items-center justify-between pb-2 border-b border-neutral-800">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded bg-sky-950 text-sky-400 font-bold border border-sky-800">
                            {selectedPort.type}
                          </span>
                          <h4 className="font-bold text-sm text-white">
                            {selectedPort.labelEn}
                          </h4>
                        </div>
                        <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 text-[10px] font-bold">
                          {selectedPort.status.toUpperCase()}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                        <div className="p-2.5 rounded-lg bg-neutral-950 border border-neutral-800 space-y-1">
                          <span className="text-neutral-500 block text-[10px]">CONNECTED DESTINATION</span>
                          <p className="text-white font-bold leading-relaxed">
                            {selectedPort.connectedToEn}
                          </p>
                        </div>

                        <div className="p-2.5 rounded-lg bg-neutral-950 border border-neutral-800 space-y-1">
                          <span className="text-neutral-500 block text-[10px]">CABLE TYPE & SPEC</span>
                          <p className="text-emerald-300 font-bold leading-relaxed">
                            {selectedPort.cableType}
                          </p>
                        </div>

                        <div className="p-2.5 rounded-lg bg-neutral-950 border border-neutral-800 space-y-1">
                          <span className="text-neutral-500 block text-[10px]">TRANSMISSION SPEED</span>
                          <p className="text-sky-300 font-bold">
                            {selectedPort.speed}
                          </p>
                        </div>

                        {selectedPort.packetStats && (
                          <div className="p-2.5 rounded-lg bg-neutral-950 border border-neutral-800 space-y-1">
                            <span className="text-neutral-500 block text-[10px]">EN 50159 TELEMETRY</span>
                            <div className="flex items-center justify-between text-neutral-300">
                              <span>TX: <strong>{selectedPort.packetStats.txPkts}</strong></span>
                              <span>RX: <strong>{selectedPort.packetStats.rxPkts}</strong></span>
                              <span className="text-emerald-400 font-bold">
                                CRC: {selectedPort.packetStats.crcErrors}
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : null}

                  {/* Interactive Digital Multimeter & Voltage Test Points */}
                  <div className="p-4 rounded-xl bg-gradient-to-r from-neutral-900 via-[#181a24] to-neutral-900 border border-neutral-700 space-y-3">
                    <div className="flex items-center justify-between pb-2 border-b border-neutral-800">
                      <div className="flex items-center gap-2">
                        <Gauge className="w-4 h-4 text-emerald-400" />
                        <h4 className="font-bold text-xs text-white uppercase tracking-wider">
                          PRECISION DIGITAL MULTIMETER TEST PROBE
                        </h4>
                      </div>
                      <span className="text-[10px] text-neutral-400">
                        CLICK TEST POINTS TO MEASURE VOLTAGE
                      </span>
                    </div>

                    {/* Digital Multimeter LCD Display */}
                    <div className="p-3 rounded-lg bg-[#070b09] border-2 border-neutral-700 flex items-center justify-between shadow-inner">
                      <div>
                        <span className="text-[9px] text-neutral-500 block">CURRENT PROBE</span>
                        <span className="text-white font-bold text-xs">
                          {activeTestPoint ? activeTestPoint : "PROBE DISCONNECTED"}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-[9px] text-emerald-500 font-bold block">DC VOLTS</span>
                        <span className="font-mono font-black text-xl text-emerald-400 tracking-wider">
                          {multimeterVoltage ? multimeterVoltage : "0.000 V"}
                        </span>
                      </div>
                    </div>

                    {/* Test Points Selector */}
                    <div className="flex flex-wrap gap-2">
                      {card.voltageRails.map((rail, rIdx) => (
                        <button
                          key={rIdx}
                          type="button"
                          onClick={() => handleProbeTestPoint(rail.rail, rail.value)}
                          className={cn(
                            "px-2.5 py-1.5 rounded-lg border transition-all cursor-pointer flex items-center gap-2 text-xs",
                            activeTestPoint === rail.rail
                              ? "bg-emerald-950 border-emerald-400 text-emerald-300 ring-2 ring-emerald-500/50"
                              : "bg-neutral-950 border-neutral-700 text-neutral-300 hover:border-neutral-500"
                          )}
                        >
                          <span className="w-2 h-2 rounded-full bg-amber-400 border border-black" />
                          <span>{rail.rail}</span>
                          <span className="text-neutral-500">({rail.value})</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Architecture Summary */}
                  <div className="p-3.5 rounded-xl bg-neutral-900 border border-neutral-800 space-y-1">
                    <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider">
                      MODULE ARCHITECTURE
                    </span>
                    <p className="text-neutral-300 text-xs leading-relaxed">
                      {card.descriptionEn}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: TERMINAL PINOUT TABLE */}
          {activeTab === "pinout" && (
            <div className="space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-neutral-800">
                <span className="text-neutral-400 text-xs">
                  PHOENIX CONTACT / WAGO INDUSTRIAL TERMINAL BLOCK (5.08mm PITCH)
                </span>
                <span className="text-neutral-400 text-[10px]">
                  TOTAL {card.terminals.length} ACTIVE PINS
                </span>
              </div>

              {card.terminals.length > 0 ? (
                <div className="overflow-x-auto rounded-xl border border-neutral-700">
                  <table className="w-full text-left text-xs font-mono">
                    <thead className="bg-neutral-950 text-neutral-400 text-[10px] border-b border-neutral-700">
                      <tr>
                        <th className="p-2.5">PIN #</th>
                        <th className="p-2.5">SIGNAL NAME</th>
                        <th className="p-2.5">WIRE COLOR & GAUGE</th>
                        <th className="p-2.5">VOLTAGE LEVEL</th>
                        <th className="p-2.5">RATING</th>
                        <th className="p-2.5">FIELD DESTINATION</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-800 bg-neutral-900">
                      {card.terminals.map((t, idx) => (
                        <tr key={idx} className="hover:bg-neutral-800 transition-colors">
                          <td className="p-2.5 font-bold text-sky-400">{t.pinNumber}</td>
                          <td className="p-2.5 font-bold text-white">{t.signalNameEn}</td>
                          <td className="p-2.5">
                            <div className="flex items-center gap-1.5">
                              <span
                                className="w-2.5 h-2.5 rounded-full border border-black/80 shrink-0"
                                style={{ backgroundColor: t.wireColor }}
                              />
                              <span className="text-neutral-300 text-[11px]">{t.wireColorName}</span>
                            </div>
                          </td>
                          <td className="p-2.5 text-emerald-400 font-bold">{t.voltageLevel}</td>
                          <td className="p-2.5 text-neutral-300">{t.currentRating}</td>
                          <td className="p-2.5 text-neutral-400 truncate max-w-[200px]">{t.destinationEn}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="p-6 text-center text-neutral-500 rounded-xl bg-neutral-950 border border-neutral-800">
                  <Sliders className="w-8 h-8 mx-auto text-neutral-600 mb-2" />
                  <p>This module connects via dedicated backplane optical fibers and RJ45/SFP front connectors.</p>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: DIAGNOSTICS BENCH */}
          {activeTab === "diagnostics" && (
            <div className="space-y-4">
              {/* LED Matrix */}
              <div className="p-3.5 rounded-xl bg-neutral-950 border border-neutral-800 space-y-2.5">
                <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider block border-b border-neutral-800 pb-2">
                  ACTIVE SILK-SCREEN INDICATOR LEDS ({card.leds.length})
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {card.leds.map((led, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 rounded-lg bg-neutral-900 border border-neutral-800 flex items-start gap-2.5"
                    >
                      <RealisticLed led={led} size="md" showLabel={false} />
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white text-xs">{led.label}</span>
                          <span className="text-[9px] px-1 py-0.2 rounded bg-neutral-950 text-neutral-400 border border-neutral-800">
                            {led.state.toUpperCase()}
                          </span>
                        </div>
                        <p className="text-[11px] text-neutral-400 mt-0.5 leading-snug">{led.meaningEn}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Interactive Test Action Bench */}
              <div className="p-4 rounded-xl bg-neutral-900 border border-neutral-700 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-neutral-800">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    <h4 className="font-bold text-sm text-white">INTERACTIVE HARDWARE TEST BENCH</h4>
                  </div>
                  <span className="text-neutral-400 text-[10px]">SIMULATE DIAGNOSTIC ROUTINES</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <button
                    type="button"
                    onClick={() => handleRunTest("pulse")}
                    disabled={testModeActive !== null}
                    className="p-2.5 rounded-lg bg-neutral-950 hover:bg-neutral-800 border border-neutral-700 hover:border-sky-400 text-left transition-colors cursor-pointer disabled:opacity-50"
                  >
                    <span className="text-sky-400 font-bold block mb-1">[Dynamic Pulse Test]</span>
                    <span className="text-[10px] text-neutral-400 block">Verify anti-welding pulse</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleRunTest("lamp")}
                    disabled={testModeActive !== null}
                    className="p-2.5 rounded-lg bg-neutral-950 hover:bg-neutral-800 border border-neutral-700 hover:border-amber-400 text-left transition-colors cursor-pointer disabled:opacity-50"
                  >
                    <span className="text-amber-400 font-bold block mb-1">[Lamp Test LEDs]</span>
                    <span className="text-[10px] text-neutral-400 block">Illuminate all panel LEDs</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleRunTest("optical")}
                    disabled={testModeActive !== null}
                    className="p-2.5 rounded-lg bg-neutral-950 hover:bg-neutral-800 border border-neutral-700 hover:border-emerald-400 text-left transition-colors cursor-pointer disabled:opacity-50"
                  >
                    <span className="text-emerald-400 font-bold block mb-1">[Query SFP Optical]</span>
                    <span className="text-[10px] text-neutral-400 block">Check laser bias & dBm</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleRunTest("watchdog")}
                    disabled={testModeActive !== null}
                    className="p-2.5 rounded-lg bg-neutral-950 hover:bg-neutral-800 border border-neutral-700 hover:border-purple-400 text-left transition-colors cursor-pointer disabled:opacity-50"
                  >
                    <span className="text-purple-400 font-bold block mb-1">[Watchdog Refresh]</span>
                    <span className="text-[10px] text-neutral-400 block">Test SIL-4 fail-safe cycle</span>
                  </button>
                </div>

                {testResult && (
                  <div className="p-3 rounded-lg bg-black border border-emerald-500/50 text-emerald-300 font-mono text-xs">
                    {testResult}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 4: SAFETY & CENELEC STANDARDS */}
          {activeTab === "safety" && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3.5 rounded-xl bg-neutral-950 border border-neutral-800 space-y-2">
                  <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider block">
                    CENELEC COMPLIANCE CERTIFICATES
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {card.standardsEn.map((std, sIdx) => (
                      <span
                        key={sIdx}
                        className="px-2 py-1 rounded bg-neutral-900 border border-neutral-700 text-emerald-400 font-bold text-xs"
                      >
                        {std}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-neutral-950 border border-neutral-800 space-y-2">
                  <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider block">
                    ELECTRICAL & THERMAL RATINGS
                  </span>
                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between">
                      <span className="text-neutral-400">Power Consumption:</span>
                      <strong className="text-white">{card.powerConsumption}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-400">Core Operating Temp:</span>
                      <strong className="text-emerald-400">{card.coreTemperature}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-400">SIL Rating:</span>
                      <strong className="text-sky-400">{card.safetyLevel}</strong>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
