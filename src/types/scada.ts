// Types for SCADA & CTC Rail Monitoring Panel & Training Simulator

export type TrackStatus = 'free' | 'occupied' | 'locked' | 'fleet' | 'failed';

export type SignalAspect = 'red' | 'green' | 'yellow' | 'flashing_yellow' | 'white_dwell';

export type PointPosition = 'normal' | 'reverse' | 'moving' | 'failed' | 'trailed';

export type PlatformType = 'side' | 'island'; // طرفین یا جزیره‌ای

export interface SignalingRoomInfo {
  id: string; // e.g. "SER-01", "CER-OCC", "SER-07", "SER-10", "SER-12", "SER-16", "SER-18", "SER-20"
  type: 'CER' | 'SER';
  title: string;
  stationId: number;
  rackCount: number;
  interlockingType: string;
  lcpAvailable: boolean;
  description: string;
  equipment: string[];
}

export interface StationData {
  id: number;
  name: string;
  alias: string;
  pinglishName: string; // e.g. "01-GHODS", "07-KAVEH"
  fullName: string;
  platformType: PlatformType;
  platformDescription: string;
  chainage: string; // e.g. "0+000"
  hasDepotConnection?: boolean; // ایستگاه کاوه
  hasBranchingSwitch?: boolean; // امام حسین و آزادی
  hasCrossover?: boolean; // قدس، شهدا، صفه و ...
  speedLimit: number; // km/h
  signalingRoom?: SignalingRoomInfo;
}

export interface TrackCircuit {
  id: string; // e.g. "T1.1", "T4.1.4", "T7.1", "T1.A.5"
  stationId?: number;
  name: string;
  trackNumber: 1 | 2; // Line 1 (Track 1 / Track 2 - رفت و برگشت)
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  status: TrackStatus;
  speedLimit: number; // 70 km/h main, 50 km/h platform, 25 km/h depot/switch
  speedDisplay: string; // e.g. "70/50", "50/50", "25/25"
  direction: 'northbound' | 'southbound' | 'both';
  isPlatform?: boolean;
  isDeadEnd?: boolean;
  isDiagonal?: boolean; // Diagonal switch / crossover track segment
  isBufferStopLeft?: boolean; // Physical buffer stop at left end
  isBufferStopRight?: boolean; // Physical buffer stop at right end
  occupyingTrainId?: string | null;
  lengthMeters: number;
}

export interface PointSwitch {
  id: string; // e.g. "P1.1", "P20.6"
  stationId: number;
  name: string;
  x: number;
  y: number;
  normalX: number;
  normalY: number;
  reverseX: number;
  reverseY: number;
  position: PointPosition;
  isFlankProtected?: boolean;
  isLocked?: boolean;
  isBlocked?: boolean; // Blocked or failed switch
}

export interface RailSignal {
  id: string; // e.g. "S1.1", "S20.4"
  stationId: number;
  name: string;
  x: number;
  y: number;
  aspect: SignalAspect;
  direction: 'north' | 'south';
  hasFailure: boolean;
  isDwellActive?: boolean;
  routeLocked?: boolean;
  isShunting?: boolean;
}

export interface SimulatedTrain {
  id: string; // e.g. "106", "112"
  currentTrackId: string;
  speed: number; // km/h
  targetSpeed: number;
  direction: 'northbound' | 'southbound';
  mode: 'ATO' | 'ATP_MANUAL' | 'SHUNTING' | 'ATSD';
  originStation: string;
  destinationStation: string;
  dwellSecondsRemaining?: number;
  activeCab?: 'Cab 1' | 'Cab 2';
  isTrainLost?: boolean;
  serviceId?: string;
  doorsState?: 'closed_locked' | 'platform_open';
  scheduleStatus?: 'on_time' | 'delayed' | 'early';
  lastBaliseId?: string;
  progressRatio?: number; // 0.0 to 1.0 along the current track for smooth animation
  targetTrackId?: string; // Next track train is navigating towards
}

export interface ScadaEvent {
  id: string;
  occurredOn: string; // e.g. "2026-10-08 12:59:28"
  source: string; // e.g. "Logic", "Interlocking", "CTC", "ATP"
  type: string; // e.g. "EVNT_CMD_CHANGE_POINT", "EVNT_RED_PASSED"
  eventDescription: string; // e.g. "Interlocking: 1 Point: 206 is Changing"
  level: 'info' | 'warning' | 'error' | 'success';
}

export interface LedStatus {
  arsActive: boolean;
  arsTsMode: boolean;
  arsScMode: boolean;
  atrActive: boolean;
  control: boolean;
  approach: boolean;
  pointFail: boolean;
  pointTrailed: boolean;
}

export interface RouteRequest {
  originTrackId: string;
  destinationTrackId: string;
  interveningTracks: string[];
  overlapTracks: string[];
  flankSwitches: string[];
  status: 'pending' | 'active' | 'cleared';
  trainId?: string;
}
