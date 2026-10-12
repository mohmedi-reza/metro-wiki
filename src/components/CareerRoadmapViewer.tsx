import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  ROLE_ROADMAPS,
  ROLE_EXAMS_DATABASE,
  RoleRoadmap,
  CareerRoadmapStep,
  RoleExam,
  ExamQuestion,
} from "../data/roadmapData";
import {
  CheckCircle2,
  Circle,
  Network,
  Cpu,
  Train,
  Clock,
  BookOpen,
  Server,
  Play,
  Award,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  HelpCircle,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  Wrench,
  Check,
  Filter,
  BookmarkCheck,
  GraduationCap,
  Timer,
  FileCheck2,
  Flag,
  Share2,
  Printer,
  ShieldCheck,
  CheckCheck,
  AlertOctagon,
  RefreshCw,
  Trophy,
  Layers,
} from "lucide-react";
import { cn } from "../lib/utils";

interface CareerRoadmapViewerProps {
  onNavigateToArticle?: (articleId: string, sectionId?: string) => void;
  onOpenSimulator?: () => void;
  onOpenRacksMap?: (tab?: "racks" | "cards" | "table") => void;
  className?: string;
}

const STORAGE_KEY_ROADMAP = "daneshnamak_roadmap_progress";
const STORAGE_KEY_COMPETENCIES = "daneshnamak_roadmap_competencies";
const STORAGE_KEY_EXAM_RESULTS = "daneshnamak_exam_results";

export const CareerRoadmapViewer: React.FC<CareerRoadmapViewerProps> = ({
  onNavigateToArticle,
  onOpenSimulator,
  onOpenRacksMap,
  className,
}) => {
  // Top-level tab: Learning Curriculum vs Exam Center
  const [mainTab, setMainTab] = useState<"learning" | "exam">("learning");
  const [selectedRoleId, setSelectedRoleId] = useState<string>("it-specialist");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  // Step completion state
  const [completedSteps, setCompletedSteps] = useState<Record<string, string[]>>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_ROADMAP);
      if (saved) return JSON.parse(saved);
    } catch {
      // Fallback
    }
    return {
      "it-specialist": ["it-step-1"],
      "signaling-engineer": [],
      "train-operator": [],
      "telecom-maintenance": [],
    };
  });

  // Individual competency sub-checkboxes
  const [competencyChecks, setCompetencyChecks] = useState<Record<string, boolean>>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_COMPETENCIES);
      if (saved) return JSON.parse(saved);
    } catch {
      // Fallback
    }
    return {
      "it-step-1-comp-0": true,
      "it-step-1-comp-1": true,
    };
  });

  const [expandedStepId, setExpandedStepId] = useState<string | null>("it-step-1");

  // EXAM CENTER STATES
  const [examMode, setExamMode] = useState<"comprehensive" | "modular">("comprehensive");
  const [selectedModularStepId, setSelectedModularStepId] = useState<string | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [userExamAnswers, setUserExamAnswers] = useState<Record<string, number>>({});
  const [flaggedQuestions, setFlaggedQuestions] = useState<string[]>([]);
  const [isExamSubmitted, setIsExamSubmitted] = useState<boolean>(false);
  const [examTimerSeconds, setExamTimerSeconds] = useState<number>(20 * 60); // 20 minutes default
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);
  const [candidateName, setCandidateName] = useState<string>("مهندس متخصص ریلی");

  // Saved exam records (Score history)
  const [examHistory, setExamHistory] = useState<
    Record<
      string,
      {
        scorePercent: number;
        passed: boolean;
        date: string;
        totalQuestions: number;
        correctAnswers: number;
      }
    >
  >(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_EXAM_RESULTS);
      if (saved) return JSON.parse(saved);
    } catch {
      // Fallback
    }
    return {};
  });

  // Sync steps to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_ROADMAP, JSON.stringify(completedSteps));
    } catch {
      // Ignore
    }
  }, [completedSteps]);

  // Sync competencies to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_COMPETENCIES, JSON.stringify(competencyChecks));
    } catch {
      // Ignore
    }
  }, [competencyChecks]);

  // Sync exam history
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_EXAM_RESULTS, JSON.stringify(examHistory));
    } catch {
      // Ignore
    }
  }, [examHistory]);

  const activeRoadmap: RoleRoadmap = ROLE_ROADMAPS[selectedRoleId] || ROLE_ROADMAPS["it-specialist"];
  const currentCompletedList = completedSteps[activeRoadmap.id] || [];
  const progressPercent = Math.round(
    (currentCompletedList.length / (activeRoadmap.steps.length || 1)) * 100
  );

  // Active Role Exam
  const activeRoleExam: RoleExam =
    ROLE_EXAMS_DATABASE[selectedRoleId] || ROLE_EXAMS_DATABASE["it-specialist"];

  // Determine active questions for the exam (comprehensive vs modular)
  const activeExamQuestions: ExamQuestion[] = useMemo(() => {
    if (examMode === "modular" && selectedModularStepId) {
      const step = activeRoadmap.steps.find((s) => s.id === selectedModularStepId);
      if (step && step.checkpointQuestions) {
        return step.checkpointQuestions.map((cq, cqIdx) => ({
          id: `${step.id}-cq-${cqIdx}`,
          stepId: step.id,
          domain: step.category,
          difficulty: "متوسط",
          question: cq.question,
          options: cq.options,
          correctIndex: cq.correctIndex,
          explanation: cq.explanation,
          standardReference: "سرفصل آموزشی گام " + step.order,
        }));
      }
    }
    return activeRoleExam.questions;
  }, [examMode, selectedModularStepId, activeRoadmap, activeRoleExam]);

  // Exam Countdown Timer
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (mainTab === "exam" && !isExamSubmitted && isTimerRunning && examTimerSeconds > 0) {
      interval = setInterval(() => {
        setExamTimerSeconds((prev) => {
          if (prev <= 1) {
            setIsTimerRunning(false);
            handleSubmitExam();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [mainTab, isExamSubmitted, isTimerRunning, examTimerSeconds]);

  // Next step to study in learning tab
  const nextIncompleteStep = useMemo(() => {
    return activeRoadmap.steps.find((s) => !currentCompletedList.includes(s.id));
  }, [activeRoadmap, currentCompletedList]);

  // Toggle step completion
  const toggleStepCompletion = (stepId: string) => {
    setCompletedSteps((prev) => {
      const roleList = prev[activeRoadmap.id] || [];
      const isAlreadyDone = roleList.includes(stepId);
      const updatedList = isAlreadyDone
        ? roleList.filter((id) => id !== stepId)
        : [...roleList, stepId];
      return {
        ...prev,
        [activeRoadmap.id]: updatedList,
      };
    });
  };

  // Complete step and automatically advance to the next step
  const handleCompleteAndNext = (currentStep: CareerRoadmapStep) => {
    if (!currentCompletedList.includes(currentStep.id)) {
      toggleStepCompletion(currentStep.id);
    }
    const currentIndex = activeRoadmap.steps.findIndex((s) => s.id === currentStep.id);
    if (currentIndex >= 0 && currentIndex < activeRoadmap.steps.length - 1) {
      const nextStep = activeRoadmap.steps[currentIndex + 1];
      setExpandedStepId(nextStep.id);
      setTimeout(() => {
        const el = document.getElementById(`step-card-${nextStep.id}`);
        el?.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 100);
    }
  };

  // Toggle competency sub-check
  const toggleCompetency = (key: string) => {
    setCompetencyChecks((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  // Reset progress for this role
  const handleResetRoleProgress = () => {
    if (window.confirm(`آیا از بازنشانی پیشرفت آموزش‌های دوره ${activeRoadmap.roleTitle} اطمینان دارید؟`)) {
      setCompletedSteps((prev) => ({
        ...prev,
        [activeRoadmap.id]: [],
      }));
      setExpandedStepId(activeRoadmap.steps[0]?.id || null);
    }
  };

  // Reset / Start fresh exam
  const handleStartExam = (mode: "comprehensive" | "modular", stepId?: string) => {
    setExamMode(mode);
    if (stepId) setSelectedModularStepId(stepId);
    setCurrentQuestionIndex(0);
    setUserExamAnswers({});
    setFlaggedQuestions([]);
    setIsExamSubmitted(false);
    setExamTimerSeconds(mode === "comprehensive" ? 20 * 60 : 5 * 60);
    setIsTimerRunning(true);
  };

  // Submit Exam
  const handleSubmitExam = () => {
    setIsTimerRunning(false);
    setIsExamSubmitted(true);

    // Calculate score
    let correctCount = 0;
    activeExamQuestions.forEach((q) => {
      if (userExamAnswers[q.id] === q.correctIndex) {
        correctCount++;
      }
    });

    const score = Math.round((correctCount / (activeExamQuestions.length || 1)) * 100);
    const passed = score >= activeRoleExam.passingScorePercent;

    if (examMode === "comprehensive") {
      setExamHistory((prev) => ({
        ...prev,
        [activeRoleExam.roleId]: {
          scorePercent: score,
          passed,
          date: new Date().toLocaleDateString("fa-IR"),
          totalQuestions: activeExamQuestions.length,
          correctAnswers: correctCount,
        },
      }));
    }
  };

  // Toggle question flag
  const toggleFlagQuestion = (qId: string) => {
    setFlaggedQuestions((prev) =>
      prev.includes(qId) ? prev.filter((id) => id !== qId) : [...prev, qId]
    );
  };

  // Calculate score stats for submitted exam
  const examScoreStats = useMemo(() => {
    if (!isExamSubmitted) return null;
    let correct = 0;
    let answered = 0;
    activeExamQuestions.forEach((q) => {
      if (userExamAnswers[q.id] !== undefined) answered++;
      if (userExamAnswers[q.id] === q.correctIndex) correct++;
    });
    const percent = Math.round((correct / (activeExamQuestions.length || 1)) * 100);
    const passed = percent >= activeRoleExam.passingScorePercent;
    return {
      correct,
      answered,
      total: activeExamQuestions.length,
      percent,
      passed,
    };
  }, [isExamSubmitted, activeExamQuestions, userExamAnswers, activeRoleExam]);

  // Filtered steps in learning tab
  const visibleSteps = useMemo(() => {
    if (categoryFilter === "all") return activeRoadmap.steps;
    return activeRoadmap.steps.filter((s) => s.category === categoryFilter);
  }, [activeRoadmap, categoryFilter]);

  const categories = useMemo(() => {
    return Array.from(new Set(activeRoadmap.steps.map((s) => s.category)));
  }, [activeRoadmap]);

  const getRoleIcon = (name: string, className = "w-5 h-5") => {
    switch (name) {
      case "Network":
        return <Network className={className} />;
      case "Cpu":
        return <Cpu className={className} />;
      case "Train":
        return <Train className={className} />;
      case "Wrench":
        return <Wrench className={className} />;
      default:
        return <BookOpen className={className} />;
    }
  };

  // Format timer seconds (MM:SS)
  const formatTimer = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remaining = secs % 60;
    return `${mins.toString().padStart(2, "0")}:${remaining.toString().padStart(2, "0")}`;
  };

  return (
    <div className={cn("space-y-6 min-w-0 max-w-full pb-16 select-text", className)}>
      {/* 1. Header Breadcrumbs & Main Section Title */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-xs text-neutral-500 flex-wrap">
          <span className="font-medium text-black">دانشنامه مهندسی</span>
          <ChevronLeft className="w-3.5 h-3.5 text-neutral-300" />
          <span>مرکز آموزش و آزمون‌های شایستگی ریلی</span>
          <ChevronLeft className="w-3.5 h-3.5 text-neutral-300" />
          <span className="text-neutral-900 font-bold">{activeRoadmap.roleTitle.split(" (")[0]}</span>
        </div>

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-neutral-900 tracking-tight flex items-center gap-2.5">
              <span className="p-2 rounded-2xl bg-black text-white shadow-xs">
                <GraduationCap className="w-5 h-5" />
              </span>
              <span>مسیر شایستگی و مرکز آزمون‌های تخصصی</span>
            </h1>
            <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed max-w-3xl">
              سامانه دوگانه آموزش گام‌به‌گام سیلابس‌های مهندسی خط ۱، و مرکز آزمون رسمی سنجش صلاحیت با استانداردهای CENELEC SIL 4.
            </p>
          </div>
        </div>
      </div>

      {/* 2. Top-Level Main Section Switcher: 📚 آموزش کامل | 🎓 آزمون و سنجش کامل */}
      <div className="bg-neutral-100 p-1.5 rounded-2xl flex flex-col sm:flex-row items-stretch sm:items-center gap-1.5 shadow-2xs">
        <button
          type="button"
          onClick={() => setMainTab("learning")}
          className={cn(
            "flex-1 py-2.5 sm:py-3 px-3 sm:px-4 rounded-xl font-bold text-xs sm:text-sm transition-all flex items-center justify-between sm:justify-center gap-2 cursor-pointer",
            mainTab === "learning"
              ? "bg-white text-neutral-900 shadow-sm"
              : "text-neutral-600 hover:text-black hover:bg-neutral-200/50"
          )}
        >
          <div className="flex items-center gap-2 truncate">
            <BookOpen className="w-4 h-4 shrink-0" />
            <span className="truncate">مسیر شایستگی و آموزش</span>
          </div>
          <span className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-neutral-100 text-neutral-700 font-semibold shrink-0">
            {activeRoadmap.steps.length} گام درسی
          </span>
        </button>

        <button
          type="button"
          onClick={() => {
            setMainTab("exam");
            if (!isTimerRunning && !isExamSubmitted) {
              handleStartExam("comprehensive");
            }
          }}
          className={cn(
            "flex-1 py-2.5 sm:py-3 px-3 sm:px-4 rounded-xl font-bold text-xs sm:text-sm transition-all flex items-center justify-between sm:justify-center gap-2 cursor-pointer",
            mainTab === "exam"
              ? "bg-black text-white shadow-sm"
              : "text-neutral-600 hover:text-black hover:bg-neutral-200/50"
          )}
        >
          <div className="flex items-center gap-2 truncate">
            <Award className="w-4 h-4 text-amber-400 shrink-0" />
            <span className="truncate">مرکز آزمون‌های تخصصی</span>
          </div>
          <span
            className={cn(
              "text-[11px] font-mono px-2 py-0.5 rounded-md font-semibold shrink-0",
              mainTab === "exam" ? "bg-white/20 text-neutral-200" : "bg-neutral-200 text-neutral-800"
            )}
          >
            آزمون رسمی SIL 4
          </span>
        </button>
      </div>

      {/* 3. Role Selector Cards (Shared between both sections) */}
      <div className="bg-white rounded-3xl border border-neutral-200 p-4 sm:p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between text-xs font-bold text-neutral-400 uppercase tracking-wider px-1">
          <span>انتخاب نقش تخصصی جهت {mainTab === "learning" ? "مطالعه و آموزش" : "شرکت در آزمون"}:</span>
          <span className="font-mono text-neutral-500 font-semibold lowercase">
            {Object.keys(ROLE_ROADMAPS).length} تخصص ریلی
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
          {Object.values(ROLE_ROADMAPS).map((role) => {
            const isSelected = role.id === selectedRoleId;
            const completedCount = (completedSteps[role.id] || []).length;
            const percent = Math.round((completedCount / (role.steps.length || 1)) * 100);
            const roleExamRecord = examHistory[role.id];

            return (
              <button
                key={role.id}
                type="button"
                onClick={() => {
                  setSelectedRoleId(role.id);
                  setCategoryFilter("all");
                  setExpandedStepId(role.steps[0]?.id || null);
                  if (mainTab === "exam") {
                    handleStartExam("comprehensive");
                  }
                }}
                className={cn(
                  "p-3.5 rounded-2xl text-right transition-all border flex flex-col justify-between gap-3 cursor-pointer group relative overflow-hidden",
                  isSelected
                    ? "bg-neutral-950 text-white border-neutral-950 shadow-md ring-2 ring-black/10"
                    : "bg-neutral-50/60 hover:bg-neutral-100/80 border-neutral-200/90 text-neutral-800"
                )}
              >
                <div className="flex items-start justify-between gap-2 w-full">
                  <div
                    className={cn(
                      "p-2 rounded-xl shrink-0 transition-colors",
                      isSelected
                        ? "bg-white/10 text-white"
                        : "bg-white text-neutral-700 shadow-2xs border border-neutral-200/60"
                    )}
                  >
                    {getRoleIcon(role.iconName, "w-4 h-4")}
                  </div>

                  <div className="flex items-center gap-1">
                    {roleExamRecord && (
                      <span
                        className={cn(
                          "text-[9px] font-mono font-bold px-1.5 py-0.2 rounded shrink-0",
                          roleExamRecord.passed
                            ? "bg-emerald-500 text-white"
                            : "bg-rose-500 text-white"
                        )}
                        title={`نمره آزمون: ${roleExamRecord.scorePercent}%`}
                      >
                        آزمون: {roleExamRecord.scorePercent}%
                      </span>
                    )}

                    <span
                      className={cn(
                        "text-[10px] font-mono font-bold px-2 py-0.5 rounded-md shrink-0",
                        isSelected
                          ? percent === 100
                            ? "bg-emerald-500 text-white"
                            : "bg-white/20 text-neutral-200"
                          : percent === 100
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-neutral-200/80 text-neutral-700"
                      )}
                    >
                      آموزش: {percent}%
                    </span>
                  </div>
                </div>

                <div className="space-y-1 w-full min-w-0">
                  <span className="text-xs sm:text-sm font-extrabold truncate block leading-snug">
                    {role.roleTitle.split(" (")[0]}
                  </span>
                  <span
                    className={cn(
                      "text-[10px] block truncate font-sans",
                      isSelected ? "text-neutral-400" : "text-neutral-500"
                    )}
                  >
                    {role.badge}
                  </span>
                </div>

                <div className="w-full bg-neutral-200/40 rounded-full h-1 overflow-hidden mt-1">
                  <div
                    className={cn(
                      "h-full rounded-full transition-all duration-300",
                      isSelected ? "bg-emerald-400" : "bg-neutral-900"
                    )}
                    style={{ width: `${percent}%` }}
                  />
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* =========================================================================
          TAB 1: آموزش و مسیر شایستگی‌ها (COMPREHENSIVE TRAINING & LEARNING SECTION)
         ========================================================================= */}
      {mainTab === "learning" && (
        <div className="space-y-6 animate-in fade-in duration-150">
          {/* Active Role Learning Dashboard */}
          <div className="bg-white rounded-3xl border border-neutral-200 p-5 sm:p-7 shadow-xs space-y-6">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 pb-5 border-b border-neutral-100">
              <div className="space-y-2 flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-bold px-2.5 py-0.5 rounded-lg bg-black text-white font-mono">
                    {activeRoadmap.badge}
                  </span>
                  <span className="text-xs font-mono text-neutral-500 bg-neutral-100 px-2 py-0.5 rounded-lg flex items-center gap-1 font-semibold">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{activeRoadmap.estimatedTotalHours}</span>
                  </span>
                  <span className="text-xs font-sans text-neutral-500 bg-neutral-100 px-2 py-0.5 rounded-lg">
                    مخاطبان: {activeRoadmap.targetAudience}
                  </span>
                </div>

                <h2 className="text-lg sm:text-xl font-black text-neutral-900 leading-snug">
                  {activeRoadmap.roleTitle}
                </h2>
                <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed text-justify max-w-3xl">
                  {activeRoadmap.description}
                </p>
              </div>

              {/* Progress Circular & Metrics Badge */}
              <div className="flex items-center justify-between sm:justify-start gap-4 bg-neutral-50 border border-neutral-200/80 rounded-2xl p-4 w-full sm:w-auto shrink-0">
                <div className="text-right space-y-0.5">
                  <span className="text-[11px] font-semibold text-neutral-500 block">پیشرفت دوره:</span>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-2xl sm:text-3xl font-black font-mono text-neutral-900">
                      {progressPercent}%
                    </span>
                    <span className="text-xs text-neutral-500 font-semibold">
                      ({currentCompletedList.length} از {activeRoadmap.steps.length} گام)
                    </span>
                  </div>
                </div>

                <div className="w-14 h-14 rounded-full bg-neutral-200/80 p-1 flex items-center justify-center shrink-0">
                  <div
                    className={cn(
                      "w-12 h-12 rounded-full flex items-center justify-center font-bold text-xs font-mono shadow-xs",
                      progressPercent === 100 ? "bg-emerald-600 text-white" : "bg-black text-white"
                    )}
                  >
                    {progressPercent === 100 ? <Check className="w-5 h-5 stroke-[3]" /> : `${progressPercent}%`}
                  </div>
                </div>
              </div>
            </div>

            {/* Linear Stepper Breadcrumbs Bar */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold text-neutral-500 px-1">
                <span>مراحل زنجیره یادگیری:</span>
                {currentCompletedList.length > 0 && (
                  <button
                    type="button"
                    onClick={handleResetRoleProgress}
                    className="text-[11px] text-neutral-400 hover:text-neutral-800 transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>بازنشانی پیشرفت آموزش</span>
                  </button>
                )}
              </div>

              {/* Stepper Progress Visual Bar - Scrollable on mobile, grid on desktop */}
              <div className="flex sm:grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2 overflow-x-auto pb-1.5 sm:pb-0 scrollbar-none">
                {activeRoadmap.steps.map((st, sIdx) => {
                  const isDone = currentCompletedList.includes(st.id);
                  const isCurrent = expandedStepId === st.id;

                  return (
                    <button
                      key={st.id}
                      type="button"
                      onClick={() => setExpandedStepId(st.id)}
                      className={cn(
                        "p-2.5 rounded-xl border text-right transition-all flex items-center gap-2 cursor-pointer text-xs shrink-0 sm:shrink min-w-[200px] sm:min-w-0",
                        isCurrent
                          ? "bg-neutral-900 text-white border-neutral-900 shadow-2xs"
                          : isDone
                          ? "bg-emerald-50/80 border-emerald-300 text-emerald-950 font-bold"
                          : "bg-neutral-50 hover:bg-neutral-100 border-neutral-200 text-neutral-700"
                      )}
                    >
                      <span
                        className={cn(
                          "w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-mono font-bold shrink-0",
                          isCurrent
                            ? "bg-white text-black"
                            : isDone
                            ? "bg-emerald-600 text-white"
                            : "bg-neutral-200 text-neutral-700"
                        )}
                      >
                        {isDone ? <Check className="w-3 h-3 stroke-[3]" /> : sIdx + 1}
                      </span>
                      <span className="truncate flex-1 font-semibold text-[11px]">
                        گام {st.order}: {st.title.split(". ")[1] || st.title}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Recommended Next Step Callout */}
            {nextIncompleteStep && (
              <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="p-1.5 rounded-xl bg-amber-500 text-white shrink-0">
                    <Sparkles className="w-4 h-4" />
                  </span>
                  <div className="space-y-0.5 min-w-0">
                    <strong className="text-amber-950 block font-bold">گام پیشنهادی بعدی برای شما:</strong>
                    <span className="text-amber-900 truncate block">
                      گام {nextIncompleteStep.order}: {nextIncompleteStep.title}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setExpandedStepId(nextIncompleteStep.id);
                    const el = document.getElementById(`step-card-${nextIncompleteStep.id}`);
                    el?.scrollIntoView({ behavior: "smooth", block: "center" });
                  }}
                  className="w-full sm:w-auto px-3.5 py-2 sm:py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold transition-colors cursor-pointer shrink-0 text-center"
                >
                  رفتن به این گام
                </button>
              </div>
            )}
          </div>

          {/* Category Filters Bar */}
          <div className="flex items-center justify-between gap-2 flex-wrap px-1">
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
              <span className="text-[11px] font-semibold text-neutral-400 shrink-0 ml-1 flex items-center gap-1">
                <Filter className="w-3 h-3" />
                <span>فیلتر فصول:</span>
              </span>
              <button
                type="button"
                onClick={() => setCategoryFilter("all")}
                className={cn(
                  "px-3 py-1 rounded-lg transition-all text-xs font-semibold cursor-pointer border",
                  categoryFilter === "all"
                    ? "bg-black text-white border-black"
                    : "bg-white text-neutral-600 border-neutral-200 hover:bg-neutral-50"
                )}
              >
                همه بخش‌ها ({activeRoadmap.steps.length})
              </button>
              {categories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategoryFilter(cat)}
                  className={cn(
                    "px-3 py-1 rounded-lg transition-all text-xs font-semibold cursor-pointer border shrink-0",
                    categoryFilter === cat
                      ? "bg-black text-white border-black"
                      : "bg-white text-neutral-600 border-neutral-200 hover:bg-neutral-50"
                  )}
                >
                  {cat}
                </button>
              ))}
            </div>

            <span className="text-[11px] text-neutral-400 font-mono">
              {visibleSteps.length} گام درسی نمایش داده شده
            </span>
          </div>

          {/* Step Timeline Cards */}
          <div className="relative space-y-4 before:absolute before:top-6 before:bottom-6 before:right-6 before:w-0.5 before:bg-neutral-200/80 before:hidden sm:before:block">
            {visibleSteps.map((step) => {
              const isDone = currentCompletedList.includes(step.id);
              const isExpanded = expandedStepId === step.id;

              return (
                <div
                  key={step.id}
                  id={`step-card-${step.id}`}
                  className={cn(
                    "rounded-3xl border transition-all overflow-hidden bg-white shadow-2xs relative",
                    isDone
                      ? "border-emerald-300 ring-1 ring-emerald-300/40"
                      : isExpanded
                      ? "border-neutral-900 ring-2 ring-neutral-900/10 shadow-md"
                      : "border-neutral-200 hover:border-neutral-300"
                  )}
                >
                  {/* Step Header Accordion */}
                  <div
                    onClick={() => setExpandedStepId(isExpanded ? null : step.id)}
                    className="p-4 sm:p-5 flex items-start justify-between gap-3 cursor-pointer hover:bg-neutral-50/70 transition-colors"
                  >
                    <div className="flex items-start gap-3.5 min-w-0 flex-1">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleStepCompletion(step.id);
                        }}
                        className={cn(
                          "w-8 h-8 rounded-2xl flex items-center justify-center transition-all cursor-pointer shrink-0 border mt-0.5",
                          isDone
                            ? "bg-emerald-600 border-emerald-600 text-white shadow-xs hover:bg-emerald-700"
                            : "bg-white border-neutral-300 text-neutral-400 hover:border-black hover:text-black"
                        )}
                        title={isDone ? "لغو تیک این گام" : "تیک زدن و تکمیل این گام"}
                      >
                        {isDone ? <Check className="w-4 h-4 stroke-[3]" /> : <Circle className="w-4 h-4" />}
                      </button>

                      <div className="space-y-1 min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-neutral-900 text-white">
                            گام {step.order}
                          </span>
                          <span className="text-[10px] font-bold text-neutral-600 bg-neutral-100 px-2 py-0.5 rounded-md">
                            {step.category}
                          </span>
                          <span className="text-[11px] font-mono text-neutral-400 flex items-center gap-1 font-semibold">
                            <Clock className="w-3 h-3 text-neutral-400" />
                            <span>{step.duration}</span>
                          </span>
                          {isDone && (
                            <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.2 rounded-md flex items-center gap-1">
                              <Check className="w-3 h-3 stroke-[2.5]" />
                              <span>تکمیل شد</span>
                            </span>
                          )}
                        </div>

                        <h3
                          className={cn(
                            "text-sm sm:text-base font-extrabold text-neutral-900 leading-snug break-words",
                            isDone ? "text-neutral-500" : ""
                          )}
                        >
                          {step.title}
                        </h3>
                        <p className="text-xs font-mono text-neutral-400 truncate hidden sm:block">
                          {step.titleEn}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 mt-1">
                      <span className="text-xs text-neutral-400 hidden sm:inline">
                        {isExpanded ? "بستن محتوا" : "مشاهده جزئیات"}
                      </span>
                      <div
                        className={cn(
                          "p-1.5 rounded-lg text-neutral-500 transition-transform duration-150",
                          isExpanded ? "rotate-90 text-black" : ""
                        )}
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </div>
                    </div>
                  </div>

                  {/* Step Expanded Content */}
                  {isExpanded && (
                    <div className="p-4 sm:p-6 border-t border-neutral-100 bg-neutral-50/40 space-y-6 animate-in fade-in duration-100 min-w-0">
                      {/* Step Summary */}
                      <div className="p-4 rounded-2xl bg-white border border-neutral-200/90 space-y-2">
                        <span className="text-xs font-bold text-neutral-900 block flex items-center gap-1.5">
                          <BookOpen className="w-3.5 h-3.5 text-neutral-700" />
                          <span>شرح و سرفصل آموزشی گام {step.order}:</span>
                        </span>
                        <p className="text-xs sm:text-sm text-neutral-700 leading-relaxed text-justify break-words">
                          {step.summary}
                        </p>
                      </div>

                      {/* Interactive Competencies Checklist */}
                      <div className="p-4 rounded-2xl bg-white border border-neutral-200/90 space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-neutral-900 flex items-center gap-1.5">
                            <BookmarkCheck className="w-4 h-4 text-emerald-600" />
                            <span>شایستگی‌ها و مهارت‌های محوری (برای تسلط تیک بزنید):</span>
                          </span>
                          <span className="text-[10px] font-mono text-neutral-400">
                            {
                              step.keyCompetencies.filter(
                                (_, cIdx) => competencyChecks[`${step.id}-comp-${cIdx}`]
                              ).length
                            }{" "}
                            از {step.keyCompetencies.length}
                          </span>
                        </div>

                        <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                          {step.keyCompetencies.map((comp, cIdx) => {
                            const compKey = `${step.id}-comp-${cIdx}`;
                            const isChecked = !!competencyChecks[compKey];

                            return (
                              <li
                                key={cIdx}
                                onClick={() => toggleCompetency(compKey)}
                                className={cn(
                                  "p-3 rounded-xl border flex items-start gap-2.5 transition-all cursor-pointer select-none",
                                  isChecked
                                    ? "bg-emerald-50/70 border-emerald-200 text-emerald-950 font-medium"
                                    : "bg-neutral-50 hover:bg-neutral-100 border-neutral-200 text-neutral-700"
                                )}
                              >
                                <span
                                  className={cn(
                                    "w-4 h-4 rounded-md flex items-center justify-center shrink-0 mt-0.5 transition-colors",
                                    isChecked
                                      ? "bg-emerald-600 text-white"
                                      : "border border-neutral-400 bg-white"
                                  )}
                                >
                                  {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                                </span>
                                <span className="leading-snug flex-1 break-words">{comp}</span>
                              </li>
                            );
                          })}
                        </ul>
                      </div>

                      {/* Actions Toolbar */}
                      <div className="p-3.5 bg-white rounded-2xl border border-neutral-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
                          {step.articleId && (
                            <button
                              type="button"
                              onClick={() => onNavigateToArticle?.(step.articleId!, step.sectionId)}
                              className="w-full sm:w-auto px-3.5 py-2.5 sm:py-2 rounded-xl bg-neutral-900 hover:bg-black text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                            >
                              <BookOpen className="w-3.5 h-3.5" />
                              <span>مطالعه مقاله مرجع در دانشنامه</span>
                            </button>
                          )}

                          {step.toolsAction === "racks" && (
                            <button
                              type="button"
                              onClick={() => onOpenRacksMap?.("racks")}
                              className="w-full sm:w-auto px-3.5 py-2.5 sm:py-2 rounded-xl bg-sky-50 text-sky-800 hover:bg-sky-100 border border-sky-200 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                            >
                              <Server className="w-3.5 h-3.5" />
                              <span>{step.actionLabel || "مشاهده رک در اطلس"}</span>
                            </button>
                          )}

                          {step.toolsAction === "simulator" && (
                            <button
                              type="button"
                              onClick={() => onOpenSimulator?.()}
                              className="w-full sm:w-auto px-3.5 py-2.5 sm:py-2 rounded-xl bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                            >
                              <Play className="w-3.5 h-3.5 fill-current" />
                              <span>{step.actionLabel || "اجرای سناریو در شبیه‌ساز"}</span>
                            </button>
                          )}
                        </div>

                        {/* Step Completion & Auto Advance Button */}
                        <button
                          type="button"
                          onClick={() => handleCompleteAndNext(step)}
                          className={cn(
                            "w-full sm:w-auto px-4 py-2.5 sm:py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-2xs shrink-0",
                            isDone
                              ? "bg-neutral-100 text-neutral-800 hover:bg-neutral-200 border border-neutral-200"
                              : "bg-emerald-600 hover:bg-emerald-700 text-white"
                          )}
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          <span>{isDone ? "تکمیل شده (رفتن به بعدی)" : "تیک زدن و رفتن به گام بعد"}</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 2: مرکز آزمون و سنجش صلاحیت (DEDICATED EXAM & CERTIFICATION CENTER)
         ========================================================================= */}
      {mainTab === "exam" && (
        <div className="space-y-6 animate-in fade-in duration-150">
          {/* Exam Header Dashboard */}
          <div className="bg-white rounded-3xl border border-neutral-200 p-5 sm:p-7 shadow-xs space-y-6">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 pb-5 border-b border-neutral-100">
              <div className="space-y-2 flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-bold px-2.5 py-0.5 rounded-lg bg-black text-white font-mono">
                    مرکز آزمون استاندارد CENELEC
                  </span>
                  <span className="text-xs font-mono text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-lg font-bold">
                    حد نصاب قبولی: {activeRoleExam.passingScorePercent}٪
                  </span>
                  <span className="text-xs font-mono text-neutral-500 bg-neutral-100 px-2 py-0.5 rounded-lg">
                    مدت زمان استاندارد: {activeRoleExam.durationMinutes} دقیقه
                  </span>
                </div>

                <h2 className="text-lg sm:text-xl font-black text-neutral-900 leading-snug">
                  {activeRoleExam.title}
                </h2>
                <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed text-justify max-w-3xl">
                  آزمون رسمی سنجش شایستگی مهندسی شامل سوالات تخصصی استاندارد، تحلیل سناریوهای بحرانی خط ۱ و صدور گواهینامه معتبر.
                </p>
              </div>

              {/* Exam History Score Badge (if previously taken) */}
              {examHistory[activeRoleExam.roleId] && !isExamSubmitted && (
                <div className="flex items-center gap-3 bg-neutral-50 border border-neutral-200 rounded-2xl p-4 shrink-0">
                  <div className="text-right">
                    <span className="text-[11px] text-neutral-500 font-semibold block">آخرین نتیجه ثبت‌شده:</span>
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-2xl font-black font-mono text-neutral-900">
                        {examHistory[activeRoleExam.roleId].scorePercent}%
                      </span>
                      <span
                        className={cn(
                          "text-xs font-bold px-2 py-0.5 rounded-md",
                          examHistory[activeRoleExam.roleId].passed
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-rose-100 text-rose-800"
                        )}
                      >
                        {examHistory[activeRoleExam.roleId].passed ? "تایید صلاحیت" : "عدم قبولی"}
                      </span>
                    </div>
                    <span className="text-[10px] text-neutral-400 font-mono block">
                      تاریخ: {examHistory[activeRoleExam.roleId].date}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Exam Mode Toggle (Comprehensive Exam vs Modular Step Quizzes) */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs pt-1">
              <div className="flex items-center gap-2">
                <span className="font-bold text-neutral-700">نوع ارزیابی:</span>
                <div className="p-1 bg-neutral-100 rounded-xl flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => handleStartExam("comprehensive")}
                    className={cn(
                      "px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer",
                      examMode === "comprehensive"
                        ? "bg-white text-black shadow-2xs"
                        : "text-neutral-600 hover:text-black"
                    )}
                  >
                    آزمون جامع نقش ({activeRoleExam.questions.length} سوال)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const firstStepWithQ = activeRoadmap.steps[0]?.id;
                      handleStartExam("modular", firstStepWithQ);
                    }}
                    className={cn(
                      "px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer",
                      examMode === "modular"
                        ? "bg-white text-black shadow-2xs"
                        : "text-neutral-600 hover:text-black"
                    )}
                  >
                    آزمون گام‌به‌گام موضوعی
                  </button>
                </div>
              </div>

              {/* Modular Step Selector (if in modular mode) */}
              {examMode === "modular" && (
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                  {activeRoadmap.steps.map((st) => (
                    <button
                      key={st.id}
                      type="button"
                      onClick={() => handleStartExam("modular", st.id)}
                      className={cn(
                        "px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-colors cursor-pointer shrink-0",
                        selectedModularStepId === st.id
                          ? "bg-black text-white border-black"
                          : "bg-white text-neutral-600 border-neutral-200 hover:bg-neutral-50"
                      )}
                    >
                      گام {st.order}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* ACTIVE EXAM RUNNER OR SCORECARD REPORT */}
          {!isExamSubmitted ? (
            /* --- In-Progress Exam View --- */
            <div className="bg-white rounded-3xl border border-neutral-200 p-5 sm:p-7 shadow-xs space-y-6">
              {/* Exam Live Header Bar (Timer + Progress + Question Counter) */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-neutral-50 border border-neutral-200/80">
                <div className="flex items-center gap-3">
                  <span className="p-2 rounded-xl bg-neutral-900 text-white font-mono text-xs font-bold">
                    سوال {currentQuestionIndex + 1} از {activeExamQuestions.length}
                  </span>
                  <div className="text-xs space-y-0.5">
                    <span className="font-bold text-neutral-800 block">
                      پاسخ داده شده: {Object.keys(userExamAnswers).length} از {activeExamQuestions.length}
                    </span>
                    <span className="text-[11px] text-neutral-500">
                      نشانه‌گذاری شده: {flaggedQuestions.length} سوال
                    </span>
                  </div>
                </div>

                {/* Countdown Timer Widget */}
                <div className="flex items-center gap-2.5 w-full sm:w-auto justify-between sm:justify-end">
                  <div
                    className={cn(
                      "px-3.5 py-1.5 rounded-xl font-mono text-xs font-bold flex items-center gap-2 border",
                      examTimerSeconds < 5 * 60
                        ? "bg-rose-50 text-rose-700 border-rose-200 animate-pulse"
                        : "bg-white text-neutral-900 border-neutral-200"
                    )}
                  >
                    <Timer className="w-4 h-4" />
                    <span>{formatTimer(examTimerSeconds)}</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      if (
                        window.confirm(
                          `آیا مایل به ثبت نهایی و پایان آزمون هستید؟ (${Object.keys(userExamAnswers).length} از ${activeExamQuestions.length} پاسخ داده شده)`
                        )
                      ) {
                        handleSubmitExam();
                      }
                    }}
                    className="px-4 py-2 rounded-xl bg-black hover:bg-neutral-800 text-white text-xs font-bold transition-colors cursor-pointer shadow-2xs"
                  >
                    پایان و ثبت آزمون
                  </button>
                </div>
              </div>

              {/* Question Navigator Grid (Interactive 1..10 Pills) */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none">
                {activeExamQuestions.map((q, idx) => {
                  const isAnswered = userExamAnswers[q.id] !== undefined;
                  const isCurrent = currentQuestionIndex === idx;
                  const isFlagged = flaggedQuestions.includes(q.id);

                  return (
                    <button
                      key={q.id}
                      type="button"
                      onClick={() => setCurrentQuestionIndex(idx)}
                      className={cn(
                        "w-9 h-9 rounded-xl font-mono text-xs font-bold transition-all flex items-center justify-center cursor-pointer shrink-0 relative border",
                        isCurrent
                          ? "bg-neutral-900 text-white border-neutral-900 ring-2 ring-neutral-900/20 shadow-xs"
                          : isAnswered
                          ? "bg-emerald-50 border-emerald-400 text-emerald-900"
                          : "bg-white border-neutral-200 text-neutral-600 hover:bg-neutral-100"
                      )}
                      title={`سوال ${idx + 1}${isFlagged ? " (نشانه‌گذاری شده)" : ""}`}
                    >
                      <span>{idx + 1}</span>
                      {isFlagged && (
                        <span className="w-2 h-2 rounded-full bg-amber-500 absolute -top-0.5 -right-0.5" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Active Question Card */}
              {activeExamQuestions[currentQuestionIndex] && (
                <div className="p-5 sm:p-6 rounded-2xl bg-neutral-50/70 border border-neutral-200 space-y-5">
                  {/* Question Meta Bar */}
                  <div className="flex items-center justify-between gap-2 flex-wrap pb-3 border-b border-neutral-200/70 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-md bg-neutral-200 text-neutral-800 font-bold text-[11px]">
                        {activeExamQuestions[currentQuestionIndex].domain}
                      </span>
                      <span className="text-[11px] font-mono text-neutral-400">
                        سطح: {activeExamQuestions[currentQuestionIndex].difficulty}
                      </span>
                      {activeExamQuestions[currentQuestionIndex].standardReference && (
                        <span className="text-[11px] font-mono text-neutral-500 bg-white px-2 py-0.5 rounded border border-neutral-200">
                          {activeExamQuestions[currentQuestionIndex].standardReference}
                        </span>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => toggleFlagQuestion(activeExamQuestions[currentQuestionIndex].id)}
                      className={cn(
                        "px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer border",
                        flaggedQuestions.includes(activeExamQuestions[currentQuestionIndex].id)
                          ? "bg-amber-100 text-amber-900 border-amber-300"
                          : "bg-white text-neutral-600 border-neutral-200 hover:bg-neutral-100"
                      )}
                    >
                      <Flag className="w-3.5 h-3.5" />
                      <span>
                        {flaggedQuestions.includes(activeExamQuestions[currentQuestionIndex].id)
                          ? "نشانه‌گذاری شده"
                          : "نشانه‌گذاری برای بازبینی"}
                      </span>
                    </button>
                  </div>

                  {/* Question Prompt */}
                  <div className="space-y-2">
                    <h3 className="text-sm sm:text-base font-extrabold text-neutral-900 leading-relaxed text-justify break-words">
                      {activeExamQuestions[currentQuestionIndex].question}
                    </h3>
                  </div>

                  {/* 4 Choices */}
                  <div className="space-y-2 pt-2">
                    {activeExamQuestions[currentQuestionIndex].options.map((opt, oIdx) => {
                      const isSelected =
                        userExamAnswers[activeExamQuestions[currentQuestionIndex].id] === oIdx;

                      return (
                        <button
                          key={oIdx}
                          type="button"
                          onClick={() => {
                            setUserExamAnswers((prev) => ({
                              ...prev,
                              [activeExamQuestions[currentQuestionIndex].id]: oIdx,
                            }));
                          }}
                          className={cn(
                            "w-full text-right p-3.5 sm:p-4 rounded-xl border text-xs sm:text-sm transition-all flex items-start gap-3 cursor-pointer min-w-0 break-words",
                            isSelected
                              ? "bg-neutral-900 text-white border-neutral-900 font-bold shadow-xs"
                              : "bg-white hover:bg-neutral-100/90 border-neutral-200 text-neutral-800"
                          )}
                        >
                          <span
                            className={cn(
                              "w-6 h-6 rounded-lg flex items-center justify-center font-mono text-xs font-bold shrink-0 mt-0.5",
                              isSelected ? "bg-white text-black" : "bg-neutral-100 text-neutral-700"
                            )}
                          >
                            {["الف", "ب", "ج", "د"][oIdx] || oIdx + 1}
                          </span>
                          <span className="leading-relaxed flex-1 break-words">{opt}</span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Previous / Next Navigation Buttons */}
                  <div className="pt-4 flex items-center justify-between gap-3 border-t border-neutral-200/70">
                    <button
                      type="button"
                      disabled={currentQuestionIndex === 0}
                      onClick={() => setCurrentQuestionIndex((prev) => Math.max(prev - 1, 0))}
                      className="px-4 py-2 rounded-xl bg-white border border-neutral-200 text-neutral-700 hover:bg-neutral-100 disabled:opacity-40 disabled:pointer-events-none text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <ChevronRight className="w-4 h-4" />
                      <span>سوال قبلی</span>
                    </button>

                    <button
                      type="button"
                      disabled={currentQuestionIndex === activeExamQuestions.length - 1}
                      onClick={() =>
                        setCurrentQuestionIndex((prev) =>
                          Math.min(prev + 1, activeExamQuestions.length - 1)
                        )
                      }
                      className="px-4 py-2 rounded-xl bg-neutral-900 text-white hover:bg-black disabled:opacity-40 disabled:pointer-events-none text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <span>سوال بعدی</span>
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* --- Comprehensive Exam Scorecard & Certification Report View --- */
            examScoreStats && (
              <div className="space-y-6">
                {/* 1. Score Summary Banner */}
                <div
                  className={cn(
                    "p-6 sm:p-8 rounded-3xl border-2 text-right space-y-6",
                    examScoreStats.passed
                      ? "bg-emerald-50/80 border-emerald-500 text-emerald-950"
                      : "bg-rose-50/80 border-rose-400 text-rose-950"
                  )}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-black/10">
                    <div className="flex items-center gap-3.5">
                      <div
                        className={cn(
                          "w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-xs shrink-0",
                          examScoreStats.passed ? "bg-emerald-600" : "bg-rose-600"
                        )}
                      >
                        {examScoreStats.passed ? <Trophy className="w-6 h-6" /> : <AlertOctagon className="w-6 h-6" />}
                      </div>

                      <div className="space-y-0.5">
                        <span className="text-xs font-bold uppercase tracking-wider block opacity-80">
                          کارنامه رسمی سنجش صلاحیت حرفه‌ای:
                        </span>
                        <h3 className="text-lg sm:text-xl font-black">
                          {examScoreStats.passed
                            ? "تبریک! صلاحیت حرفه‌ای شما با موفقیت تایید شد."
                            : "نمره شما به حد نصاب قبولی (۷۵٪) نرسید."}
                        </h3>
                      </div>
                    </div>

                    <div className="flex items-baseline gap-2 bg-white/70 px-4 py-2.5 rounded-2xl border border-black/10 self-start sm:self-auto">
                      <span className="text-3xl font-black font-mono">{examScoreStats.percent}%</span>
                      <span className="text-xs font-semibold opacity-70">
                        ({examScoreStats.correct} از {examScoreStats.total} صحیح)
                      </span>
                    </div>
                  </div>

                  <p className="text-xs sm:text-sm leading-relaxed text-justify">
                    {examScoreStats.passed
                      ? `شما با کسب نمره ${examScoreStats.percent}٪ استاندارد یکپارچگی ایمنی SIL 4 را احراز نمودید و گواهینامه دیجیتال رسمی شما در زیر صادر گردیده است.`
                      : `حد نصاب استاندارد ${activeRoleExam.passingScorePercent}٪ الزامی است. می‌توانید سرفصل‌های آموزشی را مجدداً مرور کرده و در آزمون شرکت فرمایید.`}
                  </p>

                  <div className="flex items-center gap-3 pt-1 flex-wrap">
                    <button
                      type="button"
                      onClick={() => handleStartExam(examMode, selectedModularStepId || undefined)}
                      className="px-4 py-2 rounded-xl bg-black hover:bg-neutral-800 text-white text-xs font-bold flex items-center gap-2 transition-colors cursor-pointer shadow-xs"
                    >
                      <RefreshCw className="w-4 h-4" />
                      <span>شرکت مجدد در آزمون</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setMainTab("learning")}
                      className="px-4 py-2 rounded-xl bg-white hover:bg-neutral-100 text-neutral-800 border border-neutral-300 text-xs font-bold flex items-center gap-2 transition-colors cursor-pointer"
                    >
                      <BookOpen className="w-4 h-4" />
                      <span>بازگشت به بخش آموزش و سرفصل‌ها</span>
                    </button>
                  </div>
                </div>

                {/* 2. Official Digital Certification Card (if passed) */}
                {examScoreStats.passed && (
                  <div className="bg-white rounded-3xl border-2 border-neutral-900 p-6 sm:p-8 shadow-md relative overflow-hidden space-y-6">
                    <div className="absolute top-0 right-0 left-0 h-2 bg-gradient-to-r from-emerald-500 via-neutral-900 to-sky-500" />

                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-4 border-b border-neutral-100">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
                          <span className="text-xs font-mono font-bold tracking-widest text-neutral-500 uppercase">
                            METRO RAIL SYSTEM • SIL 4 CERTIFICATION
                          </span>
                        </div>
                        <h4 className="text-lg sm:text-xl font-black text-neutral-900">
                          گواهینامه دیجیتال صلاحیت و شایستگی فنی
                        </h4>
                      </div>

                      <div className="text-right sm:text-left font-mono text-xs text-neutral-400">
                        <div>کد گواهی: CERT-{activeRoleExam.roleId.toUpperCase()}-{Date.now().toString().slice(-6)}</div>
                        <div>تاریخ صدور: {new Date().toLocaleDateString("fa-IR")}</div>
                      </div>
                    </div>

                    <div className="space-y-3 text-xs sm:text-sm text-neutral-800 leading-relaxed text-justify bg-neutral-50 p-4 rounded-2xl border border-neutral-200">
                      <p>
                        بدین‌وسیله گواهی می‌شود که دارنده این سند، سرفصل‌های تخصصی دوره{" "}
                        <strong className="text-neutral-950 font-extrabold">{activeRoleExam.title}</strong>{" "}
                        را با نمره قبولی{" "}
                        <strong className="text-emerald-700 font-mono font-black">{examScoreStats.percent}٪</strong>{" "}
                        بر مبنای الزامات استانداردهای بین‌المللی ریلی CENELEC EN 50126 / EN 50128 / EN 50129 با موفقیت به پایان رسانده است.
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-2 flex-wrap gap-4 text-xs">
                      <div className="flex items-center gap-2">
                        <span className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                          ✓
                        </span>
                        <span className="text-neutral-600 font-semibold">
                          احراز صلاحیت فنی تایید شده در پایگاه سیستم خط ۱
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => window.print()}
                        className="px-3.5 py-1.5 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <Printer className="w-4 h-4" />
                        <span>چاپ / ذخیره گواهینامه</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* 3. Detailed Question-by-Question Review with Engineering Rationale */}
                <div className="bg-white rounded-3xl border border-neutral-200 p-5 sm:p-7 shadow-xs space-y-5">
                  <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
                    <h4 className="text-sm sm:text-base font-extrabold text-neutral-900 flex items-center gap-2">
                      <FileCheck2 className="w-4 h-4 text-neutral-700" />
                      <span>تحلیل تشریحی سوالات و استدلال‌های مهندسی:</span>
                    </h4>
                    <span className="text-xs text-neutral-400 font-mono">
                      {activeExamQuestions.length} سوال بررسی شده
                    </span>
                  </div>

                  <div className="space-y-4">
                    {activeExamQuestions.map((q, idx) => {
                      const userChoice = userExamAnswers[q.id];
                      const isCorrect = userChoice === q.correctIndex;
                      const isAnswered = userChoice !== undefined;

                      return (
                        <div
                          key={q.id}
                          className={cn(
                            "p-4 sm:p-5 rounded-2xl border text-xs sm:text-sm space-y-3 transition-colors",
                            isCorrect
                              ? "bg-emerald-50/40 border-emerald-200"
                              : "bg-rose-50/40 border-rose-200"
                          )}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-center gap-2 font-bold">
                              <span
                                className={cn(
                                  "w-6 h-6 rounded-lg font-mono text-xs flex items-center justify-center text-white shrink-0",
                                  isCorrect ? "bg-emerald-600" : "bg-rose-600"
                                )}
                              >
                                {idx + 1}
                              </span>
                              <span className="text-neutral-900 font-extrabold break-words">
                                {q.question}
                              </span>
                            </div>

                            <span
                              className={cn(
                                "text-[11px] font-bold px-2 py-0.5 rounded-md shrink-0",
                                isCorrect
                                  ? "bg-emerald-100 text-emerald-800"
                                  : "bg-rose-100 text-rose-800"
                              )}
                            >
                              {isCorrect ? "صحیح" : "نادرست"}
                            </span>
                          </div>

                          {/* Options breakdown */}
                          <div className="space-y-1.5 pt-1">
                            {q.options.map((opt, oIdx) => {
                              const isThisCorrect = oIdx === q.correctIndex;
                              const isThisUserChoice = userChoice === oIdx;

                              return (
                                <div
                                  key={oIdx}
                                  className={cn(
                                    "p-2.5 rounded-xl border text-xs flex items-center justify-between",
                                    isThisCorrect
                                      ? "bg-emerald-100/80 border-emerald-400 text-emerald-950 font-bold"
                                      : isThisUserChoice
                                      ? "bg-rose-100/80 border-rose-400 text-rose-950 font-bold"
                                      : "bg-white/80 border-neutral-200/80 text-neutral-600 opacity-70"
                                  )}
                                >
                                  <span className="leading-relaxed flex-1 break-words">{opt}</span>
                                  {isThisCorrect && (
                                    <span className="text-[10px] font-mono font-bold text-emerald-800 ms-2 shrink-0">
                                      ✓ گزینه صحیح
                                    </span>
                                  )}
                                  {isThisUserChoice && !isThisCorrect && (
                                    <span className="text-[10px] font-mono font-bold text-rose-800 ms-2 shrink-0">
                                      ✗ انتخاب شما
                                    </span>
                                  )}
                                </div>
                              );
                            })}
                          </div>

                          {/* Engineering Rationale & Standard reference */}
                          <div className="p-3 rounded-xl bg-white/90 border border-neutral-200 text-xs text-neutral-800 space-y-1 leading-relaxed text-justify">
                            <strong className="text-neutral-900 block font-bold">
                              استدلال مهندسی و تحلیل علت:
                            </strong>
                            <p>{q.explanation}</p>
                            {q.standardReference && (
                              <div className="text-[11px] font-mono text-neutral-500 pt-1">
                                مرجع استاندارد: {q.standardReference}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )
          )}
        </div>
      )}
    </div>
  );
};
