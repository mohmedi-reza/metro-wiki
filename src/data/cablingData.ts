import { CableRun } from '../types/cableSchedule';

export const SYSTEM_CABLING_RUNS: CableRun[] = [
  // =========================================================================
  // CER-RACK-01 / OCC CABLING
  // =========================================================================
  {
    id: 'CBL-FIB-CER01-01',
    labelEn: 'ODF T-1 to MACH1000 SFP-1 (West Tunnel Backbone)',
    category: 'fiber_optic',
    source: {
      rackId: 'CER-RACK-01',
      subrackId: 'CER-SR-01',
      slot: 'ODF 1U',
      portOrPin: 'PORT 01-02 (SC/APC)',
      labelEn: 'ODF Tray A Port 01/02',
    },
    destination: {
      rackId: 'CER-RACK-01',
      subrackId: 'CER-SR-02',
      slot: 'SW 2U',
      portOrPin: 'SFP 1 (LC-Duplex)',
      labelEn: 'MACH1000 Core Switch SFP 1',
    },
    specificationEn: 'Single-Mode 9/125µm Duplex SC/APC-LC Yellow LSZH',
    wireColor: '#eab308', // Yellow
    lengthMeters: 2.5,
    coreCount: 2,
    safetyLevel: 'SIL 4',
    status: 'healthy',
    telemetry: {
      signalLevel: 'TX: -3.2 dBm | RX: -4.1 dBm',
      speedOrRate: '1000Base-LX (1 Gbps)',
      attenuationDb: 0.9,
      packetLossPct: 0.0,
      latencyMs: 0.12,
    },
    remarksEn: 'MRP Ring Master West Port. Optical budget margin: > 14 dB.',
  },
  {
    id: 'CBL-FIB-CER01-02',
    labelEn: 'ODF T-2 to MACH1000 SFP-2 (East Tunnel Backbone)',
    category: 'fiber_optic',
    source: {
      rackId: 'CER-RACK-01',
      subrackId: 'CER-SR-01',
      slot: 'ODF 1U',
      portOrPin: 'PORT 03-04 (SC/APC)',
      labelEn: 'ODF Tray A Port 03/04',
    },
    destination: {
      rackId: 'CER-RACK-01',
      subrackId: 'CER-SR-02',
      slot: 'SW 2U',
      portOrPin: 'SFP 2 (LC-Duplex)',
      labelEn: 'MACH1000 Core Switch SFP 2',
    },
    specificationEn: 'Single-Mode 9/125µm Duplex SC/APC-LC Yellow LSZH',
    wireColor: '#eab308',
    lengthMeters: 2.5,
    coreCount: 2,
    safetyLevel: 'SIL 4',
    status: 'healthy',
    telemetry: {
      signalLevel: 'TX: -3.1 dBm | RX: -4.3 dBm',
      speedOrRate: '1000Base-LX (1 Gbps)',
      attenuationDb: 1.2,
      packetLossPct: 0.0,
      latencyMs: 0.14,
    },
    remarksEn: 'MRP Ring Master East Port. Auto-healing test pass (<10ms).',
  },
  {
    id: 'CBL-ETH-CER01-03',
    labelEn: 'Core Switch P01 to VPU-A Safety CPU Port 1',
    category: 'ethernet_safenet',
    source: {
      rackId: 'CER-RACK-01',
      subrackId: 'CER-SR-02',
      slot: 'SW 2U',
      portOrPin: 'PORT 01 (RJ45)',
      labelEn: 'MACH1000 FastEth P01',
    },
    destination: {
      rackId: 'CER-RACK-01',
      subrackId: 'CER-SR-03',
      slot: 'SLOT 03-05',
      portOrPin: 'ETH 1 (RJ45)',
      labelEn: 'VPU-A Safety CPU 1',
    },
    specificationEn: 'Cat.7 S/FTP Industrial Double Shielded LSZH Purple',
    wireColor: '#a855f7', // Purple
    lengthMeters: 1.8,
    coreCount: 8,
    safetyLevel: 'SIL 4',
    status: 'healthy',
    telemetry: {
      signalLevel: '1000BASE-T SNR: 32.5 dB',
      speedOrRate: '1000 Mbps Full Duplex',
      attenuationDb: 0.2,
      packetLossPct: 0.0,
      latencyMs: 0.35,
    },
    remarksEn: 'CENELEC EN 50159 Cat 1 Encrypted Interlocking Safety Bus A.',
  },
  {
    id: 'CBL-ETH-CER01-04',
    labelEn: 'Core Switch P02 to VPU-B Safety CPU Port 1',
    category: 'ethernet_safenet',
    source: {
      rackId: 'CER-RACK-01',
      subrackId: 'CER-SR-02',
      slot: 'SW 2U',
      portOrPin: 'PORT 02 (RJ45)',
      labelEn: 'MACH1000 FastEth P02',
    },
    destination: {
      rackId: 'CER-RACK-01',
      subrackId: 'CER-SR-03',
      slot: 'SLOT 06-08',
      portOrPin: 'ETH 1 (RJ45)',
      labelEn: 'VPU-B Safety CPU 2',
    },
    specificationEn: 'Cat.7 S/FTP Industrial Double Shielded LSZH Purple',
    wireColor: '#a855f7',
    lengthMeters: 1.8,
    coreCount: 8,
    safetyLevel: 'SIL 4',
    status: 'healthy',
    telemetry: {
      signalLevel: '1000BASE-T SNR: 33.1 dB',
      speedOrRate: '1000 Mbps Full Duplex',
      attenuationDb: 0.2,
      packetLossPct: 0.0,
      latencyMs: 0.34,
    },
    remarksEn: 'CENELEC EN 50159 Cat 1 Encrypted Interlocking Safety Bus B.',
  },
  {
    id: 'CBL-ETH-CER01-05',
    labelEn: 'DiagRC Event Recorder to Diag Management Port',
    category: 'ethernet_diag',
    source: {
      rackId: 'CER-RACK-01',
      subrackId: 'CER-SR-04',
      slot: 'DIAG 2U',
      portOrPin: 'ETH-MGT (RJ45)',
      labelEn: 'DiagRC Blackbox LAN',
    },
    destination: {
      rackId: 'CER-RACK-01',
      subrackId: 'CER-SR-02',
      slot: 'SW 2U',
      portOrPin: 'PORT 24 (RJ45)',
      labelEn: 'MACH1000 VLAN 99 (Mgt)',
    },
    specificationEn: 'Cat.6A U/FTP Industrial Blue Patch Cord',
    wireColor: '#38bdf8', // Blue
    lengthMeters: 1.4,
    coreCount: 8,
    safetyLevel: 'Non-Vital',
    status: 'healthy',
    telemetry: {
      signalLevel: '100BASE-TX SNR: 29.8 dB',
      speedOrRate: '100 Mbps Full Duplex',
      packetLossPct: 0.0,
      latencyMs: 0.65,
    },
    remarksEn: 'SNMPv3 and Syslog streaming to OCC Central NMS server.',
  },
  {
    id: 'CBL-PWR-CER01-06',
    labelEn: 'PDU Feeder A (24V DC) to EIL Safety Subrack PSU',
    category: 'power_feed',
    source: {
      rackId: 'CER-RACK-01',
      subrackId: 'CER-SR-05',
      slot: 'PDU 1U',
      portOrPin: 'Q1 L+ / L- Terminals',
      labelEn: 'PDU DC Bus A (Breaker Q1)',
    },
    destination: {
      rackId: 'CER-RACK-01',
      subrackId: 'CER-SR-03',
      slot: 'SLOT 01-02',
      portOrPin: 'P_IN_A (Weidmüller 4-Pole)',
      labelEn: 'EIL Eurocard PSU Feeder A',
    },
    specificationEn: '2x2.5mm² Flame-Retardant Radox Halogen-Free Red/Black',
    wireColor: '#ef4444', // Red
    lengthMeters: 1.2,
    coreCount: 2,
    safetyLevel: 'SIL 4',
    status: 'healthy',
    telemetry: {
      signalLevel: '24.18 V DC | 2.45 A Load',
      speedOrRate: 'DC Constant Supply',
      attenuationDb: 0.05,
      packetLossPct: 0.0,
    },
    remarksEn: 'Continuous monitored DC voltage rail with diode-ORing protection.',
  },
  {
    id: 'CBL-PWR-CER01-07',
    labelEn: 'PDU Feeder B (24V DC Redundant) to EIL Safety Subrack PSU',
    category: 'power_feed',
    source: {
      rackId: 'CER-RACK-01',
      subrackId: 'CER-SR-05',
      slot: 'PDU 1U',
      portOrPin: 'Q2 L+ / L- Terminals',
      labelEn: 'PDU DC Bus B (Breaker Q2)',
    },
    destination: {
      rackId: 'CER-RACK-01',
      subrackId: 'CER-SR-03',
      slot: 'SLOT 01-02',
      portOrPin: 'P_IN_B (Weidmüller 4-Pole)',
      labelEn: 'EIL Eurocard PSU Feeder B',
    },
    specificationEn: '2x2.5mm² Flame-Retardant Radox Halogen-Free Dark Red/Black',
    wireColor: '#b91c1c', // Dark Red
    lengthMeters: 1.2,
    coreCount: 2,
    safetyLevel: 'SIL 4',
    status: 'healthy',
    telemetry: {
      signalLevel: '24.15 V DC | 2.40 A Load',
      speedOrRate: 'DC Constant Supply',
      attenuationDb: 0.05,
      packetLossPct: 0.0,
    },
    remarksEn: 'Hot-redundant secondary DC branch from isolated battery bank B.',
  },
  {
    id: 'CBL-GND-CER01-08',
    labelEn: 'Master Protective Earth (PE) to EIL Subrack Chassis Ground',
    category: 'earth_ground',
    source: {
      rackId: 'CER-RACK-01',
      subrackId: 'RACK-FRAME',
      slot: 'BOTTOM 0U',
      portOrPin: 'COPPER BUSBAR STUD #4',
      labelEn: 'Rack Copper Earth Busbar',
    },
    destination: {
      rackId: 'CER-RACK-01',
      subrackId: 'CER-SR-03',
      slot: 'CHASSIS STUD',
      portOrPin: 'M6 Ground Bolt',
      labelEn: 'EIL Eurocard Aluminum Cage',
    },
    specificationEn: '16mm² Highly Flexible Braided Copper Green/Yellow Strap',
    wireColor: '#10b981', // Green
    lengthMeters: 0.8,
    coreCount: 1,
    safetyLevel: 'Grounding PE',
    status: 'healthy',
    telemetry: {
      signalLevel: 'Earth Resistance: 0.12 Ω (Pass < 1.0 Ω)',
      speedOrRate: 'Static Equipotential',
      packetLossPct: 0.0,
    },
    remarksEn: 'CENELEC EN 50122-1 Equipotential safety bonding conductor.',
  },

  // =========================================================================
  // SER-01 / FIELD INTERFACING CABLING (Track circuits, Point machines, Signals)
  // =========================================================================
  {
    id: 'CBL-FLD-SW01-01',
    labelEn: 'PMC Point Machine Controller to SW-01 Four-Wire Motor Drive',
    category: 'field_control',
    source: {
      rackId: 'SER-RACK-02',
      subrackId: 'SER-SR-PMC',
      slot: 'SLOT 01-04',
      portOrPin: 'X1: 1, 2, 3, 4 Terminals',
      labelEn: 'PMC Heavy-Duty 110V Stage',
    },
    destination: {
      rackId: 'FIELD-JUNCTION-01',
      portOrPin: 'TERMINAL BOX JB-SW01',
      labelEn: 'Point Machine SW-01 (Siemens S700K)',
      isFieldTarget: true,
      chainageOrLocation: 'Ch. 7+120 Track 1',
    },
    specificationEn: 'Armored Signaling Multicore 4x4.0mm² Steel Tape Protected',
    wireColor: '#f97316', // Orange
    lengthMeters: 145.0,
    coreCount: 4,
    safetyLevel: 'SIL 4',
    status: 'healthy',
    telemetry: {
      signalLevel: '110.2 V DC Drive Pulse | Normal Rest 0V',
      speedOrRate: 'Peak Drive: 4.8 A / Peak 3.2s',
      attenuationDb: 0.45,
      packetLossPct: 0.0,
    },
    remarksEn: 'Four-wire detection and power circuit with micro-switch readback.',
  },
  {
    id: 'CBL-FLD-TC01-02',
    labelEn: 'MAFTC Audio Track Circuit Transmitter to Rail Matching Unit (TIU)',
    category: 'field_control',
    source: {
      rackId: 'SER-RACK-02',
      subrackId: 'SER-SR-TC',
      slot: 'SLOT 05-08',
      portOrPin: 'TX_AUDIO OUT (BNC/Term)',
      labelEn: 'MAFTC 5.7 kHz FSK Modulator',
    },
    destination: {
      rackId: 'TRACK-TIU-01',
      portOrPin: 'IMPEDANCE BOND TIU-01',
      labelEn: 'Track Circuit Section 1T-01 Rails',
      isFieldTarget: true,
      chainageOrLocation: 'Ch. 6+980 to 7+450',
    },
    specificationEn: 'Twisted Shielded Star-Quad 2x2x1.5mm² Signaling Cable',
    wireColor: '#06b6d4', // Cyan
    lengthMeters: 85.0,
    coreCount: 4,
    safetyLevel: 'SIL 4',
    status: 'healthy',
    telemetry: {
      signalLevel: 'FSK Carrier 5700 Hz ± 40 Hz | 18.4 V RMS',
      speedOrRate: 'Audio Frequency Modulated',
      attenuationDb: 1.1,
      packetLossPct: 0.0,
    },
    remarksEn: 'Codelocked audio frequency signal preventing stray traction harmonics.',
  },
  {
    id: 'CBL-FLD-SIG01-03',
    labelEn: 'VSC Vital Signal Driver to Station Home Signal S-02 (4-Aspect LED)',
    category: 'vital_relay',
    source: {
      rackId: 'SER-RACK-02',
      subrackId: 'SER-SR-SIG',
      slot: 'SLOT 09-12',
      portOrPin: 'X3: R, Y1, Y2, G Terminals',
      labelEn: 'VSC Solid-State Lamp Switcher',
    },
    destination: {
      rackId: 'SIGNAL-MAST-02',
      portOrPin: 'LED HEAD JUNCTION',
      labelEn: 'Signal Mast S-02 LED Optics',
      isFieldTarget: true,
      chainageOrLocation: 'Ch. 7+050 Platform End',
    },
    specificationEn: 'Fire-Resistant Signaling Multicore 7x1.5mm² Halogen-Free',
    wireColor: '#10b981', // Green
    lengthMeters: 62.0,
    coreCount: 7,
    safetyLevel: 'SIL 4',
    status: 'healthy',
    telemetry: {
      signalLevel: 'Current Loop Sense: 42.0 mA Constant (Aspect: GREEN)',
      speedOrRate: 'Continuous Vital Sense',
      packetLossPct: 0.0,
    },
    remarksEn: 'Cold-filament and hot-filament continuous current surveillance.',
  },
  {
    id: 'CBL-FLD-AX01-04',
    labelEn: 'Axle Counter Wheel Sensor RSR123 to MH-AX Indoor Evaluator',
    category: 'serial_bus',
    source: {
      rackId: 'FIELD-WHEEL-SENSOR',
      portOrPin: 'CLAMP SENSOR SK30',
      labelEn: 'Wheel Sensor Head (Rail Foot)',
      isFieldTarget: true,
      chainageOrLocation: 'Ch. 6+900 Rail Entry',
    },
    destination: {
      rackId: 'SER-RACK-01',
      subrackId: 'SER-SR-AX',
      slot: 'SLOT 01-02',
      portOrPin: 'CH_A SENSOR IN (Twinaxial)',
      labelEn: 'MH-AX Evaluator Channel A',
    },
    specificationEn: 'Twinaxial Heavy Shielded Railway Sensor Cable 2x0.75mm²',
    wireColor: '#6366f1', // Indigo
    lengthMeters: 110.0,
    coreCount: 2,
    safetyLevel: 'SIL 4',
    status: 'healthy',
    telemetry: {
      signalLevel: 'Analog Sine Ripple 0.8 Vpp @ Idle | Pulse on Wheel Pass',
      speedOrRate: 'Inductive High-Speed Sensing (<250 km/h)',
      attenuationDb: 0.8,
      packetLossPct: 0.0,
    },
    remarksEn: 'Dual-system quadrature inductive sensor detecting direction and wheel count.',
  },
];

/**
 * Filter cables for a specific rack or subrack
 */
export function getCablesForRack(rackId: string): CableRun[] {
  return SYSTEM_CABLING_RUNS.filter(
    (c) => c.source.rackId === rackId || c.destination.rackId === rackId
  );
}

/**
 * Filter cables for a specific subrack
 */
export function getCablesForSubrack(subrackId: string): CableRun[] {
  return SYSTEM_CABLING_RUNS.filter(
    (c) => c.source.subrackId === subrackId || c.destination.subrackId === subrackId
  );
}
