// Types for Signaling Rooms, Rack Elevations, and Industrial Network Protocols

export type RackSubrackCategory =
  | 'processing'       // Vital 2oo3 processors, CPUs
  | 'io'               // Field Electronic Controllers (FEC), Digital I/O
  | 'point_machine'    // Point Machine Controller (PMC)
  | 'signal_driver'    // Vital Signal Controller (VSC)
  | 'track_circuit'    // MAFTC transmitters (TCX) and receivers (TCR)
  | 'axle_counter'     // MH-AX indoor unit (OPR, OPS, TXR, OMI)
  | 'network_switch'   // Industrial switches, routers
  | 'patch_panel'      // ODF, Patch Panels Cat6A
  | 'diagnostic'       // DiagRC recording, event logger
  | 'lcp_panel'        // Local Control Panel interface
  | 'power_supply'     // DC/DC converters, PDC, UPS, ATS
  | 'server_node';     // OCC server IPCs, Workstations

export interface SubrackComponent {
  name: string;
  nameEn: string;
  count: number;
  description: string;
}

export interface RackSubrack {
  id: string;
  uStart: number; // e.g. 38 (top)
  uEnd: number;   // e.g. 42
  heightU: number; // e.g. 4
  title: string;
  titleEn: string;
  modelCode: string; // e.g. "VPU-2oo3-MHR" or "EUR01881-MHR-ENT-SI-SRS-102"
  category: RackSubrackCategory;
  safetyLevel:
    | 'SIL 4'
    | 'SIL 4 / Highly Reliable'
    | 'SIL 4 Protected'
    | 'SIL 4 Protected Hardware'
    | 'SIL 2'
    | 'SIL 2 / Cyber Security IEC 62443'
    | 'Industrial Non-Vital'
    | 'Industrial Non-Vital (Non-intrusive)'
    | 'Fail-Safe Hardware';
  powerSpec: string; // e.g. "24V DC / 15W" or "230V AC / 100W"
  busProtocol: string; // e.g. "Dual CAN A/B 500kbps" or "Dual 100Base-TX Ethernet"
  description: string;
  components: SubrackComponent[];
  ledIndicators: { label: string; color: 'green' | 'red' | 'yellow' | 'blue'; state: 'on' | 'blinking' }[];
  ports?: string[];
}

export interface SignalingRackElevation {
  id: string; // e.g. "RACK-01"
  name: string; // e.g. "رک پردازش مرکزی اینترلاکینگ EIL (MainIO Rack)"
  nameEn: string; // e.g. "MainIO & CBI Vital Processing Rack"
  totalU: number; // default 42U
  cabinetType: string; // e.g. "19-inch Industrial Rittal TS8, IP54, Ventilated"
  dimensions: string; // e.g. "800 × 800 × 2000 mm"
  powerFeed: string; // e.g. "230V AC Dual Feeder (UPS 1 & UPS 2) + 24V DC Internal Bus"
  subracks: RackSubrack[];
}

export interface NetworkProtocolSpec {
  name: string;
  standard: string;
  layer: 'Application / Safety' | 'Network / Transport' | 'Data Link / Fieldbus' | 'Physical Transmission';
  medium: string;
  speed: string;
  redundancyType: string;
  description: string;
  packetInfo: string;
}

export interface NetworkHardwareEquipment {
  name: string;
  model: string;
  manufacturer: string;
  portsCount: string;
  redundancy: string;
  role: string;
}

export interface SignalingRoomDetail {
  id: string; // "CER-OCC", "SER-01", "SER-07", "SER-10", "SER-12", "SER-16", "SER-18", "SER-20", "SER-DEPOT"
  stationId: number;
  stationName: string;
  title: string;
  type: 'CER' | 'SER';
  location: string;
  chainage: string;
  silLevel: 'SIL 4' | 'SIL 4 / SIL 2';
  interlockingType: string;
  controlledEquipmentSummary: {
    switchesCount: number;
    signalsCount: number;
    tracksCount: number;
    axleCountersCount?: number;
    lcpAvailable: boolean;
    coverageZone: string;
  };
  networkArchitecture: {
    backboneRing: string;
    fieldbusTopology: string;
    safetyStandard: string;
    protocols: NetworkProtocolSpec[];
    hardware: NetworkHardwareEquipment[];
  };
  racks: SignalingRackElevation[];
}
