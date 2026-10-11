import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  STATIONS_DATABASE,
  SPEED_LIMITS,
  MAP_START_X,
  MAP_STEP_X,
  TRACK_Y_LINE1,
  TRACK_Y_LINE2,
  TRACK_Y_DEPOT,
  TRACK_Y_GHODS_P1,
  TRACK_Y_GHODS_P2,
  TRACK_Y_GHODS_P3,
  TRACK_Y_GHODS_P4,
  generateInitialTracks,
  generateInitialSwitches,
  generateInitialSignals,
  INITIAL_TRAINS,
  INITIAL_LED_STATUS,
  INITIAL_EVENT_LOGS,
} from "../../data/scadaData";
import {
  TrackCircuit,
  PointSwitch,
  RailSignal,
  SimulatedTrain,
  ScadaEvent,
  LedStatus,
  PointPosition,
  SignalAspect,
} from "../../types/scada";
import {
  ZoomIn,
  ZoomOut,
  Play,
  Pause,
  SkipForward,
  Radio,
  Sliders,
  AlertOctagon,
  X,
  MapPin,
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  ChevronUp,
  Activity,
  Layers,
  FileText,
  Clock,
  Sparkles,
  Info,
  ShieldAlert,
  RotateCcw,
  Maximize2,
  Compass,
  LocateFixed,
  Server,
} from "lucide-react";
import { MetroLogo } from "../MetroLogo";

let eventCounter = 100;

// High-precision SCADA train position calculator in travel direction
export const getTrainCoordinates = (
  train: { progressRatio?: number; direction?: "northbound" | "southbound" } | undefined,
  track: TrackCircuit
): { posX: number; posY: number } => {
  const ratio = Math.max(0, Math.min(1, train?.progressRatio ?? 0.5));
  const isSouthbound =
    train?.direction === "southbound" ||
    track.direction === "southbound" ||
    track.trackNumber === 2;

  let startX = track.x1;
  let startY = track.y1;
  let endX = track.x2;
  let endY = track.y2;

  if (isSouthbound) {
    // Southbound: travels west-to-east (increasing X towards station 20)
    if (track.x1 <= track.x2) {
      startX = track.x1;
      startY = track.y1;
      endX = track.x2;
      endY = track.y2;
    } else {
      startX = track.x2;
      startY = track.y2;
      endX = track.x1;
      endY = track.y1;
    }
  } else {
    // Northbound: travels east-to-west (decreasing X towards station 01)
    if (track.x1 >= track.x2) {
      startX = track.x1;
      startY = track.y1;
      endX = track.x2;
      endY = track.y2;
    } else {
      startX = track.x2;
      startY = track.y2;
      endX = track.x1;
      endY = track.y1;
    }
  }

  return {
    posX: startX + (endX - startX) * ratio,
    posY: startY + (endY - startY) * ratio,
  };
};

interface CtcSimulatorProps {
  onClose?: () => void;
  initialStationId?: number;
  onOpenAtlas?: () => void;
}

export const CtcSimulator: React.FC<CtcSimulatorProps> = ({
  onClose,
  initialStationId,
  onOpenAtlas,
}) => {
  // SVG Canvas Pan & Zoom State
  // Real 1:1 CSS pixel units for authentic, sharp rendering (no squishing viewBox!)
  const [zoom, setZoom] = useState<number>(1.15);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState<boolean>(false);

  // System Realtime Clock
  const [systemTime, setSystemTime] = useState<string>("2026-10-08 15:27:00");

  // Core Interlocking States
  const [tracks, setTracks] = useState<TrackCircuit[]>(() => generateInitialTracks());
  const [switches, setSwitches] = useState<PointSwitch[]>(() => generateInitialSwitches());
  const [signals, setSignals] = useState<RailSignal[]>(() => generateInitialSignals());
  const [trains, setTrains] = useState<SimulatedTrain[]>(INITIAL_TRAINS);
  const [selectedTrainId, setSelectedTrainId] = useState<string>("106");
  const [isFollowingTrain, setIsFollowingTrain] = useState<boolean>(true);
  const [ledStatus, setLedStatus] = useState<LedStatus>(INITIAL_LED_STATUS);
  const [eventLogs, setEventLogs] = useState<ScadaEvent[]>(INITIAL_EVENT_LOGS);

  // Layer toggles
  const [showSignalingRooms, setShowSignalingRooms] = useState<boolean>(true);

  // Route Setting Interactive Workflow
  const [routeOrigin, setRouteOrigin] = useState<string | null>(null);
  const [routeDestination, setRouteDestination] = useState<string | null>(null);
  const [routeFeedback, setRouteFeedback] = useState<string | null>(null);
  const [currentRouteType, setCurrentRouteType] = useState<"running" | "shunting" | null>(null);

  // Simulation run state
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [simSpeed, setSimSpeed] = useState<number>(1);

  // Signal failure injection toggle
  const [signalFaultMode, setSignalFaultMode] = useState<boolean>(false);

  // Central Unified Drawer Modal State
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);
  const [drawerTab, setDrawerTab] = useState<"controls" | "logs" | "leds" | "stations" | "guide">("controls");
  const [isStationModalOpen, setIsStationModalOpen] = useState<boolean>(false);
  const [logFilter, setLogFilter] = useState<"all" | "info" | "warning" | "error">("all");

  const [selectedStationId, setSelectedStationId] = useState<number>(initialStationId || 7);

  // Selected Element for Direct Touch/Click Interaction
  const [selectedElement, setSelectedElement] = useState<{
    type: "track" | "switch" | "signal" | "train" | "signaling_room";
    id: string;
    stationName: string;
    details: { label: string; value: string; color?: string }[];
  } | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);

  // Kinetic momentum / inertia velocity tracker
  const velocityRef = useRef<{ vx: number; vy: number; lastTime: number; lastX: number; lastY: number }>({
    vx: 0,
    vy: 0,
    lastTime: 0,
    lastX: 0,
    lastY: 0,
  });
  const inertiaAnimRef = useRef<number | null>(null);

  const stopInertia = () => {
    if (inertiaAnimRef.current) {
      cancelAnimationFrame(inertiaAnimRef.current);
      inertiaAnimRef.current = null;
    }
  };

  const startInertia = () => {
    stopInertia();
    let vx = velocityRef.current.vx * 18; // Amplified flick momentum
    let vy = velocityRef.current.vy * 18;
    if (Math.hypot(vx, vy) < 1.0) return;

    const step = () => {
      vx *= 0.90;
      vy *= 0.90;
      setPan((prev) => ({
        x: prev.x + vx,
        y: prev.y + vy,
      }));
      if (Math.hypot(vx, vy) > 0.4) {
        inertiaAnimRef.current = requestAnimationFrame(step);
      } else {
        inertiaAnimRef.current = null;
      }
    };
    inertiaAnimRef.current = requestAnimationFrame(step);
  };

  // Touch Pan Tracker
  const touchStartRef = useRef<{
    x: number;
    y: number;
    distance: number;
    initialPan: { x: number; y: number };
    initialZoom: number;
  } | null>(null);

  // Center on station helper with optimal zoom
  const jumpToStation = useCallback((stationId: number, customZoom?: number) => {
    stopInertia();
    setSelectedStationId(stationId);
    const station = STATIONS_DATABASE.find((s) => s.id === stationId);
    if (!station) return;
    const stationIdx = STATIONS_DATABASE.findIndex((s) => s.id === stationId);
    const stationCenterX = MAP_START_X + stationIdx * MAP_STEP_X;
    const containerWidth = containerRef.current?.clientWidth || window.innerWidth;
    const containerHeight = containerRef.current?.clientHeight || window.innerHeight;
    const targetZoom = customZoom || 1.15;
    setZoom(targetZoom);
    setPan({
      x: containerWidth / 2 - stationCenterX * targetZoom,
      y: containerHeight / 2 - 200 * targetZoom,
    });
  }, []);

  // Initial focus on requested station or Station 07 (KAVEH) where Train 106 is stationed
  useEffect(() => {
    jumpToStation(initialStationId || 7, 1.15);
  }, [jumpToStation, initialStationId]);

  const stepStation = (direction: "prev" | "next") => {
    const currentIdx = STATIONS_DATABASE.findIndex((s) => s.id === selectedStationId);
    if (currentIdx === -1) return;
    const nextIdx =
      direction === "next"
        ? Math.min(currentIdx + 1, STATIONS_DATABASE.length - 1)
        : Math.max(currentIdx - 1, 0);
    jumpToStation(STATIONS_DATABASE[nextIdx].id);
  };

  // Center on any Train helper with high clarity & engage live tracking
  const focusOnTrain = useCallback((trainId?: string) => {
    stopInertia();
    const idToFocus = trainId || selectedTrainId || "106";
    setSelectedTrainId(idToFocus);
    setIsFollowingTrain(true);

    const train = trains.find((t) => t.id === idToFocus) || trains[0];
    if (!train) return;
    const track = tracks.find((t) => t.id === train.currentTrackId);
    if (!track) return;

    const { posX, posY } = getTrainCoordinates(train, track);
    const containerWidth = containerRef.current?.clientWidth || window.innerWidth;
    const containerHeight = containerRef.current?.clientHeight || window.innerHeight;
    const targetZoom = 1.35; // Crystal clear 135% zoom
    setZoom(targetZoom);
    setPan({
      x: containerWidth / 2 - posX * targetZoom,
      y: containerHeight / 2 - posY * targetZoom,
    });
  }, [trains, tracks, selectedTrainId]);

  // Live Camera Following when isFollowingTrain is active
  useEffect(() => {
    if (!isFollowingTrain || isPanning) return;
    const activeTrain = trains.find((t) => t.id === selectedTrainId);
    if (!activeTrain) return;
    const activeTrack = tracks.find((t) => t.id === activeTrain.currentTrackId);
    if (!activeTrack) return;

    const { posX, posY } = getTrainCoordinates(activeTrain, activeTrack);
    const containerWidth = containerRef.current?.clientWidth || window.innerWidth;
    const containerHeight = containerRef.current?.clientHeight || window.innerHeight;

    setPan({
      x: containerWidth / 2 - posX * zoom,
      y: containerHeight / 2 - posY * zoom,
    });
  }, [trains, isFollowingTrain, selectedTrainId, tracks, zoom, isPanning]);

  // Format timestamp helper
  const getTimestamp = useCallback(() => {
    const now = new Date();
    const pad = (n: number) => n.toString().padStart(2, "0");
    return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
  }, []);

  // Update real-time clock
  useEffect(() => {
    const timer = setInterval(() => {
      setSystemTime(getTimestamp());
    }, 1000);
    return () => clearInterval(timer);
  }, [getTimestamp]);

  // Append new event to log
  const addEvent = useCallback(
    (source: string, type: string, description: string, level: "info" | "warning" | "error" | "success" = "info") => {
      eventCounter += 1;
      const newEvent: ScadaEvent = {
        id: `EV-${Date.now().toString().slice(-4)}-${eventCounter}`,
        occurredOn: getTimestamp(),
        source,
        type,
        eventDescription: description,
        level,
      };
      setEventLogs((prev) => [newEvent, ...prev.slice(0, 59)]);
    },
    [getTimestamp]
  );

  // Keyboard Navigation: Arrow keys pan left/right at high speed, +/- zoom
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.key === "ArrowLeft") {
        setPan((p) => ({ ...p, x: p.x - 240 }));
      } else if (e.key === "ArrowRight") {
        setPan((p) => ({ ...p, x: p.x + 240 }));
      } else if (e.key === "ArrowUp") {
        setPan((p) => ({ ...p, y: p.y + 160 }));
      } else if (e.key === "ArrowDown") {
        setPan((p) => ({ ...p, y: p.y - 160 }));
      } else if (e.key === "+" || e.key === "=") {
        setZoom((z) => Math.min(z * 1.2, 3.5));
      } else if (e.key === "-") {
        setZoom((z) => Math.max(z / 1.2, 0.3));
      } else if (e.key === "0") {
        setZoom(1.0);
      } else if (e.key.toLowerCase() === "f") {
        focusOnTrain();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [focusOnTrain]);

  // High-Power Touch Handlers with Momentum Kinetic Physics
  const handleTouchStart = (e: React.TouchEvent) => {
    stopInertia();
    if (e.touches.length === 1) {
      const t = e.touches[0];
      velocityRef.current = { vx: 0, vy: 0, lastTime: performance.now(), lastX: t.clientX, lastY: t.clientY };
      touchStartRef.current = {
        x: t.clientX,
        y: t.clientY,
        distance: 0,
        initialPan: { ...pan },
        initialZoom: zoom,
      };
    } else if (e.touches.length === 2) {
      const t1 = e.touches[0];
      const t2 = e.touches[1];
      const dist = Math.hypot(t2.clientX - t1.clientX, t2.clientY - t1.clientY);
      touchStartRef.current = {
        x: (t1.clientX + t2.clientX) / 2,
        y: (t1.clientY + t2.clientY) / 2,
        distance: dist,
        initialPan: { ...pan },
        initialZoom: zoom,
      };
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!touchStartRef.current) return;
    if (e.touches.length === 1 && touchStartRef.current.distance === 0) {
      const t = e.touches[0];
      const now = performance.now();
      const dt = Math.max(now - velocityRef.current.lastTime, 8);
      const vx = (t.clientX - velocityRef.current.lastX) / dt;
      const vy = (t.clientY - velocityRef.current.lastY) / dt;
      velocityRef.current = { vx, vy, lastTime: now, lastX: t.clientX, lastY: t.clientY };

      const dx = (t.clientX - touchStartRef.current.x) * 1.6;
      const dy = (t.clientY - touchStartRef.current.y) * 1.4;
      if (Math.hypot(dx, dy) > 8) {
        setIsFollowingTrain(false);
      }
      setPan({
        x: touchStartRef.current.initialPan.x + dx,
        y: touchStartRef.current.initialPan.y + dy,
      });
    } else if (e.touches.length === 2 && touchStartRef.current.distance > 0) {
      const t1 = e.touches[0];
      const t2 = e.touches[1];
      const currentDist = Math.hypot(t2.clientX - t1.clientX, t2.clientY - t1.clientY);
      const scale = currentDist / touchStartRef.current.distance;
      const newZoom = Math.min(Math.max(touchStartRef.current.initialZoom * scale, 0.3), 3.5);
      setZoom(newZoom);
    }
  };

  const handleTouchEnd = () => {
    touchStartRef.current = null;
    startInertia();
  };

  // High-Power Mouse Handlers with Momentum Kinetic Physics
  const handleMouseDown = (e: React.MouseEvent) => {
    stopInertia();
    if (e.button === 0) {
      setIsPanning(true);
      velocityRef.current = { vx: 0, vy: 0, lastTime: performance.now(), lastX: e.clientX, lastY: e.clientY };
      touchStartRef.current = {
        x: e.clientX,
        y: e.clientY,
        distance: 0,
        initialPan: { ...pan },
        initialZoom: zoom,
      };
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isPanning && touchStartRef.current) {
      const now = performance.now();
      const dt = Math.max(now - velocityRef.current.lastTime, 8);
      const vx = (e.clientX - velocityRef.current.lastX) / dt;
      const vy = (e.clientY - velocityRef.current.lastY) / dt;
      velocityRef.current = { vx, vy, lastTime: now, lastX: e.clientX, lastY: e.clientY };

      const dx = (e.clientX - touchStartRef.current.x) * 1.6;
      const dy = (e.clientY - touchStartRef.current.y) * 1.4;
      if (Math.hypot(dx, dy) > 8) {
        setIsFollowingTrain(false);
      }
      setPan({
        x: touchStartRef.current.initialPan.x + dx,
        y: touchStartRef.current.initialPan.y + dy,
      });
    }
  };

  const handleMouseUp = () => {
    if (isPanning) {
      setIsPanning(false);
      touchStartRef.current = null;
      startInertia();
    }
  };

  // High-Speed Mousewheel & Trackpad Traversal (Glides horizontally on line or zooms on Ctrl)
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    stopInertia();

    if (e.ctrlKey || e.metaKey) {
      // Pinch or Ctrl+Wheel: Zoom into cursor
      const zoomFactor = e.deltaY < 0 ? 1.2 : 0.83;
      setZoom((prev) => {
        const next = Math.min(Math.max(prev * zoomFactor, 0.3), 3.5);
        const rect = containerRef.current?.getBoundingClientRect();
        if (rect) {
          const mouseX = e.clientX - rect.left;
          const mouseY = e.clientY - rect.top;
          const scaleRatio = next / prev;
          setPan((p) => ({
            x: mouseX - (mouseX - p.x) * scaleRatio,
            y: mouseY - (mouseY - p.y) * scaleRatio,
          }));
        }
        return next;
      });
    } else {
      // Natural Mousewheel / Trackpad: High-speed horizontal map glide!
      const delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
      setPan((p) => ({
        x: p.x - delta * 2.8, // 2.8x speed multiplier for effortless line traversal
        y: p.y,
      }));
    }
  };

  const handleDoubleClick = (e: React.MouseEvent) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;
    setZoom((prev) => {
      const next = Math.min(prev * 1.4, 3.5);
      const scaleRatio = next / prev;
      setPan((p) => ({
        x: clickX - (clickX - p.x) * scaleRatio,
        y: clickY - (clickY - p.y) * scaleRatio,
      }));
      return next;
    });
  };

  const applyZoom = (targetZoom: number) => {
    stopInertia();
    const clamped = Math.min(Math.max(targetZoom, 0.3), 3.5);
    setZoom((prev) => {
      const containerWidth = containerRef.current?.clientWidth || window.innerWidth;
      const containerHeight = containerRef.current?.clientHeight || window.innerHeight;
      const scaleRatio = clamped / prev;
      setPan((p) => ({
        x: containerWidth / 2 - (containerWidth / 2 - p.x) * scaleRatio,
        y: containerHeight / 2 - (containerHeight / 2 - p.y) * scaleRatio,
      }));
      return clamped;
    });
  };

  const zoomIn = () => applyZoom(zoom * 1.25);
  const zoomOut = () => applyZoom(zoom / 1.25);

  const fitWholeLine = () => {
    stopInertia();
    const containerWidth = containerRef.current?.clientWidth || window.innerWidth;
    const totalLineWidth = MAP_START_X + 19 * MAP_STEP_X + 300; // ~8000px
    const targetZoom = Math.max(Math.min((containerWidth - 60) / totalLineWidth, 0.5), 0.18);
    setZoom(targetZoom);
    setPan({
      x: 30,
      y: (containerRef.current?.clientHeight || 400) / 2 - 200 * targetZoom,
    });
    addEvent("CTC", "EVNT_VIEW_ALL", "نمای کل خط ۱ فعال شد", "info");
  };

  // Switch Toggle Logic
  const toggleSwitch = (switchId: string) => {
    setSwitches((prev) =>
      prev.map((sw) => {
        if (sw.id === switchId) {
          if (sw.isBlocked) {
            addEvent("Interlocking", "EVNT_ALRM_POINT_FAIL", `دستور رد شد: سوزن ${sw.id} قفل است!`, "error");
            return sw;
          }
          const nextPos: PointPosition = sw.position === "normal" ? "reverse" : "normal";
          addEvent(
            "Interlocking",
            "EVNT_CMD_CHANGE_POINT",
            `تغییر وضعیت سوزن ${sw.id} به [${nextPos === "normal" ? "عادی (Normal)" : "انحراف (Reverse)"}]`,
            nextPos === "reverse" ? "warning" : "info"
          );
          return { ...sw, position: nextPos };
        }
        return sw;
      })
    );
  };

  // Signal Aspect Toggle
  const cycleSignal = (signalId: string) => {
    setSignals((prev) =>
      prev.map((sig) => {
        if (sig.id === signalId) {
          if (sig.hasFailure) {
            addEvent("ATP", "EVNT_SIGNAL_FAIL", `خطای فیدبک سیگنال ${sig.id}. بازیابی شد.`, "error");
            return { ...sig, hasFailure: false };
          }
          const aspects: SignalAspect[] = ["green", "yellow", "flashing_yellow", "red"];
          const nextIdx = (aspects.indexOf(sig.aspect) + 1) % aspects.length;
          const nextAspect = aspects[nextIdx];
          addEvent(
            "Logic",
            "EVNT_SIGNAL_CHANGE",
            `سیگنال ${sig.id} تغییر فاز داد به [${nextAspect.toUpperCase()}]`,
            nextAspect === "red" ? "warning" : "info"
          );
          return { ...sig, aspect: nextAspect };
        }
        return sig;
      })
    );
  };

  // Toggle Signal Failure Simulation
  const toggleFaultOnSignal = (signalId: string) => {
    setSignals((prev) =>
      prev.map((sig) => {
        if (sig.id === signalId) {
          const nextFail = !sig.hasFailure;
          addEvent(
            "Interlocking",
            nextFail ? "EVNT_ALRM_SIGNAL_FAIL" : "EVNT_SIGNAL_RESTORED",
            nextFail
              ? `هشدار عیب‌یابی: خطای فیدبک سیگنال ${sig.id} فعال شد.`
              : `فیدبک سیگنال ${sig.id} نرمال شد.`,
            nextFail ? "error" : "success"
          );
          return { ...sig, hasFailure: nextFail };
        }
        return sig;
      })
    );
  };

  // Routing Simulation
  const handleTrackClick = (trackId: string) => {
    const targetTrack = tracks.find((t) => t.id === trackId);
    if (!targetTrack) return;

    if (!routeOrigin) {
      if (targetTrack.status === "occupied") {
        setRouteFeedback(`امکان انتخاب مبدأ وجود ندارد: بلاک ${trackId} اشغال است.`);
        return;
      }
      setRouteOrigin(trackId);
      setRouteFeedback(`مبدأ [${trackId}] ثبت شد. بلاک مقصد را لمس کنید.`);
      addEvent("CTC", "EVNT_ROUTE_PENDING", `انتخاب مبدأ مسیر [${trackId}]`);
    } else if (!routeDestination) {
      if (routeOrigin === trackId) {
        setRouteOrigin(null);
        setRouteFeedback(null);
        return;
      }
      setRouteDestination(trackId);
      executeRouteSetting(routeOrigin, trackId);
    }
  };

  // Authentic Railway Interlocking Route Setting & Switch Reversal
  const executeRouteSetting = (fromId: string, toId: string) => {
    const fromTrack = tracks.find((t) => t.id === fromId);
    const toTrack = tracks.find((t) => t.id === toId);

    if (!fromTrack || !toTrack) {
      setRouteFeedback("خطا در تنظیم مسیر: بلاک نامعتبر است.");
      setRouteOrigin(null);
      setRouteDestination(null);
      return;
    }

    const isShuntingRoute =
      fromTrack.isDeadEnd ||
      toTrack.isDeadEnd ||
      fromTrack.id.includes("T1.A") ||
      toTrack.id.includes("T1.A") ||
      fromTrack.id.includes("T20.1.4") ||
      toTrack.id.includes("T20.1.4") ||
      fromTrack.id.includes("T20.2.4") ||
      toTrack.id.includes("T20.2.4") ||
      fromTrack.id.includes("T20.4.4") ||
      toTrack.id.includes("T20.4.4") ||
      fromTrack.id.includes("DEPOT") ||
      toTrack.id.includes("DEPOT") ||
      fromTrack.id.includes("LEAD") ||
      toTrack.id.includes("LEAD");

    const minX = Math.min(fromTrack.x1, toTrack.x1);
    const maxX = Math.max(fromTrack.x2, toTrack.x2);
    const isCrossLine = fromTrack.trackNumber !== toTrack.trackNumber;

    // Interlocking Check: Detect obstruction on path
    const pathTracks = tracks.filter((t) => {
      if (t.id === fromId || t.id === toId) return true;
      if (isCrossLine && t.isDiagonal && t.x1 >= minX - 30 && t.x2 <= maxX + 30) return true;
      if (!isCrossLine && t.trackNumber === fromTrack.trackNumber && t.x1 >= minX - 15 && t.x2 <= maxX + 15) return true;
      if (isShuntingRoute && t.x1 >= minX - 15 && t.x2 <= maxX + 15) return true;
      return false;
    });

    const hasObstruction = pathTracks.some((t) => t.id !== fromId && t.status === "occupied");
    if (hasObstruction) {
      setRouteFeedback(`مسیر رد شد: یکی از بلاک‌های میانی در اینترلاکینگ اشغال است!`);
      addEvent("Interlocking", "EVNT_ROUTE_FAIL", `مسیر ${fromId} ➔ ${toId} مسدود است!`, "error");
      setRouteOrigin(null);
      setRouteDestination(null);
      return;
    }

    // Identify and lock switches on this path
    const pathSwitches = switches.filter((sw) => sw.x >= minX - 70 && sw.x <= maxX + 70);
    const hasBlockedPoint = pathSwitches.some((sw) => sw.isBlocked);
    if (hasBlockedPoint) {
      setRouteFeedback(`مسیر رد شد: یکی از ماشین‌های سوزن دچار نقص فنی (Point Fail) یا مانع است.`);
      addEvent("Interlocking", "EVNT_ROUTE_FAIL", `سوزن در مسیر ${fromId} ➔ ${toId} فیل شده است!`, "error");
      setRouteOrigin(null);
      setRouteDestination(null);
      return;
    }

    // Target position for switches on this path
    const neededSwitchPos: PointPosition = (isCrossLine || isShuntingRoute) ? "reverse" : "normal";

    setSwitches((prev) =>
      prev.map((sw) => {
        if (sw.x >= minX - 70 && sw.x <= maxX + 70) {
          return {
            ...sw,
            position: neededSwitchPos,
            isLocked: true,
            isFlankProtected: true,
          };
        }
        return sw;
      })
    );

    if (isCrossLine || isShuntingRoute) {
      setCurrentRouteType("shunting");
      setTracks((prev) =>
        prev.map((t) => {
          if (pathTracks.some((pt) => pt.id === t.id) && t.status !== "occupied") {
            return { ...t, status: "fleet", speedLimit: 25, speedDisplay: "25/25" };
          }
          return t;
        })
      );

      setSignals((prev) =>
        prev.map((sig) => {
          if (sig.x >= minX - 45 && sig.x <= maxX + 45) {
            return { ...sig, aspect: "flashing_yellow", isShunting: true, routeLocked: true };
          }
          return sig;
        })
      );

      addEvent(
        "Interlocking",
        "EVNT_SHUNT_ROUTE",
        `مسیر مانور برقرار شد: ${fromId} ➔ ${toId} (تیغه سوزن‌ها در انحراف قفل شدند، سرعت ۲۵ km/h)`,
        "warning"
      );
      setRouteFeedback(`مسیر مانور برقرار شد: ${fromId} ➔ ${toId} (سوزن‌های معکوس قفل، سرعت ۲۵ km/h)`);
    } else {
      setCurrentRouteType("running");
      setTracks((prev) =>
        prev.map((t) => {
          if (t.trackNumber === fromTrack.trackNumber && t.x1 >= minX - 10 && t.x2 <= maxX + 10 && t.status !== "occupied") {
            return { ...t, status: "fleet" };
          }
          return t;
        })
      );

      setSignals((prev) =>
        prev.map((sig) => {
          if (sig.x >= minX - 35 && sig.x <= maxX + 35) {
            return { ...sig, aspect: "green", isShunting: false, routeLocked: true };
          }
          return sig;
        })
      );

      addEvent(
        "CTC",
        "EVNT_CMD_SET_ROUTE",
        `مسیر اصلی با موفقیت برقرار شد: ${fromId} ➔ ${toId} (سوزن‌ها در نرمال قفل، سرعت مجاز ۷۰ km/h)`,
        "success"
      );
      setRouteFeedback(`مسیر اصلی برقرار شد: ${fromId} ➔ ${toId} (سبز، ۷۰ km/h)`);
    }

    setRouteOrigin(null);
    setRouteDestination(null);
  };

  // Cancel Route Command & Release Interlocking
  const handleCancelRoute = () => {
    setTracks((prev) =>
      prev.map((t) => {
        if (t.status === "fleet" || t.status === "locked") {
          return { ...t, status: "free" };
        }
        return t;
      })
    );
    setSwitches((prev) =>
      prev.map((sw) => ({
        ...sw,
        isLocked: false,
        isBlocked: false,
        position: "normal",
      }))
    );
    setSignals((prev) =>
      prev.map((sig) => ({
        ...sig,
        aspect: sig.stationId === 7 ? "red" : "green",
        isShunting: false,
        routeLocked: false,
      }))
    );
    setRouteOrigin(null);
    setRouteDestination(null);
    setCurrentRouteType(null);
    setRouteFeedback("کلیه مسیرها لغو، سوزن‌ها آزاد و به حالت نرمال (Normal) بازگشتند.");
    addEvent("CTC", "EVNT_CMD_CANCEL_ROUTE", "لغو کلیه مسیرها و آزادسازی قفل‌های اینترلاکینگ", "warning");
  };

  // Helper: Find next consecutive track along route based on train direction and switches
  const getNextTrackForTrain = useCallback(
    (train: SimulatedTrain, currentTrack: TrackCircuit): TrackCircuit | null => {
      // 1. Check for Active Reversed Point Switch Connection at exit of current track
      const exitPointX =
        train.direction === "northbound"
          ? Math.min(currentTrack.x1, currentTrack.x2)
          : Math.max(currentTrack.x1, currentTrack.x2);

      const swAtTrack = switches.find((sw) => {
        return (
          sw.position === "reverse" &&
          Math.abs(sw.x - exitPointX) < 110
        );
      });

      if (swAtTrack) {
        // Find diagonal track matching this switch
        const diagTrack = tracks.find((t) => {
          return (
            t.isDiagonal &&
            t.status !== "occupied" &&
            (Math.abs(t.x1 - swAtTrack.x) < 50 ||
              Math.abs(t.x2 - swAtTrack.x) < 50 ||
              t.id.includes(swAtTrack.id))
          );
        });
        if (diagTrack && diagTrack.id !== currentTrack.id) {
          return diagTrack;
        }
      }

      // If current track is diagonal crossover, find exiting mainline track
      if (currentTrack.isDiagonal) {
        if (currentTrack.id === "P1.5XO") {
          const l2 = tracks.find((t) => (t.id === "T1.2" || t.id === "T1.2.2") && t.status !== "occupied");
          if (l2) return l2;
        }
        if (currentTrack.id === "P4.1XO") {
          const l2 = tracks.find((t) => (t.id === "T4.2" || t.id === "T4.2.5") && t.status !== "occupied");
          if (l2) return l2;
        }
        if (currentTrack.id === "P7.1XO") {
          const l1 = tracks.find((t) => (t.id === "T7.1" || t.id === "T6.1.7") && t.status !== "occupied");
          if (l1) return l1;
        }
        if (currentTrack.id === "P10.1XO") {
          const l2 = tracks.find((t) => (t.id === "T10.2" || t.id === "T10.2.11") && t.status !== "occupied");
          if (l2) return l2;
        }
        if (currentTrack.id === "P18.2XO") {
          const l2 = tracks.find((t) => (t.id === "TP18.2.2" || t.id === "T18.2.4") && t.status !== "occupied");
          if (l2) return l2;
        }
        if (currentTrack.id === "TP20.XO1" || currentTrack.id === "TP20.XO2") {
          const l1 = tracks.find((t) => (t.id === "T20.1" || t.id === "T20.1.4") && t.status !== "occupied");
          if (l1) return l1;
        }
        const exitTracks = tracks.filter((t) => {
          if (t.id === currentTrack.id || t.status === "occupied" || t.isDiagonal) return false;
          return (
            Math.abs(t.x1 - currentTrack.x2) < 60 ||
            Math.abs(t.x2 - currentTrack.x2) < 60 ||
            Math.abs(t.x1 - currentTrack.x1) < 60 ||
            Math.abs(t.x2 - currentTrack.x1) < 60
          );
        });
        if (exitTracks.length > 0) return exitTracks[0];
      }

      // 2. Northbound (Towards 01-GHODS, moving right-to-left: decreasing X)
      if (train.direction === "northbound") {
        const candidateTracks = tracks.filter((t) => {
          if (t.id === currentTrack.id || t.status === "occupied") return false;
          // Connecting leftwards at track.x1
          const isAtConnection = Math.abs(t.x2 - currentTrack.x1) < 25;
          const isSameLine = t.trackNumber === currentTrack.trackNumber || currentTrack.isDiagonal;
          return isAtConnection && isSameLine;
        });

        if (candidateTracks.length > 0) return candidateTracks[0];

        // Specific named mappings for Line 1 continuity
        if (currentTrack.id === "T20.1.3") return tracks.find((t) => t.id === "T20.1.5") || null;
        if (currentTrack.id === "T20.1.5") return tracks.find((t) => t.id === "T19.1.4") || null;
        if (currentTrack.id === "T19.1.4") return tracks.find((t) => t.id === "T19.1.2") || null;
        if (currentTrack.id === "T19.1.2") return tracks.find((t) => t.id === "T19.1") || null;
        if (currentTrack.id === "T19.1") return tracks.find((t) => t.id === "T19.1.1") || null;
        if (currentTrack.id === "T19.1.1") return tracks.find((t) => t.id === "T19.1.3") || null;
        if (currentTrack.id === "T19.1.3") return tracks.find((t) => t.id === "T18.1.4") || null;
        if (currentTrack.id === "T18.1.4") return tracks.find((t) => t.id === "TP18.1.2") || null;
        if (currentTrack.id === "TP18.1.2") return tracks.find((t) => t.id === "T18.1") || null;
        if (currentTrack.id === "T18.1") return tracks.find((t) => t.id === "T18.1.1") || null;
        if (currentTrack.id === "T18.1.1") return tracks.find((t) => t.id === "T18.1.3") || null;
        if (currentTrack.id === "T18.1.3") return tracks.find((t) => t.id === "T17.1.5") || null;
        if (currentTrack.id === "T17.1.5") return tracks.find((t) => t.id === "T17.1") || null;

        // General Stations 17 down to 1
        if (currentTrack.stationId && currentTrack.stationId > 1 && currentTrack.isPlatform) {
          const prevStaId = currentTrack.stationId - 1;
          const interBlock = tracks.find((t) => t.id === `T${prevStaId}.1.${currentTrack.stationId}`);
          if (interBlock && interBlock.status !== "occupied") return interBlock;
          const nextPlat = tracks.find((t) => t.id === `T${prevStaId}.1`);
          if (nextPlat && nextPlat.status !== "occupied") return nextPlat;
        }

        const match = currentTrack.id.match(/^T(\d+)\.1\.(\d+)$/);
        if (match) {
          const targetStaId = parseInt(match[1]);
          const targetPlat = tracks.find((t) => t.id === `T${targetStaId}.1`);
          if (targetPlat && targetPlat.status !== "occupied") return targetPlat;
        }

        // Station 01 Turnaround at Terminal
        if (currentTrack.id === "T1.1") {
          const xo = tracks.find((t) => t.id === "P1.5XO");
          if (xo && xo.status !== "occupied") return xo;
          const line2 = tracks.find((t) => t.id === "T1.2");
          if (line2 && line2.status !== "occupied") return line2;
        }
      }

      // 3. Southbound (Towards 20-DEFA-E-MOGHADAS, moving left-to-right: increasing X)
      if (train.direction === "southbound") {
        const candidateTracks = tracks.filter((t) => {
          if (t.id === currentTrack.id || t.status === "occupied") return false;
          // Connecting rightwards at track.x2
          const isAtConnection = Math.abs(t.x1 - currentTrack.x2) < 25;
          const isSameLine = t.trackNumber === currentTrack.trackNumber || currentTrack.isDiagonal;
          return isAtConnection && isSameLine;
        });

        if (candidateTracks.length > 0) return candidateTracks[0];

        // Specific named mappings for Line 2 continuity towards station 20
        if (currentTrack.id === "T17.1.5" || currentTrack.id === "T17.2.4") return tracks.find((t) => t.id === "T18.2.3") || null;
        if (currentTrack.id === "T18.2.3") return tracks.find((t) => t.id === "T18.2.1") || null;
        if (currentTrack.id === "T18.2.1") return tracks.find((t) => t.id === "T18.2") || null;
        if (currentTrack.id === "T18.2") return tracks.find((t) => t.id === "TP18.2.2") || null;
        if (currentTrack.id === "TP18.2.2") return tracks.find((t) => t.id === "T18.2.4") || null;
        if (currentTrack.id === "T18.2.4") return tracks.find((t) => t.id === "T19.2.3") || null;
        if (currentTrack.id === "T19.2.3") return tracks.find((t) => t.id === "T19.2.1") || null;
        if (currentTrack.id === "T19.2.1") return tracks.find((t) => t.id === "T19.2") || null;
        if (currentTrack.id === "T19.2") return tracks.find((t) => t.id === "T19.2.2") || null;
        if (currentTrack.id === "T19.2.2") return tracks.find((t) => t.id === "T19.2.4") || null;
        if (currentTrack.id === "T19.2.4") return tracks.find((t) => t.id === "T20.2.5") || null;
        if (currentTrack.id === "T20.2.5") return tracks.find((t) => t.id === "T20.2.3") || null;
        if (currentTrack.id === "T20.2.3") return tracks.find((t) => t.id === "TP20.2.1") || null;
        if (currentTrack.id === "TP20.2.1") return tracks.find((t) => t.id === "T20.2") || null;
        if (currentTrack.id === "T20.2") return tracks.find((t) => t.id === "TP20.4.2") || null;
        if (currentTrack.id === "TP20.4.2") return tracks.find((t) => t.id === "TP20.6.MID") || null;
        if (currentTrack.id === "TP20.6.MID") return tracks.find((t) => t.id === "T20.2.4") || null;

        // Tail track turnaround at Station 20
        if (currentTrack.id === "T20.2.4") {
          const crossover = tracks.find((t) => t.id === "TP20.XO2");
          if (crossover && crossover.status !== "occupied") return crossover;
          const tail1 = tracks.find((t) => t.id === "T20.1.4");
          if (tail1 && tail1.status !== "occupied") return tail1;
        }

        // General Stations 1 up to 18
        if (currentTrack.stationId && currentTrack.stationId < 18 && currentTrack.isPlatform) {
          const nextStaId = currentTrack.stationId + 1;
          const interBlock = tracks.find((t) => t.id === `T${currentTrack.stationId}.2.${nextStaId}`);
          if (interBlock && interBlock.status !== "occupied") return interBlock;
          const nextPlat = tracks.find((t) => t.id === `T${nextStaId}.2`);
          if (nextPlat && nextPlat.status !== "occupied") return nextPlat;
        }

        const match = currentTrack.id.match(/^T(\d+)\.2\.(\d+)$/);
        if (match) {
          const targetStaId = parseInt(match[2]);
          const targetPlat = tracks.find((t) => t.id === `T${targetStaId}.2`);
          if (targetPlat && targetPlat.status !== "occupied") return targetPlat;
        }
      }

      return null;
    },
    [tracks, switches]
  );

  // High-Precision Simulation Step Execution (Per Iranian Railway Signaling Handbook)
  const handleStepSimulation = useCallback(() => {
    setTrains((prevTrains) => {
      return prevTrains.map((train) => {
        if (train.isTrainLost) return train; // Stopped on ATSD emergency trip

        const currTrack = tracks.find((t) => t.id === train.currentTrackId);
        if (!currTrack) return train;

        const currentProgress = train.progressRatio ?? 0.5;

        // -------------------------------------------------------------
        // SCENARIO 1: Train is on a Station Platform Track
        // -------------------------------------------------------------
        if (currTrack.isPlatform) {
          // Phase 1.1: Actively dwelling at platform (passenger boarding)
          if (train.dwellSecondsRemaining && train.dwellSecondsRemaining > 0) {
            const newDwell = Math.max(0, train.dwellSecondsRemaining - 5);
            const doorsState = newDwell > 0 ? "platform_open" : "closed_locked";
            if (newDwell === 0) {
              addEvent(
                "ATO",
                "EVNT_DOORS_CLOSED",
                `مسافرگیری قطار ${train.id} در سکوی ${currTrack.name} به پایان رسید. درها بسته و قفل شدند.`,
                "success"
              );
            }
            return {
              ...train,
              speed: 0,
              targetSpeed: 0,
              dwellSecondsRemaining: newDwell,
              doorsState,
              progressRatio: 0.5, // Perfectly centered at platform
            };
          }

          // Phase 1.2: Braking into station towards platform center (0.05 -> 0.50)
          if (currentProgress < 0.48) {
            const nextRatio = Math.min(0.5, currentProgress + 0.18);
            const isArrivedAtStop = nextRatio >= 0.5;
            const brakingSpeed = isArrivedAtStop ? 0 : Math.round(45 * (1 - nextRatio / 0.5));

            if (isArrivedAtStop) {
              addEvent(
                "ATP",
                "EVNT_STATION_STOP",
                `قطار ${train.id} در مرکز سکوی ${currTrack.name} توقف دقیق نمود. بازگشایی خودکار درها برای مسافرگیری.`,
                "info"
              );
            }

            return {
              ...train,
              progressRatio: nextRatio,
              speed: isArrivedAtStop ? 0 : brakingSpeed,
              targetSpeed: 0,
              dwellSecondsRemaining: isArrivedAtStop ? 20 : 0,
              doorsState: isArrivedAtStop ? "platform_open" : "closed_locked",
            };
          }

          // Phase 1.3: Departing platform towards exit (0.50 -> 1.00) after dwell ended
          if (currentProgress < 0.92) {
            const nextRatio = Math.min(1.0, currentProgress + 0.20);
            const departureSpeed = Math.min(50, Math.round(20 + 30 * ((nextRatio - 0.5) / 0.5)));
            return {
              ...train,
              progressRatio: nextRatio,
              speed: departureSpeed,
              targetSpeed: 50,
              doorsState: "closed_locked",
            };
          }

          // currentProgress >= 0.92 -> advances into departure block below
        } else {
          // -------------------------------------------------------------
          // SCENARIO 2: Non-Platform Track (Inter-Station Block, Turnout, Tail Track)
          // -------------------------------------------------------------
          const nextTrackAhead = getNextTrackForTrain(train, currTrack);
          const isApproachingStation = nextTrackAhead?.isPlatform ?? false;
          const isApproachingTurnout =
            nextTrackAhead?.isDiagonal ||
            switches.some(
              (sw) =>
                sw.position === "reverse" &&
                Math.abs(sw.x - (train.direction === "northbound" ? currTrack.x1 : currTrack.x2)) < 90
            );

          let blockSpeedTarget = currTrack.speedLimit;
          if (currTrack.isDiagonal || currTrack.isDeadEnd) {
            blockSpeedTarget = 25;
          } else if (isApproachingTurnout) {
            blockSpeedTarget = 25; // Turnout caution limit
          } else if (isApproachingStation && currentProgress >= 0.5) {
            blockSpeedTarget = 50; // Station approach braking curve
          } else {
            blockSpeedTarget = 70; // Mainline cruise speed
          }

          if (currentProgress < 0.92) {
            const stepDelta = currTrack.lengthMeters && currTrack.lengthMeters > 300 ? 0.20 : 0.26;
            const nextRatio = Math.min(1.0, currentProgress + stepDelta);
            return {
              ...train,
              progressRatio: nextRatio,
              speed: blockSpeedTarget,
              targetSpeed: blockSpeedTarget,
              doorsState: "closed_locked",
            };
          }

          // currentProgress >= 0.92 -> advances to next track below
        }

        // -------------------------------------------------------------
        // SCENARIO 3: Block Advance (Transitioning to Next Track Circuit)
        // -------------------------------------------------------------
        const nextTrack = getNextTrackForTrain(train, currTrack);

        if (!nextTrack) {
          // Terminal Turnarounds
          if (
            currTrack.isBufferStopLeft ||
            currTrack.id === "T1.1" ||
            currTrack.id.includes("T1.A") ||
            currTrack.id === "T1.M1.L"
          ) {
            addEvent(
              "ATO",
              "EVNT_TURNBACK",
              `ناوگان ${train.id} در پایانه قدس تغییر جهت داد (Cab 2 فعال شد، سیر به سمت پایانه دفاع مقدس).`,
              "info"
            );
            const line2Plat = tracks.find((t) => t.id === "T1.2");
            if (line2Plat && line2Plat.status !== "occupied") {
              setTracks((prev) =>
                prev.map((t) => {
                  if (t.id === "T1.2") return { ...t, status: "occupied", occupyingTrainId: train.id };
                  if (t.id === currTrack.id) return { ...t, status: "free", occupyingTrainId: null };
                  return t;
                })
              );
              return {
                ...train,
                currentTrackId: "T1.2",
                direction: "southbound",
                activeCab: "Cab 2",
                destinationStation: "۲۰-دفاع مقدس",
                speed: 0,
                targetSpeed: 50,
                progressRatio: 0.5,
                dwellSecondsRemaining: 20,
                doorsState: "platform_open",
              };
            }
            return {
              ...train,
              direction: "southbound",
              activeCab: "Cab 2",
              destinationStation: "۲۰-دفاع مقدس",
              speed: 25,
              progressRatio: 0.1,
            };
          }

          if (
            currTrack.isBufferStopRight ||
            currTrack.id === "T20.2.4" ||
            currTrack.id === "T20.1.4" ||
            currTrack.id === "T20.4.4"
          ) {
            addEvent(
              "ATO",
              "EVNT_TURNBACK",
              `ناوگان ${train.id} در دم‌موشکی پایانه دفاع مقدس تغییر جهت داد (Cab 1 فعال شد، سیر به سمت پایانه قدس).`,
              "info"
            );
            const plat1Track = tracks.find((t) => t.id === "T20.1");
            if (plat1Track && plat1Track.status !== "occupied") {
              setTracks((prev) =>
                prev.map((t) => {
                  if (t.id === "T20.1") return { ...t, status: "occupied", occupyingTrainId: train.id };
                  if (t.id === currTrack.id) return { ...t, status: "free", occupyingTrainId: null };
                  return t;
                })
              );
              return {
                ...train,
                currentTrackId: "T20.1",
                direction: "northbound",
                activeCab: "Cab 1",
                destinationStation: "۰۱-قدس",
                speed: 0,
                targetSpeed: 50,
                progressRatio: 0.5,
                dwellSecondsRemaining: 20,
                doorsState: "platform_open",
              };
            }
            return {
              ...train,
              direction: "northbound",
              activeCab: "Cab 1",
              destinationStation: "۰۱-قدس",
              speed: 25,
              progressRatio: 0.1,
            };
          }

          return { ...train, speed: 0 };
        }

        // Headway Protection: Stop before red signal if block ahead is occupied
        if (nextTrack.status === "occupied" && nextTrack.occupyingTrainId !== train.id) {
          addEvent(
            "ATP",
            "EVNT_ATP_STOP",
            `قطار ${train.id} پشت چراغ قرمز بلاک ${nextTrack.id} متوقف شد (حفظ سرفاصله ایمن Headway).`,
            "warning"
          );
          return {
            ...train,
            speed: 0,
            targetSpeed: 0,
            progressRatio: 0.95,
          };
        }

        // Calculate Entering Speed & Cab Direction
        let entrySpeed = nextTrack.speedLimit;
        let nextDirection = train.direction;
        let nextCab = train.activeCab;
        let nextDest = train.destinationStation;

        if (nextTrack.trackNumber === 2 && train.direction === "northbound") {
          nextDirection = "southbound";
          nextCab = "Cab 2";
          nextDest = "۲۰-دفاع مقدس";
        } else if (nextTrack.trackNumber === 1 && train.direction === "southbound") {
          nextDirection = "northbound";
          nextCab = "Cab 1";
          nextDest = "۰۱-قدس";
        }

        if (nextTrack.isPlatform) {
          entrySpeed = 50; // Entering station platform
        } else if (nextTrack.isDiagonal || nextTrack.isDeadEnd) {
          entrySpeed = 25; // Turnout caution limit
        } else if (currTrack.isPlatform) {
          entrySpeed = 50; // Acceleration block out of station
        } else {
          entrySpeed = 70; // Mainline cruise speed
        }

        // Atomically update block occupancy
        setTracks((prevTracks) =>
          prevTracks.map((t) => {
            if (t.id === nextTrack.id) {
              return { ...t, status: "occupied", occupyingTrainId: train.id };
            }
            if (t.id === currTrack.id) {
              return { ...t, status: "free", occupyingTrainId: null };
            }
            return t;
          })
        );

        addEvent(
          "ATP",
          "EVNT_OCCUPIED",
          `قطار ${train.id} به بلاک ${nextTrack.id} وارد شد (کد سرعت: ${entrySpeed} km/h)`,
          "info"
        );

        return {
          ...train,
          currentTrackId: nextTrack.id,
          direction: nextDirection,
          activeCab: nextCab,
          destinationStation: nextDest,
          speed: entrySpeed,
          targetSpeed: nextTrack.speedLimit,
          progressRatio: 0.05,
          dwellSecondsRemaining: 0,
          doorsState: "closed_locked",
        };
      });
    });
  }, [tracks, switches, getNextTrackForTrain, addEvent]);

  // Train Lost Simulation per CTC Booklet (عبور از چراغ قرمز و مفقود شدن شناسه)
  const toggleTrainLostSimulation = (trainId: string) => {
    setTrains((prev) =>
      prev.map((t) => {
        if (t.id === trainId) {
          const nextLost = !t.isTrainLost;
          if (nextLost) {
            addEvent(
              "CTC",
              "EVNT_TRAIN_LOST",
              `هشدار بحرانی: قطار ${t.id} از چراغ قرمز عبور کرد! سرویس توصیفگر قطار شناسه را پاک و رخداد Train Lost صادر نمود. بالیز ATSD ترمز اضطراری فعال کرد.`,
              "error"
            );
          } else {
            addEvent(
              "CTC",
              "EVNT_TRAIN_RESTORED",
              `شناسه قطار ${t.id} در سیستم توصیفگر قطار (Train Describer) بازیابی و نرمال شد.`,
              "success"
            );
          }
          return { ...t, isTrainLost: nextLost, speed: nextLost ? 0 : t.speed };
        }
        return t;
      })
    );
  };

  // Change Train Mode (ATO / ATP_MANUAL / SHUNTING)
  const changeTrainMode = (trainId: string, newMode: "ATO" | "ATP_MANUAL" | "SHUNTING") => {
    setTrains((prev) =>
      prev.map((t) => {
        if (t.id === trainId) {
          addEvent(
            "ATO",
            "EVNT_MODE_CHANGE",
            `مد هدایت ناوگان ${t.id} به [${newMode}] تغییر یافت.`,
            newMode === "ATO" ? "success" : "warning"
          );
          return { ...t, mode: newMode };
        }
        return t;
      })
    );
  };

  // Auto-run simulation timer with fluid physics
  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      handleStepSimulation();
    }, 1200 / simSpeed);
    return () => clearInterval(interval);
  }, [isPlaying, simSpeed, handleStepSimulation]);

  const activeStation = STATIONS_DATABASE.find((s) => s.id === selectedStationId) || STATIONS_DATABASE[0];

  return (
    <div className="w-full h-full flex flex-col bg-white text-neutral-900 font-sans select-none overflow-hidden text-xs">
      {/* =========================================================================
          1. CLEAN TOP HEADER (Aligned 100% with Daneshnamak Site Design)
          Right: Metro Logo + Title + Status Pill
          Left: Tools & Drawer Trigger + Exit Button
          ========================================================================= */}
      <header className="h-13 sm:h-14 bg-white/95 backdrop-blur-md border-b border-neutral-200/80 px-3 sm:px-6 flex items-center justify-between shrink-0 z-30 shadow-2xs gap-2">
        {/* Right side (RTL): Brand and Title */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0 shrink">
          <MetroLogo size="sm" />
          <div className="flex items-center gap-1.5 min-w-0">
            <h1 className="text-xs sm:text-sm font-extrabold text-neutral-900 tracking-tight leading-none truncate">
              مرکز کنترل ترافیک (CTC)
            </h1>
            <span className="hidden lg:inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10.5px] font-bold border border-emerald-200 shrink-0">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              سامانه زنده خط ۱
            </span>
          </div>
        </div>

        {/* Left side (RTL): Navigation, Tools & Exit Buttons */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Quick Scenario Play / Step */}
          <div className="flex items-center gap-0.5 sm:gap-1 bg-neutral-100 p-0.5 sm:p-1 rounded-xl border border-neutral-200/70">
            <button
              type="button"
              onClick={() => setIsPlaying(!isPlaying)}
              title={isPlaying ? "توقف شبیه‌سازی" : "پخش پیوسته شبیه‌سازی"}
              className={`p-1.5 rounded-lg flex items-center gap-1 font-bold text-xs cursor-pointer transition-colors ${
                isPlaying ? "bg-emerald-600 text-white" : "hover:bg-white text-neutral-800"
              }`}
            >
              {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-current" />}
              <span className="hidden md:inline">{isPlaying ? "توقف" : "پخش"}</span>
            </button>
            <button
              type="button"
              onClick={handleStepSimulation}
              title="پیشروی یک گام قطار طبق برنامه سیر"
              className="p-1.5 hover:bg-white rounded-lg text-neutral-800 font-bold text-xs flex items-center gap-1 cursor-pointer transition-colors"
            >
              <SkipForward className="w-3.5 h-3.5 text-neutral-700" />
              <span className="hidden md:inline">یک گام</span>
            </button>
          </div>

          {/* Atlas & Signaling Map Modal Trigger */}
          {onOpenAtlas && (
            <button
              type="button"
              onClick={onOpenAtlas}
              className="px-2.5 sm:px-3 py-1.5 rounded-xl bg-cyan-50 hover:bg-cyan-100 text-cyan-800 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer border border-cyan-200/80 shrink-0"
              title="مشاهده نقشه و اطلس کامل ایستگاه‌ها، سکوهای جزیره‌ای و اتاق‌های سیگنالینگ"
            >
              <Layers className="w-3.5 h-3.5 text-cyan-600 shrink-0" />
              <span className="hidden md:inline">اطلس ایستگاه‌ها</span>
            </button>
          )}

          {/* Toggle SER / CER Rooms Layer on Map */}
          <button
            type="button"
            onClick={() => setShowSignalingRooms(!showSignalingRooms)}
            className={`px-2.5 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer border shrink-0 ${
              showSignalingRooms
                ? "bg-emerald-50 text-emerald-800 border-emerald-300 shadow-2xs"
                : "bg-neutral-100 text-neutral-600 border-neutral-200 hover:bg-neutral-200"
            }`}
            title="نمایش یا پنهان‌سازی لایه اتاق‌های سیگنالینگ (SER/CER) روی نقشه"
          >
            <Server className="w-3.5 h-3.5 shrink-0" />
            <span className="hidden lg:inline">اتاق‌های SER</span>
          </button>

          {/* Unified Menu & Tools Trigger */}
          <button
            type="button"
            onClick={() => setIsDrawerOpen(true)}
            className="px-2.5 sm:px-3 py-1.5 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-800 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer border border-neutral-200/70"
            title="منوی ابزارهای پیشرفته، لاگ‌ها، وضعیت اینترلاکینگ و راهنمای جزوات"
          >
            <Sliders className="w-3.5 h-3.5 shrink-0" />
            <span className="hidden sm:inline">ابزارها و منو</span>
            {eventLogs.length > 0 && (
              <span className="w-4 h-4 rounded-full bg-black text-white text-[9px] flex items-center justify-center font-mono font-bold shrink-0">
                {eventLogs.length > 99 ? "99+" : eventLogs.length}
              </span>
            )}
          </button>

          {/* Clean Exit Button */}
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              title="خروج از شبیه‌ساز و بازگشت به دانشنامه"
              className="px-2.5 sm:px-3 py-1.5 bg-neutral-900 hover:bg-black text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs active:scale-95 shrink-0"
            >
              <X className="w-3.5 h-3.5" />
              <span>خروج</span>
            </button>
          )}
        </div>
      </header>

      {/* =========================================================================
          2. MAIN CTC SCADA SCHEMATIC CANVAS
          - Native 1:1 Pixel Space: NO squishing viewBox!
          - Fluid Mouse & Touch Traversal with Momentum Physics
          ========================================================================= */}
      <main
        ref={containerRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onDoubleClick={handleDoubleClick}
        onWheel={handleWheel}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={handleTouchEnd}
        className="flex-1 w-full bg-[#f8fafc] relative overflow-hidden cursor-grab active:cursor-grabbing select-none touch-none"
      >
        {/* FLOATING STATION QUICK NAVIGATOR & 20-STATION LINE SCRUBBER */}
        <div className="absolute top-2.5 inset-x-0 mx-auto w-fit max-w-[96vw] z-20 pointer-events-auto flex flex-col items-center gap-1.5">
          {/* Main Station Pill */}
          <div className="flex items-center gap-1 bg-white/95 backdrop-blur-md px-2.5 py-1 rounded-full border border-neutral-200/90 shadow-md text-xs text-neutral-800">
            <button
              type="button"
              onClick={() => stepStation("prev")}
              title="ایستگاه قبلی"
              className="p-1 hover:bg-neutral-100 rounded-full cursor-pointer transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={() => setIsStationModalOpen(true)}
              className="px-2 py-0.5 font-bold text-neutral-900 flex items-center gap-1.5 cursor-pointer max-w-[160px] sm:max-w-[220px] truncate"
              title="مشاهده و انتخاب از میان ۲۰ ایستگاه خط ۱"
            >
              <MapPin className="w-3.5 h-3.5 text-neutral-500 shrink-0" />
              <span className="truncate">{activeStation.alias} - {activeStation.pinglishName}</span>
              <ChevronDown className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
            </button>

            <button
              type="button"
              onClick={() => stepStation("next")}
              title="ایستگاه بعدی"
              className="p-1 hover:bg-neutral-100 rounded-full cursor-pointer transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <div className="h-4 w-px bg-neutral-200 mx-1" />

            {/* Quick Train Focus Selectors with Follow Indicator */}
            <div className="flex items-center gap-1">
              {trains.map((t) => {
                const isSelected = selectedTrainId === t.id;
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => focusOnTrain(t.id)}
                    className={`px-2 py-0.5 rounded-full font-bold text-[10.5px] cursor-pointer transition-all flex items-center gap-0.5 ${
                      isSelected
                        ? "bg-emerald-600 text-white shadow-2xs scale-105"
                        : "bg-neutral-100 hover:bg-neutral-200 text-neutral-800"
                    }`}
                    title={`تمرکز و تعقیب قطار ${t.id} (${t.currentTrackId} - ${t.speed} km/h)`}
                  >
                    <Compass className={`w-3 h-3 shrink-0 ${isSelected && isFollowingTrain ? "animate-spin" : ""}`} />
                    <span>{t.id}</span>
                  </button>
                );
              })}

              {/* Follow Camera Toggle */}
              <button
                type="button"
                onClick={() => {
                  const nextFollow = !isFollowingTrain;
                  setIsFollowingTrain(nextFollow);
                  if (nextFollow) {
                    focusOnTrain(selectedTrainId);
                  }
                }}
                className={`px-2 py-0.5 rounded-full font-bold text-[10px] cursor-pointer transition-colors flex items-center gap-1 ms-0.5 ${
                  isFollowingTrain
                    ? "bg-blue-600 text-white shadow-2xs"
                    : "bg-neutral-100 hover:bg-neutral-200 text-neutral-600"
                }`}
                title={isFollowingTrain ? "دوربین به صورت خودکار قطار را دنبال می‌کند (کلیک برای غیرفعال‌سازی)" : "فعال‌سازی تعقیب خودکار دوربین روی نقشه"}
              >
                <LocateFixed className={`w-3 h-3 shrink-0 ${isFollowingTrain ? "animate-pulse" : ""}`} />
                <span className="hidden xs:inline">{isFollowingTrain ? "تعقیب" : "آزاد"}</span>
              </button>
            </div>
          </div>

          {/* Rapid 20-Station Line Scrubber: Tap or drag anywhere to traverse instantly */}
          <div
            className="flex items-center gap-2 bg-white/95 backdrop-blur-md px-3.5 py-1 rounded-full border border-neutral-200 shadow-xs text-[10px] text-neutral-600 select-none"
            title="نوار پیمایش خط ۱: روی هر نقطه یا ایستگاه کلیک کنید تا نقشه فوراً به آنجا پیمایش کند"
          >
            <span className="font-bold text-neutral-600 shrink-0">قدس (۰۱)</span>
            <div
              className="relative w-44 xs:w-56 sm:w-80 h-3 flex items-center cursor-pointer"
              onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const clickRatio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
                // RTL orientation: right is Station 1, left is Station 20
                const targetIdx = Math.round((1 - clickRatio) * (STATIONS_DATABASE.length - 1));
                jumpToStation(STATIONS_DATABASE[targetIdx].id);
              }}
            >
              {/* Rail track background line */}
              <div className="w-full h-1 bg-neutral-200 rounded-full" />
              {/* Station node dots */}
              {STATIONS_DATABASE.map((st, idx) => {
                const ratio = 1 - idx / (STATIONS_DATABASE.length - 1);
                const isSelected = st.id === selectedStationId;
                const hasTrain = st.id === 7;
                return (
                  <span
                    key={`mini-dot-${st.id}`}
                    style={{ left: `${ratio * 100}%` }}
                    title={`${st.pinglishName} (${st.alias})`}
                    className={`absolute -translate-x-1/2 w-1.5 h-1.5 rounded-full transition-transform ${
                      isSelected
                        ? "bg-black scale-150 z-10"
                        : hasTrain
                        ? "bg-emerald-600 scale-125 z-5"
                        : "bg-neutral-300 hover:bg-neutral-500"
                    }`}
                  />
                );
              })}
              {/* Current Active Station Indicator */}
              <div
                style={{
                  left: `${(1 - (selectedStationId - 1) / 19) * 100}%`,
                }}
                className="absolute -translate-x-1/2 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-white shadow-xs pointer-events-none transition-all duration-150"
              />
            </div>
            <span className="font-bold text-neutral-600 shrink-0">دفاع مقدس (۲۰)</span>
          </div>
        </div>

        {/* ROUTE FEEDBACK FLOATING BANNER (When setting route) */}
        {(routeOrigin || routeFeedback) && (
          <div className="absolute top-22 inset-x-4 max-w-md mx-auto bg-amber-50/98 border border-amber-200 rounded-xl px-3.5 py-2 shadow-md flex items-center justify-between text-xs text-amber-900 z-20 animate-fadeIn backdrop-blur-xs">
            <div className="flex items-center gap-2 font-medium truncate">
              <Radio className="w-3.5 h-3.5 text-amber-600 animate-pulse shrink-0" />
              <span className="truncate">{routeFeedback || `مبدأ [${routeOrigin}] انتخاب شد. لطفاً بلاک مقصد را لمس کنید.`}</span>
            </div>
            <button
              type="button"
              onClick={handleCancelRoute}
              className="text-[11px] font-bold text-amber-800 hover:text-black underline cursor-pointer shrink-0 ms-2"
            >
              لغو مسیر
            </button>
          </div>
        )}

        {/* SVG Railway Schematic (NO static viewBox squishing! Direct real-pixel scale) */}
        <svg
          className="w-full h-full block"
          style={{ width: "100%", height: "100%" }}
        >
          <defs>
            {/* Soft Engineering Grid Pattern */}
            <pattern
              id="scadaGridClean"
              width="60"
              height="60"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M 60 0 L 0 0 0 60"
                fill="none"
                stroke="#e2e8f0"
                strokeWidth="0.6"
                strokeDasharray="2,4"
              />
            </pattern>

            {/* Directional Headlight Glow Filters */}
            <linearGradient id="headlightGlowRight" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.0" />
            </linearGradient>
            <linearGradient id="headlightGlowLeft" x1="100%" y1="0%" x2="0%" y2="0%">
              <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Background Grid in Infinite Canvas */}
          <rect width="18000" height="1200" fill="#f8fafc" />
          <rect width="18000" height="1200" fill="url(#scadaGridClean)" opacity="0.9" />

          {/* Main Pan & Zoom Dynamic Group */}
          <g
            transform={`translate(${pan.x}, ${pan.y}) scale(${zoom})`}
            style={{ transition: isPanning ? "none" : "transform 0.4s cubic-bezier(0.2, 0, 0.2, 1)" }}
          >
            {/* 1. STATIONS & PLATFORMS */}
            {STATIONS_DATABASE.map((st, idx) => {
              const startX = MAP_START_X;
              const stepX = MAP_STEP_X;
              const stCenterX = startX + idx * stepX;
              const isTrainAtStation = st.id === 7;
              const isSelected = st.id === selectedStationId;

              const isAuthenticSouthernStation = st.id >= 18;

              return (
                <g key={`station-${st.id}`}>
                  {isAuthenticSouthernStation ? (
                    /* AUTHENTIC CTC STATION STYLING (Stations 18, 19, 20 matching real monitor photo) */
                    <g>
                      {/* Authentic CTC Station Header above Line 1 */}
                      <g className="cursor-pointer" onClick={() => jumpToStation(st.id)}>
                        <rect
                          x={stCenterX - 75}
                          y={82}
                          width={150}
                          height={24}
                          fill="#f8fafc"
                          stroke="#38bdf8"
                          strokeWidth="1.2"
                          rx="4"
                        />
                        <text
                          x={stCenterX}
                          y={98}
                          fill="#0284c7"
                          fontSize="10"
                          fontFamily="monospace"
                          fontWeight="bold"
                          textAnchor="middle"
                          letterSpacing="0.5"
                        >
                          {st.pinglishName}
                        </text>
                      </g>

                      {/* Line 1 Platform Marker Bracket above Track 1 (y=140) */}
                      <path
                        d={`M ${stCenterX - 60},126 L ${stCenterX + 60},126 M ${stCenterX - 60},122 L ${stCenterX - 60},130 M ${stCenterX + 60},122 L ${stCenterX + 60},130`}
                        stroke="#0284c7"
                        strokeWidth="1.8"
                        fill="none"
                      />
                      {/* Line 2 Platform Marker Bracket below Track 2 (y=260) */}
                      <path
                        d={`M ${stCenterX - 60},274 L ${stCenterX + 60},274 M ${stCenterX - 60},270 L ${stCenterX - 60},278 M ${stCenterX + 60},270 L ${stCenterX + 60},278`}
                        stroke="#0284c7"
                        strokeWidth="1.8"
                        fill="none"
                      />
                    </g>
                  ) : st.platformType === "island" ? (
                    /* Island Platform between Line 1 (y=140) and Line 2 (y=260) */
                    <g>
                      <rect
                        x={stCenterX - 90}
                        y={178}
                        width={180}
                        height={26}
                        fill="#f1f5f9"
                        stroke="#cbd5e1"
                        strokeWidth="1.2"
                        rx="4"
                      />
                      <line
                        x1={stCenterX - 85}
                        y1={191}
                        x2={stCenterX + 85}
                        y2={191}
                        stroke="#cbd5e1"
                        strokeWidth="1"
                        strokeDasharray="4,4"
                      />
                      <text
                        x={stCenterX}
                        y={194}
                        fill="#475569"
                        fontSize="9"
                        fontFamily="monospace"
                        fontWeight="700"
                        textAnchor="middle"
                      >
                        سکو جزیره‌ای ({st.alias})
                      </text>
                    </g>
                  ) : (
                    /* Side Platforms */
                    <>
                      {/* Side Platform Line 1 (Northbound) above Track 1 at y=76 */}
                      <g>
                        <rect
                          x={stCenterX - 90}
                          y={76}
                          width={180}
                          height={18}
                          fill="#f8fafc"
                          stroke="#cbd5e1"
                          strokeWidth="1"
                          rx="3"
                        />
                        <text
                          x={stCenterX}
                          y={89}
                          fill="#64748b"
                          fontSize="8.5"
                          fontFamily="monospace"
                          fontWeight="600"
                          textAnchor="middle"
                        >
                          سکو خط ۱ ({st.alias})
                        </text>
                      </g>
                      {/* Side Platform Line 2 (Southbound) below Track 2 at y=286 */}
                      <g>
                        <rect
                          x={stCenterX - 90}
                          y={286}
                          width={180}
                          height={18}
                          fill="#f8fafc"
                          stroke="#cbd5e1"
                          strokeWidth="1"
                          rx="3"
                        />
                        <text
                          x={stCenterX}
                          y={299}
                          fill="#64748b"
                          fontSize="8.5"
                          fontFamily="monospace"
                          fontWeight="600"
                          textAnchor="middle"
                        >
                          سکو خط ۲ ({st.alias})
                        </text>
                      </g>
                    </>
                  )}

                  {/* Vertical Guide Line to Station Info Card at y=405 (Clear of all tracks) */}
                  <line
                    x1={stCenterX}
                    y1={308}
                    x2={stCenterX}
                    y2={405}
                    stroke="#cbd5e1"
                    strokeWidth="1"
                    strokeDasharray="2,3"
                  />
                  <circle cx={stCenterX} cy={308} r="2" fill="#94a3b8" />

                  {/* Station Info Badge Card placed at y=405 */}
                  <g
                    className="cursor-pointer"
                    onClick={() => jumpToStation(st.id)}
                  >
                    <rect
                      x={stCenterX - 80}
                      y={405}
                      width={160}
                      height={36}
                      fill="#ffffff"
                      stroke={isSelected ? "#000000" : isTrainAtStation ? "#16a34a" : "#cbd5e1"}
                      strokeWidth={isSelected ? "2" : isTrainAtStation ? "2" : "1"}
                      rx="6"
                      filter="drop-shadow(0 1px 3px rgba(0, 0, 0, 0.06))"
                    />
                    <text
                      x={stCenterX}
                      y={420}
                      fill="#0f172a"
                      fontSize="11"
                      fontWeight="bold"
                      fontFamily="monospace"
                      textAnchor="middle"
                      letterSpacing="0.5"
                    >
                      {st.pinglishName}
                    </text>
                    <text
                      x={stCenterX}
                      y={433}
                      fill="#64748b"
                      fontSize="8.5"
                      fontFamily="monospace"
                      textAnchor="middle"
                    >
                      {st.alias} | {st.chainage}
                    </text>
                  </g>

                  {/* Signaling Equipment Room (SER / CER) Marker & Building */}
                  {st.signalingRoom && showSignalingRooms && (
                    <g
                      className="cursor-pointer group"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (st.signalingRoom) {
                          setSelectedElement({
                            type: "signaling_room",
                            id: st.signalingRoom.id,
                            stationName: st.fullName,
                            details: [
                              { label: "عنوان اتاق", value: st.signalingRoom.title },
                              { label: "کد شناسایی", value: st.signalingRoom.id, color: "text-emerald-700" },
                              { label: "نوع اینترلاکینگ", value: st.signalingRoom.interlockingType },
                              { label: "تعداد رک‌ها", value: `${st.signalingRoom.rackCount} رک فنی استاندارد` },
                              { label: "پانل محلی LCP", value: st.signalingRoom.lcpAvailable ? "مستقر و فعال ✓" : "ندارد" },
                              { label: "مأموریت و کنترل", value: st.signalingRoom.description },
                              { label: "تجهیزات مستقر", value: st.signalingRoom.equipment.join(" • ") },
                            ],
                          });
                          setIsDrawerOpen(true);
                          setDrawerTab("controls");
                        }
                      }}
                    >
                      {/* Connection dashed line from room to track */}
                      <line
                        x1={stCenterX}
                        y1={54}
                        x2={stCenterX}
                        y2={76}
                        stroke={st.signalingRoom.type === "CER" ? "#a855f7" : "#10b981"}
                        strokeWidth="1.2"
                        strokeDasharray="2,2"
                        opacity="0.8"
                      />

                      {/* Room box */}
                      <rect
                        x={stCenterX - 60}
                        y={32}
                        width={120}
                        height={24}
                        fill={st.signalingRoom.type === "CER" ? "#3b0764" : "#064e3b"}
                        stroke={st.signalingRoom.type === "CER" ? "#c084fc" : "#34d399"}
                        strokeWidth="1.2"
                        rx="5"
                        filter="drop-shadow(0 2px 4px rgba(0,0,0,0.18))"
                      />
                      {/* Blinking server indicator light */}
                      <circle
                        cx={stCenterX - 48}
                        cy={44}
                        r="3"
                        fill={st.signalingRoom.type === "CER" ? "#f43f5e" : "#10b981"}
                      />
                      <text
                        x={stCenterX + 6}
                        y={48}
                        fill="#ffffff"
                        fontSize="9.5"
                        fontFamily="monospace"
                        fontWeight="bold"
                        textAnchor="middle"
                        letterSpacing="0.3"
                      >
                        {st.signalingRoom.type === "CER" ? "🏢 CER/OCC" : `🏢 ${st.signalingRoom.id}`}
                      </text>
                    </g>
                  )}
                </g>
              );
            })}

            {/* Authentic Traffic Flow Direction Chevrons between Kooy-e-Emam (19) and Defa-e-Moghadas (20) */}
            {(() => {
              const mid19_20X = MAP_START_X + 18.5 * MAP_STEP_X;
              return (
                <g className="select-none pointer-events-none">
                  {/* Line 1 (Upper Track, Northbound): Green chevron pointing Left ◀ */}
                  <polygon
                    points={`${mid19_20X + 12},134 ${mid19_20X - 6},140 ${mid19_20X + 12},146`}
                    fill="#16a34a"
                    opacity="0.9"
                  />
                  {/* Line 2 (Lower Track, Southbound): Green chevron pointing Right ▶ */}
                  <polygon
                    points={`${mid19_20X - 12},254 ${mid19_20X + 6},260 ${mid19_20X - 12},266`}
                    fill="#16a34a"
                    opacity="0.9"
                  />
                </g>
              );
            })()}

            {/* 2. TRACK CIRCUITS */}
            {tracks.map((track) => {
              const isSelectedOrigin = routeOrigin === track.id;
              const isOccupied = track.status === "occupied";
              const isFleet = track.status === "fleet";

              let strokeColor = track.isDiagonal ? "#4f46e5" : "#64748b";
              let strokeWidth = track.isDiagonal ? 3.2 : 2.8;

              if (isOccupied) {
                strokeColor = "#dc2626";
                strokeWidth = 5.0;
              } else if (isFleet) {
                strokeColor = "#16a34a";
                strokeWidth = 5.0;
              } else if (track.status === "locked") {
                strokeColor = "#d97706";
                strokeWidth = 4.2;
              }

              if (isSelectedOrigin) {
                strokeColor = "#f59e0b";
                strokeWidth = 5.5;
              }

              const midX = (track.x1 + track.x2) / 2;
              const midY = (track.y1 + track.y2) / 2;

              return (
                <g
                  key={`track-${track.id}`}
                  className="cursor-pointer group"
                  onClick={() => {
                    handleTrackClick(track.id);
                    const station = STATIONS_DATABASE.find((s) => s.id === track.stationId);
                    setSelectedElement({
                      type: "track",
                      id: track.id,
                      stationName: station ? `${station.pinglishName} (${station.alias})` : track.name,
                      details: [
                        { label: "نوع بلاک", value: track.isDeadEnd ? "خط کور مانور" : `خط اصلی ${track.trackNumber}` },
                        {
                          label: "وضعیت مداری",
                          value: track.status === "occupied" ? "اشغال (قطار ۱۰۶)" : track.status === "fleet" ? "مسیر قفل و برقرار" : "آزاد",
                          color: track.status === "occupied" ? "#dc2626" : track.status === "fleet" ? "#16a34a" : "#475569",
                        },
                        { label: "کد سرعت مجاز", value: track.speedDisplay },
                        { label: "سامانه ردیابی", value: "مدار راه فرکانسی MAFTC-LC92" },
                      ],
                    });
                  }}
                >
                  {/* Invisible wide hit area */}
                  <line
                    x1={track.x1}
                    y1={track.y1}
                    x2={track.x2}
                    y2={track.y2}
                    stroke="transparent"
                    strokeWidth="32"
                  />

                  {/* Main Rail Line */}
                  <line
                    x1={track.x1}
                    y1={track.y1}
                    x2={track.x2}
                    y2={track.y2}
                    stroke={strokeColor}
                    strokeWidth={strokeWidth}
                    strokeLinecap="round"
                    className="transition-colors duration-200"
                  />

                  {/* Buffer Stop Left */}
                  {track.isBufferStopLeft && (
                    <g>
                      <rect x={track.x1 - 3} y={track.y1 - 8} width={3} height={16} fill="#dc2626" />
                      <line x1={track.x1} y1={track.y1 - 10} x2={track.x1} y2={track.y1 + 10} stroke="#0f172a" strokeWidth="3.5" strokeLinecap="square" />
                    </g>
                  )}

                  {/* Buffer Stop Right */}
                  {track.isBufferStopRight && (
                    <g>
                      <rect x={track.x2} y={track.y2 - 8} width={3} height={16} fill="#dc2626" />
                      <line x1={track.x2} y1={track.y2 - 10} x2={track.x2} y2={track.y2 + 10} stroke="#0f172a" strokeWidth="3.5" strokeLinecap="square" />
                    </g>
                  )}

                  {/* Route Cleared Directional Chevron */}
                  {isFleet && (
                    <polygon
                      points={
                        track.direction === "southbound"
                          ? `${midX + 8},${midY - 4.5} ${midX - 8},${midY} ${midX + 8},${midY + 4.5}`
                          : `${midX - 8},${midY - 4.5} ${midX + 8},${midY} ${midX - 8},${midY + 4.5}`
                      }
                      fill="#ffffff"
                      stroke="#16a34a"
                      strokeWidth="1"
                    />
                  )}

                  {/* Track ID: Placed cleanly with ample breathing room */}
                  <text
                    x={midX}
                    y={track.trackNumber === 1 ? midY - 14 : midY + 22}
                    fill={isSelectedOrigin ? "#b45309" : track.isDiagonal ? "#4338ca" : "#64748b"}
                    fontSize="9.5"
                    fontFamily="monospace"
                    fontWeight="700"
                    textAnchor="middle"
                    className="select-none pointer-events-none"
                  >
                    {track.id}
                  </text>

                  {/* Speed Limit Display */}
                  <text
                    x={midX}
                    y={track.trackNumber === 1 ? midY + 18 : midY - 12}
                    fill={track.speedDisplay === "0/0" ? "#dc2626" : "#0284c7"}
                    fontSize="8.5"
                    fontFamily="monospace"
                    fontWeight="600"
                    textAnchor="middle"
                    className="select-none pointer-events-none"
                  >
                    {track.speedDisplay}
                  </text>

                  {/* =========================================================================
                      TRAIN DESCRIBER BADGE (Official Iranian Railway & Metro Signaling Standard)
                      - "Square with a triangular nose on its tip" (مربع با مثلث نوک کادر)
                      - Triangle Tip: Points in travel direction (◀ Northbound / ▶ Southbound)
                        Shows leading active cab (C1 / C2), direction, & active headlight beam!
                      - Square Body: Shows Train ID (106), Mode (ATO/ATP/RM), Speed / Dwell time,
                        Destination, and Train Lost status per signaling booklet!
                      ========================================================================= */}
                  {isOccupied && track.occupyingTrainId && (() => {
                    const simTrain = trains.find((tr) => tr.id === track.occupyingTrainId);
                    const trainId = track.occupyingTrainId;
                    const isSouthbound = simTrain ? simTrain.direction === "southbound" : track.direction === "southbound" || track.trackNumber === 2;
                    const speed = simTrain?.speed ?? (track.id === "T7.1" ? 0 : 48);
                    const mode = simTrain?.mode ?? "ATO";
                    const isDwell = speed === 0 && (track.isPlatform || simTrain?.dwellSecondsRemaining);
                    const dwellSeconds = simTrain?.dwellSecondsRemaining ?? 22;
                    const activeCab = simTrain?.activeCab || (isSouthbound ? "Cab 2" : "Cab 1");
                    const destName = isSouthbound ? "۲۰-دفاع مقدس" : "۰۱-قدس";
                    const isLost = simTrain?.isTrainLost || false;

                    const { posX, posY } = getTrainCoordinates(simTrain, track);

                    return (
                      <g
                        transform={`translate(${posX}, ${posY})`}
                        className="cursor-pointer group select-none transition-transform duration-500 ease-out"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedElement({
                            type: "train",
                            id: trainId,
                            stationName: `ناوگان خط ۱ - ${track.name}`,
                            details: [
                              { label: "شماره قطار (Train Describer)", value: trainId },
                              {
                                label: "جهت حرکت و نوک مثلثی",
                                value: isSouthbound ? "به سمت جنوب (صفه) ➔ دماغه راست" : "به سمت شمال (قدس) ➔ دماغه چپ",
                                color: "#16a34a",
                              },
                              { label: "کابین پیشرو و راهبر فعال", value: `${activeCab} (چراغ پیشانی روشن)`, color: "#2563eb" },
                              {
                                label: "مد عملیاتی ناوگان",
                                value: mode === "ATO" ? "ATO (هدایت تمام خودکار)" : mode === "ATP_MANUAL" ? "ATP Coded Manual" : "RM مانور",
                                color: mode === "ATO" ? "#059669" : "#d97706",
                              },
                              { label: "سرعت لحظه‌ای", value: `${speed} کیلومتر بر ساعت`, color: speed === 0 ? "#dc2626" : "#0284c7" },
                              { label: "سقف مجاز بلاک", value: track.speedDisplay },
                              {
                                label: "وضعیت درها و سکو",
                                value: isDwell ? `توقف مسافرگیری در سکو (${dwellSeconds} ثانیه باقیمانده)` : "درها بسته و قفل سیر",
                                color: isDwell ? "#d97706" : "#475569",
                              },
                              {
                                label: "وضعیت توصیفگر قطار",
                                value: isLost ? "رخداد بحرانی TRAIN LOST (عبور از چراغ قرمز)" : "نرمال و در حال تعقیب توالی تراک‌ها",
                                color: isLost ? "#dc2626" : "#16a34a",
                              },
                              { label: "سامانه ردیابی", value: "توصیفگر مهاران (Train Describer) و رادار داپلر ادومتری" },
                            ],
                          });
                        }}
                      >
                        {/* Projected Headlight Glow from the triangular tip */}
                        {isSouthbound ? (
                          <polygon
                            points="42,-6 86,-18 86,18 42,6"
                            fill="url(#headlightGlowRight)"
                            opacity="0.45"
                            className="pointer-events-none"
                          />
                        ) : (
                          <polygon
                            points="-42,-6 -86,-18 -86,18 -42,6"
                            fill="url(#headlightGlowLeft)"
                            opacity="0.45"
                            className="pointer-events-none"
                          />
                        )}

                        {/* Train Describer Body with Triangular Nose Tip */}
                        {isSouthbound ? (
                          /* Southbound: Nose points RIGHT (▶) */
                          <path
                            d="M -42,-15 L 30,-15 L 44,0 L 30,15 L -42,15 Z"
                            fill={isLost ? "#7f1d1d" : "#0f172a"}
                            stroke={isLost ? "#ef4444" : "#ffffff"}
                            strokeWidth="1.8"
                            filter="drop-shadow(0 2px 5px rgba(15, 23, 42, 0.45))"
                          />
                        ) : (
                          /* Northbound: Nose points LEFT (◀) */
                          <path
                            d="M -30,-15 L 42,-15 L 42,15 L -30,15 L -44,0 Z"
                            fill={isLost ? "#7f1d1d" : "#0f172a"}
                            stroke={isLost ? "#ef4444" : "#ffffff"}
                            strokeWidth="1.8"
                            filter="drop-shadow(0 2px 5px rgba(15, 23, 42, 0.45))"
                          />
                        )}

                        {/* Triangular Tip: Leading Cab & Direction Arrow indicator */}
                        {isSouthbound ? (
                          <g transform="translate(30, 0)">
                            <polygon points="0,-9 12,0 0,9" fill={isLost ? "#ef4444" : "#10b981"} />
                            <text x="2" y="3" fill="#ffffff" fontSize="7" fontWeight="bold" fontFamily="monospace">
                              ▶
                            </text>
                            {/* Cab Label */}
                            <text x="-9" y="3.5" fill="#38bdf8" fontSize="6.5" fontWeight="bold" fontFamily="monospace">
                              C2
                            </text>
                          </g>
                        ) : (
                          <g transform="translate(-42, 0)">
                            <polygon points="12,-9 0,0 12,9" fill={isLost ? "#ef4444" : "#10b981"} />
                            <text x="3" y="3" fill="#ffffff" fontSize="7" fontWeight="bold" fontFamily="monospace">
                              ◀
                            </text>
                            {/* Cab Label */}
                            <text x="14" y="3.5" fill="#38bdf8" fontSize="6.5" fontWeight="bold" fontFamily="monospace">
                              C1
                            </text>
                          </g>
                        )}

                        {/* Train ID Number or Train Lost Alert */}
                        {isLost ? (
                          <text
                            x={isSouthbound ? -8 : 8}
                            y={-1}
                            fill="#fecaca"
                            fontSize="9"
                            fontWeight="bold"
                            fontFamily="monospace"
                            textAnchor="middle"
                            className="animate-pulse"
                          >
                            LOST ⚠
                          </text>
                        ) : (
                          <text
                            x={isSouthbound ? -6 : 6}
                            y={-1}
                            fill="#ffffff"
                            fontSize="12"
                            fontWeight="bold"
                            fontFamily="monospace"
                            textAnchor="middle"
                            letterSpacing="0.8"
                          >
                            {trainId}
                          </text>
                        )}

                        {/* Mode & Speed Micro-Badges inside box */}
                        <g transform={`translate(${isSouthbound ? -8 : 8}, 8)`}>
                          {/* Mode Pill */}
                          <rect
                            x="-24"
                            y="-2"
                            width="22"
                            height="7.5"
                            rx="1.5"
                            fill={isLost ? "#dc2626" : mode === "ATO" ? "#059669" : "#0284c7"}
                          />
                          <text x="-13" y="4" fill="#ffffff" fontSize="5.5" fontWeight="bold" fontFamily="monospace" textAnchor="middle">
                            {isLost ? "ALRM" : mode}
                          </text>

                          {/* Speed / Dwell Pill */}
                          <rect
                            x="2"
                            y="-2"
                            width="24"
                            height="7.5"
                            rx="1.5"
                            fill={isDwell ? "#d97706" : "#2563eb"}
                          />
                          <text x="14" y="4" fill="#ffffff" fontSize="5.5" fontWeight="bold" fontFamily="monospace" textAnchor="middle">
                            {isDwell ? `D${dwellSeconds}s` : `${speed}k`}
                          </text>
                        </g>

                        {/* Floating Overhead Telemetry Tag */}
                        <g transform="translate(0, -22)" className="pointer-events-none">
                          <rect
                            x="-50"
                            y="-9"
                            width="100"
                            height="13"
                            rx="3"
                            fill="#ffffff"
                            stroke="#cbd5e1"
                            strokeWidth="0.8"
                            filter="drop-shadow(0 1px 2px rgba(0,0,0,0.06))"
                          />
                          <text x="0" y="0.5" fill="#0f172a" fontSize="6.5" fontWeight="bold" fontFamily="monospace" textAnchor="middle">
                            DEST: {destName} | {isDwell ? "مسافرگیری" : "سیر"}
                          </text>
                        </g>
                      </g>
                    );
                  })()}
                </g>
              );
            })}

            {/* 3. POINT SWITCHES */}
            {switches.map((sw) => {
              const isReverse = sw.position === "reverse";
              const isLocked = sw.isLocked;

              let switchColor = "#64748b";
              if (isReverse) switchColor = "#eab308";
              if (isLocked) switchColor = "#16a34a";
              if (sw.isBlocked) switchColor = "#ef4444";

              return (
                <g
                  key={`switch-${sw.id}`}
                  className="cursor-pointer group"
                  onClick={() => {
                    toggleSwitch(sw.id);
                    const station = STATIONS_DATABASE.find((s) => s.id === sw.stationId);
                    setSelectedElement({
                      type: "switch",
                      id: sw.id,
                      stationName: station ? `${station.pinglishName} (${station.alias})` : sw.name,
                      details: [
                        { label: "شناسه سوزن", value: sw.id },
                        { label: "موقعیت تیغه", value: sw.position === "normal" ? "عادی (Normal)" : "انحراف (Reverse)", color: switchColor },
                        { label: "قفل مسیر اینترلاکینگ", value: sw.isLocked ? "قفل الکتریکی EIL" : "آزاد" },
                        { label: "حفاظت جانبی (Flank)", value: sw.isFlankProtected ? "فعال (Flank Locked)" : "ندارد" },
                      ],
                    });
                  }}
                >
                  {/* Normal Blade Line */}
                  <line
                    x1={sw.x}
                    y1={sw.y}
                    x2={sw.normalX}
                    y2={sw.normalY}
                    stroke={!isReverse ? switchColor : "#cbd5e1"}
                    strokeWidth={!isReverse ? "3.5" : "1.8"}
                    strokeLinecap="round"
                  />

                  {/* Reverse Blade Line */}
                  <line
                    x1={sw.x}
                    y1={sw.y}
                    x2={sw.reverseX}
                    y2={sw.reverseY}
                    stroke={isReverse ? switchColor : "#cbd5e1"}
                    strokeWidth={isReverse ? "3.5" : "1.8"}
                    strokeLinecap="round"
                  />

                  {/* Point Machine Pivot Point */}
                  <circle
                    cx={sw.x}
                    cy={sw.y}
                    r="4.5"
                    fill={switchColor}
                    stroke="#ffffff"
                    strokeWidth="1.5"
                  />

                  {/* Switch Name Tag */}
                  <text
                    x={sw.x}
                    y={sw.y > 200 ? sw.y + 16 : sw.y - 12}
                    fill="#334155"
                    fontSize="8.5"
                    fontFamily="monospace"
                    fontWeight="700"
                    textAnchor="middle"
                  >
                    {sw.id}
                  </text>
                </g>
              );
            })}

            {/* 4. RAIL SIGNALS */}
            {signals.map((sig) => {
              let aspectColor = "#ef4444";
              if (sig.aspect === "green") aspectColor = "#22c55e";
              if (sig.aspect === "yellow") aspectColor = "#eab308";
              if (sig.aspect === "flashing_yellow") aspectColor = "#f59e0b";

              const isFlashing = sig.aspect === "flashing_yellow";

              return (
                <g
                  key={`signal-${sig.id}`}
                  className="cursor-pointer group"
                  onClick={() => {
                    cycleSignal(sig.id);
                    const station = STATIONS_DATABASE.find((s) => s.id === sig.stationId);
                    setSelectedElement({
                      type: "signal",
                      id: sig.id,
                      stationName: station ? `${station.pinglishName} (${station.alias})` : sig.name,
                      details: [
                        { label: "شناسه چراغ", value: sig.id },
                        { label: "نمای سیگنال (Aspect)", value: sig.aspect.toUpperCase(), color: aspectColor },
                        { label: "جهت پوشش", value: sig.direction === "north" ? "شمالی (به سمت قدس)" : "جنوبی (به سمت صفه)" },
                        { label: "بالیز حفاظتی ATSD", value: "مستقر پای سیگنال (توقف اضطراری هنگام خطر)" },
                      ],
                    });
                  }}
                >
                  {/* Signal Mast */}
                  <line
                    x1={sig.x}
                    y1={sig.y}
                    x2={sig.x}
                    y2={sig.y + (sig.direction === "north" ? 14 : -14)}
                    stroke="#475569"
                    strokeWidth="2"
                  />

                  {/* Signal Head Housing */}
                  <rect
                    x={sig.x - 7.5}
                    y={sig.y - 7.5}
                    width="15"
                    height="15"
                    fill={sig.aspect === "red" ? "#450a0a" : sig.aspect === "green" ? "#064e3b" : "#0f172a"}
                    stroke={aspectColor}
                    strokeWidth="1.2"
                    rx="3"
                  />

                  {/* Signal Aspect Marker: Directional Chevron for Green, Aspect Indicator for Red */}
                  {sig.aspect === "green" ? (
                    <polygon
                      points={
                        sig.direction === "north"
                          ? `${sig.x + 3},${sig.y - 4} ${sig.x - 3},${sig.y} ${sig.x + 3},${sig.y + 4}`
                          : `${sig.x - 3},${sig.y - 4} ${sig.x + 3},${sig.y} ${sig.x - 3},${sig.y + 4}`
                      }
                      fill="#22c55e"
                    />
                  ) : sig.aspect === "red" ? (
                    <g>
                      <rect x={sig.x - 3.5} y={sig.y - 3.5} width="7" height="7" fill="#ef4444" rx="1" />
                      <rect x={sig.x - 1.5} y={sig.y - 1.5} width="3" height="3" fill="#ffffff" />
                    </g>
                  ) : (
                    <circle
                      cx={sig.x}
                      cy={sig.y}
                      r="4.2"
                      fill={aspectColor}
                      className={isFlashing ? "animate-pulse" : ""}
                    />
                  )}

                  {/* Signal Name Label */}
                  <text
                    x={sig.x}
                    y={sig.direction === "north" ? sig.y - 10 : sig.y + 18}
                    fill="#475569"
                    fontSize="8.5"
                    fontFamily="monospace"
                    fontWeight="700"
                    textAnchor="middle"
                  >
                    {sig.id}
                  </text>

                  {/* Signal Failure Cross */}
                  {sig.hasFailure && (
                    <g transform={`translate(${sig.x - 7}, ${sig.y - 7})`}>
                      <rect width="14" height="14" fill="#ef4444" opacity="0.9" rx="2" />
                      <line x1="2" y1="2" x2="12" y2="12" stroke="#ffffff" strokeWidth="2" />
                      <line x1="12" y1="2" x2="2" y2="12" stroke="#ffffff" strokeWidth="2" />
                    </g>
                  )}
                </g>
              );
            })}
          </g>
        </svg>

        {/* FLOATING ZOOM CONTROLLER (Bottom-Right, Powerful & Complete) */}
        <div className="absolute bottom-4 end-4 flex items-center gap-1.5 bg-white/95 backdrop-blur-md p-1.5 rounded-2xl border border-neutral-200 shadow-lg z-20 text-neutral-800">
          {/* Zoom Out Button */}
          <button
            type="button"
            onClick={zoomOut}
            title="کوچکنمایی (Zoom Out)"
            className="p-1.5 hover:bg-neutral-100 rounded-xl cursor-pointer transition-colors active:scale-95"
          >
            <ZoomOut className="w-4 h-4 text-neutral-700" />
          </button>

          {/* Real Direct Percentage Display & Reset to 100% */}
          <button
            type="button"
            onClick={() => applyZoom(1.0)}
            title="بازنشانی زوم به ۱۰۰٪ (اندازه واقعی)"
            className="text-[11px] font-mono font-bold px-2 py-0.5 hover:bg-neutral-100 rounded-lg min-w-[42px] text-center cursor-pointer transition-colors"
          >
            {Math.round(zoom * 100)}%
          </button>

          {/* Zoom In Button */}
          <button
            type="button"
            onClick={zoomIn}
            title="بزرگنمایی (Zoom In)"
            className="p-1.5 hover:bg-neutral-100 rounded-xl cursor-pointer transition-colors active:scale-95"
          >
            <ZoomIn className="w-4 h-4 text-neutral-700" />
          </button>

          <div className="h-4 w-px bg-neutral-200 mx-0.5" />

          {/* Zoom Presets: 50%, 100%, 150%, 200% */}
          <div className="hidden sm:flex items-center gap-1">
            <button
              type="button"
              onClick={() => applyZoom(0.5)}
              className={`px-1.5 py-1 rounded-lg text-[10px] font-bold cursor-pointer transition-colors ${
                Math.round(zoom * 100) === 50 ? "bg-black text-white" : "hover:bg-neutral-100 text-neutral-600"
              }`}
            >
              ۵۰٪
            </button>
            <button
              type="button"
              onClick={() => applyZoom(1.0)}
              className={`px-1.5 py-1 rounded-lg text-[10px] font-bold cursor-pointer transition-colors ${
                Math.round(zoom * 100) === 100 ? "bg-black text-white" : "hover:bg-neutral-100 text-neutral-600"
              }`}
            >
              ۱۰۰٪
            </button>
            <button
              type="button"
              onClick={() => applyZoom(1.5)}
              className={`px-1.5 py-1 rounded-lg text-[10px] font-bold cursor-pointer transition-colors ${
                Math.round(zoom * 100) === 150 ? "bg-black text-white" : "hover:bg-neutral-100 text-neutral-600"
              }`}
            >
              ۱۵۰٪
            </button>
          </div>

          <div className="h-4 w-px bg-neutral-200 mx-0.5 hidden sm:block" />

          {/* Whole Line Overview Button */}
          <button
            type="button"
            onClick={fitWholeLine}
            title="مشاهده نمای کلی سراسر خط ۱ (۲۰ ایستگاه)"
            className="px-2.5 py-1 hover:bg-neutral-100 rounded-xl text-[10.5px] font-bold cursor-pointer transition-colors text-neutral-700"
          >
            کل خط
          </button>
        </div>

        {/* SELECTED ELEMENT BOTTOM SHEET CARD */}
        {selectedElement && (
          <div className="absolute bottom-16 start-4 end-4 sm:start-auto sm:end-4 sm:w-88 bg-white/98 border border-neutral-200 p-4 rounded-2xl shadow-2xl backdrop-blur-md z-30 space-y-3 animate-fadeIn">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-2">
              <div className="flex items-center gap-2 font-bold text-black text-xs">
                <Activity className="w-4 h-4 text-emerald-600" />
                <span className="truncate">{selectedElement.stationName} - {selectedElement.id}</span>
              </div>
              <button
                type="button"
                onClick={() => setSelectedElement(null)}
                className="p-1 hover:bg-neutral-100 rounded-md text-neutral-500 hover:text-black cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-x-2 gap-y-1.5 text-[11px]">
              {selectedElement.details.map((d, i) => (
                <div key={i} className="flex flex-col">
                  <span className="text-neutral-500 text-[10px]">{d.label}:</span>
                  <span className="font-semibold truncate" style={{ color: d.color || "#0f172a" }}>
                    {d.value}
                  </span>
                </div>
              ))}
            </div>

            <div className="pt-2 border-t border-neutral-100 flex flex-wrap gap-2">
              {selectedElement.type === "train" && (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      focusOnTrain(selectedElement.id);
                      setSelectedElement(null);
                    }}
                    className="flex-1 py-2 px-3 rounded-xl bg-black hover:bg-neutral-800 text-white text-xs font-bold cursor-pointer active:scale-98 transition-all shadow-xs"
                  >
                    تمرکز بر قطار
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      toggleTrainLostSimulation(selectedElement.id);
                    }}
                    className="py-2 px-3 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold cursor-pointer border border-rose-200"
                    title="شبیه‌سازی رخداد Train Lost طبق جزوه CTC (عبور از چراغ قرمز)"
                  >
                    تست Train Lost
                  </button>
                  <button
                    type="button"
                    onClick={handleStepSimulation}
                    className="py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold cursor-pointer active:scale-98 transition-all shadow-xs"
                  >
                    یک گام حرکت
                  </button>
                </>
              )}
              {selectedElement.type === "switch" && (
                <button
                  type="button"
                  onClick={() => {
                    toggleSwitch(selectedElement.id);
                    setSelectedElement(null);
                  }}
                  className="flex-1 py-2 px-3 rounded-xl bg-black hover:bg-neutral-800 text-white text-xs font-bold cursor-pointer active:scale-98 transition-all shadow-xs"
                >
                  تغییر وضعیت سوزن
                </button>
              )}
              {selectedElement.type === "signal" && (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      cycleSignal(selectedElement.id);
                      setSelectedElement(null);
                    }}
                    className="flex-1 py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold cursor-pointer active:scale-98 transition-all shadow-xs"
                  >
                    تغییر فاز چراغ
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      toggleFaultOnSignal(selectedElement.id);
                      setSelectedElement(null);
                    }}
                    className="py-2 px-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold cursor-pointer active:scale-98 transition-all shadow-xs"
                  >
                    تست خطا
                  </button>
                </>
              )}
              {selectedElement.type === "track" && (
                <button
                  type="button"
                  onClick={() => {
                    handleTrackClick(selectedElement.id);
                    setSelectedElement(null);
                  }}
                  className="flex-1 py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold cursor-pointer active:scale-98 transition-all shadow-xs"
                >
                  {routeOrigin ? "تنظیم به عنوان مقصد روت" : "تنظیم به عنوان مبدأ روت"}
                </button>
              )}
            </div>
          </div>
        )}
      </main>

      {/* =========================================================================
          3. SLIM BOTTOM STATUS BAR (Clean, Informative & Minimalist)
          ========================================================================= */}
      <footer className="h-8 bg-neutral-50 border-t border-neutral-200 px-4 flex items-center justify-between text-[11px] text-neutral-600 shrink-0 z-20">
        <div className="flex items-center gap-2 truncate">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
          <span className="text-neutral-500 hidden xs:inline">رویداد زنده:</span>
          <span className="font-medium text-neutral-800 truncate max-w-xs sm:max-w-md">
            {eventLogs[0]?.eventDescription || "سامانه آماده به کار است."}
          </span>
        </div>

        <button
          type="button"
          onClick={() => {
            setDrawerTab("logs");
            setIsDrawerOpen(true);
          }}
          className="text-neutral-800 hover:text-black font-semibold text-[10.5px] flex items-center gap-1 cursor-pointer shrink-0"
        >
          <span>مشاهده لاگ‌ها ({eventLogs.length})</span>
          <ChevronUp className="w-3.5 h-3.5" />
        </button>
      </footer>

      {/* =========================================================================
          4. CENTRAL UNIFIED DRAWER (TABBED & BEAUTIFULLY ORGANIZED)
          Preserves 100% of all features in clean tabs: Controls | Logs | LEDs | Stations | Guide
          ========================================================================= */}
      {isDrawerOpen && (
        <div
          onClick={() => setIsDrawerOpen(false)}
          className="fixed inset-0 bg-black/40 backdrop-blur-2xs z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fadeIn"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full sm:max-w-2xl bg-white border border-neutral-200 rounded-t-2xl sm:rounded-2xl p-4 sm:p-5 shadow-2xl space-y-4 max-h-[85vh] flex flex-col"
          >
            {/* Header with Title and Close Button */}
            <div className="flex items-center justify-between border-b border-neutral-100 pb-3 shrink-0">
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-neutral-800" />
                <h3 className="font-extrabold text-sm text-neutral-900">
                  ابزارها و تنظیمات شبیه‌ساز CTC
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsDrawerOpen(false)}
                className="p-1 hover:bg-neutral-100 rounded-md text-neutral-500 hover:text-black cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Clean Segmented Tabs Switcher */}
            <div className="grid grid-cols-5 gap-1 p-1 bg-neutral-100 rounded-xl text-xs font-bold shrink-0">
              <button
                type="button"
                onClick={() => setDrawerTab("controls")}
                className={`py-2 px-1 rounded-lg text-center transition-all cursor-pointer truncate ${
                  drawerTab === "controls"
                    ? "bg-white text-black shadow-xs font-extrabold"
                    : "text-neutral-600 hover:text-black"
                }`}
              >
                کنترل سناریو
              </button>
              <button
                type="button"
                onClick={() => setDrawerTab("logs")}
                className={`py-2 px-1 rounded-lg text-center transition-all cursor-pointer truncate ${
                  drawerTab === "logs"
                    ? "bg-white text-black shadow-xs font-extrabold"
                    : "text-neutral-600 hover:text-black"
                }`}
              >
                لاگ‌ها ({eventLogs.length})
              </button>
              <button
                type="button"
                onClick={() => setDrawerTab("leds")}
                className={`py-2 px-1 rounded-lg text-center transition-all cursor-pointer truncate ${
                  drawerTab === "leds"
                    ? "bg-white text-black shadow-xs font-extrabold"
                    : "text-neutral-600 hover:text-black"
                }`}
              >
                اینترلاکینگ
              </button>
              <button
                type="button"
                onClick={() => setDrawerTab("stations")}
                className={`py-2 px-1 rounded-lg text-center transition-all cursor-pointer truncate ${
                  drawerTab === "stations"
                    ? "bg-white text-black shadow-xs font-extrabold"
                    : "text-neutral-600 hover:text-black"
                }`}
              >
                ایستگاه‌ها
              </button>
              <button
                type="button"
                onClick={() => setDrawerTab("guide")}
                className={`py-2 px-1 rounded-lg text-center transition-all cursor-pointer truncate ${
                  drawerTab === "guide"
                    ? "bg-white text-black shadow-xs font-extrabold"
                    : "text-neutral-600 hover:text-black"
                }`}
              >
                راهنمای جزوات
              </button>
            </div>

            {/* Tab Contents Container */}
            <div className="flex-1 overflow-y-auto space-y-4 pe-1">
              {/* TAB 1: CONTROLS & FLEET SCENARIO */}
              {drawerTab === "controls" && (
                <div className="space-y-4">
                  {/* Multi-Train Fleet Management Panel */}
                  <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200/80 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-neutral-900 text-xs flex items-center gap-1.5">
                        <Activity className="w-3.5 h-3.5 text-emerald-600" />
                        مدیریت ناوگان خط ۱ (Train Describer)
                      </span>
                      {/* Train Selector Dropdown */}
                      <div className="flex items-center gap-1 bg-white px-2 py-0.5 rounded-lg border border-neutral-200">
                        <span className="text-[10px] text-neutral-500">قطار:</span>
                        <select
                          value={selectedTrainId}
                          onChange={(e) => {
                            setSelectedTrainId(e.target.value);
                            focusOnTrain(e.target.value);
                          }}
                          className="font-mono font-bold text-xs bg-transparent cursor-pointer outline-hidden"
                        >
                          {trains.map((t) => (
                            <option key={t.id} value={t.id}>
                              {t.id} ({t.currentTrackId})
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {(() => {
                      const activeTrain = trains.find((t) => t.id === selectedTrainId) || trains[0];
                      const activeTrack = tracks.find((t) => t.id === activeTrain.currentTrackId);
                      return (
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-[11px] bg-white p-2 rounded-lg border border-neutral-100">
                            <span className="text-neutral-600">
                              بلاک: <strong className="font-mono text-black">{activeTrain.currentTrackId}</strong> ({activeTrack?.name || "خط"})
                            </span>
                            <span className="text-neutral-600">
                              سرعت: <strong className="font-mono text-blue-600">{activeTrain.speed} km/h</strong> (مجاز: {activeTrack?.speedDisplay})
                            </span>
                            <span className="text-neutral-600">
                              جهت: <strong>{activeTrain.direction === "southbound" ? "جنوب (دفاع مقدس)" : "شمال (قدس)"}</strong>
                            </span>
                          </div>

                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                            <button
                              type="button"
                              onClick={() => changeTrainMode(selectedTrainId, "ATO")}
                              className={`py-1.5 px-2 font-bold rounded-lg border cursor-pointer text-center text-[11px] ${
                                activeTrain.mode === "ATO"
                                  ? "bg-emerald-600 text-white border-emerald-600 shadow-2xs"
                                  : "bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border-emerald-200"
                              }`}
                            >
                              مد خودکار (ATO)
                            </button>
                            <button
                              type="button"
                              onClick={() => changeTrainMode(selectedTrainId, "ATP_MANUAL")}
                              className={`py-1.5 px-2 font-bold rounded-lg border cursor-pointer text-center text-[11px] ${
                                activeTrain.mode === "ATP_MANUAL"
                                  ? "bg-blue-600 text-white border-blue-600 shadow-2xs"
                                  : "bg-blue-50 hover:bg-blue-100 text-blue-800 border-blue-200"
                              }`}
                            >
                              مد کُددار (ATP)
                            </button>
                            <button
                              type="button"
                              onClick={() => changeTrainMode(selectedTrainId, "SHUNTING")}
                              className={`py-1.5 px-2 font-bold rounded-lg border cursor-pointer text-center text-[11px] ${
                                activeTrain.mode === "SHUNTING"
                                  ? "bg-amber-600 text-white border-amber-600 shadow-2xs"
                                  : "bg-amber-50 hover:bg-amber-100 text-amber-800 border-amber-200"
                              }`}
                            >
                              مد مانور (RM ۲۵)
                            </button>
                            <button
                              type="button"
                              onClick={() => toggleTrainLostSimulation(selectedTrainId)}
                              className="py-1.5 px-2 bg-rose-50 hover:bg-rose-100 text-rose-800 font-bold rounded-lg border border-rose-200 cursor-pointer text-center text-[11px]"
                              title="شبیه‌سازی رخداد Train Lost طبق جزوه CTC (عبور از چراغ قرمز)"
                            >
                              {activeTrain.isTrainLost ? "بازیابی قطار ✅" : "تست Train Lost ⚠"}
                            </button>
                          </div>
                        </div>
                      );
                    })()}
                  </div>

                  {/* Interlocking Scenarios & Route Operations */}
                  <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200/80 space-y-2.5">
                    <span className="font-bold text-neutral-900 text-xs">سناریوهای استاندارد اینترلاکینگ و مسیرسازی</span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => executeRouteSetting("T7.1", "T6.1")}
                        className="py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl cursor-pointer text-xs text-start"
                      >
                        مسیر اصلی خط ۱ (کاوه ➔ جابر - ۷۰ km/h)
                      </button>
                      <button
                        type="button"
                        onClick={() => executeRouteSetting("T20.1.3", "T20.1")}
                        className="py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl cursor-pointer text-xs text-start"
                      >
                        مسیر ورودی قطار ۱۰۵ به سکوی دفاع مقدس
                      </button>
                      <button
                        type="button"
                        onClick={() => executeRouteSetting("T18.1", "T18.2")}
                        className="py-2 px-3 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl cursor-pointer text-xs text-start"
                      >
                        تغییر خط از کراس‌اور کارگر (P18.1XO - ۲۵ km/h)
                      </button>
                      <button
                        type="button"
                        onClick={() => executeRouteSetting("T20.2", "T20.2.4")}
                        className="py-2 px-3 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl cursor-pointer text-xs text-start"
                      >
                        مانور به دم‌موشکی پایانه دفاع مقدس (سوزن P20.4/P20.6)
                      </button>
                    </div>

                    <div className="pt-1 flex gap-2">
                      <button
                        type="button"
                        onClick={handleCancelRoute}
                        className="flex-1 py-2 px-3 bg-neutral-200 hover:bg-neutral-300 text-neutral-900 font-bold rounded-xl cursor-pointer text-xs"
                      >
                        لغو کلیه مسیرها و بازگرداندن سوزن‌ها به نرمال (Normal)
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: AUDIT & EVENT LOGS */}
              {drawerTab === "logs" && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setLogFilter("all")}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-bold cursor-pointer ${
                        logFilter === "all" ? "bg-black text-white" : "bg-neutral-100 text-neutral-600"
                      }`}
                    >
                      همه ({eventLogs.length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setLogFilter("error")}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-bold cursor-pointer ${
                        logFilter === "error" ? "bg-rose-600 text-white" : "bg-neutral-100 text-neutral-600"
                      }`}
                    >
                      خطا و هشدار
                    </button>
                  </div>

                  <div className="space-y-1.5 font-mono text-[11px] max-h-80 overflow-y-auto">
                    {eventLogs
                      .filter((log) => logFilter === "all" || log.level === logFilter)
                      .map((log) => (
                        <div
                          key={log.id}
                          className={`p-2 rounded-lg border flex items-start gap-2 ${
                            log.level === "error"
                              ? "bg-rose-50/70 border-rose-200 text-rose-900"
                              : log.level === "warning"
                              ? "bg-amber-50/70 border-amber-200 text-amber-900"
                              : "bg-neutral-50 border-neutral-200 text-neutral-800"
                          }`}
                        >
                          <span className="text-[10px] text-neutral-400 shrink-0">
                            {log.occurredOn.slice(11)}
                          </span>
                          <span className="font-bold shrink-0">[{log.source}]</span>
                          <span className="truncate">{log.eventDescription}</span>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {/* TAB 3: INTERLOCKING LEDS & TMR 2oo3 STATUS */}
              {drawerTab === "leds" && (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {[
                      { label: "ARS فعال", active: ledStatus.arsActive, color: "bg-blue-500" },
                      { label: "ATR فعال", active: ledStatus.atrActive, color: "bg-blue-500" },
                      { label: "کنترل مرکز (CM)", active: ledStatus.control, color: "bg-emerald-500" },
                      { label: "حفاظت جانبی (Flank)", active: true, color: "bg-emerald-500" },
                      { label: "معماری 2oo3 TMR", active: true, color: "bg-emerald-500" },
                      { label: "خطای سوزن (Point Fail)", active: ledStatus.pointFail, color: "bg-rose-500" },
                      { label: "تیغه‌بُری (Point Trailed)", active: ledStatus.pointTrailed, color: "bg-rose-500" },
                      { label: "بالیز ATSD", active: true, color: "bg-emerald-500" },
                    ].map((item, idx) => (
                      <div
                        key={idx}
                        className="p-2.5 rounded-xl border border-neutral-200/80 bg-neutral-50 flex items-center justify-between"
                      >
                        <span className="text-xs font-semibold text-neutral-700">{item.label}</span>
                        <span
                          className={`w-2.5 h-2.5 rounded-full ${item.active ? item.color : "bg-neutral-300"}`}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 4: 20-STATIONS DIRECTORY */}
              {drawerTab === "stations" && (
                <div className="space-y-2.5">
                  {onOpenAtlas && (
                    <div className="p-2.5 rounded-xl bg-cyan-50 border border-cyan-200 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <Layers className="w-4 h-4 text-cyan-700" />
                        <div>
                          <span className="font-bold text-cyan-950 block">اطلس و نقشه مهندسی خط ۱</span>
                          <span className="text-[10.5px] text-cyan-800">
                            تفکیک ۹ سکوی جزیره‌ای و ۱۱ سکوی کناری، موقعیت اتاق‌های سیگنالینگ و مقایسه فنی
                          </span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setIsDrawerOpen(false);
                          onOpenAtlas();
                        }}
                        className="px-3 py-1.5 rounded-lg bg-cyan-700 hover:bg-cyan-600 text-white font-bold text-xs cursor-pointer transition-colors shrink-0"
                      >
                        باز کردن اطلس
                      </button>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-80 overflow-y-auto">
                    {STATIONS_DATABASE.map((st) => (
                      <div
                        key={st.id}
                        onClick={() => {
                          jumpToStation(st.id);
                          setIsDrawerOpen(false);
                        }}
                        className={`p-2.5 rounded-xl border flex items-center justify-between cursor-pointer transition-colors ${
                          st.id === selectedStationId
                            ? "bg-neutral-900 text-white border-neutral-900"
                            : "bg-neutral-50 hover:bg-neutral-100 border-neutral-200/80 text-neutral-800"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-xs">
                            {st.id.toString().padStart(2, "0")}
                          </span>
                          <div>
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <p className="font-bold text-xs">{st.fullName}</p>
                              <span
                                className={`text-[9px] px-1.5 py-0.2 rounded font-bold ${
                                  st.platformType === "island"
                                    ? "bg-cyan-100 text-cyan-800 border border-cyan-200"
                                    : "bg-amber-100 text-amber-800 border border-amber-200"
                                }`}
                              >
                                {st.platformType === "island" ? "جزیره‌ای" : "کناری"}
                              </span>
                              {st.signalingRoom && (
                                <span
                                  className={`text-[9px] px-1.5 py-0.2 rounded font-mono font-bold ${
                                    st.signalingRoom.type === "CER"
                                      ? "bg-purple-100 text-purple-800 border border-purple-200"
                                      : "bg-emerald-100 text-emerald-800 border border-emerald-200"
                                  }`}
                                >
                                  {st.signalingRoom.id}
                                </span>
                              )}
                            </div>
                            <p
                              className={`text-[10px] ${
                                st.id === selectedStationId ? "text-neutral-300" : "text-neutral-500"
                              }`}
                            >
                              {st.chainage} | {st.platformDescription}
                            </p>
                          </div>
                        </div>
                        <ChevronLeft className="w-4 h-4 opacity-60 shrink-0" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 5: SIGNALING BOOKLET GUIDE (جزوات علائم و اینترلاکینگ) */}
              {drawerTab === "guide" && (
                <div className="space-y-3 text-neutral-800 leading-relaxed text-xs">
                  <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl space-y-2">
                    <h4 className="font-extrabold text-emerald-900 flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-emerald-700" />
                      استاندارد نماد توصیف‌گر قطار در جزوه CTC و مهاران
                    </h4>
                    <p className="text-[11.5px] text-emerald-950">
                      بر اساس جزوه رسمی سیستم سیگنالینگ و کنترل ترافیک مرکزی (CTC)، نماد قطار بر روی تراک به صورت یک <strong>کادر مربعی/مستطیلی با یک مثلث در نوک آن (دماغه هدایت)</strong> ترسیم می‌شود:
                    </p>
                    <ul className="list-disc list-inside space-y-1 text-[11px] text-emerald-900">
                      <li>
                        <strong>مثلث نوک کادر (Triangular Nose):</strong> نشان‌دهنده جهت سیر قطار (به سمت ایستگاه قدس در شمال ◀ یا دفاع مقدس در جنوب ▶) و مشخص‌کننده کابین پیشرو فعال (Cab 1 یا Cab 2) به همراه پرتو نور چراغ پیشانی است.
                      </li>
                      <li>
                        <strong>کادر بدنه (مربع شناسنامه قطار):</strong> حاوی شماره قطار (مثلاً ۱۰۶)، مد هدایت (ATO خودکار، ATP دستی، یا RM مانور)، سرعت سیر، زمان توقف سکو (Dwell Time)، و کد مقصد نهایی است.
                      </li>
                      <li>
                        <strong>رخداد Train Lost طبق جزوه:</strong> در صورت عبور قطار از چراغ قرمز یا خطای ردیابی، شماره قطار در سرویس Train Describer پاک شده و هشدار چشمک‌زن <code>[TRAIN LOST ⚠]</code> صادر می‌گردد.
                      </li>
                    </ul>
                  </div>

                  <div className="p-3 bg-neutral-50 border border-neutral-200 rounded-xl space-y-1.5 text-[11.5px]">
                    <h5 className="font-bold text-neutral-900">نمای سیگنال‌ها در اینترلاکینگ EIL:</h5>
                    <p>• <strong>سبز:</strong> مسیر مستقیم با حداکثر سرعت ۷۰ km/h آزاد است.</p>
                    <p>• <strong>زرد:</strong> مسیر انحرافی یا تقرب به توقف (حداکثر ۲۵ km/h).</p>
                    <p>• <strong>زرد چشمک‌زن:</strong> مسیر مانوری با احتیاط دیداری (۱۰ تا ۱۵ km/h).</p>
                    <p>• <strong>قرمز:</strong> توقف مطلق. بالیز ATSD پای سیگنال در صورت عبور غیرمجاز ترمز اضطراری می‌زند.</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* STATIONS QUICK MODAL SELECTOR */}
      {isStationModalOpen && (
        <div
          onClick={() => setIsStationModalOpen(false)}
          className="fixed inset-0 bg-black/40 backdrop-blur-2xs z-50 flex items-center justify-center p-4 animate-fadeIn"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg bg-white border border-neutral-200 rounded-2xl p-4 shadow-2xl space-y-3 max-h-[80vh] flex flex-col"
          >
            <div className="flex items-center justify-between border-b border-neutral-100 pb-2">
              <h3 className="font-extrabold text-sm text-neutral-900 flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-emerald-600" />
                انتخاب ایستگاه از خط ۱ متروی اصفهان
              </h3>
              <button
                type="button"
                onClick={() => setIsStationModalOpen(false)}
                className="p-1 hover:bg-neutral-100 rounded-md text-neutral-500 hover:text-black cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-1.5 pe-1">
              {STATIONS_DATABASE.map((st) => (
                <button
                  key={st.id}
                  type="button"
                  onClick={() => {
                    jumpToStation(st.id);
                    setIsStationModalOpen(false);
                  }}
                  className={`w-full p-2.5 rounded-xl border flex items-center justify-between text-start cursor-pointer transition-colors ${
                    st.id === selectedStationId
                      ? "bg-black text-white border-black"
                      : "bg-neutral-50 hover:bg-neutral-100 border-neutral-200/80 text-neutral-800"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="font-mono font-bold text-xs">
                      {st.id.toString().padStart(2, "0")}
                    </span>
                    <div>
                      <p className="font-bold text-xs">{st.fullName}</p>
                      <p className={`text-[10.5px] ${st.id === selectedStationId ? "text-neutral-300" : "text-neutral-500"}`}>
                        {st.chainage} • {st.platformDescription}
                      </p>
                    </div>
                  </div>
                  <ChevronLeft className="w-4 h-4 opacity-50" />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
