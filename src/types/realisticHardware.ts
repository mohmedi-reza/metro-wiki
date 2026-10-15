// Type definitions for ultra-realistic railway signaling rack hardware, cards, ports, and diagnostics

export type HardwareStatus = 'active' | 'standby' | 'voting' | 'ok' | 'warning' | 'fault';

export type LedColor = 'green' | 'amber' | 'red' | 'blue' | 'white';
export type LedState = 'solid' | 'pulsing' | 'blinking_fast' | 'blinking_slow' | 'off';

export interface HardwareLed {
  label: string; // English silk-screen text, e.g. "PWR", "RUN", "2oo3_OK", "FLT"
  color: LedColor;
  state: LedState;
  meaningEn: string; // e.g. "Solid Green: CPU in sync and healthy in 2oo3 voter"
}

export type PortConnectorType =
  | 'RJ45'
  | 'SFP'
  | 'SFP+'
  | 'LC_DUPLEX'
  | 'SC_APC'
  | 'BNC'
  | 'DB9'
  | 'TERMINAL'
  | 'USB_MGT';

export interface HardwarePort {
  id: string;
  type: PortConnectorType;
  labelEn: string; // e.g. "ETH 1 (1000M)", "SFP 1 (RING WEST)", "CAN-A"
  speed: string; // e.g. "1000 Mbps Full Duplex", "1.25 Gbps Optical", "500 kbps"
  status: 'connected' | 'active' | 'standby' | 'disconnected';
  connectedToEn: string; // e.g. "Hirschmann MACH1000 Core Switch Port 04 (VLAN 10 SafeNet)"
  cableType: string; // e.g. "Cat6A SF/UTP Industrial Double Shielded", "Single-Mode 9/125µm LC/APC Yellow Cable"
  pinoutDetails?: string[];
  rxPower?: string;
  txPower?: string;
  packetStats?: {
    txPkts: string;
    rxPkts: string;
    crcErrors: number;
  };
}

export interface HardwareTerminalPin {
  pinNumber: string | number; // e.g. "1", "2", "L+", "PE"
  signalNameEn: string; // e.g. "+110V DC MOTOR COMMON", "24V VITAL RETURN", "DI 01 PULSE TEST"
  wireColor: string; // e.g. "#dc2626" (Red), "#2563eb" (Blue), "#10b981" (Green/Yellow)
  wireColorName: string; // e.g. "Red 2.5mm²", "Black 2.5mm²", "Green/Yellow 4.0mm² PE"
  voltageLevel: string; // e.g. "110V DC", "24V DC", "0V GND", "Audio FSK 5.7kHz"
  currentRating: string; // e.g. "5.2A Max", "20mA Nominal"
  destinationEn: string; // e.g. "Point Machine SW-01 Motor Terminal Winding A"
}

export type HardwareControlType =
  | 'toggle_switch'
  | 'rotary_dial'
  | 'push_button'
  | 'fuse_holder'
  | 'test_point'
  | 'dip_switch'
  | 'circuit_breaker';

export interface HardwareControl {
  id: string;
  type: HardwareControlType;
  labelEn: string; // e.g. "RUN/STOP", "NODE ID: 0x07", "LAMP TEST", "FUSE 10A 250V"
  currentValueEn: string; // e.g. "RUN (UP)", "POS 7", "INTACT 10A (Ceramic)", "0.00V REF"
  descriptionEn: string;
}

export interface HardwareModuleCard {
  id: string;
  slotNumber: string; // e.g. "SLOT 01-02", "SLOT 03-05", "1U RACK BAY"
  nameEn: string; // e.g. "VPU-A SAFETY CPU MODULE"
  nameFa?: string;
  modelEn: string; // e.g. "EUR01881-CPU-32B"
  widthHp: number; // Eurocard width in HP (84 HP = full 19" rack width)
  status: HardwareStatus;
  safetyLevel: string; // "SIL 4", "SIL 2", "Fail-Safe", "Industrial"
  powerConsumption: string; // e.g. "24V DC / 12W"
  coreTemperature: string; // e.g. "38.2 °C"
  voltageRails: { rail: string; value: string; tolerance: string }[];
  ports: HardwarePort[];
  leds: HardwareLed[];
  terminals: HardwareTerminalPin[];
  controls: HardwareControl[];
  descriptionEn: string;
  technicalSpecsEn: { [key: string]: string };
  standardsEn: string[]; // e.g. ["CENELEC EN 50126", "EN 50128 SIL 4", "EN 50129", "EN 50159 Cat 1"]
}
