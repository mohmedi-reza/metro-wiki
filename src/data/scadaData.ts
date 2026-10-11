import {
  StationData,
  TrackCircuit,
  PointSwitch,
  RailSignal,
  SimulatedTrain,
  ScadaEvent,
  LedStatus,
  SignalingRoomInfo
} from '../types/scada';

// Constants for ATP / ATO Speed Limits (km/h)
export const SPEED_LIMITS = {
  MAINLINE_MAX: 70, // حداکثر سرعت مجاز خط اصلی: ۷۰ km/h (Running Route)
  PLATFORM_TRACK: 50, // سرعت تراک سکو: ۵۰ km/h
  SHUNTING_DEPOT: 25, // حالت مانور/ورود به خطوط کور و پارکینگ: ۲۵ km/h (Shunting Route)
  ATSD_DANGER: 10, // حالت خطر (ATSD): محدود به ۱۰ km/h
  BUFFER_STOP: 0,  // توقف پایانی و بافر: ۰ km/h
};

// 1. لیست دقیق ۲۰ ایستگاه خط ۱ قطار شهری همراه با نام‌های Pinglish جهت نمایش صنعتی SCADA
export const STATIONS_DATABASE: StationData[] = [
  {
    id: 1,
    name: "قدس",
    alias: "پاسداران",
    pinglishName: "01-GHODS",
    fullName: "قدس (پاسداران)",
    platformType: "side",
    platformDescription: "سکو: طرفین (پایانه شمالی - دارای ۴ خط کور پارکینگ شانه‌مانند)",
    chainage: "0+000",
    hasCrossover: true,
    speedLimit: SPEED_LIMITS.PLATFORM_TRACK,
    signalingRoom: {
      id: "SER-01",
      type: "SER",
      title: "اتاق سیگنالینگ و اینترلاکینگ پایانه قدس",
      stationId: 1,
      rackCount: 2,
      interlockingType: "EIL 2oo2 (سیستم اینترلاکینگ الکترونیکی)",
      lcpAvailable: true,
      description: "کنترل اینترلاکینگ سوزن‌های پایانه شمالی قدس (P1.1 تا P1.5)، ۴ خط کور پارکینگ، کراس‌اور دوبل، تراک‌های شنتینگ و پانل کنترل محلی LCP.",
      equipment: [
        "رک پردازنده مرکزی EIL 2oo2",
        "ساب‌رک عملگر کنار خط TFC-01",
        "کنترلرهای فیلد FEC",
        "پانل کنترل محلی LCP قدس",
        "منبع تغذیه بدون وقفه UPS سیگنالینگ",
        "پایانه فیبر نوری CTC"
      ],
    },
  },
  {
    id: 2,
    name: "بهارستان",
    alias: "بهارستان",
    pinglishName: "02-BAHARESTAN",
    fullName: "بهارستان",
    platformType: "side",
    platformDescription: "سکو: طرفین",
    chainage: "1+100",
    speedLimit: SPEED_LIMITS.PLATFORM_TRACK,
  },
  {
    id: 3,
    name: "گلستان",
    alias: "گلستان",
    pinglishName: "03-GOLESTAN",
    fullName: "گلستان",
    platformType: "side",
    platformDescription: "سکو: طرفین",
    chainage: "2+050",
    speedLimit: SPEED_LIMITS.PLATFORM_TRACK,
  },
  {
    id: 4,
    name: "شهید دکتر مفتح",
    alias: "مفتح",
    pinglishName: "04-SHAHID MOFATTEH",
    fullName: "شهید دکتر مفتح",
    platformType: "side",
    platformDescription: "سکو: طرفین",
    chainage: "3+150",
    hasCrossover: true,
    speedLimit: SPEED_LIMITS.PLATFORM_TRACK,
    signalingRoom: {
      id: "SER-04",
      type: "SER",
      title: "اتاق تجهیزات بین‌راهی و تقویت فرکانس مفتح",
      stationId: 4,
      rackCount: 1,
      interlockingType: "MAFTC Interface",
      lcpAvailable: false,
      description: "تقویت و بازتولید فرکانس‌های صوتی مدارهای راه MAFTC خطوط میانی و واسط سنسورهای شمارنده محور.",
      equipment: [
        "رک تقویت فرکانس MAFTC",
        "یونیت‌های تطبیق امپدانس باند",
        "کارت‌های اینترفیس شمارنده محور",
      ],
    },
  },
  {
    id: 5,
    name: "شهید علیخانی",
    alias: "علیخانی",
    pinglishName: "05-SHAHID ALIKHANI",
    fullName: "شهید علیخانی",
    platformType: "side",
    platformDescription: "سکو: طرفین",
    chainage: "4+200",
    speedLimit: SPEED_LIMITS.PLATFORM_TRACK,
  },
  {
    id: 6,
    name: "جابر",
    alias: "جابر انصاری",
    pinglishName: "06-JABER",
    fullName: "جابر",
    platformType: "side",
    platformDescription: "سکو: طرفین",
    chainage: "5+300",
    speedLimit: SPEED_LIMITS.PLATFORM_TRACK,
  },
  {
    id: 7,
    name: "کاوه",
    alias: "ترمینال کاوه - دپو",
    pinglishName: "07-KAVEH",
    fullName: "کاوه (دارای مسیر ورود به دپو)",
    platformType: "island",
    platformDescription: "سکو: جزیره‌ای (دارای مسیر ورود به دپو)",
    chainage: "6+850",
    hasDepotConnection: true,
    hasCrossover: true,
    speedLimit: SPEED_LIMITS.PLATFORM_TRACK,
    signalingRoom: {
      id: "CER-OCC/SER-07",
      type: "CER",
      title: "مرکز کنترل و فرمان OCC و اتاق تجهیزات مرکزی (CER)",
      stationId: 7,
      rackCount: 6,
      interlockingType: "EIL Master & CTC Mainframe",
      lcpAvailable: true,
      description: "مرکز فرماندهی کل خط ۱؛ سرورهای دوگانه افزونه CTC، سرورهای Train Describer، آرشیو SCADA، سوئیچ‌های Core شبکه اترنت صنعتی، کنترل سوزن‌های دپو P7.1 و P7.3، خط تست ۱/۲km، کنسول مانیتورینگ ترافیک و پانل LCP کاوه.",
      equipment: [
        "سرورهای دوقلوی سروری CTC (Master/Standby)",
        "سرورهای توصیف‌گر قطار Train Describer",
        "رک‌های سوئیچ Core اترنت و پایانه فیبر نوری سراسری",
        "پانل کنترل محلی LCP کاوه و کنسول برج دپو",
        "سیستم حفاظت ATSD خطوط غیرکددار دپو",
        "رک‌های تغذیه و باتری‌خانه بدون وقفه ۴۸ ولت و ۸۰ ولت DC"
      ],
    },
  },
  {
    id: 8,
    name: "شهید دکتر مصطفی چمران",
    alias: "چمران",
    pinglishName: "08-CHAMRAN",
    fullName: "شهید دکتر مصطفی چمران",
    platformType: "side",
    platformDescription: "سکو: طرفین",
    chainage: "7+950",
    speedLimit: SPEED_LIMITS.PLATFORM_TRACK,
  },
  {
    id: 9,
    name: "شهید حجت الاسلام باهنر",
    alias: "مدرس / باهنر",
    pinglishName: "09-BAHONAR",
    fullName: "شهید حجت الاسلام باهنر (مدرس)",
    platformType: "side",
    platformDescription: "سکو: طرفین",
    chainage: "9+000",
    speedLimit: SPEED_LIMITS.PLATFORM_TRACK,
  },
  {
    id: 10,
    name: "شهدا",
    alias: "میدان شهدا",
    pinglishName: "10-SHOHADA",
    fullName: "شهدا",
    platformType: "island",
    platformDescription: "سکو: جزیره‌ای",
    chainage: "10+150",
    hasCrossover: true,
    speedLimit: SPEED_LIMITS.PLATFORM_TRACK,
    signalingRoom: {
      id: "SER-10",
      type: "SER",
      title: "اتاق سیگنالینگ و اینترلاکینگ شهدا",
      stationId: 10,
      rackCount: 2,
      interlockingType: "EIL 2oo2",
      lcpAvailable: true,
      description: "کنترل اینترلاکینگ کراس‌اور دوبل فاز ۱، سوزن‌های P10.1 و P10.2، دوربرگردان میانی ناوگان و پانل کنترل محلی LCP شهدا.",
      equipment: [
        "رک پردازنده اینترلاکینگ EIL",
        "ساب‌رک عملگر کنار خط TFC-10",
        "پانل کنترل محلی LCP شهدا",
        "بردهای خروجی تست دینامیک پالس",
        "سیستم مانیتورینگ تصویری CCTV سیگنالینگ"
      ],
    },
  },
  {
    id: 11,
    name: "تختی",
    alias: "چهارراه تختی",
    pinglishName: "11-TAKHTI",
    fullName: "تختی",
    platformType: "island",
    platformDescription: "سکو: جزیره‌ای",
    chainage: "11+100",
    speedLimit: SPEED_LIMITS.PLATFORM_TRACK,
  },
  {
    id: 12,
    name: "امام حسین (ع)",
    alias: "دروازه دولت",
    pinglishName: "12-EMAM HOSSEIN",
    fullName: "امام حسین (ع) (دارای سوزن انشعابی)",
    platformType: "island",
    platformDescription: "سکو: جزیره‌ای (دارای سوزن انشعابی)",
    chainage: "12+200",
    hasBranchingSwitch: true,
    speedLimit: SPEED_LIMITS.PLATFORM_TRACK,
    signalingRoom: {
      id: "SER-12",
      type: "SER",
      title: "اتاق سیگنالینگ تقاطع خط ۱ و ۲ (امام حسین)",
      stationId: 12,
      rackCount: 3,
      interlockingType: "EIL Junction 2oo2",
      lcpAvailable: true,
      description: "کنترل سوزن انشعابی ۱ به خط ۲ آینده، کراس‌اور تقاطعی، اینترلاک‌های ایمنی سکوی جزیره‌ای دوطبقه و پانل LCP امام حسین.",
      equipment: [
        "رک‌های دوگانه افزونه اینترلاکینگ EIL",
        "ساب‌رک کنترل سوزن انشعابی TFC-12",
        "پانل کنترل محلی LCP امام حسین",
        "اینترفیس باس دیجیتال CAN",
        "ترانسپوندرهای پای سیگنال ATSD"
      ],
    },
  },
  {
    id: 13,
    name: "انقلاب اسلامی",
    alias: "میدان انقلاب",
    pinglishName: "13-ENGHELAB",
    fullName: "انقلاب اسلامی",
    platformType: "island",
    platformDescription: "سکو: جزیره‌ای",
    chainage: "13+150",
    speedLimit: SPEED_LIMITS.PLATFORM_TRACK,
  },
  {
    id: 14,
    name: "سی و سه پل",
    alias: "زاینده رود",
    pinglishName: "14-SI-O-SE POL",
    fullName: "سی و سه پل",
    platformType: "island",
    platformDescription: "سکو: جزیره‌ای",
    chainage: "14+050",
    speedLimit: SPEED_LIMITS.PLATFORM_TRACK,
  },
  {
    id: 15,
    name: "دکتر شریعتی",
    alias: "شریعتی",
    pinglishName: "15-SHARIATI",
    fullName: "دکتر شریعتی (شریعتی)",
    platformType: "island",
    platformDescription: "سکو: جزیره‌ای",
    chainage: "15+200",
    speedLimit: SPEED_LIMITS.PLATFORM_TRACK,
  },
  {
    id: 16,
    name: "آزادی",
    alias: "دروازه شیراز",
    pinglishName: "16-AZADI",
    fullName: "آزادی (دارای سوزن انشعابی)",
    platformType: "island",
    platformDescription: "سکو: جزیره‌ای (دارای سوزن انشعابی)",
    chainage: "16+350",
    hasBranchingSwitch: true,
    speedLimit: SPEED_LIMITS.PLATFORM_TRACK,
    signalingRoom: {
      id: "SER-16",
      type: "SER",
      title: "اتاق سیگنالینگ تقاطع خط ۱ و ۳ (آزادی)",
      stationId: 16,
      rackCount: 3,
      interlockingType: "EIL Junction 2oo2",
      lcpAvailable: true,
      description: "کنترل سوزن انشعابی ۲ به خط ۳ آینده، کراس‌اور آزادی، اینترفیس سنسورهای محوری، کلیدهای ESP سکوی جزیره‌ای و پانل LCP آزادی.",
      equipment: [
        "رک‌های اینترلاکینگ EIL",
        "ساب‌رک عملگر TFC-16",
        "پانل کنترل محلی LCP آزادی",
        "پایانه شبکه فیبر نوری CTC",
        "سیستم حفاظت ATSD"
      ],
    },
  },
  {
    id: 17,
    name: "دانشگاه",
    alias: "دانشگاه اصفهان",
    pinglishName: "17-DANESHGAH",
    fullName: "دانشگاه",
    platformType: "island",
    platformDescription: "سکو: جزیره‌ای",
    chainage: "17+500",
    speedLimit: SPEED_LIMITS.PLATFORM_TRACK,
  },
  {
    id: 18,
    name: "کارگر",
    alias: "کارگر",
    pinglishName: "18-KARGAR",
    fullName: "کارگر",
    platformType: "side",
    platformDescription: "سکو: طرفین",
    chainage: "18+600",
    speedLimit: SPEED_LIMITS.PLATFORM_TRACK,
    signalingRoom: {
      id: "SER-18",
      type: "SER",
      title: "اتاق سیگنالینگ بخش جنوبی کارگر",
      stationId: 18,
      rackCount: 2,
      interlockingType: "EIL",
      lcpAvailable: true,
      description: "کنترل کراس‌اور جنوبی P18.1 و P18.2 و مسیرهای تغییر خط ناوگان پیش از ورود به کوی امام.",
      equipment: [
        "رک اینترلاکینگ EIL",
        "ساب‌رک TFC-18",
        "پانل کنترل محلی LCP کارگر",
        "کنترلرهای فیلد FEC"
      ],
    },
  },
  {
    id: 19,
    name: "کوی امام",
    alias: "خوابگاه",
    pinglishName: "19-KUY-E EMAM",
    fullName: "کوی امام (خوابگاه)",
    platformType: "side",
    platformDescription: "سکو: طرفین",
    chainage: "19+700",
    speedLimit: SPEED_LIMITS.PLATFORM_TRACK,
  },
  {
    id: 20,
    name: "دفاع مقدس",
    alias: "صفه",
    pinglishName: "20-DEFA-E-MOGHADAS",
    fullName: "دفاع مقدس (صفه)",
    platformType: "side",
    platformDescription: "سکو: طرفین (پایانه جنوبی - دارای سوزن قیچی X و خطوط کور انتهایی)",
    chainage: "21+114",
    hasCrossover: true,
    speedLimit: SPEED_LIMITS.PLATFORM_TRACK,
    signalingRoom: {
      id: "SER-20",
      type: "SER",
      title: "اتاق سیگنالینگ و اینترلاکینگ پایانه جنوبی صفه",
      stationId: 20,
      rackCount: 3,
      interlockingType: "EIL Terminal 2oo2",
      lcpAvailable: true,
      description: "کنترل سوزن‌های قیچی کراس‌اور دوبل (سوزن‌های P20.1, P20.3, P20.5)، خطوط کور مانور، توقفگاه شبانه پایانه صفه، بافرهای هیدرولیکی و پانل LCP صفه.",
      equipment: [
        "رک‌های پردازنده اینترلاکینگ EIL 2oo2",
        "ساب‌رک عملگر کنار خط TFC-20",
        "پانل کنترل محلی LCP صفه",
        "کنترلرهای شنتینگ خطوط کور",
        "باتری‌خانه و UPS پشتیبان"
      ],
    },
  },
];

// لیست تجمیعی اتاق‌های سیگنالینگ خط ۱ (CER/SER)
export const SIGNALING_ROOMS_DATABASE: SignalingRoomInfo[] = STATIONS_DATABASE
  .filter((s): s is StationData & { signalingRoom: SignalingRoomInfo } => Boolean(s.signalingRoom))
  .map((s) => s.signalingRoom);

export const MAP_START_X = 520; // Station 01 Center X
export const MAP_STEP_X = 380;  // Generous 380px per station, creating ~210px clear block segments

export const TRACK_Y_LINE1 = 140; // Main Line 1 (Up / Northbound)
export const TRACK_Y_LINE2 = 260; // Main Line 2 (Down / Southbound)
export const TRACK_Y_DEPOT = 60;  // Kaveh Depot Lead Track

// Station 01 4 Parallel Dead-End Parking Levels
export const TRACK_Y_GHODS_P1 = 50;  // Dead-end 1 (T1.A.5)
export const TRACK_Y_GHODS_P2 = 90;  // Dead-end 2 (T1.A.6)
export const TRACK_Y_GHODS_P3 = 310; // Dead-end 3 (T1.A.7)
export const TRACK_Y_GHODS_P4 = 350; // Dead-end 4 (T1.A.8)

// Station 20 Defa-e-Moghadas 3rd Siding Track (TP20.5.4 & T20.4.4)
export const TRACK_Y_LINE4 = 340;

export function generateInitialTracks(): TrackCircuit[] {
  const tracks: TrackCircuit[] = [];
  const startX = MAP_START_X;
  const stepX = MAP_STEP_X;

  // =========================================================================
  // 1. STATION 01 (GHODS) - LEFT TERMINAL TOPOLOGY
  // Comb-like / Tree structure creating 4 parallel dead-end parking tracks
  // T1.A.5, T1.A.6, T1.A.7, T1.A.8 with vertical white bar buffer stops at left (x = 60)
  // =========================================================================
  const bufferStopX = 60;

  // Track 1.A.5 (Top-most dead-end parking track at y = 50)
  tracks.push({
    id: "T1.A.5",
    stationId: 1,
    name: "PARK-01 (T1.A.5)",
    trackNumber: 1,
    x1: bufferStopX,
    y1: TRACK_Y_GHODS_P1,
    x2: 220,
    y2: TRACK_Y_GHODS_P1,
    status: "free",
    speedLimit: SPEED_LIMITS.BUFFER_STOP,
    speedDisplay: "0/0",
    direction: "both",
    isPlatform: false,
    isDeadEnd: true,
    isBufferStopLeft: true,
    lengthMeters: 140,
  });

  // Diagonal branch connecting T1.A.6 level (y=90) up to T1.A.5 level (y=50)
  tracks.push({
    id: "T1.BR.5",
    stationId: 1,
    name: "BRANCH-05",
    trackNumber: 1,
    x1: 220,
    y1: TRACK_Y_GHODS_P1,
    x2: 290,
    y2: TRACK_Y_GHODS_P2,
    status: "free",
    speedLimit: SPEED_LIMITS.SHUNTING_DEPOT,
    speedDisplay: "25/25",
    direction: "both",
    isPlatform: false,
    isDiagonal: true,
    lengthMeters: 60,
  });

  // Track 1.A.6 (Upper dead-end parking track at y = 90)
  tracks.push({
    id: "T1.A.6",
    stationId: 1,
    name: "PARK-02 (T1.A.6)",
    trackNumber: 1,
    x1: bufferStopX,
    y1: TRACK_Y_GHODS_P2,
    x2: 290,
    y2: TRACK_Y_GHODS_P2,
    status: "free",
    speedLimit: SPEED_LIMITS.SHUNTING_DEPOT,
    speedDisplay: "25/25",
    direction: "both",
    isPlatform: false,
    isDeadEnd: true,
    isBufferStopLeft: true,
    lengthMeters: 180,
  });

  // Diagonal branch connecting Main Line 1 (y=140) up to T1.A.6 (y=90)
  tracks.push({
    id: "T1.BR.6",
    stationId: 1,
    name: "BRANCH-06",
    trackNumber: 1,
    x1: 290,
    y1: TRACK_Y_GHODS_P2,
    x2: 380,
    y2: TRACK_Y_LINE1,
    status: "free",
    speedLimit: SPEED_LIMITS.SHUNTING_DEPOT,
    speedDisplay: "25/25",
    direction: "both",
    isPlatform: false,
    isDiagonal: true,
    lengthMeters: 80,
  });

  // Main Line 1 Lead extending left before platform
  tracks.push({
    id: "T1.M1.L",
    stationId: 1,
    name: "LEAD-MAIN-1",
    trackNumber: 1,
    x1: 380,
    y1: TRACK_Y_LINE1,
    x2: startX - 85,
    y2: TRACK_Y_LINE1,
    status: "free",
    speedLimit: SPEED_LIMITS.PLATFORM_TRACK,
    speedDisplay: "50/50",
    direction: "northbound",
    isPlatform: false,
    lengthMeters: 65,
  });

  // Track 1.A.7 (Lower dead-end parking track at y = 310)
  tracks.push({
    id: "T1.A.7",
    stationId: 1,
    name: "PARK-03 (T1.A.7)",
    trackNumber: 2,
    x1: bufferStopX,
    y1: TRACK_Y_GHODS_P3,
    x2: 290,
    y2: TRACK_Y_GHODS_P3,
    status: "free",
    speedLimit: SPEED_LIMITS.SHUNTING_DEPOT,
    speedDisplay: "25/25",
    direction: "both",
    isPlatform: false,
    isDeadEnd: true,
    isBufferStopLeft: true,
    lengthMeters: 180,
  });

  // Diagonal branch connecting Main Line 2 (y=260) down to T1.A.7 (y=310)
  tracks.push({
    id: "T1.BR.7",
    stationId: 1,
    name: "BRANCH-07",
    trackNumber: 2,
    x1: 290,
    y1: TRACK_Y_GHODS_P3,
    x2: 380,
    y2: TRACK_Y_LINE2,
    status: "free",
    speedLimit: SPEED_LIMITS.SHUNTING_DEPOT,
    speedDisplay: "25/25",
    direction: "both",
    isPlatform: false,
    isDiagonal: true,
    lengthMeters: 80,
  });

  // Track 1.A.8 (Bottom-most dead-end parking track at y = 350)
  tracks.push({
    id: "T1.A.8",
    stationId: 1,
    name: "PARK-04 (T1.A.8)",
    trackNumber: 2,
    x1: bufferStopX,
    y1: TRACK_Y_GHODS_P4,
    x2: 220,
    y2: TRACK_Y_GHODS_P4,
    status: "free",
    speedLimit: SPEED_LIMITS.BUFFER_STOP,
    speedDisplay: "0/0",
    direction: "both",
    isPlatform: false,
    isDeadEnd: true,
    isBufferStopLeft: true,
    lengthMeters: 140,
  });

  // Diagonal branch connecting T1.A.7 level (y=310) down to T1.A.8 level (y=350)
  tracks.push({
    id: "T1.BR.8",
    stationId: 1,
    name: "BRANCH-08",
    trackNumber: 2,
    x1: 220,
    y1: TRACK_Y_GHODS_P4,
    x2: 290,
    y2: TRACK_Y_GHODS_P3,
    status: "free",
    speedLimit: SPEED_LIMITS.SHUNTING_DEPOT,
    speedDisplay: "25/25",
    direction: "both",
    isPlatform: false,
    isDiagonal: true,
    lengthMeters: 60,
  });

  // Main Line 2 Lead extending left before platform
  tracks.push({
    id: "T1.M2.L",
    stationId: 1,
    name: "LEAD-MAIN-2",
    trackNumber: 2,
    x1: 380,
    y1: TRACK_Y_LINE2,
    x2: startX - 85,
    y2: TRACK_Y_LINE2,
    status: "free",
    speedLimit: SPEED_LIMITS.PLATFORM_TRACK,
    speedDisplay: "50/50",
    direction: "southbound",
    isPlatform: false,
    lengthMeters: 65,
  });

  // =========================================================================
  // Standard Stations Platforms and Inter-station Block Sections (Stations 1 to 17)
  // =========================================================================
  STATIONS_DATABASE.forEach((st, idx) => {
    if (st.id >= 18) return; // Stations 18, 19, 20 are created with authentic layout below
    const stCenterX = startX + idx * stepX;

    // Platform Track 1 (Northbound / Up)
    tracks.push({
      id: `T${st.id}.1`,
      stationId: st.id,
      name: `1T-${st.pinglishName}`,
      trackNumber: 1,
      x1: stCenterX - 85,
      y1: TRACK_Y_LINE1,
      x2: stCenterX + 85,
      y2: TRACK_Y_LINE1,
      status: st.id === 7 ? 'occupied' : 'free',
      speedLimit: SPEED_LIMITS.PLATFORM_TRACK,
      speedDisplay: '50/50',
      direction: 'northbound',
      isPlatform: true,
      occupyingTrainId: st.id === 7 ? '106' : null,
      lengthMeters: 100,
    });

    // Platform Track 2 (Southbound / Down)
    tracks.push({
      id: `T${st.id}.2`,
      stationId: st.id,
      name: `2T-${st.pinglishName}`,
      trackNumber: 2,
      x1: stCenterX - 85,
      y1: TRACK_Y_LINE2,
      x2: stCenterX + 85,
      y2: TRACK_Y_LINE2,
      status: 'free',
      speedLimit: SPEED_LIMITS.PLATFORM_TRACK,
      speedDisplay: '50/50',
      direction: 'southbound',
      isPlatform: true,
      occupyingTrainId: null,
      lengthMeters: 100,
    });

    // Inter-station Block Sections
    const nextCenterX = startX + (idx + 1) * stepX;
    const isRoutePreset = st.id === 5;
    const nextEndTrack1X = st.id === 17 ? nextCenterX - 160 : nextCenterX - 85;
    const nextEndTrack2X = st.id === 17 ? nextCenterX - 160 : nextCenterX - 85;
    const track1Id = st.id === 17 ? "T17.1.5" : `T${st.id}.1.${st.id + 1}`;
    const track2Id = st.id === 17 ? "T17.2.4" : `T${st.id}.2.${st.id + 1}`;

    tracks.push({
      id: track1Id,
      stationId: undefined,
      name: `BLK1-${st.id}-${st.id + 1}`,
      trackNumber: 1,
      x1: stCenterX + 85,
      y1: TRACK_Y_LINE1,
      x2: nextEndTrack1X,
      y2: TRACK_Y_LINE1,
      status: st.id === 5 ? 'occupied' : isRoutePreset ? 'fleet' : 'free',
      occupyingTrainId: st.id === 5 ? '104' : null,
      speedLimit: SPEED_LIMITS.MAINLINE_MAX,
      speedDisplay: '70/50',
      direction: 'northbound',
      isPlatform: false,
      lengthMeters: 450,
    });

    tracks.push({
      id: track2Id,
      stationId: undefined,
      name: `BLK2-${st.id}-${st.id + 1}`,
      trackNumber: 2,
      x1: stCenterX + 85,
      y1: TRACK_Y_LINE2,
      x2: nextEndTrack2X,
      y2: TRACK_Y_LINE2,
      status: 'free',
      speedLimit: SPEED_LIMITS.MAINLINE_MAX,
      speedDisplay: '70/50',
      direction: 'southbound',
      isPlatform: false,
      lengthMeters: 450,
    });
  });

  // =========================================================================
  // Station 07 (Kaveh) Depot Connection Tracks
  // =========================================================================
  const kavehX = startX + 6 * stepX;
  tracks.push({
    id: `T7.DEPOT`,
    stationId: 7,
    name: `DEP-01 (KAVEH)`,
    trackNumber: 1,
    x1: kavehX - 90,
    y1: TRACK_Y_DEPOT,
    x2: kavehX + 90,
    y2: TRACK_Y_DEPOT,
    status: 'free',
    speedLimit: SPEED_LIMITS.SHUNTING_DEPOT,
    speedDisplay: '25/25',
    direction: 'both',
    isPlatform: false,
    lengthMeters: 250,
  });

  tracks.push({
    id: `T7.LEAD`,
    stationId: 7,
    name: `DEP-LEAD`,
    trackNumber: 1,
    x1: kavehX + 90,
    y1: TRACK_Y_DEPOT,
    x2: kavehX + 150,
    y2: TRACK_Y_LINE1,
    status: 'free',
    speedLimit: SPEED_LIMITS.SHUNTING_DEPOT,
    speedDisplay: '25/25',
    direction: 'both',
    isPlatform: false,
    isDiagonal: true,
    lengthMeters: 120,
  });

  // Mainline Crossover Segments for Points P1.5, P4.1, P7.1, P10.1, P12.1, P16.1
  // Station 01 Crossover (P1.5): Line 1 to Line 2
  tracks.push({
    id: "P1.5XO",
    stationId: 1,
    name: "P1.5XO (01-GHODS Crossover)",
    trackNumber: 1,
    x1: startX + 90,
    y1: TRACK_Y_LINE1,
    x2: startX + 180,
    y2: TRACK_Y_LINE2,
    status: "free",
    speedLimit: SPEED_LIMITS.SHUNTING_DEPOT,
    speedDisplay: "25/25",
    direction: "both",
    isPlatform: false,
    isDiagonal: true,
    lengthMeters: 110,
  });

  // Station 04 Crossover (P4.1): Line 1 to Line 2
  tracks.push({
    id: "P4.1XO",
    stationId: 4,
    name: "P4.1XO (04-MOFATTEH Crossover)",
    trackNumber: 1,
    x1: startX + 3 * stepX + 90,
    y1: TRACK_Y_LINE1,
    x2: startX + 3 * stepX + 180,
    y2: TRACK_Y_LINE2,
    status: "free",
    speedLimit: SPEED_LIMITS.SHUNTING_DEPOT,
    speedDisplay: "25/25",
    direction: "both",
    isPlatform: false,
    isDiagonal: true,
    lengthMeters: 110,
  });

  // Station 07 Crossover (P7.1): Line 2 to Line 1
  tracks.push({
    id: "P7.1XO",
    stationId: 7,
    name: "P7.1XO (07-KAVEH Crossover)",
    trackNumber: 2,
    x1: startX + 6 * stepX - 90,
    y1: TRACK_Y_LINE2,
    x2: startX + 6 * stepX - 10,
    y2: TRACK_Y_LINE1,
    status: "free",
    speedLimit: SPEED_LIMITS.SHUNTING_DEPOT,
    speedDisplay: "25/25",
    direction: "both",
    isPlatform: false,
    isDiagonal: true,
    lengthMeters: 110,
  });

  // Station 10 Crossover (P10.1): Line 1 to Line 2
  tracks.push({
    id: "P10.1XO",
    stationId: 10,
    name: "P10.1XO (10-SHOHADA Crossover)",
    trackNumber: 1,
    x1: startX + 9 * stepX + 90,
    y1: TRACK_Y_LINE1,
    x2: startX + 9 * stepX + 180,
    y2: TRACK_Y_LINE2,
    status: "free",
    speedLimit: SPEED_LIMITS.SHUNTING_DEPOT,
    speedDisplay: "25/25",
    direction: "both",
    isPlatform: false,
    isDiagonal: true,
    lengthMeters: 110,
  });

  // =========================================================================
  // AUTHENTIC LAYOUT FOR STATIONS 18, 19, 20 (EXACTLY MATCHING CTC MONITOR PHOTO)
  // 18-KAREGAR | 19-KOOY-E-EMA | 20-DEFA-E-MOGHADAS
  // =========================================================================
  const sta18X = startX + 17 * stepX; // Station 18 Karegar Center
  const sta19X = startX + 18 * stepX; // Station 19 Kooy-e-Ema Center
  const sta20X = startX + 19 * stepX; // Station 20 Defa-e-Moghadas Center

  // --- STATION 18 (18-KAREGAR) ---
  // Upper line approach: T18.1.3 (70/50)
  tracks.push({
    id: "T18.1.3",
    stationId: 18,
    name: "T18.1.3",
    trackNumber: 1,
    x1: sta18X - 160,
    y1: TRACK_Y_LINE1,
    x2: sta18X - 105,
    y2: TRACK_Y_LINE1,
    status: "free",
    speedLimit: 70,
    speedDisplay: "70/50",
    direction: "northbound",
    isPlatform: false,
    lengthMeters: 55,
  });
  // Upper line pre-platform: T18.1.1 (60/50)
  tracks.push({
    id: "T18.1.1",
    stationId: 18,
    name: "T18.1.1",
    trackNumber: 1,
    x1: sta18X - 105,
    y1: TRACK_Y_LINE1,
    x2: sta18X - 45,
    y2: TRACK_Y_LINE1,
    status: "free",
    speedLimit: 60,
    speedDisplay: "60/50",
    direction: "northbound",
    isPlatform: false,
    lengthMeters: 60,
  });
  // Upper line platform track: T18.1 (50/50)
  tracks.push({
    id: "T18.1",
    stationId: 18,
    name: "1T-18-KAREGAR",
    trackNumber: 1,
    x1: sta18X - 45,
    y1: TRACK_Y_LINE1,
    x2: sta18X + 45,
    y2: TRACK_Y_LINE1,
    status: "free",
    speedLimit: 50,
    speedDisplay: "50/50",
    direction: "northbound",
    isPlatform: true,
    lengthMeters: 90,
  });
  // Upper line switch track: TP18.1.2 (contains switch P18.1 at sta18X + 105)
  tracks.push({
    id: "TP18.1.2",
    stationId: 18,
    name: "TP18.1.2",
    trackNumber: 1,
    x1: sta18X + 45,
    y1: TRACK_Y_LINE1,
    x2: sta18X + 105,
    y2: TRACK_Y_LINE1,
    status: "free",
    speedLimit: 70,
    speedDisplay: "70/50",
    direction: "northbound",
    isPlatform: false,
    lengthMeters: 60,
  });

  // Lower line approach: T18.2.3 from T17.2.4
  tracks.push({
    id: "T18.2.3",
    stationId: 18,
    name: "T18.2.3",
    trackNumber: 2,
    x1: sta18X - 160,
    y1: TRACK_Y_LINE2,
    x2: sta18X - 105,
    y2: TRACK_Y_LINE2,
    status: "free",
    speedLimit: 70,
    speedDisplay: "70/50",
    direction: "southbound",
    isPlatform: false,
    lengthMeters: 55,
  });
  // Lower line pre-platform: T18.2.1 (60/50)
  tracks.push({
    id: "T18.2.1",
    stationId: 18,
    name: "T18.2.1",
    trackNumber: 2,
    x1: sta18X - 105,
    y1: TRACK_Y_LINE2,
    x2: sta18X - 45,
    y2: TRACK_Y_LINE2,
    status: "free",
    speedLimit: 60,
    speedDisplay: "60/50",
    direction: "southbound",
    isPlatform: false,
    lengthMeters: 60,
  });
  // Lower line platform track: T18.2 (50/50)
  tracks.push({
    id: "T18.2",
    stationId: 18,
    name: "2T-18-KAREGAR",
    trackNumber: 2,
    x1: sta18X - 45,
    y1: TRACK_Y_LINE2,
    x2: sta18X + 45,
    y2: TRACK_Y_LINE2,
    status: "free",
    speedLimit: 50,
    speedDisplay: "50/50",
    direction: "southbound",
    isPlatform: true,
    lengthMeters: 90,
  });
  // Lower line post-platform: TP18.2.2 (connects to switch P18.2 at sta18X + 175)
  tracks.push({
    id: "TP18.2.2",
    stationId: 18,
    name: "TP18.2.2",
    trackNumber: 2,
    x1: sta18X + 45,
    y1: TRACK_Y_LINE2,
    x2: sta18X + 175,
    y2: TRACK_Y_LINE2,
    status: "free",
    speedLimit: 70,
    speedDisplay: "70/50",
    direction: "southbound",
    isPlatform: false,
    lengthMeters: 130,
  });
  // Crossover track at Station 18: from P18.1 (sta18X + 105, Line 1) down to P18.2 (sta18X + 175, Line 2)
  tracks.push({
    id: "P18.2XO",
    stationId: 18,
    name: "P18.2XO",
    trackNumber: 2,
    x1: sta18X + 105,
    y1: TRACK_Y_LINE1,
    x2: sta18X + 175,
    y2: TRACK_Y_LINE2,
    status: "free",
    speedLimit: 25,
    speedDisplay: "0/0",
    direction: "both",
    isPlatform: false,
    isDiagonal: true,
    lengthMeters: 110,
  });

  // --- INTER-STATION BLOCK: 18-KAREGAR TO 19-KOOY-E-EMA ---
  // Upper line:
  tracks.push({
    id: "T18.1.4",
    stationId: 18,
    name: "T18.1.4",
    trackNumber: 1,
    x1: sta18X + 105,
    y1: TRACK_Y_LINE1,
    x2: sta18X + 185,
    y2: TRACK_Y_LINE1,
    status: "free",
    speedLimit: 70,
    speedDisplay: "70/50",
    direction: "northbound",
    isPlatform: false,
    lengthMeters: 80,
  });
  tracks.push({
    id: "T19.1.3",
    stationId: 19,
    name: "T19.1.3",
    trackNumber: 1,
    x1: sta18X + 185,
    y1: TRACK_Y_LINE1,
    x2: sta18X + 265,
    y2: TRACK_Y_LINE1,
    status: "free",
    speedLimit: 70,
    speedDisplay: "70/50",
    direction: "northbound",
    isPlatform: false,
    lengthMeters: 80,
  });
  tracks.push({
    id: "T19.1.1",
    stationId: 19,
    name: "T19.1.1",
    trackNumber: 1,
    x1: sta18X + 265,
    y1: TRACK_Y_LINE1,
    x2: sta19X - 50,
    y2: TRACK_Y_LINE1,
    status: "free",
    speedLimit: 70,
    speedDisplay: "70/50",
    direction: "northbound",
    isPlatform: false,
    lengthMeters: 65,
  });

  // Lower line:
  tracks.push({
    id: "T18.2.4",
    stationId: 18,
    name: "T18.2.4",
    trackNumber: 2,
    x1: sta18X + 175,
    y1: TRACK_Y_LINE2,
    x2: sta18X + 245,
    y2: TRACK_Y_LINE2,
    status: "free",
    speedLimit: 70,
    speedDisplay: "70/50",
    direction: "southbound",
    isPlatform: false,
    lengthMeters: 70,
  });
  tracks.push({
    id: "T19.2.3",
    stationId: 19,
    name: "T19.2.3",
    trackNumber: 2,
    x1: sta18X + 245,
    y1: TRACK_Y_LINE2,
    x2: sta18X + 315,
    y2: TRACK_Y_LINE2,
    status: "free",
    speedLimit: 70,
    speedDisplay: "70/50",
    direction: "southbound",
    isPlatform: false,
    lengthMeters: 70,
  });
  tracks.push({
    id: "T19.2.1",
    stationId: 19,
    name: "T19.2.1",
    trackNumber: 2,
    x1: sta18X + 315,
    y1: TRACK_Y_LINE2,
    x2: sta19X - 50,
    y2: TRACK_Y_LINE2,
    status: "free",
    speedLimit: 70,
    speedDisplay: "70/50",
    direction: "southbound",
    isPlatform: false,
    lengthMeters: 15,
  });

  // --- STATION 19 (19-KOOY-E-EMA) ---
  tracks.push({
    id: "T19.1",
    stationId: 19,
    name: "1T-19-KOOY-E-EMA",
    trackNumber: 1,
    x1: sta19X - 50,
    y1: TRACK_Y_LINE1,
    x2: sta19X + 50,
    y2: TRACK_Y_LINE1,
    status: "free",
    speedLimit: 50,
    speedDisplay: "50/50",
    direction: "northbound",
    isPlatform: true,
    lengthMeters: 100,
  });
  tracks.push({
    id: "T19.2",
    stationId: 19,
    name: "2T-19-KOOY-E-EMA",
    trackNumber: 2,
    x1: sta19X - 50,
    y1: TRACK_Y_LINE2,
    x2: sta19X + 50,
    y2: TRACK_Y_LINE2,
    status: "free",
    speedLimit: 50,
    speedDisplay: "50/50",
    direction: "southbound",
    isPlatform: true,
    lengthMeters: 100,
  });

  // --- INTER-STATION BLOCK: 19-KOOY-E-EMA TO 20-DEFA-E-MOGHADAS ---
  // Upper line (with traffic arrow pointing left):
  tracks.push({
    id: "T19.1.2",
    stationId: 19,
    name: "T19.1.2",
    trackNumber: 1,
    x1: sta19X + 50,
    y1: TRACK_Y_LINE1,
    x2: sta19X + 115,
    y2: TRACK_Y_LINE1,
    status: "free",
    speedLimit: 65,
    speedDisplay: "65/50",
    direction: "northbound",
    isPlatform: false,
    lengthMeters: 65,
  });
  tracks.push({
    id: "T19.1.4",
    stationId: 19,
    name: "T19.1.4",
    trackNumber: 1,
    x1: sta19X + 115,
    y1: TRACK_Y_LINE1,
    x2: sta19X + 185,
    y2: TRACK_Y_LINE1,
    status: "free",
    speedLimit: 70,
    speedDisplay: "70/50",
    direction: "northbound",
    isPlatform: false,
    lengthMeters: 70,
  });
  tracks.push({
    id: "T20.1.5",
    stationId: 20,
    name: "T20.1.5",
    trackNumber: 1,
    x1: sta19X + 185,
    y1: TRACK_Y_LINE1,
    x2: sta19X + 255,
    y2: TRACK_Y_LINE1,
    status: "free",
    speedLimit: 70,
    speedDisplay: "70/50",
    direction: "northbound",
    isPlatform: false,
    lengthMeters: 70,
  });
  tracks.push({
    id: "T20.1.3",
    stationId: 20,
    name: "T20.1.3",
    trackNumber: 1,
    x1: sta19X + 255,
    y1: TRACK_Y_LINE1,
    x2: sta20X - 110,
    y2: TRACK_Y_LINE1,
    status: "occupied",
    occupyingTrainId: "105",
    speedLimit: 70,
    speedDisplay: "70/50",
    direction: "northbound",
    isPlatform: false,
    lengthMeters: 75,
  });

  // Lower line (with traffic arrow pointing right):
  tracks.push({
    id: "T19.2.2",
    stationId: 19,
    name: "T19.2.2",
    trackNumber: 2,
    x1: sta19X + 50,
    y1: TRACK_Y_LINE2,
    x2: sta19X + 115,
    y2: TRACK_Y_LINE2,
    status: "free",
    speedLimit: 65,
    speedDisplay: "65/0",
    direction: "southbound",
    isPlatform: false,
    lengthMeters: 65,
  });
  tracks.push({
    id: "T19.2.4",
    stationId: 19,
    name: "T19.2.4",
    trackNumber: 2,
    x1: sta19X + 115,
    y1: TRACK_Y_LINE2,
    x2: sta19X + 185,
    y2: TRACK_Y_LINE2,
    status: "free",
    speedLimit: 70,
    speedDisplay: "70/0",
    direction: "southbound",
    isPlatform: false,
    lengthMeters: 70,
  });
  tracks.push({
    id: "T20.2.5",
    stationId: 20,
    name: "T20.2.5",
    trackNumber: 2,
    x1: sta19X + 185,
    y1: TRACK_Y_LINE2,
    x2: sta19X + 255,
    y2: TRACK_Y_LINE2,
    status: "free",
    speedLimit: 70,
    speedDisplay: "70/0",
    direction: "southbound",
    isPlatform: false,
    lengthMeters: 70,
  });
  tracks.push({
    id: "T20.2.3",
    stationId: 20,
    name: "T20.2.3",
    trackNumber: 2,
    x1: sta19X + 255,
    y1: TRACK_Y_LINE2,
    x2: sta20X - 110,
    y2: TRACK_Y_LINE2,
    status: "free",
    speedLimit: 0,
    speedDisplay: "0/0",
    direction: "southbound",
    isPlatform: false,
    lengthMeters: 75,
  });

  // --- STATION 20 (20-DEFA-E-MOGHADAS) ---
  // Pre-platform Upper Track: TP20.1.1 (contains switch P20.1 at sta20X - 45)
  tracks.push({
    id: "TP20.1.1",
    stationId: 20,
    name: "TP20.1.1",
    trackNumber: 1,
    x1: sta20X - 110,
    y1: TRACK_Y_LINE1,
    x2: sta20X - 45,
    y2: TRACK_Y_LINE1,
    status: "free",
    speedLimit: 70,
    speedDisplay: "70/50",
    direction: "northbound",
    isPlatform: false,
    lengthMeters: 65,
  });
  // Pre-platform Lower Track: TP20.2.1
  tracks.push({
    id: "TP20.2.1",
    stationId: 20,
    name: "TP20.2.1",
    trackNumber: 2,
    x1: sta20X - 110,
    y1: TRACK_Y_LINE2,
    x2: sta20X + 20,
    y2: TRACK_Y_LINE2,
    status: "free",
    speedLimit: 0,
    speedDisplay: "0/0",
    direction: "southbound",
    isPlatform: false,
    lengthMeters: 130,
  });
  // Pre-platform Crossover 1: from P20.1 (sta20X - 45, Line 1) down to P20.2 (sta20X + 20, Line 2)
  tracks.push({
    id: "TP20.XO1",
    stationId: 20,
    name: "TP20.XO1",
    trackNumber: 2,
    x1: sta20X - 45,
    y1: TRACK_Y_LINE1,
    x2: sta20X + 20,
    y2: TRACK_Y_LINE2,
    status: "free",
    speedLimit: 25,
    speedDisplay: "0/5",
    direction: "both",
    isPlatform: false,
    isDiagonal: true,
    lengthMeters: 110,
  });

  // Station 20 Platform Tracks:
  tracks.push({
    id: "T20.1",
    stationId: 20,
    name: "1T-20-DEFA-E-MOGHADAS",
    trackNumber: 1,
    x1: sta20X - 45,
    y1: TRACK_Y_LINE1,
    x2: sta20X + 80,
    y2: TRACK_Y_LINE1,
    status: "free",
    speedLimit: 0,
    speedDisplay: "0/0",
    direction: "northbound",
    isPlatform: true,
    lengthMeters: 125,
  });
  tracks.push({
    id: "T20.2",
    stationId: 20,
    name: "2T-20-DEFA-E-MOGHADAS",
    trackNumber: 2,
    x1: sta20X + 20,
    y1: TRACK_Y_LINE2,
    x2: sta20X + 90,
    y2: TRACK_Y_LINE2,
    status: "free",
    speedLimit: 0,
    speedDisplay: "0/0",
    direction: "southbound",
    isPlatform: true,
    lengthMeters: 70,
  });

  // Post-platform Turnback & Siding Area:
  // Upper track post-platform: TP20.3.2 (contains switch P20.3 at sta20X + 160)
  tracks.push({
    id: "TP20.3.2",
    stationId: 20,
    name: "TP20.3.2",
    trackNumber: 1,
    x1: sta20X + 80,
    y1: TRACK_Y_LINE1,
    x2: sta20X + 160,
    y2: TRACK_Y_LINE1,
    status: "free",
    speedLimit: 0,
    speedDisplay: "0/0",
    direction: "both",
    isPlatform: false,
    lengthMeters: 80,
  });
  // Upper line dead-end tail T20.1.4: straight from P20.3 past S20.7 to buffer stop
  tracks.push({
    id: "T20.1.4",
    stationId: 20,
    name: "TAIL-01 (T20.1.4)",
    trackNumber: 1,
    x1: sta20X + 160,
    y1: TRACK_Y_LINE1,
    x2: sta20X + 310,
    y2: TRACK_Y_LINE1,
    status: "free",
    speedLimit: 0,
    speedDisplay: "0/0",
    direction: "both",
    isPlatform: false,
    isDeadEnd: true,
    isBufferStopRight: true,
    lengthMeters: 150,
  });
  // Post-platform Crossover 2: from P20.3 (sta20X + 160, Line 1) down to P20.6 (sta20X + 230, Line 2)
  tracks.push({
    id: "TP20.XO2",
    stationId: 20,
    name: "TP20.XO2",
    trackNumber: 2,
    x1: sta20X + 160,
    y1: TRACK_Y_LINE1,
    x2: sta20X + 230,
    y2: TRACK_Y_LINE2,
    status: "free",
    speedLimit: 25,
    speedDisplay: "0/0",
    direction: "both",
    isPlatform: false,
    isDiagonal: true,
    lengthMeters: 110,
  });

  // Lower track post-platform: TP20.4.2 (contains switch P20.4 at sta20X + 150)
  tracks.push({
    id: "TP20.4.2",
    stationId: 20,
    name: "TP20.4.2",
    trackNumber: 2,
    x1: sta20X + 90,
    y1: TRACK_Y_LINE2,
    x2: sta20X + 150,
    y2: TRACK_Y_LINE2,
    status: "free",
    speedLimit: 0,
    speedDisplay: "0/0",
    direction: "both",
    isPlatform: false,
    lengthMeters: 60,
  });
  // Straight link from P20.4 to P20.6:
  tracks.push({
    id: "TP20.6.MID",
    stationId: 20,
    name: "TP20.6.MID",
    trackNumber: 2,
    x1: sta20X + 150,
    y1: TRACK_Y_LINE2,
    x2: sta20X + 230,
    y2: TRACK_Y_LINE2,
    status: "free",
    speedLimit: 0,
    speedDisplay: "0/0",
    direction: "both",
    isPlatform: false,
    lengthMeters: 80,
  });
  // Lower line dead-end tail T20.2.4: straight from P20.6 past S20.8 to buffer stop
  tracks.push({
    id: "T20.2.4",
    stationId: 20,
    name: "TAIL-02 (T20.2.4)",
    trackNumber: 2,
    x1: sta20X + 230,
    y1: TRACK_Y_LINE2,
    x2: sta20X + 355,
    y2: TRACK_Y_LINE2,
    status: "occupied",
    occupyingTrainId: "131",
    speedLimit: 20,
    speedDisplay: "20/0",
    direction: "both",
    isPlatform: false,
    isDeadEnd: true,
    isBufferStopRight: true,
    lengthMeters: 125,
  });

  // Track 4 (Third Parallel Storage Track below Line 2 at y = 340):
  // Diverging diagonal branch from P20.4 down to TP20.5.4
  tracks.push({
    id: "TP20.LEAD4",
    stationId: 20,
    name: "TP20.LEAD4",
    trackNumber: 2,
    x1: sta20X + 150,
    y1: TRACK_Y_LINE2,
    x2: sta20X + 215,
    y2: TRACK_Y_LINE4,
    status: "free",
    speedLimit: 25,
    speedDisplay: "0/0",
    direction: "both",
    isPlatform: false,
    isDiagonal: true,
    lengthMeters: 110,
  });
  // Storage approach track TP20.5.4 (contains switch P20.5 at sta20X + 270)
  tracks.push({
    id: "TP20.5.4",
    stationId: 20,
    name: "TP20.5.4",
    trackNumber: 2,
    x1: sta20X + 215,
    y1: TRACK_Y_LINE4,
    x2: sta20X + 270,
    y2: TRACK_Y_LINE4,
    status: "free",
    speedLimit: 0,
    speedDisplay: "0/0",
    direction: "both",
    isPlatform: false,
    lengthMeters: 55,
  });
  // Storage dead-end track T20.4.4: straight from P20.5 past S20.9 to buffer stop
  tracks.push({
    id: "T20.4.4",
    stationId: 20,
    name: "SIDING-04 (T20.4.4)",
    trackNumber: 2,
    x1: sta20X + 270,
    y1: TRACK_Y_LINE4,
    x2: sta20X + 375,
    y2: TRACK_Y_LINE4,
    status: "free",
    speedLimit: 10,
    speedDisplay: "10/0",
    direction: "both",
    isPlatform: false,
    isDeadEnd: true,
    isBufferStopRight: true,
    lengthMeters: 105,
  });

  return tracks;
}

// Switches (Points) across key stations including Station 01 branches and Station 20 Scissors
export function generateInitialSwitches(): PointSwitch[] {
  const startX = MAP_START_X;
  const stepX = MAP_STEP_X;

  return [
    // Station 01 (GHODS) Branching Switches
    {
      id: "P1.1",
      stationId: 1,
      name: "Point P1.1 (Line 1 to T1.A.6 Shunt)",
      x: 380,
      y: TRACK_Y_LINE1,
      normalX: 435,
      normalY: TRACK_Y_LINE1,
      reverseX: 290,
      reverseY: TRACK_Y_GHODS_P2,
      position: "normal",
      isFlankProtected: false,
      isLocked: false,
    },
    {
      id: "P1.2",
      stationId: 1,
      name: "Point P1.2 (Line 2 to T1.A.7 Shunt)",
      x: 380,
      y: TRACK_Y_LINE2,
      normalX: 435,
      normalY: TRACK_Y_LINE2,
      reverseX: 290,
      reverseY: TRACK_Y_GHODS_P3,
      position: "normal",
      isFlankProtected: false,
      isLocked: false,
    },
    {
      id: "P1.3",
      stationId: 1,
      name: "Point P1.3 (T1.A.6 to T1.A.5 Branch)",
      x: 290,
      y: TRACK_Y_GHODS_P2,
      normalX: 220,
      normalY: TRACK_Y_GHODS_P2,
      reverseX: 220,
      reverseY: TRACK_Y_GHODS_P1,
      position: "normal",
      isFlankProtected: false,
      isLocked: false,
    },
    {
      id: "P1.4",
      stationId: 1,
      name: "Point P1.4 (T1.A.7 to T1.A.8 Branch)",
      x: 290,
      y: TRACK_Y_GHODS_P3,
      normalX: 220,
      normalY: TRACK_Y_GHODS_P3,
      reverseX: 220,
      reverseY: TRACK_Y_GHODS_P4,
      position: "normal",
      isFlankProtected: false,
      isLocked: false,
    },
    // Station 01 Main Crossover
    {
      id: "P1.5",
      stationId: 1,
      name: "Point P1.5 (01-GHODS Crossover)",
      x: startX + 90,
      y: TRACK_Y_LINE1,
      normalX: startX + 150,
      normalY: TRACK_Y_LINE1,
      reverseX: startX + 180,
      reverseY: TRACK_Y_LINE2,
      position: "normal",
      isFlankProtected: false,
      isLocked: false,
    },
    // Station 04 (04-MOFATTEH)
    {
      id: "P4.1",
      stationId: 4,
      name: "Point P4.1 (04-MOFATTEH)",
      x: startX + 3 * stepX + 90,
      y: TRACK_Y_LINE1,
      normalX: startX + 3 * stepX + 150,
      normalY: TRACK_Y_LINE1,
      reverseX: startX + 3 * stepX + 180,
      reverseY: TRACK_Y_LINE2,
      position: "normal",
      isFlankProtected: false,
      isLocked: false,
    },
    // Station 07 (07-KAVEH)
    {
      id: "P7.1",
      stationId: 7,
      name: "Point P7.1 (07-KAVEH Crossover)",
      x: startX + 6 * stepX - 90,
      y: TRACK_Y_LINE2,
      normalX: startX + 6 * stepX - 30,
      normalY: TRACK_Y_LINE2,
      reverseX: startX + 6 * stepX - 10,
      reverseY: TRACK_Y_LINE1,
      position: "normal",
      isFlankProtected: true,
      isLocked: true,
    },
    {
      id: "P7.2",
      stationId: 7,
      name: "Point P7.2 (07-KAVEH Depot Lead)",
      x: startX + 6 * stepX + 90,
      y: TRACK_Y_LINE1,
      normalX: startX + 6 * stepX + 160,
      normalY: TRACK_Y_LINE1,
      reverseX: startX + 6 * stepX + 90,
      reverseY: TRACK_Y_DEPOT,
      position: "normal",
      isFlankProtected: false,
      isLocked: false,
    },
    // Station 10 (10-SHOHADA)
    {
      id: "P10.1",
      stationId: 10,
      name: "Point P10.1 (10-SHOHADA)",
      x: startX + 9 * stepX + 90,
      y: TRACK_Y_LINE1,
      normalX: startX + 9 * stepX + 150,
      normalY: TRACK_Y_LINE1,
      reverseX: startX + 9 * stepX + 180,
      reverseY: TRACK_Y_LINE2,
      position: "normal",
      isFlankProtected: true,
      isLocked: false,
    },
    // Station 12 (12-EMAM HOSSEIN)
    {
      id: "P12.1",
      stationId: 12,
      name: "Point P12.1 (12-EMAM HOSSEIN)",
      x: startX + 11 * stepX + 90,
      y: TRACK_Y_LINE2,
      normalX: startX + 11 * stepX + 150,
      normalY: TRACK_Y_LINE2,
      reverseX: startX + 11 * stepX + 180,
      reverseY: TRACK_Y_LINE2 + 55,
      position: "normal",
      isFlankProtected: false,
      isLocked: false,
    },
    // Station 16 (16-AZADI)
    {
      id: "P16.1",
      stationId: 16,
      name: "Point P16.1 (16-AZADI)",
      x: startX + 15 * stepX + 90,
      y: TRACK_Y_LINE1,
      normalX: startX + 15 * stepX + 150,
      normalY: TRACK_Y_LINE1,
      reverseX: startX + 15 * stepX + 180,
      reverseY: TRACK_Y_LINE1 - 55,
      position: "normal",
      isFlankProtected: false,
      isLocked: false,
    },
    // =========================================================================
    // AUTHENTIC SWITCHES FOR STATIONS 18 & 20 (ACCORDING TO REAL CTC MONITOR PHOTO)
    // =========================================================================
    // Station 18 (18-KAREGAR) Crossover Switches
    {
      id: "P18.1",
      stationId: 18,
      name: "Point P18.1 (18-KAREGAR Line 1 to Line 2)",
      x: startX + 17 * stepX + 105,
      y: TRACK_Y_LINE1,
      normalX: startX + 17 * stepX + 185,
      normalY: TRACK_Y_LINE1,
      reverseX: startX + 17 * stepX + 175,
      reverseY: TRACK_Y_LINE2,
      position: "normal",
      isFlankProtected: false,
      isLocked: false,
    },
    {
      id: "P18.2",
      stationId: 18,
      name: "Point P18.2 (18-KAREGAR Line 2 from Line 1)",
      x: startX + 17 * stepX + 175,
      y: TRACK_Y_LINE2,
      normalX: startX + 17 * stepX + 245,
      normalY: TRACK_Y_LINE2,
      reverseX: startX + 17 * stepX + 105,
      reverseY: TRACK_Y_LINE1,
      position: "normal",
      isFlankProtected: false,
      isLocked: false,
    },
    // Station 20 (20-DEFA-E-MOGHADAS) Switches: P20.1 to P20.6
    {
      id: "P20.1",
      stationId: 20,
      name: "Point P20.1 (20-DEFA-E-MOGHADAS Pre-Platform Inbound)",
      x: startX + 19 * stepX - 45,
      y: TRACK_Y_LINE1,
      normalX: startX + 19 * stepX + 80,
      normalY: TRACK_Y_LINE1,
      reverseX: startX + 19 * stepX + 20,
      reverseY: TRACK_Y_LINE2,
      position: "normal",
      isFlankProtected: false,
      isLocked: false,
    },
    {
      id: "P20.2",
      stationId: 20,
      name: "Point P20.2 (20-DEFA-E-MOGHADAS Pre-Platform Crossover)",
      x: startX + 19 * stepX + 20,
      y: TRACK_Y_LINE2,
      normalX: startX + 19 * stepX + 90,
      normalY: TRACK_Y_LINE2,
      reverseX: startX + 19 * stepX - 45,
      reverseY: TRACK_Y_LINE1,
      position: "normal",
      isFlankProtected: false,
      isLocked: false,
    },
    {
      id: "P20.3",
      stationId: 20,
      name: "Point P20.3 (20-DEFA-E-MOGHADAS Tail Crossover Upper)",
      x: startX + 19 * stepX + 160,
      y: TRACK_Y_LINE1,
      normalX: startX + 19 * stepX + 310,
      normalY: TRACK_Y_LINE1,
      reverseX: startX + 19 * stepX + 230,
      reverseY: TRACK_Y_LINE2,
      position: "normal",
      isFlankProtected: false,
      isLocked: false,
    },
    {
      id: "P20.4",
      stationId: 20,
      name: "Point P20.4 (20-DEFA-E-MOGHADAS Tail to Siding Lead)",
      x: startX + 19 * stepX + 150,
      y: TRACK_Y_LINE2,
      normalX: startX + 19 * stepX + 230,
      normalY: TRACK_Y_LINE2,
      reverseX: startX + 19 * stepX + 215,
      reverseY: TRACK_Y_LINE4,
      position: "normal",
      isFlankProtected: false,
      isLocked: false,
    },
    {
      id: "P20.5",
      stationId: 20,
      name: "Point P20.5 (20-DEFA-E-MOGHADAS Siding Track 4)",
      x: startX + 19 * stepX + 270,
      y: TRACK_Y_LINE4,
      normalX: startX + 19 * stepX + 375,
      normalY: TRACK_Y_LINE4,
      reverseX: startX + 19 * stepX + 150,
      reverseY: TRACK_Y_LINE2,
      position: "normal",
      isFlankProtected: false,
      isLocked: false,
    },
    {
      id: "P20.6",
      stationId: 20,
      name: "Point P20.6 (20-DEFA-E-MOGHADAS Tail Crossover Junction)",
      x: startX + 19 * stepX + 230,
      y: TRACK_Y_LINE2,
      normalX: startX + 19 * stepX + 355,
      normalY: TRACK_Y_LINE2,
      reverseX: startX + 19 * stepX + 160,
      reverseY: TRACK_Y_LINE1,
      position: "normal",
      isFlankProtected: false,
      isLocked: false,
    },
  ];
}

// Signals across stations including entrance signals to dead-end branches S1.5, S1.6, S1.7, S1.8
export function generateInitialSignals(): RailSignal[] {
  const startX = MAP_START_X;
  const stepX = MAP_STEP_X;
  const signals: RailSignal[] = [];

  // Signals at the entrance of Station 01 dead-end branches (S1.5, S1.6, S1.7, S1.8)
  signals.push({
    id: "S1.5",
    stationId: 1,
    name: "S1.5 (T1.A.5 Entrance)",
    x: 220,
    y: TRACK_Y_GHODS_P1 - 18,
    aspect: "yellow",
    direction: "north",
    hasFailure: false,
    isShunting: true,
  });

  signals.push({
    id: "S1.6",
    stationId: 1,
    name: "S1.6 (T1.A.6 Entrance)",
    x: 290,
    y: TRACK_Y_GHODS_P2 - 18,
    aspect: "flashing_yellow", // Flashing yellow for active shunting
    direction: "north",
    hasFailure: false,
    isShunting: true,
  });

  signals.push({
    id: "S1.7",
    stationId: 1,
    name: "S1.7 (T1.A.7 Entrance)",
    x: 290,
    y: TRACK_Y_GHODS_P3 + 18,
    aspect: "yellow",
    direction: "south",
    hasFailure: false,
    isShunting: true,
  });

  signals.push({
    id: "S1.8",
    stationId: 1,
    name: "S1.8 (T1.A.8 Entrance)",
    x: 220,
    y: TRACK_Y_GHODS_P4 + 18,
    aspect: "red",
    direction: "south",
    hasFailure: false,
    isShunting: true,
  });

  // Mainline Platform Signals (Stations 1 to 17)
  STATIONS_DATABASE.forEach((st, idx) => {
    if (st.id >= 18) return; // Stations 18, 19, 20 signals are defined authentically below
    const stCenterX = startX + idx * stepX;

    // Platform Signal Line 1 (Northbound - placed above track 1)
    signals.push({
      id: `S${st.id}.1`,
      stationId: st.id,
      name: `S${st.id}.1`,
      x: stCenterX + 75,
      y: TRACK_Y_LINE1 - 18,
      aspect: st.id === 7 ? 'red' : st.id === 5 || st.id === 6 ? 'green' : 'green',
      direction: 'north',
      hasFailure: false,
      isDwellActive: st.id === 7,
    });

    // Platform Signal Line 2 (Southbound - placed below track 2)
    signals.push({
      id: `S${st.id}.2`,
      stationId: st.id,
      name: `S${st.id}.2`,
      x: stCenterX - 75,
      y: TRACK_Y_LINE2 + 18,
      aspect: 'green',
      direction: 'south',
      hasFailure: false,
      isDwellActive: false,
    });
  });

  // =========================================================================
  // AUTHENTIC SIGNALS FOR STATIONS 18, 19, 20 (ACCORDING TO REAL CTC MONITOR PHOTO)
  // S18.1, S18.2, S18.3, S18.4, S20.1, S20.2, S20.3, S20.4, S20.5, S20.6, S20.7, S20.8, S20.9
  // =========================================================================
  const sta18X = startX + 17 * stepX;
  const sta20X = startX + 19 * stepX;

  // Station 18 Signals:
  signals.push({
    id: "S18.1",
    stationId: 18,
    name: "S18.1",
    x: sta18X + 105,
    y: TRACK_Y_LINE1 + 18,
    aspect: "red",
    direction: "north",
    hasFailure: false,
  });
  signals.push({
    id: "S18.3",
    stationId: 18,
    name: "S18.3",
    x: sta18X + 140,
    y: TRACK_Y_LINE1 - 18,
    aspect: "green",
    direction: "north", // pointing left ◀
    hasFailure: false,
  });
  signals.push({
    id: "S18.2",
    stationId: 18,
    name: "S18.2",
    x: sta18X + 105,
    y: TRACK_Y_LINE2 + 18,
    aspect: "green",
    direction: "south", // pointing right ▶
    hasFailure: false,
  });
  signals.push({
    id: "S18.4",
    stationId: 18,
    name: "S18.4",
    x: sta18X + 165,
    y: TRACK_Y_LINE2 - 18,
    aspect: "red",
    direction: "south",
    hasFailure: false,
  });

  // Station 20 Signals (Exact photo placement):
  signals.push({
    id: "S20.1",
    stationId: 20,
    name: "S20.1",
    x: sta20X - 45,
    y: TRACK_Y_LINE1 + 18,
    aspect: "red",
    direction: "north",
    hasFailure: false,
  });
  signals.push({
    id: "S20.3",
    stationId: 20,
    name: "S20.3",
    x: sta20X - 10,
    y: TRACK_Y_LINE1 - 18,
    aspect: "green",
    direction: "north", // pointing left ◀
    hasFailure: false,
  });
  signals.push({
    id: "S20.2",
    stationId: 20,
    name: "S20.2",
    x: sta20X - 45,
    y: TRACK_Y_LINE2 + 18,
    aspect: "red",
    direction: "south",
    hasFailure: false,
  });
  signals.push({
    id: "S20.4",
    stationId: 20,
    name: "S20.4",
    x: sta20X + 20,
    y: TRACK_Y_LINE2 - 18,
    aspect: "red",
    direction: "south",
    hasFailure: false,
  });
  signals.push({
    id: "S20.5",
    stationId: 20,
    name: "S20.5",
    x: sta20X + 135,
    y: TRACK_Y_LINE2 - 18,
    aspect: "red",
    direction: "south",
    hasFailure: false,
  });
  signals.push({
    id: "S20.6",
    stationId: 20,
    name: "S20.6",
    x: sta20X + 135,
    y: TRACK_Y_LINE2 + 18,
    aspect: "red",
    direction: "south",
    hasFailure: false,
  });
  signals.push({
    id: "S20.7",
    stationId: 20,
    name: "S20.7",
    x: sta20X + 215,
    y: TRACK_Y_LINE1 - 18,
    aspect: "red",
    direction: "north",
    hasFailure: false,
  });
  signals.push({
    id: "S20.8",
    stationId: 20,
    name: "S20.8",
    x: sta20X + 275,
    y: TRACK_Y_LINE2 - 18,
    aspect: "red",
    direction: "south",
    hasFailure: false,
  });
  signals.push({
    id: "S20.9",
    stationId: 20,
    name: "S20.9",
    x: sta20X + 310,
    y: TRACK_Y_LINE4 - 18,
    aspect: "red",
    direction: "south",
    hasFailure: false,
  });

  return signals;
}

// Initial Simulated Train on the system (Train 106 at Station 07 KAVEH)
export const INITIAL_TRAINS: SimulatedTrain[] = [
  {
    id: "106",
    currentTrackId: "T7.1", // At Station 07 (KAVEH)
    speed: 0,
    targetSpeed: SPEED_LIMITS.PLATFORM_TRACK,
    direction: "northbound",
    mode: "ATO",
    originStation: "20-DEFA-E-MOGHADAS",
    destinationStation: "01-GHODS",
    dwellSecondsRemaining: 22,
    activeCab: "Cab 1",
    serviceId: "SRV-106",
    doorsState: "platform_open",
    scheduleStatus: "on_time",
    lastBaliseId: "BLZ-KAV-01",
    isTrainLost: false,
    progressRatio: 0.5,
  },
  {
    id: "104",
    currentTrackId: "T5.1.6", // En route between 05-ALIKHANI and 06-JABER
    speed: 68,
    targetSpeed: SPEED_LIMITS.MAINLINE_MAX,
    direction: "northbound",
    mode: "ATO",
    originStation: "07-KAVEH",
    destinationStation: "01-GHODS",
    dwellSecondsRemaining: 0,
    activeCab: "Cab 1",
    serviceId: "SRV-104",
    doorsState: "closed_locked",
    scheduleStatus: "on_time",
    lastBaliseId: "BLZ-ALIK-02",
    isTrainLost: false,
    progressRatio: 0.5,
  },
  {
    id: "105",
    currentTrackId: "T20.1.3", // Inbound to 20-DEFA-E-MOGHADAS (seen on CTC monitor photo)
    speed: 70,
    targetSpeed: 70,
    direction: "northbound",
    mode: "ATO",
    originStation: "20-DEFA-E-MOGHADAS",
    destinationStation: "01-GHODS",
    dwellSecondsRemaining: 0,
    activeCab: "Cab 1",
    serviceId: "SRV-105",
    doorsState: "closed_locked",
    scheduleStatus: "on_time",
    lastBaliseId: "BLZ-KOY-01",
    isTrainLost: false,
    progressRatio: 0.5,
  },
  {
    id: "131",
    currentTrackId: "T20.2.4", // Southbound turnback tail track at 20-DEFA-E-MOGHADAS (seen on CTC monitor photo)
    speed: 0,
    targetSpeed: 20,
    direction: "southbound",
    mode: "ATO",
    originStation: "01-GHODS",
    destinationStation: "20-DEFA-E-MOGHADAS",
    dwellSecondsRemaining: 45,
    activeCab: "Cab 2",
    serviceId: "SRV-131",
    doorsState: "closed_locked",
    scheduleStatus: "on_time",
    lastBaliseId: "BLZ-DEF-02",
    isTrainLost: false,
    progressRatio: 0.5,
  },
];

// Initial Global Status LED Indicators (SCADA Header)
export const INITIAL_LED_STATUS: LedStatus = {
  arsActive: true,      // ARS_Active (Blue)
  arsTsMode: true,      // ARS_TS_Mode (Blue)
  arsScMode: false,     // ARS_SC_Mod (Blue)
  atrActive: true,      // ATR_Active (Blue)
  control: true,        // Control (Green)
  approach: true,       // Approach (Green)
  pointFail: false,     // Point Fail (Red)
  pointTrailed: false,  // Point Trailed (Red)
};

// Event Log Panel data with exact requested columns:
// Occurred_On | Source | Type | Event Description
export const INITIAL_EVENT_LOGS: ScadaEvent[] = [
  {
    id: "EV-001",
    occurredOn: "2026-10-08 12:59:28",
    source: "Logic",
    type: "EVNT_CMD_CHANGE_POINT",
    eventDescription: "Interlocking: 1 Point: 206 is Changing",
    level: "info",
  },
  {
    id: "EV-002",
    occurredOn: "2026-10-08 12:58:45",
    source: "Interlocking",
    type: "EVNT_FLANK_LOCK",
    eventDescription: "Flank Protection Locked on Scissors Points P20.1-P20.4 at 20-DEFA-E-MOGHADAS",
    level: "info",
  },
  {
    id: "EV-003",
    occurredOn: "2026-10-08 12:57:32",
    source: "ATP",
    type: "EVNT_OCCUPIED",
    eventDescription: "Track T7.1 occupied by Train 106 at Station 07-KAVEH",
    level: "warning",
  },
  {
    id: "EV-004",
    occurredOn: "2026-10-08 12:56:10",
    source: "CTC",
    type: "EVNT_ROUTE_SET",
    eventDescription: "Running Route Set: S5.1 to S6.1 [Aspect: GREEN, Max Speed: 70 km/h]",
    level: "success",
  },
  {
    id: "EV-005",
    occurredOn: "2026-10-08 12:54:19",
    source: "Logic",
    type: "EVNT_RED_PASSED",
    eventDescription: "Signal S7.1 aspect held at RED during station platform dwell",
    level: "info",
  },
  {
    id: "EV-006",
    occurredOn: "2026-10-08 12:52:05",
    source: "Interlocking",
    type: "EVNT_SHUNT_ROUTE",
    eventDescription: "Shunting Route to Dead-End T1.A.6 engaged [Signal: S1.6 FLASHING_YELLOW, Limit: 25 km/h]",
    level: "warning",
  },
  {
    id: "EV-007",
    occurredOn: "2026-10-08 12:50:00",
    source: "CTC",
    type: "EVNT_SYS_STATE",
    eventDescription: "Esfahan Metro Line 1 SCADA Interlocking Online: 20 Stations Polled OK",
    level: "success",
  },
];

// Historical Simulation Snapshots for Training Playback Slider (0 to 100%)
export interface SimulationSnapshot {
  step: number;
  timeOffset: string;
  description: string;
  train106TrackId: string;
  speed: number;
  routeActive: boolean;
  activeSignals: { id: string; aspect: string }[];
}

export const TRAINING_TIMELINE_SNAPSHOTS: SimulationSnapshot[] = [
  {
    step: 0,
    timeOffset: "12:50:00",
    description: "System Initialization: All blocks clear, Train 106 held at Soffeh (Sta 20)",
    train106TrackId: "T20.1",
    speed: 0,
    routeActive: false,
    activeSignals: [{ id: "S20.1", aspect: "red" }],
  },
  {
    step: 25,
    timeOffset: "12:53:15",
    description: "Train 106 departs towards Daneshgah (Sta 17) [Running Route, 70 km/h]",
    train106TrackId: "T17.1",
    speed: 65,
    routeActive: true,
    activeSignals: [{ id: "S17.1", aspect: "green" }],
  },
  {
    step: 50,
    timeOffset: "12:56:40",
    description: "Train 106 approaching Kaveh (Sta 07) [Platform Approach, 50 km/h]",
    train106TrackId: "T7.1.8",
    speed: 48,
    routeActive: true,
    activeSignals: [{ id: "S7.1", aspect: "yellow" }],
  },
  {
    step: 75,
    timeOffset: "12:57:32",
    description: "Train 106 berthed at Kaveh Platform Track T7.1 [Dwell Active: 22s]",
    train106TrackId: "T7.1",
    speed: 0,
    routeActive: false,
    activeSignals: [{ id: "S7.1", aspect: "red" }],
  },
  {
    step: 100,
    timeOffset: "12:59:28",
    description: "Shunting Route to Qods Dead-End T1.A.6 Prepared [Flashing Yellow, 25 km/h]",
    train106TrackId: "T1.A.6",
    speed: 22,
    routeActive: true,
    activeSignals: [{ id: "S1.6", aspect: "flashing_yellow" }],
  },
];
