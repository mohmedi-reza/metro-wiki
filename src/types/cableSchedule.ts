export type CableCategory =
  | 'fiber_optic'
  | 'ethernet_safenet'
  | 'ethernet_diag'
  | 'field_control'
  | 'vital_relay'
  | 'power_feed'
  | 'earth_ground'
  | 'serial_bus';

export interface CableRun {
  id: string; // e.g., "CBL-FIB-01", "WIR-ETH-102"
  labelEn: string;
  category: CableCategory;
  source: {
    rackId: string;
    subrackId?: string;
    slot?: string;
    portOrPin: string;
    labelEn: string;
    isFieldTarget?: boolean;
    chainageOrLocation?: string;
  };
  destination: {
    rackId: string;
    subrackId?: string;
    slot?: string;
    portOrPin: string;
    labelEn: string;
    isFieldTarget?: boolean;
    chainageOrLocation?: string;
  };
  specificationEn: string; // e.g. "OM3 50/125µm Duplex LC-LC Orange LSZH"
  wireColor: string; // Hex color for drawing
  lengthMeters: number;
  coreCount?: number;
  safetyLevel: 'SIL 4' | 'SIL 2' | 'Non-Vital' | 'Grounding PE';
  status: 'healthy' | 'warning' | 'standby' | 'disconnected';
  telemetry: {
    signalLevel: string; // e.g. "TX: -3.2 dBm / RX: -4.1 dBm" or "24.1 V DC / 180mA"
    speedOrRate: string; // e.g. "1000 Mbps Full-Duplex"
    attenuationDb?: number;
    packetLossPct: number;
    latencyMs?: number;
  };
  remarksEn: string;
}
