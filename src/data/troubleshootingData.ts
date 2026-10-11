export type IncidentSeverity = "بحرانی (Critical)" | "شدید (Major)" | "متوسط (Moderate)" | "هشدار (Warning)";
export type IncidentCategory = "شبکه و مخابرات" | "سیگنالینگ و اینترلاکینگ" | "ناوگان و ATP" | "تجهیزات خط و رک‌ها" | "تغذیه و توان";

export interface TroubleshootingIncident {
  id: string;
  code: string; // e.g. "ERR-SIG-101"
  title: string;
  titleEn: string;
  category: IncidentCategory;
  severity: IncidentSeverity;
  affectedComponents: string[];
  safetyStandardClause?: string; // e.g. "EN 50129 Clause 7.2"
  rootCausesReasoning: {
    primaryCause: string;
    underlyingPhysicsOrLogic: string;
    whyItHappens: string;
  };
  symptomsAndAlarms: {
    occDisplay: string;
    dmiDisplay?: string;
    hardwareLeds?: string;
    relayStates?: string;
  };
  failSafeAutomatedReaction: {
    systemAction: string;
    trainSpeedEffect: string;
    signalsState: string;
  };
  stepByStepRemediation: {
    step: number;
    action: string;
    toolsRequired?: string;
    precautions: string;
  }[];
  postIncidentRecovery: string;
  relatedArticleId?: string;
  relatedSectionId?: string;
  relatedRackId?: string;
}

export const TROUBLESHOOTING_INCIDENTS_DATABASE: TroubleshootingIncident[] = [
  {
    id: "inc-point-failure-10s",
    code: "ERR-PNT-01",
    title: "خطای عدم جابجایی و تطابق تیغه‌های سوزن ظرف مهلت ۱۰ ثانیه‌ای (Point Fail)",
    titleEn: "Point Detection Timeout / Out of Correspondence (Fail Error)",
    category: "سیگنالینگ و اینترلاکینگ",
    severity: "بحرانی (Critical)",
    affectedComponents: [
      "ماشین سوزن الکتریکی (Point Machine)",
      "کارت درایور سوزن (PMC)",
      "سنسور تشخیص قفل مکانیکی و میکروسوئیچ‌ها",
      "کابینت TFC و فیلدباس CAN",
    ],
    safetyStandardClause: "CENELEC EN 50129 / EN 50128 SIL 4 - Vital Point Monitoring",
    rootCausesReasoning: {
      primaryCause: "نرسیدن تیغه‌های متحرک سوزن به موقعیت درخواستی (Normal یا Reverse) ظرف مهلت ۱۰ ثانیه‌ای تایمر ایمن سیستم EIL.",
      underlyingPhysicsOrLogic:
        "در منطق اینترلاکینگ ریلی، وضعیت سوزن تا زمانی که تیغه‌ها کاملاً به ریل پهلو نچسبیده و قفل مکانیکی درگیر نشده باشد 'نامشخص' (Middle Position) تلقی می‌شود. عبور قطار از روی سوزنی که قفل نشده می‌تواند منجر به خروج فاجعه‌بار چرخ از ریل (Derailment) گردد.",
      whyItHappens:
        "۱. گیر کردن جسم خارجی (سنگلاخ بالاست، قطعات یخ یا زباله) بین تیغه متحرک و ریل ثابت ۲. نقص مکانیکی گیربکس یا قطع شدن کابل تغذیه ۱۱۰ ولت جریان مستقیم موتور ۳. تنظیم نبودن میکروسوئیچ‌های جعبه سوزن یا خرابی رله‌های تشخیص وضعیت در کارت PMC.",
    },
    symptomsAndAlarms: {
      occDisplay: "نماد سوزن در صفحه دیسپاچینگ CTC زرد چشمک‌زن یا قرمز می‌شود و آلارم صوتی 'Point Fail Pxx' به صدا درمی‌آید.",
      dmiDisplay: "سرعت مجاز قطار متوقف یا به صفر تقلیل می‌یابد.",
      hardwareLeds: "روی کارت PMC در ساب‌رک SER-01 ال‌ای‌دی‌های N/R خاموش و LED قرمز FAIL روشن می‌گردد.",
      relayStates: "رله‌های تشخیص قفل سوزن (NWPR / RWPR) هر دو قطع (De-energized) می‌شوند.",
    },
    failSafeAutomatedReaction: {
      systemAction: "اینترلاکینگ فوراً دستور قطع توان موتور سوزن را پس از ۱۰ ثانیه صادر کرده تا از سوختن موتور جلوگیری شود و تشکیل مسیر متوقف می‌گردد.",
      trainSpeedEffect: "کد سرعت تمام تراک‌های منتهی به سوزن به 0km/h (توقف کامل) تغییر می‌یابد.",
      signalsState: "کلیه چراغ‌های سیگنال محافظ سوزن فوراً قرمز ثابت (Stop Aspect) می‌گردند.",
    },
    stepByStepRemediation: [
      {
        step: 1,
        action: "تلاش برای برگشت سوزن (Reverse Command) به موقعیت قبلی از طریق ایستگاه کاری CTC جهت تست آزادسازی تیغه.",
        precautions: "در صورت وجود قطار در بلاک تقرب، هیچ فرمانی بدون تایید توقف قطار صادر نشود.",
      },
      {
        step: 2,
        action: "اعزام تیم پایش میدانی به پای خط جهت بررسی فیزیکی فاصله بین تیغه سوزن و ریل (Stock Rail).",
        toolsRequired: "گیج اندازه فاصله تیغه، دسته‌هندل هندلی سوزن (Hand Crank)",
        precautions: "مسدودسازی کامل بلاک و هماهنگی بیسیم با اتاق فرمان مرکزی قبل از ورود به حریم خط.",
      },
      {
        step: 3,
        action: "در صورت سالم بودن فیزیکی تیغه‌ها، تست ولتاژ ۱۱۰ ولت در ترمینال ورودی جعبه سوزن و بررسی فیوزهای رک TFC.",
        toolsRequired: "مولتی‌متر دیجیتال کالیبره‌شده",
        precautions: "رعایت ایمنی ولتاژ DC و عدم دستکاری پین‌های ورودی کارت بدون دستکش عایق.",
      },
    ],
    postIncidentRecovery: "انجام مانور دستی با هندل، تست سوئیچ و صدور فرمان همگام‌سازی از مرکز تا تثبیت نور سبز قفل سوزن.",
    relatedArticleId: "interlocking-operations",
    relatedSectionId: "eil-elements-definitions",
    relatedRackId: "SER01-RACK-01",
  },

  {
    id: "inc-point-trail-error",
    code: "ERR-PNT-02",
    title: "خطای تیغه‌بُری ناخواسته سوزن ناشی از فشار چرخ یا جابجایی بدون فرمان (Point Trail)",
    titleEn: "Point Trail Error / Forced Flange Displacement",
    category: "سیگنالینگ و اینترلاکینگ",
    severity: "بحرانی (Critical)",
    affectedComponents: [
      "مکانیسم تیغه و پین‌های شکستنی سوزن",
      "سنسورهای مانیتورینگ کارت PMC",
      "اینترلاکینگ EIL",
    ],
    safetyStandardClause: "EN 50129 Safety Principle 4.3 - Uncommanded Motion Detection",
    rootCausesReasoning: {
      primaryCause: "جابجایی فیزیکی تیغه‌های سوزن بدون اینکه اینترلاکینگ فرمانی برای تغییر موقعیت آن صادر کرده باشد.",
      underlyingPhysicsOrLogic:
        "طوقه چرخ‌های قطاری که خلاف جهت سوزن قفل‌شده حرکت می‌کند تیغه را به زور پس می‌زند (Trail). این رخداد به شدت خطرناک بوده و معمولاً ناشی از فرار واگن یا عبور غیرمجاز از سیگنال قرمز (SPAD) است.",
      whyItHappens:
        "عبور قطار یا درزین مانوری از روی سوزن در مسیر همگرا در حالی که سوزن برای مسیر دیگر قفل بوده است؛ یا شکستن فنرها و پین‌های قفل مکانیکی زیر ارتعاش شدید عبور ناوگان.",
    },
    symptomsAndAlarms: {
      occDisplay: "آلارم بحرانی قرمز چشمک‌زن با بوق ممتد: 'CRITICAL: POINT TRAILED Pxx'.",
      dmiDisplay: "اعمال ترمز اضطراری خودکار به قطار متخلف.",
      hardwareLeds: "چشمک‌زن همزمان قرمز روی کارت PMC سالن علائم.",
      relayStates: "سقوط ناگهانی هر دو رله نرمال و معکوس.",
    },
    failSafeAutomatedReaction: {
      systemAction: "قفل فوری تمام مسیرهای متصل و مجاور، قطع برق بالاسری در صورت لزوم توسط SCADA.",
      trainSpeedEffect: "کد سرعت صفر برای تمام قطارهای آن ناحیه ترافیکی.",
      signalsState: "قرمز شدن سراسری چراغ‌های ناحیه به شعاع ۲ کیلومتر.",
    },
    stepByStepRemediation: [
      {
        step: 1,
        action: "توقف کامل و فوری کلیه حرکت‌های ریلی در ایستگاه و دپوی متصل.",
        precautions: "هیچ فرمانی نباید تا بازرسی حضوری صادر گردد.",
      },
      {
        step: 2,
        action: "بازرسی مکانیکی میله‌های اتصال تیغه و پین‌های برش فیوز مکانیکی سوزن.",
        toolsRequired: "ابزار تعویض پین‌های شکستنی استاندارد مهاران/وئست‌آلپین",
        precautions: "در صورت خمیدگی تیغه، تعویض کامل ریل سوزن الزامی است.",
      },
    ],
    postIncidentRecovery: "تست مکانیکی و الکتریکی ۱۰ دور جابجایی رفت و برگشت بدون قطار و تست مدارات ایمنی پیش از صدور مجوز بازگشایی خط.",
    relatedArticleId: "interlocking-operations",
    relatedSectionId: "eil-elements-definitions",
    relatedRackId: "SER01-RACK-01",
  },

  {
    id: "inc-fiber-ring-break",
    code: "ERR-NET-01",
    title: "قطع شدن یکی از لینک‌های رینگ فیبر نوری سراسری خط ۱ (Single Fiber Cut)",
    titleEn: "Optical Fiber Cable Cut / Ring Topology Degradation",
    category: "شبکه و مخابرات",
    severity: "متوسط (Moderate)",
    affectedComponents: [
      "کابل ژله‌دار نوری ۱۲ کور (OCFC Single-mode)",
      "ماژول‌های SFP سوئیچ‌های Hirschmann",
      "پچ‌پنل‌های ODF سالن‌های SER",
      "کارت رابط FCI در کابینت‌های TFC",
    ],
    safetyStandardClause: "CENELEC EN 50159 / IEC 62439-2 Media Redundancy Protocol (MRP)",
    rootCausesReasoning: {
      primaryCause: "پارگی یا شکستگی فیزیکی کابل فیبر نوری در یکی از تونل‌ها به دلیل عملیات عمرانی یا آسیب کابل‌کشی.",
      underlyingPhysicsOrLogic:
        "شبکه سیگنالینگ خط ۱ بر مبنای دو رینگ فیبر نوری مستقل در تونل‌های چپ و راست طراحی شده است. به محض قطع شدن یک لینک، سوئیچ Ring Manager پورت بلاک‌شده رینگ را در کمتر از ۲۰ میلی‌ثانیه باز می‌کند تا داده‌ها از جهت مخالف به گردش درآیند.",
      whyItHappens:
        "حفاری پیمانکاران عمرانی در حریم تونل، جویدن کابل توسط جوندگان، پیچ‌خوردگی شعاع خمش بیش از حد کابل (Micro-bending) یا سوختن ترنسیور نوری SFP.",
    },
    symptomsAndAlarms: {
      occDisplay: "آلارم زرد 'Network Ring Degraded: Link Cut between Station X and Y'. ترافیک زنده قطارها بدون وقفه ادامه دارد.",
      hardwareLeds: "روی سوئیچ هیرشمان پورت مربوطه چراغ لینک (LNK) خاموش و چراغ RM به رنگ زرد درمی‌آید.",
    },
    failSafeAutomatedReaction: {
      systemAction: "پروتکل MRP بدون نیاز به ریست سیستم، مسیر ثانویه رینگ را در کسری از ثانیه فعال ساخته و مانع از قطع ارتباط ایستگاه‌ها می‌شود.",
      trainSpeedEffect: "هیچ تاثیری روی سرعت قطار ندارد (عملکرد بدون افت شفاف).",
      signalsState: "کلیه سیگنال‌ها در وضعیت عادی به کار ادامه می‌دهند.",
    },
    stepByStepRemediation: [
      {
        step: 1,
        action: "بررسی داشبورد مانیتورینگ شبکه نوری جهت شناسایی دقیق دو سوئیچی که بین آن‌ها لینک قطع شده است.",
        precautions: "مراقبت از رینگ باقی‌مانده؛ نباید هیچ مانوری روی رینگ دوم انجام شود.",
      },
      {
        step: 2,
        action: "تست با دستگاه بازتاب‌سنج نوری (OTDR) از پچ‌پنل ODF ایستگاه جهت مشخص کردن متراژ دقیق نقطه پارگی کابل.",
        toolsRequired: "دستگاه OTDR کالیبره‌شده، قلم لیزری VFL (Visual Fault Locator)",
        precautions: "عدم نگاه مستقیم به پورت‌های لیزری به دلیل خطر آسیب به چشم.",
      },
      {
        step: 3,
        action: "مفصل‌بندی فیوژن کابل در محل آسیب‌دیدگی تونل با دستگاه جوش فیبر نوری.",
        toolsRequired: "دستگاه فیوژن، کاست مفصل ضدآب IP68",
        precautions: "استفاده از محافظ‌های حرارتی (Heat Shrink) استاندارد.",
      },
    ],
    postIncidentRecovery: "تست افت توان عبوری (کمتر از 0.2dB در هر جوش)، برقراری لینک و بسته شدن خودکار پورت Ring Manager به حالت نرمال.",
    relatedArticleId: "railway-signaling",
    relatedSectionId: "field-cabinets-tfc",
    relatedRackId: "CER-RACK-01",
  },

  {
    id: "inc-track-circuit-false-occupied",
    code: "ERR-TRK-01",
    title: "اشغال کاذب مدار راه بدون حضور فیزیکی قطار (False Track Occupation - Drop Error)",
    titleEn: "Audio Frequency Track Circuit False Drop / Bobbing Track",
    category: "تجهیزات خط و رک‌ها",
    severity: "شدید (Major)",
    affectedComponents: [
      "کارت گیرنده دوکاناله TCR (2oo2)",
      "واحدهای تنظیم و هماهنگی Tuning Unit (TU)",
      "کابل‌های امپدانس باند و اتصالات ریل",
      "جریان برگشت تراکشن برق ۱۵۰۰ ولت ریل",
    ],
    safetyStandardClause: "CENELEC EN 50129 Fail-Safe Detection of Track Clear Condition",
    rootCausesReasoning: {
      primaryCause: "افت سیگنال دریافتی کارت گیرنده TCR به زیر آستانه حساسیت، علیرغم عدم حضور چرخ‌های قطار روی خط.",
      underlyingPhysicsOrLogic:
        "طبق اصل Fail-Safe، سیستم گیرنده تا زمانی که سیگنال فرکانس صوتی با کدینگ معتبر و ولتاژ بالای حد آستانه دریافت نکند رله را وصل نگه نمی‌دارد. کاهش ولتاژ سیگنال به هر دلیلی فوراً به عنوان اشغال بلاک توسط قطار تفسیر می‌شود.",
      whyItHappens:
        "۱. شکستگی یا شل شدن کابل‌های اتصال باند به ریل ۲. اتصال کوتاه ناخواسته بین دو ریل ناشی از براده‌های آهن حاصل از ترمزگیری قطارها ۳. رطوبت و لجن‌گرفتگی شدید خط و کاهش مقاومت بالاست به زیر ۱.۵ اهم بر کیلومتر ۴. سوختن خازن‌های تنظیم در واحد TU پای ریل.",
    },
    symptomsAndAlarms: {
      occDisplay: "خط مربوط به بلاک در مانیتور CTC قرمز رنگ می‌شود (نمایش حضور قطار شبح‌گونه).",
      dmiDisplay: "قطارهای پشت سر با رسیدن به این بلاک سقف سرعت 0km/h دریافت می‌کنند.",
      hardwareLeds: "روی کارت TCR در راک سالن علائم، چراغ سبز CLEAR خاموش و چراغ قرمز OCCUPIED روشن می‌گردد.",
      relayStates: "رله مربوط به تراک (TPR) قطع (De-energized) می‌گردد.",
    },
    failSafeAutomatedReaction: {
      systemAction: "اینترلاکینگ بلاک را اشغال فرض کرده و از تشکیل هرگونه مسیر متقاطع یا ورود قطار بعدی ممانعت می‌ورزد.",
      trainSpeedEffect: "قطار در حال تقرب با فرمان سیستم ATP تا پیش از مرز بلاک متوقف می‌شود.",
      signalsState: "سیگنال ورودی بلاک قرمز ثابت می‌شود.",
    },
    stepByStepRemediation: [
      {
        step: 1,
        action: "تطبیق تصویری دوربین‌های مداربسته CCTV سالن کنترل با گراف حرکت جهت اطمینان ۱۰۰٪ از عدم حضور فیزیکی واگن روی خط.",
        precautions: "هیچ فرمانی برای عبور قطار صادر نشود تا اطمینان چشمی حاصل گردد.",
      },
      {
        step: 2,
        action: "اندازه‌گیری ولتاژ فرکانس صوتی با مولتی‌متر فرکانسی در ورودی کارت TCR راک و خروجی واحد TU کنار خط.",
        toolsRequired: "اسیلوسکوپ دستی یا مولتی‌متر فرکانس‌دار کالیبره",
        precautions: "اندازه‌گیری پالس‌های FSK بدون قطع مدار.",
      },
      {
        step: 3,
        action: "بررسی کابل‌های باند و نظافت محدوده ریل از براده‌های فلزی و تخلیه آب زیر ریل‌ها.",
        toolsRequired: "برس صنعتی ضد براده، ابزار آچارکشی اتصالات ریل",
        precautions: "استفاده از کفش و تجهیزات عایق جریان الکتریکی.",
      },
    ],
    postIncidentRecovery: "رسیدن ولتاژ ریل به سطح نامی، جذب مجدد رله TPR و سبز شدن بلاک در پانل CTC.",
    relatedArticleId: "track-circuits-loop",
    relatedSectionId: "maftc-block-diagram-working-principle",
    relatedRackId: "SER01-RACK-02",
  },

  {
    id: "inc-train-lost-ctc",
    code: "ERR-CTC-01",
    title: "مفقود شدن شناسه و تعقیب قطار در مرکز کنترل ترافیک (Train Lost Event)",
    titleEn: "Train Identity Lost in CTC / Tracking Discontinuity",
    category: "شبکه و مخابرات",
    severity: "شدید (Major)",
    affectedComponents: [
      "سرویس تعقیب و توصیف قطار (Train Describer - TD)",
      "سرور اصلی کنترل و پایش (CM Server)",
      "سیستم اینترلاکینگ EIL",
    ],
    safetyStandardClause: "CENELEC EN 50128 Supervisory Traffic Software Specifications",
    rootCausesReasoning: {
      primaryCause: "عدم تطابق پیوسته اشغال و آزادی متوالی تراک‌ها با شماره و توالی ثبت‌شده برای آن قطار در دیتابیس CTC.",
      underlyingPhysicsOrLogic:
        "سرویس Train Describer با فرض حرکت پیوسته قطار از بلاک N به بلاک N+1 شناسه قطار (مثلاً T104) را جابجا می‌کند. اگر قطاری بدون آزاد شدن بلاک قبلی ناگهان در بلاک دورتر دیده شود یا در حین مانور خاموش گردد، پیوستگی منطقی از بین رفته و سیستم برای جلوگیری از اشتباه اپراتور، وضعیت Train Lost صادر می‌کند.",
      whyItHappens:
        "پرش ناگهانی سیگنال تراک (Bobbing Track)، جابجایی دستی واگن‌ها بدون ثبت در سیستم برنامه‌ریزی، قطع موقت ارتباط شبکه بین اتاق سرور OCC و ایستگاه مربوطه، یا خاموش کردن کابین پیشرو قبل از توقف کامل.",
    },
    symptomsAndAlarms: {
      occDisplay: "شماره قطار در صفحه CTC به رنگ قرمز با علامت سوال '?????' درآمده و آلارم 'TRAIN LOST AT BLOCK xxx' صادر می‌شود.",
      dmiDisplay: "نمایشگر راهبر تحت تاثیر قرار نمی‌گیرد چون سیستم ATP ایمنی محلی را مستقل تضمین می‌کند.",
    },
    failSafeAutomatedReaction: {
      systemAction: "سرویس مسیرسازی خودکار (ARS) برای این قطار بلافاصله تعلیق می‌شود تا دیسپاچر وضعیت را دستی بررسی کند.",
      trainSpeedEffect: "سیستم ATP onboard به نظارت سرعت ادامه می‌دهد و تغییری در ایمنی رخ نمی‌دهد.",
      signalsState: "سیگنال‌های مسیرسازی خودکار متوقف شده و نیاز به تایید دستی دارند.",
    },
    stepByStepRemediation: [
      {
        step: 1,
        action: "تماس بی‌سیم دیسپاچر با لکوموتیوران جهت تایید موقعیت دقیق مکانی و شماره رام قطار.",
        precautions: "دریافت موقعیت دقیق بر اساس تابلوی کیلومتراژ تونل.",
      },
      {
        step: 2,
        action: "استفاده از ابزار 'Manual Train Description' در نرم‌افزار Control Panel مرکز برای تخصیص مجدد شماره قطار روی بلاک اشغال‌شده فعلی.",
        toolsRequired: "مجوز و رمز دسترسی دیسپاچر ارشد در Workstation 1",
        precautions: "اطمینان از اینکه هیچ قطار دیگری با آن شماره در خط ثبت نشده باشد.",
      },
      {
        step: 3,
        action: "فعال‌سازی مجدد روتینگ اتوماتیک ARS پس از احراز هویت قطار.",
        precautions: "نظارت بر اولین عبور از بلاک بعدی برای اطمینان از صحت زنجیره تعقیب.",
      },
    ],
    postIncidentRecovery: "تطابق کامل گراف حرکت Train Graph با مسیر واقعی ناوگان و محو شدن نشانگر هشدار.",
    relatedArticleId: "ctc-system",
    relatedSectionId: "ctc-train-describer",
    relatedRackId: "CER-RACK-01",
  },

  {
    id: "inc-esp-platform-button",
    code: "ERR-SEC-01",
    title: "فشردن شستی توقف اضطراری سکو توسط مسافر (Emergency Stop Pushbutton - ESP)",
    titleEn: "Platform ESP Activation / Vital Passenger Emergency Trip",
    category: "سیگنالینگ و اینترلاکینگ",
    severity: "بحرانی (Critical)",
    affectedComponents: [
      "شستی قارچی ESP سکو",
      "کارت‌های ورودی دیجیتال ایمن در کابینت TFC",
      "اینترلاکینگ الکترونیکی EIL",
      "سیستم کدهای سرعت ATP",
    ],
    safetyStandardClause: "CENELEC EN 50126/EN 50129 Passenger Platform Safety Requirements",
    rootCausesReasoning: {
      primaryCause: "فشردن یکی از دو شستی اضطراری نصب‌شده روی سکوی ایستگاه به دلیل سقوط مسافر روی ریل یا خطر فوری تصادم.",
      underlyingPhysicsOrLogic:
        "مدار شستی‌های ESP به صورت مدار بسته نرمال (Normally Closed - Fail-Safe) طراحی شده است. هرگونه قطع شدن این حلقه، به منزله درخواست فوری ترمز اضطراری برای تمام قطارهایی است که در حال ورود به ایستگاه هستند یا در سکو متوقف می‌باشند.",
      whyItHappens:
        "سقوط فرد روی خط ریل، گیر کردن مسافر لای درهای قطار، ورود شیء خارجی به حریم سکو، یا فعال‌سازی غیرعمدی و کنجکاوی.",
    },
    symptomsAndAlarms: {
      occDisplay: "آلارم سرخ سراسری با صدای بوق ممتد: 'EMERGENCY STOP BUTTON ACTIVE - PLATFORM X'.",
      dmiDisplay: "آلارم 'Platform Emergency Trip' و سقف سرعت بلافاصله به 0km/h تغییر می‌کند.",
      hardwareLeds: "ال‌ای‌دی کانال ورودی ESP روی کارت ورودی ایمن TFC خاموش می‌شود.",
    },
    failSafeAutomatedReaction: {
      systemAction: "اینترلاکینگ بی‌درنگ کدهای سرعت مجاز تمام بلاک‌های ایستگاه و بلاک‌های تقرب پیش از ایستگاه را صفر می‌کند.",
      trainSpeedEffect: "قطارهای در حال تقرب یا حرکت با ترمز اضطراری حداکثر ترمز (EB) متوقف می‌شوند و قطار متوقف در سکو اجازه حرکت دریافت نمی‌کند.",
      signalsState: "چراغ‌های ورودی سکو بلافاصله قرمز می‌شوند.",
    },
    stepByStepRemediation: [
      {
        step: 1,
        action: "بررسی فوری وضعیت سکو و ریل توسط مامور ایستگاه و دوربین مداربسته CCTV.",
        precautions: "اطمینان قطعی از نجات مسافر و عدم حضور فرد روی ریل.",
      },
      {
        step: 2,
        action: "آزادسازی فیزیکی شستی قارچی ESP با چرخاندن سر شستی در جهت عقربه‌های ساعت با کلید مخصوص مامور ایستگاه.",
        toolsRequired: "کلید ویژه ریست شستی ESP",
        precautions: "فقط مامور ارشد ایستگاه مجاز به چرخاندن و ریست شستی است.",
      },
      {
        step: 3,
        action: "صدور فرمان بازنشانی منطقی وضعیت سکو از طرف دیسپاچر مرکز کنترل CTC.",
        precautions: "بررسی سلامت ترمز قطارهای متوقف‌شده و هماهنگی بیسیم با لکوموتیورانان.",
      },
    ],
    postIncidentRecovery: "آزاد شدن مدارهای ترمز، تزریق مجدد کدهای سرعت ATP به ریل و از سرگیری حرکت مسافرگیری.",
    relatedArticleId: "railway-signaling",
    relatedSectionId: "station-technical-matrix",
  },

  {
    id: "inc-ptp-clock-drift",
    code: "ERR-NET-02",
    title: "خطای عدم تطابق زمانی و قطع همگام‌سازی ساعت PTP/NTP در سرورهای CTC",
    titleEn: "PTP / IEEE 1588 Clock Synchronization Failure & NTP Drift",
    category: "شبکه و مخابرات",
    severity: "متوسط (Moderate)",
    affectedComponents: [
      "سرور ساعت مرکزی تایم‌سرور GPS/GLONASS در رک CER-01",
      "پروتکل زمان‌بندی دقیق IEEE 1588 PTP",
      "سیستم ثبت وقایع و لاگر DiagRC سالن علائم",
      "پایگاه داده رخدادهای SCADA",
    ],
    safetyStandardClause: "CENELEC EN 50128 SIL 4 Event Logging & IEC 61588 Time Sync",
    rootCausesReasoning: {
      primaryCause: "انحراف زمانی (Clock Drift) بیش از ۵۰ میلی‌ثانیه بین ایستگاه‌های کاری OCC و کنترلرهای اینترلاکینگ به دلیل نقص آنتن GPS یا سوئیچ‌های PTP.",
      underlyingPhysicsOrLogic:
        "در سیستم‌های ایمنی ریلی و مانیتورینگ بلادرنگ، تطابق ترتیب رویدادها (Sequence of Events - SOE) برای ریشه‌یابی خطاها و تایید اعتبار بسته‌های ارتباطی ایمن EN 50159 به برچسب‌های زمانی میلی‌ثانیه‌ای دقیق وابسته است. در صورت اختلاف زمانی، بسته‌های پیام منقضی (Stale) ارزیابی شده و رد می‌شوند.",
      whyItHappens:
        "قطع کابل کواکسیال آنتن GPS روی بام ساختمان مرکزی، قطع برق تغذیه تایم‌سرور اصلی و عدم انتقال خودکار به تایم‌سرور پشتیبان، یا فیلتر شدن پورت‌های UDP 123/319 توسط پیکربندی اشتباه فایروال.",
    },
    symptomsAndAlarms: {
      occDisplay: "آلارم زرد رنگ در گوشه نوار وظیفه سرورها: 'TIME SYNC DRIFT > 50ms - CHECK MASTER CLOCK'.",
      dmiDisplay: "پیام تاخیر داده‌های رادیویی با ثبت آیکون ساعت زرد رنگ در گوشه DMI.",
      hardwareLeds: "ال‌ای‌دی LOCK روی یونیت تایم‌سرور ۱ یونیت رک CER-01 از حالت سبز به قرمز چشمک‌زن تغییر می‌کند.",
    },
    failSafeAutomatedReaction: {
      systemAction: "سیستم به ساعت کریستالی داخلی پایداری بالا (OCXO Holdover) شیفت می‌کند و لاگ‌های خطا را با علامت هشدار برچسب می‌زند.",
      trainSpeedEffect: "تغییری در سرعت قطارها رخ نمی‌دهد مگر اینکه انحراف به آستانه بحرانی رد پیام‌های ایمن برسد.",
      signalsState: "سیگنال‌ها وضعیت فعلی را حفظ می‌کنند.",
    },
    stepByStepRemediation: [
      {
        step: 1,
        action: "بررسی وضعیت دریافت ماهواره‌های GPS روی پنل تایم‌سرور رک CER-RACK-01 (حداقل دریافت ۴ ماهواره الزامی است).",
        precautions: "عدم تغییر دستی تاریخ و ساعت سیستم بدون تایید سوپروایزر مرکز کنترل.",
      },
      {
        step: 2,
        action: "تست کابل کواکسیال RG-58 آنتن تا تایم‌سرور و بررسی آمپلی‌فایر خطی آنتن.",
        toolsRequired: "سیگنال‌تستر RF یا مولتی‌متر جهت تست ولتاژ ۵ ولت بایاس آنتن فعال",
        precautions: "محافظت در برابر تخلیه بار صاعقه در مسیر آنتن.",
      },
      {
        step: 3,
        action: "اجرای فرمان ntpq -p و بررسی وضعیت همگام‌سازی در سوئیچ‌های هیرشمان و سرورهای DiagRC.",
        toolsRequired: "دسترسی کنسول SSH به سوئیچ‌های رینگ",
        precautions: "اطمینان از پیکربندی صحیح NTP Stratum 1/2.",
      },
    ],
    postIncidentRecovery: "پایدار شدن وضعیت تایم‌سرور در مد Locked و سینک شدن زمان تمام ۲۱ رک ایستگاهی با خطای زیر ۵۰۰ میکروثانیه.",
    relatedArticleId: "ctc-system",
    relatedSectionId: "ctc-apps-diag-playback-scheduler",
    relatedRackId: "CER-RACK-01",
  },

  {
    id: "inc-broadcast-storm",
    code: "ERR-NET-03",
    title: "طوفان برودکست و قفل شدن پورت‌های سوئیچ‌های شبکه به دلیل لوپ اترنت (Broadcast Storm)",
    titleEn: "Broadcast Storm & Layer-2 Loop in Signaling Switch Network",
    category: "شبکه و مخابرات",
    severity: "بحرانی (Critical)",
    affectedComponents: [
      "سوئیچ‌های شبکه صنعتی Hirschmann RS20/RS30",
      "ماژول‌های اترنت کارت‌های VPU اینترلاکینگ",
      "پورت‌های ارتباطی SCADA و CTC",
    ],
    safetyStandardClause: "CENELEC EN 50159 Category 1 Closed Network Determinism",
    rootCausesReasoning: {
      primaryCause: "ایجاد چرخه فیزیکی بدون کنترل (Loop) در سوییچ‌ها ناشی از اتصال نادرست پچ‌کورد RJ-45 یا غیرفعال شدن مکانیزم Storm Control.",
      underlyingPhysicsOrLogic:
        "در شبکه‌های اترنت بدون پروتکل مهار لوپ، بسته‌های برودکست ARP و دیسکاوری به صورت تصاعدی تکثیر شده و پهنای باند پورت‌ها را تا ۱۰۰٪ اشغال می‌کنند. این امر موجب تاخیر بیش از حد مجاز در تبادل فریم‌های ویتال ایمنی اینترلاکینگ می‌گردد.",
      whyItHappens:
        "اتصال همزمان دو کابل شبکه بین دو سوئیچ توسط تکنسین بدون فعال بودن RSTP/MRP، نقص فریمور سوئیچ صنعتی یا قطعی پورت محافظت‌شده رینگ نوری.",
    },
    symptomsAndAlarms: {
      occDisplay: "قطع ارتباط همزمان تله‌متری چندین ایستگاه و کندی شدید رابط کاربری دیسپاچینگ CTC.",
      hardwareLeds: "کلیه چراغ‌های پورت‌های اترنت روی سوئیچ‌های هیرشمان با فرکانس بسیار بالا به صورت پیوسته چشمک می‌زنند (Solid Flickering).",
    },
    failSafeAutomatedReaction: {
      systemAction: "مکانیزم Rate Limiter سخت‌افزاری سوئیچ‌ها پورت‌های متخلف را وارد وضعیت Error-Disabled می‌کند.",
      trainSpeedEffect: "در صورت قطع بسته‌های ایمن بین TFC و اینترلاکینگ، قطارهای محدوده تحت پوشش به سرعت توقف ایمن هدایت می‌شوند.",
      signalsState: "چراغ‌های سیگنال ایستگاه مربوطه به حالت قرمز Fail-Safe می‌روند.",
    },
    stepByStepRemediation: [
      {
        step: 1,
        action: "شناسایی سوئیچی که دارای بیشترین بار پردازشی و مصرف پهنای باند است از طریق کنسول HiView هیرشمان.",
        precautions: "عدم ریست همزمان تمام سوئیچ‌ها برای حفظ سابقه رویدادها.",
      },
      {
        step: 2,
        action: "جدا کردن موقت پچ‌کوردهای مشکوک تا قطع شدن طوفان بسته‌ها و بازگشت ترافیک به حالت عادی.",
        toolsRequired: "نرم‌افزار آنالیز شبکه Wireshark جهت شناسایی منشا مک‌آدرس متخلف",
        precautions: "علامت‌گذاری دقیق پورت‌ها قبل از جداسازی کابل.",
      },
      {
        step: 3,
        action: "فعال‌سازی و تایید آستانه Storm Control روی سوئیچ‌ها (محدودسازی به حداکثر ۲٪ ظرفیت پورت).",
        precautions: "ذخیره کانفیگ در حافظه پایدار سوئیچ (Save NVRAM).",
      },
    ],
    postIncidentRecovery: "تثبیت مصرف پهنای باند پورت‌ها زیر ۵٪ و بازیابی تبادل پایدار بسته‌های اینترلاکینگ بدون کوچکترین پکت‌لاس.",
    relatedArticleId: "interlocking-atc-detail-design",
    relatedSectionId: "ilatc-hardware-specifications",
    relatedRackId: "SER01-RACK-01",
  },

  {
    id: "inc-track-circuit-shunt-fail",
    code: "ERR-TRK-02",
    title: "خطای عدم شنت مدار راه ناشی از زنگ‌زدگی ریل یا فیلم عایق اکسید آهن (Rusty Rail Failure)",
    titleEn: "Loss of Shunt / High Rail-Wheel Contact Impedance Error",
    category: "تجهیزات خط و رک‌ها",
    severity: "بحرانی (Critical)",
    affectedComponents: [
      "مدار راه بدون درز MAFTC",
      "سطح تماس تاج ریل و طوقه چرخ قطار",
      "گیرنده فرکانسی MAFTC RX در رک SER-01",
    ],
    safetyStandardClause: "CENELEC EN 50129 SIL 4 & Shunt Sensitivity Standard EN 50617-2",
    rootCausesReasoning: {
      primaryCause: "افزایش مقاومت الکتریکی سطح تماس چرخ و ریل به بیش از ۰.۰۶ اهم (حداکثر مقاومت شنت استاندارد ریلی) به دلیل لایه اکسید آهن، برگ خشک یا آلودگی روغنی.",
      underlyingPhysicsOrLogic:
        "تشخیص حضور قطار در مدار راه بر مبنای اتصال کوتاه الکتریکی دو رشته ریل توسط محور فولادی قطار است. اگر لایه‌ای عایق روی ریل تشکیل شود، جریان مدار راه قطع نشده و سیستم قطار را 'نامرئی' تصور می‌کند (عدم افت رله)، که شدیدترین تهدید ایمنی تصادف است.",
      whyItHappens:
        "استفاده نشدن از خط برای چند روز (مثلاً خطوط مانوری دپو در تعطیلات)، رطوبت بالا و زنگ‌زدگی شدید تاج ریل، یا ریختن ماسه بیش از حد توسط سیستم ضدلغزش قطار.",
    },
    symptomsAndAlarms: {
      occDisplay: "عدم نمایش اشغالی بلاک در حالی که قطار فیزیکاً روی آن مستقر است؛ یا ناپدید شدن ناگهانی اشغالی در حین توقف قطار.",
      dmiDisplay: "ممکن است هشدار انحراف سرفاصله صادر شود.",
      hardwareLeds: "ال‌ای‌دی OCCUPIED روی کارت گیرنده MAFTC RX روشن نمی‌شود و همچنان CLEAR نشان می‌دهد.",
    },
    failSafeAutomatedReaction: {
      systemAction: "منطق اینترلاکینگ (Sequence Logic) ورود قطار به بلاک قبلی را پایش کرده و در صورت رد نشدن متوالی، بلاک مشکوک را وارد وضعیت 'حفاظت کاذب' می‌کند.",
      trainSpeedEffect: "کاهش اجباری سرعت کلیه قطارهای اعزامی بعدی در آن ناحیه به حالت مد دیداری.",
      signalsState: "سیگنال‌های اعزام قطار دوم قرمز نگاه داشته می‌شوند.",
    },
    stepByStepRemediation: [
      {
        step: 1,
        action: "اعزام درزین ریل‌ساب یا قطار مانوری سنگین جهت تمیزکاری مکانیکی تاج ریل (Rail Scuffing/Grinding).",
        precautions: "حرکت قطار فقط با اسکورت و در مد دیداری کمتر از ۱۵km/h انجام پذیرد.",
      },
      {
        step: 2,
        action: "تست حساسیت شنت مدار با شنت تستر استاندارد ۰.۰۶ اهم در نقاط ابتدایی، میانی و انتهایی بلاک.",
        toolsRequired: "شنت‌باکس کالیبره‌شده ۰.۰۶ اهم مجهز به کابل‌های با مقاومت صفر",
        precautions: "بررسی افت ولتاژ گیرنده به زیر آستانه ۵۰ میلی‌ولت هنگام شنت.",
      },
    ],
    postIncidentRecovery: "کسب تاییدیه حساسیت شنت پایدار در تمام نقاط بلاک و بازگشت عملکرد خودکار مدار راه.",
    relatedArticleId: "track-circuits-loop",
    relatedSectionId: "track-circuit-impedance-tuning",
    relatedRackId: "SER01-RACK-02",
  },

  {
    id: "inc-axle-counter-miscount",
    code: "ERR-AXL-01",
    title: "خطای ناهماهنگی شمارش محورها و قفل ماندن بلاک در سیستم محور شمار (Axle Miscount Lock)",
    titleEn: "Axle Counter Section Lock / Count Inconsistency Event",
    category: "سیگنالینگ و اینترلاکینگ",
    severity: "بحرانی (Critical)",
    affectedComponents: [
      "سنسور القایی تشخیص چرخ (Wheel Detection Head RPH)",
      "واحد ارزیاب داخلی محور شمار (Indoor Evaluator Unit)",
      "رله‌های ایمن قفل سرفصل در رک SER-01",
    ],
    safetyStandardClause: "CENELEC EN 50129 / EN 50128 Wheel Sensor Counting Integrity",
    rootCausesReasoning: {
      primaryCause: "عدم تطابق تعداد محورهای ورودی (IN-Count) با تعداد محورهای خروجی (OUT-Count) پس از خروج کامل قطار از بلاک.",
      underlyingPhysicsOrLogic:
        "واحد پردازش محور شمار تعداد پالس‌های دو سیستم سنسور ویگاند با ۹۰ درجه اختلاف فاز را شمارش می‌کند. چنانچه یک پالس به دلیل نویز الکترومغناطیسی یا لرزش ریل گم شود یا پالس اضافی ثبت گردد، حاصل جمع نهایی صفر نشده و بلاک در حالت 'اشغال ایمن' قفل باقی می‌ماند.",
      whyItHappens:
        "کج شدن سنسور روی ریل در اثر ضربه آویزهای ناوگان، تغییر فاصله هوایی Air Gap به دلیل خزش ریل در گرما، یا نویز شدید ناشی از سوئیچینگ چاپر تراکشن قطار.",
    },
    symptomsAndAlarms: {
      occDisplay: "بلاک در صفحه CTC به رنگ قرمز ممتد با علامت ستاره یا خطای 'AXLE MISCOUNT SEC-xx' باقی می‌ماند در حالی که قطار از آن خارج شده است.",
      dmiDisplay: "قطار بعدی در پشت چراغ قرمز مسدود می‌شود.",
      hardwareLeds: "روی کارت پردازشگر محور شمار در رک SER-01 ال‌ای‌دی COUNT ERROR قرمز می‌شود.",
    },
    failSafeAutomatedReaction: {
      systemAction: "بلاک مربوطه در وضعیت اشغال (Occupied) قفل می‌گردد و سیستم اجازه تشکیل مسیر بعدی را نمی‌دهد.",
      trainSpeedEffect: "قطار تعقیب‌کننده با دریافت کد سرعت صفر متوقف می‌گردد.",
      signalsState: "سیگنال محافظ ورودی بلاک قرمز ثابت باقی می‌ماند.",
    },
    stepByStepRemediation: [
      {
        step: 1,
        action: "تایید چشمی و دوربینی خروج کامل آخرین قطار از بلاک توسط دیسپاچر و بازرس ایستگاه.",
        precautions: "هیچ فرمانی بدون تایید اطمینان از تخلیه فیزیکی خط صادر نشود.",
      },
      {
        step: 2,
        action: "اجرای فرآیند دو مرحله‌ای ریست محور شمار (Cooperative Reset / Counting Reset) طبق پروتکل ایمنی با ورود دو پسورد مستقل مرکز و ایستگاه.",
        toolsRequired: "کلیدهای سوئیچ ریست سالن SER و پنل نرم‌افزاری CTC",
        precautions: "رعایت ماده ۴۳ آیین‌نامه ایمنی بازنشانی قطعات خط.",
      },
      {
        step: 3,
        action: "تنظیم زاویه و سفت کردن پیچ‌های مهار سنسور روی جان ریل با ترکمتر استاندارد (۴۵ نیوتن‌متر).",
        toolsRequired: "آچار ترکمتر کالیبره و فیلر سنجش فاصله ۴۲ میلی‌متر",
        precautions: "تست تقارن ولتاژ دو کانال القایی پس از محکم‌سازی.",
      },
    ],
    postIncidentRecovery: "انجام یک تردد آزمایشی یا عبور قطار اول با سرعت کنترل‌شده و آزادسازی اتوماتیک بلاک.",
    relatedArticleId: "axle-counter-system",
    relatedSectionId: "axle-counter-architecture",
    relatedRackId: "SER01-RACK-01",
  },

  {
    id: "inc-atp-signal-loss",
    code: "ERR-ATC-01",
    title: "قطع دریافت کدهای فرکانسی سرعت در آنتن پیکاپ کویل قطار و شیفت به کد صفر (Cab Signal Loss)",
    titleEn: "ATP Cab Signal Loss / Onboard Receiver Carrier Dropout",
    category: "ناوگان و ATP",
    severity: "شدید (Major)",
    affectedComponents: [
      "آنتن‌های گیرنده زیر شاسی قطار (Pickup Coils)",
      "کارت فیلتر باندگذر و تقویت‌کننده سیگنال onboard",
      "سیستم کنترل ترمز خودکار ATP",
      "نمایشگر کابین راننده (DMI)",
    ],
    safetyStandardClause: "CENELEC EN 50126/EN 50128 ATP Continuous Supervision Requirements",
    rootCausesReasoning: {
      primaryCause: "افت دامنه سیگنال فرکانسی جریان کددار ریل به کمتر از آستانه حساسیت آنتن‌های زیر قطار به مدت بیش از ۱.۵ ثانیه.",
      underlyingPhysicsOrLogic:
        "سیستم ATP قطار به صورت پیوسته نیازمند دریافت کدهای حامل مدوله شده صوتی از ریل است. طبق منطق ایمن Fail-Safe، قطع موقت یا دائم سیگنال بلافاصله به منزله کد سرعت صفر (حداکثر خطر) تفسیر شده و زمان مهلت واکنشی راهبر آغاز می‌شود.",
      whyItHappens:
        "عبور قطار از روی نقطه کور بدون تزریق کد (Neutral Section یا درز عایق معیوب)، شکستن پایه آنتن پیکاپ کویل زیر بوژی بر اثر برخورد اشیاء، یا افت توان فرستنده MAFTC TX در کابینت کنار خط.",
    },
    symptomsAndAlarms: {
      occDisplay: "آلارم 'Train xx Cab Signal Degraded' در صفحه رهگیری قطارها.",
      dmiDisplay: "نشانگر سرعت مجاز روی گیج سرعت خاموش شده و آلارم صوتی هشدار ممتد بیپ پخش می‌شود؛ علامت اخطار 'CODE LOSS'.",
      hardwareLeds: "روی رک onboard ATP در کابین راننده چراغ CARRIER OK خاموش می‌گردد.",
    },
    failSafeAutomatedReaction: {
      systemAction: "تایمر ایمن ۱.۵ ثانیه‌ای فعال شده و در صورت عدم بازگشت کد، سقف سرعت مجاز به 0km/h تقلیل می‌یابد.",
      trainSpeedEffect: "اگر راننده ظرف ۳ ثانیه واکنش نشان ندهد، ترمز سرویس کامل (FSB) یا ترمز اضطراری (EB) فعال می‌شود.",
      signalsState: "سیستم اینترلاکینگ وضعیت بلاک را همچنان اشغال حفظ می‌کند.",
    },
    stepByStepRemediation: [
      {
        step: 1,
        action: "راهبر قطار کلید تایید هوشیاری (Acknowledge) را فشرده و با مرکز فرمان تماس برقرار می‌نماید.",
        precautions: "حفظ آرامش مسافران و جلوگیری از توقف قطار در شیب تند تونل در صورت امکان.",
      },
      {
        step: 2,
        action: "تغییر مد کاری به مد رانندگی با دید دستی (Restricted Manual - RM) با کسب مجوز کتبی یا رادیویی از دیسپاچر مرکز.",
        precautions: "محدودیت سرعت اکید ۲۵ کیلومتر بر ساعت در مد RM.",
      },
      {
        step: 3,
        action: "بررسی فیزیکی کانکتورها و کابل شیلددار آنتن‌های پیکاپ کویل بوژی ۱ در اولین ایستگاه پایانی.",
        toolsRequired: "تستر مقاومت اهمی کویل آنتن (حدود ۱۰ تا ۲۰ اهم)",
        precautions: "قطع برق ترن پیش از لمس ادوات زیر شاسی.",
      },
    ],
    postIncidentRecovery: "تست دریافت کد در بلاک آزمایشی و بازگشت به مد بهره‌برداری خودکار ATO/CM.",
    relatedArticleId: "atc-system",
    relatedSectionId: "operating-modes-transitions",
  },

  {
    id: "inc-rack-overheating",
    code: "ERR-RCK-01",
    title: "افزایش دمای بحرانی در رک ۴۲ یونیت اتاق علائم SER و خطر خاموشی اضطراری (Rack Thermal Alarm)",
    titleEn: "42U Equipment Rack Thermal Overheating & High Temp Alert",
    category: "تجهیزات خط و رک‌ها",
    severity: "شدید (Major)",
    affectedComponents: [
      "پنل تهویه سقفی ۴ فن ۴۲ یونیت",
      "واحدهای پردازش سه‌گانه VPU در رک SER-01",
      "سنسورهای مانیتورینگ حرارتی PDU",
      "سیستم تهویه مطبوع HVAC اتاق علائم",
    ],
    safetyStandardClause: "IEC 60297 Mechanical Structures & EN 50125-3 Signaling Environmental Spec",
    rootCausesReasoning: {
      primaryCause: "رسیدن دمای هوای داخل ساب‌رک‌های اینترلاکینگ به بیش از ۵۵ درجه سلسیوس ناشی از خرابی فن‌های رک یا کرش چیلر سالن SER.",
      underlyingPhysicsOrLogic:
        "پردازنده‌های صنعتی ریلی در دمای بالاتر از ۶۵ درجه دچار پدیده Thermal Throttling و خطاهای بیتی در حافظه‌های ECC RAM می‌گردند که منجر به مغایرت در رای‌گیری 2oo3 و ریست محافظتی پردازنده می‌شود.",
      whyItHappens:
        "سوختن موتور فن‌های مکنده سقف رک، مسدود شدن توری‌های فیلتر گرد و غبار با پرز و آلودگی، یا خروج یکی از دو دستگاه کولر گازی اتاق علائم از مدار در فصل تابستان.",
    },
    symptomsAndAlarms: {
      occDisplay: "آلارم محیطی SCADA: 'HIGH TEMPERATURE WARNING - SER ROOM 01 T > 45C'.",
      hardwareLeds: "ال‌ای‌دی TEMP روی نمایشگر سنسور PDU و کنترلر مانیتورینگ رک قرمز شده و بوق آلارم محلی فعال می‌شود.",
    },
    failSafeAutomatedReaction: {
      systemAction: "سیستم مانیتورینگ وضعیت به صورت خودکار فن‌های رزرو را با حداکثر دور فعال می‌کند و آلارم فوری به تکنسین مقیم ارسال می‌نماید.",
      trainSpeedEffect: "تا قبل از خاموشی سیستم تاثیری ندارد؛ در صورت خاموشی پردازنده‌ها، تمام قطارهای منطقه متوقف می‌شوند.",
      signalsState: "پایدار تا زمان ادامه کار پردازنده‌ها.",
    },
    stepByStepRemediation: [
      {
        step: 1,
        action: "اعزام فوری تکنسین تاسیسات به سالن SER و بررسی دستگاه‌های خنک‌کننده پشتیبان HVAC.",
        precautions: "باز کردن درب‌های مشبک جلو و عقب رک جهت برقراری جریان هوای طبیعی سالن.",
      },
      {
        step: 2,
        action: "بررسی گردش فن‌های سقف رک و تعویض ماژول سینی فن در صورت گریپاژ یاتاقان فن‌ها.",
        toolsRequired: "یونیت فن یدکی ۴ تایی رک ۱۹ اینچ، دماسنج مادون قرمز کالیبره",
        precautions: "استفاده از دستکش کار برای باز کردن پیچ‌های براکت سینی فن.",
      },
    ],
    postIncidentRecovery: "افت دمای رک به زیر ۲۸ درجه سلسیوس و پاک شدن آلارم‌های مانیتورینگ SCADA.",
    relatedArticleId: "interlocking-atc-detail-design",
    relatedSectionId: "ilatc-hardware-specifications",
    relatedRackId: "SER01-RACK-01",
  },

  {
    id: "inc-ups-dc-bus-fail",
    code: "ERR-PWR-01",
    title: "خطای سوئیچ منبع تغذیه دوبل (STS) و افت ولتاژ در باس ۱۱۰ ولت DC سالن علائم (DC Bus Undervoltage)",
    titleEn: "Dual-Feeder UPS Static Transfer Switch (STS) Failure & DC Bus Sag",
    category: "تغذیه و توان",
    severity: "بحرانی (Critical)",
    affectedComponents: [
      "سوئیچ انتقال استاتیک خودکار (STS)",
      "اینورترهای دوبل ماژولار UPS صنعتی ۱۰kVA",
      "رک توزیع توان جریان مستقیم (PDC)",
      "رله‌های مدارات اینترلاکینگ",
    ],
    safetyStandardClause: "CENELEC EN 50125-1 Signaling Power Supply & EN 50129 Fail-Safe Power Principles",
    rootCausesReasoning: {
      primaryCause: "سوختن تریستورهای سوئیچ انتقال استاتیک یا قطعی ارتباط فاز منابع تغذیه اصلی و رزرو، همراه با افت ولتاژ باس DC به کمتر از ۸۵ ولت.",
      underlyingPhysicsOrLogic:
        "رله‌های ایمن نوع ویتال و بردهای اینترلاکینگ برای باقی ماندن در وضعیت جذب (Energized) نیازمند ولتاژ پایدار ۱۱۰VDC با ریپل کمتر از ۲٪ هستند. افت ولتاژ ناگهانی باعث سقوط رله‌های حساس و ریست شدن منابع تغذیه سوئیچینگ (SMPS) پردازنده‌ها می‌گردد.",
      whyItHappens:
        "خرابی شارژر باتری اصلی در زمان تست دوره‌ای، فرسودگی سلول‌های باتری اسیدی، یا اتصال کوتاه در کابل‌های خروجی مدارات فیلد.",
    },
    symptomsAndAlarms: {
      occDisplay: "آلارم بحرانی قرمز در مرکز کنترل: 'MAJOR POWER FAULT: SER-01 DC BUS UNDERVOLTAGE'.",
      hardwareLeds: "ال‌ای‌دی‌های خطای اینورتر و آلارم باتری روی تابلوی توزیع PDC قرمز و بوق سیرن به صدا درمی‌آید.",
    },
    failSafeAutomatedReaction: {
      systemAction: "رله‌های ویتال سقوط کرده و طبق قاعده Fail-Safe کلیه سیگنال‌ها در وضعیت قرمز ایمن قفل می‌شوند.",
      trainSpeedEffect: "قطارها به دلیل قطع تغذیه مدارهای راه MAFTC فوراً ترمز اضطراری می‌کنند.",
      signalsState: "خاموش شدن موقت یا قرمز شدن سراسری چراغ‌های سیگنال.",
    },
    stepByStepRemediation: [
      {
        step: 1,
        action: "سوئیچ دستی بای‌پس مکانیکی (Maintenance Bypass Switch) روی پنل UPS جهت اتصال مستقیم به مسیر تغذیه کمکی ترانس ایزوله.",
        precautions: "رعایت قواعد هم‌فاز بودن و پرهیز از سوئیچ زودهنگام در صورت وجود اتصال کوتاه در خط.",
      },
      {
        step: 2,
        action: "ایزوله کردن بانک باتری معیوب از طریق بریکر اصلی باتری و بررسی ولتاژ تک تک سلول‌ها.",
        toolsRequired: "تستر باتری صنعتی، ولت‌متر True-RMS، دستکش و عینک عایق ولتاژ",
        precautions: "مراقبت در برابر خطرات جرقه DC و گاز هیدروژن باتری‌خانه.",
      },
    ],
    postIncidentRecovery: "تثبیت ولتاژ خروجی روی ۱۱۵VDC و شارژ کامل باتری‌ها و راه‌اندازی گام‌به‌گام رله‌ها.",
    relatedArticleId: "interlocking-atc-detail-design",
    relatedSectionId: "ilatc-interlocking-hardware-2oo3",
    relatedRackId: "SER01-RACK-02",
  },

  {
    id: "inc-vpu-tmr-discordance",
    code: "ERR-VPU-01",
    title: "مغایرت خروجی در پردازنده‌های سه‌گانه 2oo3 اینترلاکینگ و ایزولاسیون برخط پردازنده خطادار (VPU Disagreement)",
    titleEn: "2oo3 TMR Processor Discordance & On-line Faulty Channel Isolation",
    category: "سیگنالینگ و اینترلاکینگ",
    severity: "متوسط (Moderate)",
    affectedComponents: [
      "واحدهای پردازش ایمن VPU-A، VPU-B و VPU-C در رک SER-01",
      "مدار رای‌گیری سخت‌افزاری 2oo3 Voter",
      "کارت باس رابط ایمن F-Bus",
    ],
    safetyStandardClause: "CENELEC EN 50128 SIL 4 Triple Modular Redundancy (TMR)",
    rootCausesReasoning: {
      primaryCause: "تولید خروجی منطقی متفاوت توسط یکی از سه پردازنده (مثلاً VPU-B) در مقایسه با دو پردازنده دیگر در یک چرخه اسکن ۲۰ میلی‌ثانیه‌ای.",
      underlyingPhysicsOrLogic:
        "معماری 2oo3 برای تداوم عملیات بدون وقفه بر مبنای رای اکثریت کار می‌کند. اگر دو پردازنده رای موافق دهند و یک پردازنده به دلیل خطای رم یا پردازشگر متفاوت باشد، مدار رای‌گیری به کار ادامه می‌دهد اما پردازنده اقلیت را بلافاصله برای بررسی ایزوله می‌کند.",
      whyItHappens:
        "خطای تصادفی Single Event Upset (SEU) ناشی از نویز یا امواج الکترومغناطیسی روی حافظه RAM پردازنده، یا داغ شدن موقت یکی از بردهای پردازنده.",
    },
    symptomsAndAlarms: {
      occDisplay: "آلارم نگهداری زرد رنگ: 'Interlocking Redundancy Degraded: VPU-B Isolated, System Running in 2oo2 Mode'. ترافیک قطارها بدون کوچکترین وقفه‌ای ادامه دارد.",
      hardwareLeds: "روی کارت VPU-B در ساب‌رک SER-01 ال‌ای‌دی DISAGREE و FAULT به رنگ قرمز درمی‌آید و کارت‌های VPU-A و VPU-C سبز ممتد باقی می‌مانند.",
    },
    failSafeAutomatedReaction: {
      systemAction: "مدار رای‌گیری بدون تاخیر خروجی پردازنده B را قطع کرده و منطق سیستم را به ساختار 2oo2 Fail-Safe منتقل می‌کند.",
      trainSpeedEffect: "هیچ تاثیری بر حرکت یا سرعت قطارها ندارد (تداوم سرویس صد در صد).",
      signalsState: "کلیه سیگنال‌ها عملکرد عادی خود را حفظ می‌نمایند.",
    },
    stepByStepRemediation: [
      {
        step: 1,
        action: "استخراج لاگ تفصیلی خطا از پورت سریال دیباگ کارت VPU-B از طریق لپ‌تاپ نگهداری DiagPC.",
        precautions: "عدم ریست کل سیستم اینترلاکینگ؛ فقط پردازنده ایزوله‌شده بررسی گردد.",
      },
      {
        step: 2,
        action: "اجرای فرآیند همگام‌سازی مجدد برخط (On-line Re-synchronization) از طریق نرم‌افزار تشخیصی مهندسی.",
        toolsRequired: "نرم‌افزار مهاران DiagMaster و کابل سریال ایزوله RS-422",
        precautions: "بررسی تطابق کامل چک‌سام نسخه نرم‌افزار فریمور با دو پردازنده دیگر.",
      },
      {
        step: 3,
        action: "در صورت تکرار خطا، تعویض گرم (Hot-Swap) برد پردازنده VPU-B با ماژول یدکی کالیبره.",
        precautions: "بستن مچ‌بند ضد الکتریسیته ساکن (ESD Wrist Strap) قبل از لمس برد.",
      },
    ],
    postIncidentRecovery: "پایان همگام‌سازی، بازگشت ال‌ای‌دی VPU-B به حالت سبز و احیای مجدد معماری کامل 2oo3 با پایداری حداکثری.",
    relatedArticleId: "interlocking-atc-detail-design",
    relatedSectionId: "ilatc-interlocking-hardware-2oo3",
    relatedRackId: "SER01-RACK-01",
  },
];

