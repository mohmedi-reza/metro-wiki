import React, { useState, useEffect, useMemo } from "react";
import {
  QuizQuestion,
  QUIZ_QUESTIONS,
  QUIZ_CATEGORIES,
} from "../../data/quizAndFlashcardsData";
import {
  Award,
  Clock,
  CheckCircle2,
  XCircle,
  HelpCircle,
  RotateCcw,
  Bookmark,
  ChevronRight,
  ChevronLeft,
  Filter,
  BarChart3,
  Printer,
  Sparkles,
  FileCheck2,
  AlertTriangle,
  Play,
  ArrowRight,
  Layers,
  Search,
} from "lucide-react";
import { cn } from "../../lib/utils";

interface ExamResult {
  id: string;
  date: string;
  modeTitle: string;
  totalQuestions: number;
  correctCount: number;
  scorePercentage: number;
  passed: boolean;
  timeSpentSeconds: number;
}

const EXAM_HISTORY_KEY = "daneshnamak_exam_history";

interface ProfessionalExamProps {
  onNavigateToArticle?: (articleId: string) => void;
  onBack?: () => void;
}

export const ProfessionalExam: React.FC<ProfessionalExamProps> = ({
  onNavigateToArticle,
  onBack,
}) => {
  // Screens: 'intro' | 'exam' | 'results' | 'history'
  const [screen, setScreen] = useState<"intro" | "exam" | "results" | "history">("intro");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [examMode, setExamMode] = useState<"standard" | "category" | "quick">("standard");

  // Active exam state
  const [activeQuestions, setActiveQuestions] = useState<QuizQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [userAnswers, setUserAnswers] = useState<Record<string, number>>({});
  const [flaggedQuestionIds, setFlaggedQuestionIds] = useState<Record<string, boolean>>({});
  const [timeRemainingSeconds, setTimeRemainingSeconds] = useState<number>(0);
  const [isTimerPaused, setIsTimerPaused] = useState<boolean>(false);
  const [totalExamTimeSeconds, setTotalExamTimeSeconds] = useState<number>(0);

  // Review & Certificate modal
  const [reviewFilter, setReviewFilter] = useState<"all" | "wrong" | "correct" | "flagged">("all");
  const [candidateName, setCandidateName] = useState<string>("مهندس کنترل و سیگنالینگ");
  const [showCertificateModal, setShowCertificateModal] = useState<boolean>(false);

  // History from localStorage
  const [examHistory, setExamHistory] = useState<ExamResult[]>(() => {
    try {
      const saved = localStorage.getItem(EXAM_HISTORY_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return [];
  });

  // Start exam handler
  const startExam = (mode: "standard" | "category" | "quick", categoryId: string = "all") => {
    let pool = [...QUIZ_QUESTIONS];
    if (categoryId !== "all") {
      pool = pool.filter((q) => q.category === categoryId);
    }

    // Shuffle
    const shuffled = pool.sort(() => Math.random() - 0.5);

    let count = 15;
    let timeMinutes = 20;

    if (mode === "quick") {
      count = 5;
      timeMinutes = 6;
    } else if (mode === "category") {
      count = Math.min(pool.length, 12);
      timeMinutes = Math.max(8, Math.round(count * 1.3));
    } else {
      // standard comprehensive
      count = Math.min(shuffled.length, 15);
      timeMinutes = 20;
    }

    const selected = shuffled.slice(0, count);
    setActiveQuestions(selected);
    setCurrentIndex(0);
    setUserAnswers({});
    setFlaggedQuestionIds({});
    setTimeRemainingSeconds(timeMinutes * 60);
    setTotalExamTimeSeconds(timeMinutes * 60);
    setIsTimerPaused(false);
    setExamMode(mode);
    setScreen("exam");
  };

  // Timer effect
  useEffect(() => {
    if (screen !== "exam" || isTimerPaused) return;

    const timer = setInterval(() => {
      setTimeRemainingSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          finishExam();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [screen, isTimerPaused]);

  // Finish exam
  const finishExam = () => {
    setScreen("results");

    // Calculate score
    let correct = 0;
    activeQuestions.forEach((q) => {
      if (userAnswers[q.id] === q.correctAnswer) {
        correct++;
      }
    });

    const scorePct = Math.round((correct / activeQuestions.length) * 100);
    const passed = scorePct >= 70;
    const timeSpent = totalExamTimeSeconds - timeRemainingSeconds;

    const newResult: ExamResult = {
      id: `exam-${Date.now()}`,
      date: new Date().toLocaleDateString("fa-IR"),
      modeTitle:
        examMode === "standard"
          ? "آزمون جامع استاندارد"
          : examMode === "quick"
          ? "آزمون سریع ۵ سوالی"
          : `آزمون مبحث ${QUIZ_CATEGORIES.find((c) => c.id === selectedCategory)?.label || ""}`,
      totalQuestions: activeQuestions.length,
      correctCount: correct,
      scorePercentage: scorePct,
      passed,
      timeSpentSeconds: timeSpent,
    };

    setExamHistory((prev) => {
      const updated = [newResult, ...prev].slice(0, 20);
      try {
        localStorage.setItem(EXAM_HISTORY_KEY, JSON.stringify(updated));
      } catch {
        // ignore
      }
      return updated;
    });
  };

  // Answers stats
  const answeredCount = Object.keys(userAnswers).length;
  const currentQuestion = activeQuestions[currentIndex];

  // Key navigation (1-4 to select option, arrows to navigate)
  useEffect(() => {
    if (screen !== "exam" || !currentQuestion) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (["1", "2", "3", "4"].includes(e.key)) {
        const optIndex = parseInt(e.key, 10) - 1;
        if (optIndex >= 0 && optIndex < currentQuestion.options.length) {
          setUserAnswers((prev) => ({
            ...prev,
            [currentQuestion.id]: optIndex,
          }));
        }
      } else if (e.key === "ArrowLeft") {
        // In RTL, ArrowLeft goes to NEXT question
        if (currentIndex < activeQuestions.length - 1) {
          setCurrentIndex((prev) => prev + 1);
        }
      } else if (e.key === "ArrowRight") {
        // In RTL, ArrowRight goes to PREVIOUS question
        if (currentIndex > 0) {
          setCurrentIndex((prev) => prev - 1);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [screen, currentQuestion, currentIndex, activeQuestions.length]);

  // Results calculation
  const resultsCalculated = useMemo(() => {
    if (activeQuestions.length === 0) {
      return { correct: 0, wrong: 0, unattempted: 0, percentage: 0, passed: false };
    }
    let correct = 0;
    let wrong = 0;
    let unattempted = 0;

    activeQuestions.forEach((q) => {
      const ans = userAnswers[q.id];
      if (ans === undefined) {
        unattempted++;
      } else if (ans === q.correctAnswer) {
        correct++;
      } else {
        wrong++;
      }
    });

    const percentage = Math.round((correct / activeQuestions.length) * 100);
    return {
      correct,
      wrong,
      unattempted,
      percentage,
      passed: percentage >= 70,
    };
  }, [activeQuestions, userAnswers]);

  // Category performance breakdown
  const categoryBreakdown = useMemo(() => {
    const map: Record<string, { total: number; correct: number; label: string }> = {};

    activeQuestions.forEach((q) => {
      if (!map[q.category]) {
        map[q.category] = { total: 0, correct: 0, label: q.categoryLabel };
      }
      map[q.category].total += 1;
      if (userAnswers[q.id] === q.correctAnswer) {
        map[q.category].correct += 1;
      }
    });

    return Object.entries(map).map(([catKey, data]) => ({
      key: catKey,
      label: data.label,
      total: data.total,
      correct: data.correct,
      percent: Math.round((data.correct / data.total) * 100),
    }));
  }, [activeQuestions, userAnswers]);

  // Review list filtered
  const filteredReviewQuestions = useMemo(() => {
    return activeQuestions.filter((q) => {
      const ans = userAnswers[q.id];
      if (reviewFilter === "wrong") return ans !== undefined && ans !== q.correctAnswer;
      if (reviewFilter === "correct") return ans === q.correctAnswer;
      if (reviewFilter === "flagged") return Boolean(flaggedQuestionIds[q.id]);
      return true;
    });
  }, [activeQuestions, userAnswers, reviewFilter, flaggedQuestionIds]);

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // ----------------------------------------------------
  // SCREEN: INTRO / SELECTOR
  // ----------------------------------------------------
  if (screen === "intro") {
    return (
      <div className="max-w-5xl mx-auto py-8 px-4 sm:px-6">
        {/* Top Header Banner */}
        <div className="mb-8 border-b border-neutral-200 pb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs text-neutral-500 mb-1">
              <span>سامانه ارزیابی فنی و صلاحیت حرفه‌ای</span>
              <span aria-hidden="true">·</span>
              <span>مترو و راه‌آهن شهری</span>
              <span aria-hidden="true">·</span>
              <span>استاندارد CENELEC</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-black tracking-tight">
              آزمون جامع مهندسی سیگنالینگ و کنترل قطار
            </h1>
            <p className="text-sm text-neutral-600 mt-1 max-w-2xl leading-relaxed">
              ارزیابی مهارت‌های فنی در حوزه‌های اینترلاکینگ (EIL)، سامانه‌های ATC/ATP، تجهیزات خط و مدار راه، اتاق‌های SER/CER و عیب‌یابی پیشرفته با صدور گواهی دیجیتال.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {examHistory.length > 0 && (
              <button
                type="button"
                onClick={() => setScreen("history")}
                className="px-3.5 py-2 text-xs font-semibold text-neutral-700 bg-neutral-100 hover:bg-neutral-200 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 whitespace-nowrap"
              >
                <BarChart3 className="w-4 h-4 text-neutral-500" />
                <span>تاریخچه آزمون‌ها ({examHistory.length})</span>
              </button>
            )}
            {onBack && (
              <button
                type="button"
                onClick={onBack}
                className="px-3.5 py-2 text-xs font-semibold text-neutral-600 hover:text-black border border-neutral-200 hover:border-neutral-400 rounded-lg transition-colors cursor-pointer whitespace-nowrap"
              >
                بازگشت به دانشنامه
              </button>
            )}
          </div>
        </div>

        {/* 3 Main Exam Modes */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
          {/* Card 1: Standard Comprehensive Exam */}
          <div className="p-6 rounded-2xl border border-neutral-200 bg-white hover:border-black transition-all flex flex-col justify-between group shadow-2xs">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-[11px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-bold">
                  استاندارد رسمی
                </span>
                <Clock className="w-4 h-4 text-neutral-400" />
              </div>
              <h2 className="text-base font-bold text-black mb-2">
                آزمون جامع گواهینامه مهندسی
              </h2>
              <p className="text-xs text-neutral-500 leading-relaxed mb-4">
                ۱۵ سوال تصادفی از تمامی مباحث تخصصی با محدودیت زمانی ۲۰ دقیقه و حد نصاب قبولی ۷۰ درصد.
              </p>
              <div className="text-[11px] text-neutral-600 space-y-1 mb-6 border-t border-neutral-100 pt-3">
                <div className="flex justify-between">
                  <span>تعداد سوالات:</span>
                  <span className="font-mono font-bold">۱۵ سوال</span>
                </div>
                <div className="flex justify-between">
                  <span>مدت زمان:</span>
                  <span className="font-mono font-bold">۲۰ دقیقه</span>
                </div>
                <div className="flex justify-between">
                  <span>نمره قبولی:</span>
                  <span className="font-mono font-bold">۷۰٪ (۱۱ از ۱۵)</span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => startExam("standard", "all")}
              className="w-full py-2.5 px-4 bg-black text-white hover:bg-neutral-800 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>شروع آزمون جامع</span>
            </button>
          </div>

          {/* Card 2: Specialized Topic Drill */}
          <div className="p-6 rounded-2xl border border-neutral-200 bg-white hover:border-black transition-all flex flex-col justify-between group shadow-2xs">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-[11px] font-mono text-sky-700 bg-sky-50 px-2 py-0.5 rounded font-bold">
                  موضوعی / هدفمند
                </span>
                <Layers className="w-4 h-4 text-neutral-400" />
              </div>
              <h2 className="text-base font-bold text-black mb-2">
                تمرین تخصصی تک‌مبحثی
              </h2>
              <p className="text-xs text-neutral-500 leading-relaxed mb-4">
                انتخاب دسته‌بندی خاص جهت تقویت نقاط ضعف در سرفصل‌های خاص سیگنالینگ یا تجهیزات خط.
              </p>

              {/* Category selector */}
              <div className="mb-6 space-y-1.5 border-t border-neutral-100 pt-3">
                <label className="text-[11px] font-medium text-neutral-500 block">
                  انتخاب دسته‌بندی:
                </label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs bg-neutral-50 border border-neutral-200 rounded-lg font-medium text-neutral-800 focus:outline-none focus:border-black"
                >
                  {QUIZ_CATEGORIES.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <button
              type="button"
              onClick={() => startExam("category", selectedCategory)}
              className="w-full py-2.5 px-4 bg-neutral-900 text-white hover:bg-black rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>شروع آزمون مبحثی</span>
            </button>
          </div>

          {/* Card 3: Quick Quiz */}
          <div className="p-6 rounded-2xl border border-neutral-200 bg-white hover:border-black transition-all flex flex-col justify-between group shadow-2xs">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-[11px] font-mono text-amber-700 bg-amber-50 px-2 py-0.5 rounded font-bold">
                  سریع و چک‌لیست
                </span>
                <Sparkles className="w-4 h-4 text-neutral-400" />
              </div>
              <h2 className="text-base font-bold text-black mb-2">
                آزمون سرعتی روزانه
              </h2>
              <p className="text-xs text-neutral-500 leading-relaxed mb-4">
                ۵ سوال تصادفی برای مرور سریع پیش از شیفت کاری یا یادآوری نکات کلیدی در ۶ دقیقه.
              </p>
              <div className="text-[11px] text-neutral-600 space-y-1 mb-6 border-t border-neutral-100 pt-3">
                <div className="flex justify-between">
                  <span>تعداد سوالات:</span>
                  <span className="font-mono font-bold">۵ سوال</span>
                </div>
                <div className="flex justify-between">
                  <span>مدت زمان:</span>
                  <span className="font-mono font-bold">۶ دقیقه</span>
                </div>
                <div className="flex justify-between">
                  <span>مناسب برای:</span>
                  <span className="font-medium text-neutral-700">مرور نکات طلایی شیفت</span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => startExam("quick", "all")}
              className="w-full py-2.5 px-4 bg-white text-black border border-neutral-300 hover:border-black hover:bg-neutral-50 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-2xs"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>شروع آزمون سریع</span>
            </button>
          </div>
        </div>

        {/* Informational Guidance Block */}
        <div className="p-5 rounded-2xl bg-neutral-50 border border-neutral-200 text-xs text-neutral-600 leading-relaxed">
          <div className="font-bold text-neutral-900 mb-2 flex items-center gap-1.5">
            <FileCheck2 className="w-4 h-4 text-neutral-700" />
            <span>راهنمای آزمون و ضوابط نمره‌دهی:</span>
          </div>
          <ul className="list-disc list-inside space-y-1 text-neutral-600 me-2">
            <li>سوالات بر اساس استاندارد CENELEC EN 50126/50128/50129 و مستندات رسمی خط ۱ طراحی شده‌اند.</li>
            <li>امکان نشانه‌گذاری سوالات برای بازبینی قبل از تحویل نهایی آزمون وجود دارد.</li>
            <li>می‌توانید با استفاده از کلیدهای عددی ۱، ۲، ۳ و ۴ روی کیبورد مستقیماً گزینه‌ها را انتخاب کنید.</li>
            <li>برای داوطلبانی که به نمره ۷۰٪ یا بالاتر دست یابند، گواهی دیجیتال صلاحیت مهندسی صادر می‌شود.</li>
          </ul>
        </div>
      </div>
    );
  }

  // ----------------------------------------------------
  // SCREEN: EXAM IN PROGRESS
  // ----------------------------------------------------
  if (screen === "exam") {
    if (!currentQuestion) return null;

    const isCurrentFlagged = Boolean(flaggedQuestionIds[currentQuestion.id]);
    const selectedOpt = userAnswers[currentQuestion.id];
    const isLastQuestion = currentIndex === activeQuestions.length - 1;

    return (
      <div className="max-w-5xl mx-auto py-6 px-4 sm:px-6">
        {/* Sticky top control header */}
        <div className="mb-4 sm:mb-6 p-3.5 sm:p-4 rounded-2xl bg-white border border-neutral-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
          <div className="flex items-center justify-between sm:justify-start gap-3 w-full sm:w-auto">
            <div className="flex items-center gap-1.5 font-mono text-xs sm:text-sm font-bold text-neutral-900 bg-neutral-100 px-2.5 sm:px-3 py-1.5 rounded-lg shrink-0">
              <Clock className={cn("w-4 h-4", timeRemainingSeconds < 180 ? "text-rose-600 animate-pulse" : "text-neutral-500")} />
              <span className={cn(timeRemainingSeconds < 180 && "text-rose-600")}>
                {formatTimer(timeRemainingSeconds)}
              </span>
            </div>

            <button
              type="button"
              onClick={() => setIsTimerPaused(!isTimerPaused)}
              className="text-xs text-neutral-500 hover:text-black px-2 py-1 rounded hover:bg-neutral-100 cursor-pointer shrink-0"
            >
              {isTimerPaused ? "ادامه زمان" : "توقف موقت"}
            </button>
          </div>

          <div className="flex items-center justify-between sm:justify-end gap-3 sm:gap-4 text-xs w-full sm:w-auto border-t sm:border-t-0 pt-2 sm:pt-0 border-neutral-100">
            <div className="flex items-center gap-2 sm:gap-3 text-neutral-600 text-[11px] sm:text-xs">
              <span>سوال <strong className="font-bold text-black font-mono">{currentIndex + 1}</strong> از <span className="font-mono">{activeQuestions.length}</span></span>
              <span>·</span>
              <span>پاسخ: <strong className="font-bold text-emerald-700 font-mono">{answeredCount}/{activeQuestions.length}</strong></span>
            </div>

            <button
              type="button"
              onClick={finishExam}
              className="px-3.5 sm:px-4 py-2 bg-black text-white hover:bg-neutral-800 rounded-lg text-xs font-bold transition-colors cursor-pointer shrink-0 shadow-2xs"
            >
              <span>تحویل آزمون</span>
            </button>
          </div>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-neutral-100 h-1.5 rounded-full overflow-hidden mb-4 sm:mb-6">
          <div
            className="bg-black h-full transition-all duration-200"
            style={{ width: `${((currentIndex + 1) / activeQuestions.length) * 100}%` }}
          />
        </div>

        {/* Mobile-Only Horizontal Question Navigation Strip (Allows 1-tap switching without scrolling to bottom) */}
        <div className="lg:hidden flex items-center gap-1.5 overflow-x-auto pb-3 mb-3 scrollbar-none touch-pan-x">
          {activeQuestions.map((q, qIndex) => {
            const isCurrent = qIndex === currentIndex;
            const isAnswered = userAnswers[q.id] !== undefined;
            const isFlagged = Boolean(flaggedQuestionIds[q.id]);

            return (
              <button
                key={q.id}
                type="button"
                onClick={() => setCurrentIndex(qIndex)}
                className={cn(
                  "w-8 h-8 rounded-lg font-mono text-xs font-bold transition-all flex items-center justify-center shrink-0 border cursor-pointer",
                  isCurrent
                    ? "bg-black text-white border-black ring-2 ring-black/20 shadow-xs"
                    : isAnswered
                    ? "bg-neutral-900 text-white border-neutral-900"
                    : "bg-white text-neutral-600 border-neutral-200 hover:bg-neutral-100",
                  isFlagged && "!bg-amber-400 !text-black !border-amber-400"
                )}
                title={`سوال ${qIndex + 1}`}
              >
                {qIndex + 1}
              </button>
            );
          })}
        </div>

        {/* Main 2-column layout: Question Stage & Quick Question Navigator Palette */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Question Card (3 cols) */}
          <div className="lg:col-span-3 bg-white border border-neutral-200 rounded-2xl p-4 sm:p-6 md:p-8 flex flex-col justify-between shadow-2xs">
            <div>
              {/* Question metadata header */}
              <div className="flex items-center justify-between gap-2 border-b border-neutral-100 pb-4 mb-5">
                <div className="flex items-center gap-2 text-xs text-neutral-500">
                  <span className="font-semibold text-neutral-800">{currentQuestion.categoryLabel}</span>
                  <span aria-hidden="true">·</span>
                  <span
                    className={cn(
                      "font-medium",
                      currentQuestion.difficulty === "basic" && "text-emerald-700",
                      currentQuestion.difficulty === "intermediate" && "text-sky-700",
                      currentQuestion.difficulty === "advanced" && "text-rose-700"
                    )}
                  >
                    درجه: {currentQuestion.difficultyLabel}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    setFlaggedQuestionIds((prev) => ({
                      ...prev,
                      [currentQuestion.id]: !prev[currentQuestion.id],
                    }))
                  }
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer",
                    isCurrentFlagged
                      ? "bg-amber-100 text-amber-800"
                      : "text-neutral-500 hover:text-black hover:bg-neutral-100"
                  )}
                >
                  <Bookmark className={cn("w-3.5 h-3.5", isCurrentFlagged && "fill-current")} />
                  <span>{isCurrentFlagged ? "نشانه‌گذاری شده" : "نشانه‌گذاری برای بازبینی"}</span>
                </button>
              </div>

              {/* Question Text */}
              <h2 className="text-base sm:text-lg font-bold text-black mb-6 leading-relaxed">
                {currentIndex + 1}. {currentQuestion.title}
              </h2>

              {/* Options */}
              <div className="space-y-3 mb-8">
                {currentQuestion.options.map((opt, oIdx) => {
                  const isSelected = selectedOpt === oIdx;
                  return (
                    <button
                      key={oIdx}
                      type="button"
                      onClick={() =>
                        setUserAnswers((prev) => ({
                          ...prev,
                          [currentQuestion.id]: oIdx,
                        }))
                      }
                      className={cn(
                        "w-full text-right p-4 rounded-xl border transition-all flex items-start gap-3.5 cursor-pointer group",
                        isSelected
                          ? "border-black bg-neutral-900 text-white shadow-xs"
                          : "border-neutral-200 bg-white hover:border-neutral-400 hover:bg-neutral-50 text-neutral-800"
                      )}
                    >
                      <div
                        className={cn(
                          "w-6 h-6 rounded-md font-mono text-xs font-bold flex items-center justify-center shrink-0 mt-0.5",
                          isSelected
                            ? "bg-white text-black"
                            : "bg-neutral-100 text-neutral-600 group-hover:bg-neutral-200"
                        )}
                      >
                        {oIdx + 1}
                      </div>
                      <span className="text-sm font-medium leading-relaxed pt-0.5">
                        {opt}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Bottom Question Controls */}
            <div className="border-t border-neutral-100 pt-5 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
                disabled={currentIndex === 0}
                className={cn(
                  "px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer",
                  currentIndex === 0
                    ? "text-neutral-300 cursor-not-allowed"
                    : "text-neutral-700 hover:text-black hover:bg-neutral-100"
                )}
              >
                <ChevronRight className="w-4 h-4" />
                <span>سوال قبلی</span>
              </button>

              <div className="text-[11px] text-neutral-400 hidden sm:block">
                کلیدهای میانبر: ۱ تا ۴ برای انتخاب گزینه · فلش‌ها برای جابجایی
              </div>

              {isLastQuestion ? (
                <button
                  type="button"
                  onClick={finishExam}
                  className="px-5 py-2.5 bg-black text-white hover:bg-neutral-800 rounded-xl text-xs font-bold transition-colors cursor-pointer shadow-xs"
                >
                  ثبت و مشاهده کارنامه
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setCurrentIndex((prev) => Math.min(activeQuestions.length - 1, prev + 1))}
                  className="px-5 py-2.5 bg-neutral-900 text-white hover:bg-black rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 shadow-xs"
                >
                  <span>سوال بعدی</span>
                  <ChevronLeft className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Side Question Navigator Matrix (1 col) */}
          <div className="lg:col-span-1 bg-white border border-neutral-200 rounded-2xl p-5 shadow-2xs h-fit">
            <div className="text-xs font-bold text-neutral-800 mb-3 flex items-center justify-between">
              <span>پالت سوالات</span>
              <span className="font-mono text-[11px] text-neutral-400">
                {answeredCount}/{activeQuestions.length}
              </span>
            </div>

            <div className="grid grid-cols-5 gap-2 mb-4">
              {activeQuestions.map((q, qIndex) => {
                const isCurrent = qIndex === currentIndex;
                const isAnswered = userAnswers[q.id] !== undefined;
                const isFlagged = Boolean(flaggedQuestionIds[q.id]);

                return (
                  <button
                    key={q.id}
                    type="button"
                    onClick={() => setCurrentIndex(qIndex)}
                    className={cn(
                      "h-9 rounded-lg font-mono text-xs font-bold transition-all flex items-center justify-center relative cursor-pointer",
                      isCurrent && "ring-2 ring-black font-extrabold",
                      isAnswered
                        ? "bg-neutral-900 text-white"
                        : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200",
                      isFlagged && "!bg-amber-400 !text-black"
                    )}
                    title={`سوال ${qIndex + 1} - ${isAnswered ? "پاسخ داده شده" : "بی‌پاسخ"}`}
                  >
                    {qIndex + 1}
                  </button>
                );
              })}
            </div>

            {/* Legend */}
            <div className="border-t border-neutral-100 pt-3 space-y-2 text-[11px] text-neutral-500">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded bg-neutral-900 shrink-0" />
                <span>پاسخ داده شده</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded bg-neutral-100 border border-neutral-300 shrink-0" />
                <span>بدون پاسخ</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded bg-amber-400 shrink-0" />
                <span>نشانه‌گذاری برای بازبینی</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ----------------------------------------------------
  // SCREEN: RESULTS & REVIEW
  // ----------------------------------------------------
  if (screen === "results") {
    const { correct, wrong, unattempted, percentage, passed } = resultsCalculated;

    return (
      <div className="max-w-5xl mx-auto py-8 px-4 sm:px-6">
        {/* Top Result Banner */}
        <div
          className={cn(
            "p-6 sm:p-8 rounded-3xl border mb-8 text-black transition-all",
            passed ? "bg-emerald-50/70 border-emerald-200" : "bg-neutral-50 border-neutral-200"
          )}
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                {passed ? (
                  <span className="px-3 py-1 rounded-full bg-emerald-600 text-white text-xs font-bold flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>قبولی و احراز صلاحیت مهندسی</span>
                  </span>
                ) : (
                  <span className="px-3 py-1 rounded-full bg-neutral-800 text-white text-xs font-bold flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                    <span>نیاز به بازبینی و تمرین مجدد</span>
                  </span>
                )}
                <span className="text-xs text-neutral-500">
                  {new Date().toLocaleDateString("fa-IR")}
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                کارنامه آزمون مهندسی سیگنالینگ
              </h1>
              <p className="text-xs sm:text-sm text-neutral-600 mt-1 max-w-xl leading-relaxed">
                {passed
                  ? "تبریک! شما با موفقیت به حد نصاب استاندارد CENELEC دست یافتید. گواهی دیجیتال شما صادر شده است."
                  : "برای دریافت گواهی صلاحیت مهندسی، کسب حداقل ۷۰ درصد نمره الزامی است. می‌توانید تحلیل تشریحی سوالات را در زیر مرور نمایید."}
              </p>
            </div>

            {/* Scorecard badge */}
            <div className="bg-white p-5 rounded-2xl border border-neutral-200 shadow-xs text-center min-w-[140px] shrink-0">
              <div className="text-3xl sm:text-4xl font-extrabold font-mono text-black">
                {percentage}٪
              </div>
              <div className="text-[11px] font-semibold text-neutral-500 mt-1">
                نمره نهایی ({correct} از {activeQuestions.length})
              </div>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-3 gap-3 mt-6 pt-6 border-t border-neutral-200/60 text-center">
            <div className="bg-white/80 p-3 rounded-xl border border-neutral-200/60">
              <div className="text-base font-bold font-mono text-emerald-700">{correct}</div>
              <div className="text-[11px] text-neutral-500">پاسخ‌های صحیح</div>
            </div>
            <div className="bg-white/80 p-3 rounded-xl border border-neutral-200/60">
              <div className="text-base font-bold font-mono text-rose-700">{wrong}</div>
              <div className="text-[11px] text-neutral-500">پاسخ‌های نادرست</div>
            </div>
            <div className="bg-white/80 p-3 rounded-xl border border-neutral-200/60">
              <div className="text-base font-bold font-mono text-neutral-600">{unattempted}</div>
              <div className="text-[11px] text-neutral-500">پاسخ‌داده‌نشده</div>
            </div>
          </div>
        </div>

        {/* Action Buttons: Certificate, Retake, Home */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-8">
          <div className="flex items-center gap-2">
            {passed && (
              <button
                type="button"
                onClick={() => setShowCertificateModal(true)}
                className="px-4 py-2.5 bg-emerald-700 text-white hover:bg-emerald-800 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-2xs"
              >
                <Award className="w-4 h-4" />
                <span>مشاهده و چاپ گواهینامه مهندسی</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => startExam(examMode, selectedCategory)}
              className="px-4 py-2.5 bg-black text-white hover:bg-neutral-800 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-2xs"
            >
              <RotateCcw className="w-4 h-4" />
              <span>آزمون مجدد</span>
            </button>
          </div>

          <button
            type="button"
            onClick={() => setScreen("intro")}
            className="px-4 py-2.5 border border-neutral-300 hover:border-black text-neutral-700 hover:text-black rounded-xl text-xs font-semibold transition-all cursor-pointer"
          >
            صفحه اصلی آزمون‌ها
          </button>
        </div>

        {/* Category Breakdown Bar */}
        <div className="p-6 rounded-2xl bg-white border border-neutral-200 shadow-2xs mb-8">
          <h2 className="text-sm font-bold text-black mb-4 flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-neutral-500" />
            <span>تفکیک تسلط بر اساس سرفصل‌های مهندسی:</span>
          </h2>
          <div className="space-y-4">
            {categoryBreakdown.map((cat) => (
              <div key={cat.key} className="space-y-1.5">
                <div className="flex justify-between text-xs font-medium">
                  <span className="text-neutral-800">{cat.label}</span>
                  <span className="font-mono text-neutral-600">
                    {cat.correct} از {cat.total} ({cat.percent}٪)
                  </span>
                </div>
                <div className="w-full bg-neutral-100 h-2 rounded-full overflow-hidden">
                  <div
                    className={cn(
                      "h-full rounded-full transition-all duration-300",
                      cat.percent >= 70 ? "bg-emerald-600" : cat.percent >= 50 ? "bg-amber-500" : "bg-rose-500"
                    )}
                    style={{ width: `${cat.percent}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Detailed Question Review Section */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-neutral-200 pb-4">
            <h2 className="text-base font-bold text-black">
              تحلیل تشریحی سوالات و استانداردهای مرجع
            </h2>

            {/* Review filters */}
            <div className="flex items-center gap-1 p-1 bg-neutral-100 rounded-lg text-xs font-medium">
              <button
                type="button"
                onClick={() => setReviewFilter("all")}
                className={cn(
                  "px-2.5 py-1 rounded-md transition-all cursor-pointer",
                  reviewFilter === "all" ? "bg-white text-black font-bold shadow-2xs" : "text-neutral-500"
                )}
              >
                همه ({activeQuestions.length})
              </button>
              <button
                type="button"
                onClick={() => setReviewFilter("wrong")}
                className={cn(
                  "px-2.5 py-1 rounded-md transition-all cursor-pointer",
                  reviewFilter === "wrong" ? "bg-white text-rose-700 font-bold shadow-2xs" : "text-neutral-500"
                )}
              >
                اشتباهات ({wrong})
              </button>
              <button
                type="button"
                onClick={() => setReviewFilter("correct")}
                className={cn(
                  "px-2.5 py-1 rounded-md transition-all cursor-pointer",
                  reviewFilter === "correct" ? "bg-white text-emerald-700 font-bold shadow-2xs" : "text-neutral-500"
                )}
              >
                صحیح‌ها ({correct})
              </button>
              <button
                type="button"
                onClick={() => setReviewFilter("flagged")}
                className={cn(
                  "px-2.5 py-1 rounded-md transition-all cursor-pointer",
                  reviewFilter === "flagged" ? "bg-white text-amber-700 font-bold shadow-2xs" : "text-neutral-500"
                )}
              >
                نشان‌شده‌ها
              </button>
            </div>
          </div>

          {/* Question Review Cards */}
          <div className="space-y-4">
            {filteredReviewQuestions.map((q) => {
              const userOpt = userAnswers[q.id];
              const isCorrect = userOpt === q.correctAnswer;
              const isUnattempted = userOpt === undefined;

              return (
                <div
                  key={q.id}
                  className={cn(
                    "p-6 rounded-2xl border bg-white transition-all shadow-2xs",
                    isCorrect ? "border-emerald-200" : isUnattempted ? "border-neutral-200" : "border-rose-200"
                  )}
                >
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2 text-xs">
                      {isCorrect ? (
                        <span className="text-emerald-700 font-bold flex items-center gap-1">
                          <CheckCircle2 className="w-4 h-4" />
                          <span>پاسخ صحیح</span>
                        </span>
                      ) : isUnattempted ? (
                        <span className="text-neutral-500 font-bold flex items-center gap-1">
                          <HelpCircle className="w-4 h-4" />
                          <span>پاسخ داده نشده</span>
                        </span>
                      ) : (
                        <span className="text-rose-700 font-bold flex items-center gap-1">
                          <XCircle className="w-4 h-4" />
                          <span>پاسخ اشتباه</span>
                        </span>
                      )}
                      <span className="text-neutral-400">·</span>
                      <span className="text-neutral-500">{q.categoryLabel}</span>
                    </div>

                    {q.relatedArticleId && onNavigateToArticle && (
                      <button
                        type="button"
                        onClick={() => onNavigateToArticle(q.relatedArticleId!)}
                        className="text-xs text-neutral-600 hover:text-black font-medium flex items-center gap-1 cursor-pointer"
                      >
                        <span>مشاهده در مقاله</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    )}
                  </div>

                  <h3 className="text-sm sm:text-base font-bold text-black mb-4 leading-relaxed">
                    {q.title}
                  </h3>

                  {/* Options review list */}
                  <div className="space-y-2 mb-4">
                    {q.options.map((opt, optIndex) => {
                      const isThisCorrect = optIndex === q.correctAnswer;
                      const isThisUserChoice = optIndex === userOpt;

                      return (
                        <div
                          key={optIndex}
                          className={cn(
                            "p-3 rounded-xl text-xs font-medium border flex items-start gap-2.5",
                            isThisCorrect
                              ? "bg-emerald-50/80 border-emerald-300 text-emerald-950 font-bold"
                              : isThisUserChoice
                              ? "bg-rose-50 border-rose-300 text-rose-950"
                              : "bg-neutral-50/50 border-neutral-200 text-neutral-600"
                          )}
                        >
                          <span className="w-5 h-5 rounded font-mono text-[11px] font-bold flex items-center justify-center shrink-0 bg-white border border-neutral-300">
                            {optIndex + 1}
                          </span>
                          <span className="flex-1 leading-relaxed">{opt}</span>
                          {isThisCorrect && (
                            <span className="text-[10px] text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded font-bold shrink-0">
                              گزینه صحیح
                            </span>
                          )}
                          {isThisUserChoice && !isThisCorrect && (
                            <span className="text-[10px] text-rose-700 bg-rose-100 px-1.5 py-0.5 rounded font-bold shrink-0">
                              انتخاب شما
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Technical Analysis & Reference */}
                  <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-100 text-xs text-neutral-700 leading-relaxed space-y-1.5">
                    <div className="font-bold text-black">تحلیل فنی و علت پاسخ:</div>
                    <p className="text-neutral-600">{q.explanation}</p>
                    <div className="text-[11px] text-neutral-400 font-mono pt-1">
                      مرجع استاندارد: {q.reference}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Certificate Modal */}
        {showCertificateModal && (
          <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-3 sm:p-4 backdrop-blur-xs">
            <div className="bg-white rounded-3xl max-w-2xl w-full p-4 sm:p-8 shadow-2xl border border-neutral-200 relative overflow-y-auto max-h-[92vh]">
              {/* Close button */}
              <button
                type="button"
                onClick={() => setShowCertificateModal(false)}
                className="absolute top-3 left-3 p-2 text-neutral-400 hover:text-black rounded-lg hover:bg-neutral-100 transition-colors cursor-pointer z-10"
              >
                ✕
              </button>

              {/* Printable Certificate Frame */}
              <div id="print-certificate" className="border-2 sm:border-4 border-double border-neutral-800 p-4 sm:p-8 rounded-2xl bg-gradient-to-b from-white via-neutral-50 to-white text-center mt-4 sm:mt-0">
                <div className="flex items-center justify-center gap-1.5 sm:gap-2 mb-2 text-neutral-500 text-[10px] sm:text-xs font-mono flex-wrap">
                  <span>METRO RAILWAY ENGINEERING COUNCIL</span>
                  <span>·</span>
                  <span>گواهی صلاحیت فنی</span>
                </div>

                <h2 className="text-lg sm:text-2xl font-black text-black tracking-tight mb-1">
                  گواهینامه شایستگی و تسلط مهندسی سیگنالینگ
                </h2>
                <div className="text-[11px] sm:text-xs text-neutral-500 mb-4 sm:mb-6">
                  بر مبنای استاندارد CENELEC EN 50129 و چارچوب بهره‌برداری خط ۱ مترو
                </div>

                <div className="my-4 sm:my-6 py-3 sm:py-4 border-y border-neutral-200 text-xs sm:text-sm leading-relaxed">
                  بدین‌وسیله گواهی می‌شود که
                  <div className="my-2">
                    <input
                      type="text"
                      value={candidateName}
                      onChange={(e) => setCandidateName(e.target.value)}
                      className="text-base sm:text-lg font-bold text-black text-center border-b border-black focus:outline-none bg-transparent px-2 py-0.5 max-w-full"
                      placeholder="نام و نام خانوادگی خود را بنویسید"
                    />
                  </div>
                  با موفقیت آزمون جامع تخصصی را با امتیاز ممتاز{" "}
                  <span className="font-extrabold font-mono text-emerald-800">{percentage}٪</span> به پایان رسانده و صلاحیت کارشناسی در تجهیزات EIL، مدار راه و کنترل خودکار قطار (ATC) را احراز نموده است.
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-4 pt-3 sm:pt-4 text-xs text-neutral-600">
                  <div className="bg-white/80 p-2 rounded-lg border border-neutral-200/60 sm:border-0 sm:bg-transparent sm:p-0">
                    <div className="text-[10px] text-neutral-400">تاریخ صدور:</div>
                    <div className="font-mono font-bold">{new Date().toLocaleDateString("fa-IR")}</div>
                  </div>
                  <div className="bg-white/80 p-2 rounded-lg border border-neutral-200/60 sm:border-0 sm:bg-transparent sm:p-0">
                    <div className="text-[10px] text-neutral-400">شناسه پیگیری:</div>
                    <div className="font-mono font-bold">MTR-CERT-{Math.floor(100000 + Math.random() * 900000)}</div>
                  </div>
                  <div className="bg-white/80 p-2 rounded-lg border border-neutral-200/60 sm:border-0 sm:bg-transparent sm:p-0">
                    <div className="text-[10px] text-neutral-400">سطح ایمنی:</div>
                    <div className="font-mono font-bold text-emerald-800">CENELEC SIL 4</div>
                  </div>
                </div>
              </div>

              {/* Modal footer controls */}
              <div className="mt-4 sm:mt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-right">
                <span className="text-[11px] sm:text-xs text-neutral-400">
                  می‌توانید نام خود را در کادر ویرایش کرده و گواهینامه را پرینت نمایید.
                </span>
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="w-full sm:w-auto px-5 py-2.5 bg-black text-white hover:bg-neutral-800 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-1.5 shadow-xs"
                >
                  <Printer className="w-4 h-4" />
                  <span>چاپ گواهینامه</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ----------------------------------------------------
  // SCREEN: HISTORY
  // ----------------------------------------------------
  if (screen === "history") {
    return (
      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6">
        <div className="flex items-center justify-between mb-8 border-b border-neutral-200 pb-4">
          <div>
            <h1 className="text-2xl font-extrabold text-black">
              تاریخچه سوابق آزمون‌های شما
            </h1>
            <p className="text-xs text-neutral-500 mt-1">
              ثبت امتیازات و رکوردهای آزمون در حافظه مرورگر
            </p>
          </div>
          <button
            type="button"
            onClick={() => setScreen("intro")}
            className="px-4 py-2 border border-neutral-300 hover:border-black rounded-lg text-xs font-semibold cursor-pointer"
          >
            بازگشت به آزمون‌ها
          </button>
        </div>

        {examHistory.length === 0 ? (
          <div className="p-12 text-center text-neutral-400 border border-dashed rounded-2xl">
            هنوز سابقه‌ای ثبت نشده است. اولین آزمون خود را شروع کنید!
          </div>
        ) : (
          <div className="space-y-3">
            {examHistory.map((item) => (
              <div
                key={item.id}
                className="p-4 rounded-xl border border-neutral-200 bg-white flex items-center justify-between gap-4 shadow-2xs"
              >
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-bold text-black">{item.modeTitle}</span>
                    <span
                      className={cn(
                        "text-[10px] px-2 py-0.5 rounded font-bold font-mono",
                        item.passed ? "bg-emerald-50 text-emerald-800" : "bg-rose-50 text-rose-800"
                      )}
                    >
                      {item.passed ? "قبول" : "مردود"}
                    </span>
                  </div>
                  <div className="text-xs text-neutral-400 flex items-center gap-3">
                    <span>تاریخ: {item.date}</span>
                    <span>·</span>
                    <span>پاسخ صحیح: {item.correctCount} از {item.totalQuestions}</span>
                    <span>·</span>
                    <span>زمان: {Math.round(item.timeSpentSeconds / 60)} دقیقه</span>
                  </div>
                </div>

                <div className="text-xl font-black font-mono text-black">
                  {item.scorePercentage}٪
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  return null;
};
