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
  const [learningViewMode, setLearningViewMode] = useState<"reader" | "list">("reader");
  const [stepQuizAnswers, setStepQuizAnswers] = useState<Record<string, number>>({});

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

  // Active step, previous step, and next step derivation for sequential topic navigation
  const currentStepIndex = useMemo(() => {
    const idx = activeRoadmap.steps.findIndex((s) => s.id === expandedStepId);
    return idx >= 0 ? idx : 0;
  }, [activeRoadmap, expandedStepId]);

  const activeStep: CareerRoadmapStep =
    activeRoadmap.steps[currentStepIndex] || activeRoadmap.steps[0];
  const prevStep: CareerRoadmapStep | null =
    currentStepIndex > 0 ? activeRoadmap.steps[currentStepIndex - 1] : null;
  const nextStep: CareerRoadmapStep | null =
    currentStepIndex < activeRoadmap.steps.length - 1 ? activeRoadmap.steps[currentStepIndex + 1] : null;

  const handleGoToPrevStep = () => {
    if (prevStep) {
      setExpandedStepId(prevStep.id);
      setTimeout(() => {
        const el = document.getElementById("active-topic-reader");
        el?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 50);
    }
  };

  const handleGoToNextStep = () => {
    if (nextStep) {
      setExpandedStepId(nextStep.id);
      setTimeout(() => {
        const el = document.getElementById("active-topic-reader");
        el?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 50);
    }
  };

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
      const nextStepObj = activeRoadmap.steps[currentIndex + 1];
      setExpandedStepId(nextStepObj.id);
      setTimeout(() => {
        const readerEl = document.getElementById("active-topic-reader");
        if (readerEl) {
          readerEl.scrollIntoView({ behavior: "smooth", block: "start" });
        } else {
          const cardEl = document.getElementById(`step-card-${nextStepObj.id}`);
          cardEl?.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      }, 50);
    } else {
      // Completed all steps in this curriculum! Transition to the role exam
      setMainTab("exam");
      handleStartExam("comprehensive");
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
      {/* 1. Header & Minimal Clean Title */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-4 border-b border-neutral-100">
        <div>
          <div className="flex items-center gap-1.5 text-xs text-neutral-400 mb-1">
            <span>دانشنامه مهندسی</span>
            <span>/</span>
            <span className="text-neutral-600 font-medium">مسیرهای شغلی و آموزش</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-black tracking-tight">
            مسیر شایستگی و آموزش مهندسی
          </h1>
          <p className="text-xs sm:text-sm text-neutral-500 mt-1 max-w-2xl leading-relaxed">
            برنامه راهبردی یادگیری مهارت‌های تخصصی، تجهیزات خط، اینترلاکینگ و اتاق‌های SER خط ۱ مترو
          </p>
        </div>

        {/* Tab switch between Learning & Role Exam */}
        <div className="inline-flex items-center p-1 bg-neutral-100 rounded-xl text-xs font-semibold self-start sm:self-auto shrink-0">
          <button
            type="button"
            onClick={() => setMainTab("learning")}
            className={cn(
              "px-3.5 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5",
              mainTab === "learning"
                ? "bg-white text-black shadow-2xs font-bold"
                : "text-neutral-500 hover:text-black"
            )}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>مسیر آموزش ({activeRoadmap.steps.length} گام)</span>
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
              "px-3.5 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5",
              mainTab === "exam"
                ? "bg-white text-black shadow-2xs font-bold"
                : "text-neutral-500 hover:text-black"
            )}
          >
            <Award className="w-3.5 h-3.5 text-amber-600" />
            <span>آزمون این نقش</span>
          </button>
        </div>
      </div>

      {/* 2. Sleek, Minimal Role Selector Chips */}
      <div>
        <div className="text-[11px] font-semibold text-neutral-400 mb-2">
          انتخاب نقش مهندسی:
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {Object.values(ROLE_ROADMAPS).map((role) => {
            const isSelected = role.id === selectedRoleId;
            const completedCount = (completedSteps[role.id] || []).length;
            const percent = Math.round((completedCount / (role.steps.length || 1)) * 100);

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
                  "p-3 rounded-xl text-right transition-all border flex items-center gap-2.5 cursor-pointer relative",
                  isSelected
                    ? "bg-black text-white border-black shadow-2xs"
                    : "bg-white hover:bg-neutral-50 border-neutral-200 text-neutral-800"
                )}
              >
                <div
                  className={cn(
                    "p-1.5 rounded-lg shrink-0",
                    isSelected ? "bg-white/15 text-white" : "bg-neutral-100 text-neutral-600"
                  )}
                >
                  {getRoleIcon(role.iconName, "w-4 h-4")}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="text-xs font-bold truncate leading-tight">
                    {role.roleTitle.split(" (")[0]}
                  </div>
                  <div
                    className={cn(
                      "text-[10px] font-mono mt-0.5",
                      isSelected ? "text-neutral-300" : "text-neutral-400"
                    )}
                  >
                    {percent}% تکمیل‌شده
                  </div>
                </div>

                {isSelected && (
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* =========================================================================
          TAB 1: آموزش و مسیر شایستگی‌ها (COMPREHENSIVE TRAINING & LEARNING SECTION)
         ========================================================================= */}
      {mainTab === "learning" && (
        <div className="space-y-5 animate-in fade-in duration-100">
          {/* Active Role Meta & Progress Bar */}
          <div className="p-4 sm:p-5 rounded-2xl bg-neutral-50/70 border border-neutral-200/90 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap text-xs">
                  <span className="font-bold text-black">{activeRoadmap.roleTitle}</span>
                  <span className="text-neutral-300">·</span>
                  <span className="text-neutral-500 font-mono text-[11px]">{activeRoadmap.estimatedTotalHours}</span>
                  <span className="text-neutral-300">·</span>
                  <span className="text-neutral-500 text-[11px]">{activeRoadmap.badge}</span>
                </div>
                <p className="text-xs text-neutral-600 leading-relaxed max-w-3xl">
                  {activeRoadmap.description}
                </p>
              </div>

              <div className="flex items-center gap-3 shrink-0 self-end sm:self-auto">
                <div className="text-left sm:text-right">
                  <div className="text-xs font-mono font-bold text-black">
                    {currentCompletedList.length} از {activeRoadmap.steps.length} گام
                  </div>
                  <div className="text-[10px] text-neutral-400 font-medium">پیشرفت کلی</div>
                </div>
                <div className="px-2.5 py-1 rounded-lg bg-black text-white font-mono text-xs font-bold">
                  {progressPercent}%
                </div>
              </div>
            </div>

            {/* Progress line */}
            <div className="w-full bg-neutral-200/80 rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-black h-full transition-all duration-300 rounded-full"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

            {/* View Mode & Topic Stepper Header */}
            <div className="space-y-3 pt-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                <div className="flex items-center gap-1.5 text-xs font-bold text-neutral-800">
                  <span>سرفصل‌های آموزشی این دوره</span>
                  <span className="font-mono text-neutral-400">({activeRoadmap.steps.length} مبحث تخصصی)</span>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-auto">
                  {/* View Mode Toggle: Reader vs Overview */}
                  <div className="inline-flex items-center p-0.5 bg-neutral-100 rounded-lg text-[11px] font-semibold border border-neutral-200/60">
                    <button
                      type="button"
                      onClick={() => setLearningViewMode("reader")}
                      className={cn(
                        "px-2.5 py-1 rounded-md transition-all cursor-pointer flex items-center gap-1.5",
                        learningViewMode === "reader"
                          ? "bg-white text-black shadow-2xs font-bold"
                          : "text-neutral-500 hover:text-black"
                      )}
                    >
                      <BookOpen className="w-3 h-3" />
                      <span>مطالعه گام‌به‌گام</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setLearningViewMode("list")}
                      className={cn(
                        "px-2.5 py-1 rounded-md transition-all cursor-pointer flex items-center gap-1.5",
                        learningViewMode === "list"
                          ? "bg-white text-black shadow-2xs font-bold"
                          : "text-neutral-500 hover:text-black"
                      )}
                    >
                      <Layers className="w-3 h-3" />
                      <span>نمای کلی سرفصل‌ها</span>
                    </button>
                  </div>

                  {currentCompletedList.length > 0 && (
                    <button
                      type="button"
                      onClick={handleResetRoleProgress}
                      className="text-[11px] text-neutral-400 hover:text-neutral-800 transition-colors flex items-center gap-1 cursor-pointer px-1 py-1"
                      title="بازنشانی پیشرفت آموزش"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span className="hidden sm:inline">بازنشانی</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Horizontal Stepper Timeline Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                {activeRoadmap.steps.map((st, sIdx) => {
                  const isDone = currentCompletedList.includes(st.id);
                  const isCurrent = activeStep.id === st.id;

                  return (
                    <button
                      key={st.id}
                      type="button"
                      onClick={() => {
                        setExpandedStepId(st.id);
                        if (learningViewMode !== "reader") {
                          setLearningViewMode("reader");
                        }
                      }}
                      className={cn(
                        "px-3 py-2 rounded-xl border text-right transition-all flex items-center gap-2 cursor-pointer text-xs shrink-0",
                        isCurrent
                          ? "bg-black text-white border-black shadow-xs font-bold"
                          : isDone
                          ? "bg-neutral-100 text-neutral-800 border-neutral-300 hover:bg-neutral-200"
                          : "bg-white hover:bg-neutral-50 border-neutral-200 text-neutral-600"
                      )}
                    >
                      <span
                        className={cn(
                          "w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-mono font-bold shrink-0",
                          isCurrent
                            ? "bg-white text-black"
                            : isDone
                            ? "bg-emerald-600 text-white"
                            : "bg-neutral-200 text-neutral-700"
                        )}
                      >
                        {isDone ? <Check className="w-3 h-3 stroke-[3]" /> : sIdx + 1}
                      </span>
                      <span className="truncate max-w-[150px] sm:max-w-[220px]">
                        گام {st.order}: {st.title.split(". ")[1] || st.title}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* MODE 1: FOCUSED TOPIC READER */}
            {learningViewMode === "reader" && (
              <div id="active-topic-reader" className="bg-white rounded-3xl border border-neutral-200 p-5 sm:p-8 space-y-6 shadow-xs animate-in fade-in duration-100">
                {/* Topic Header Bar */}
                <div className="pb-5 border-b border-neutral-100 space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono font-bold bg-neutral-100 text-neutral-900 px-2.5 py-1 rounded-lg">
                        مبحث {currentStepIndex + 1} از {activeRoadmap.steps.length}
                      </span>
                      <span className="text-neutral-300">·</span>
                      <span className="text-neutral-500 font-semibold">{activeStep.category}</span>
                      <span className="text-neutral-300">·</span>
                      <span className="font-mono text-neutral-400">{activeStep.duration}</span>
                    </div>

                    <button
                      type="button"
                      onClick={() => toggleStepCompletion(activeStep.id)}
                      className={cn(
                        "px-3 py-1.5 rounded-lg border text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer",
                        currentCompletedList.includes(activeStep.id)
                          ? "bg-emerald-50 border-emerald-300 text-emerald-800"
                          : "bg-neutral-50 hover:bg-neutral-100 border-neutral-200 text-neutral-700"
                      )}
                    >
                      <span
                        className={cn(
                          "w-4 h-4 rounded flex items-center justify-center text-[10px]",
                          currentCompletedList.includes(activeStep.id)
                            ? "bg-emerald-600 text-white"
                            : "border border-neutral-300 bg-white"
                        )}
                      >
                        {currentCompletedList.includes(activeStep.id) && <Check className="w-3 h-3 stroke-[3]" />}
                      </span>
                      <span>
                        {currentCompletedList.includes(activeStep.id) ? "تکمیل شده ✓" : "علامت‌گذاری به عنوان تکمیل"}
                      </span>
                    </button>
                  </div>

                  <div>
                    <h2 className="text-xl sm:text-2xl font-black text-neutral-900 tracking-tight leading-snug">
                      {activeStep.title}
                    </h2>
                    <p className="text-xs sm:text-sm font-mono text-neutral-400 mt-1">
                      {activeStep.titleEn}
                    </p>
                  </div>
                </div>

                {/* Educational Content & Technical Summary */}
                <div className="space-y-4">
                  <div className="text-xs font-bold text-neutral-400 uppercase tracking-wider">
                    شرح و مبانی فنی این مبحث:
                  </div>
                  <div className="p-4 sm:p-5 rounded-2xl bg-neutral-50/80 border border-neutral-200/70 text-neutral-800 text-xs sm:text-sm leading-relaxed text-justify space-y-2">
                    <p>{activeStep.summary}</p>
                  </div>
                </div>

                {/* Interactive Key Competencies Checklist */}
                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-neutral-900">
                      مهارت‌ها و شایستگی‌های محوری این مبحث:
                    </span>
                    <span className="font-mono text-neutral-400 text-[11px]">
                      {
                        activeStep.keyCompetencies.filter(
                          (_, cIdx) => competencyChecks[`${activeStep.id}-comp-${cIdx}`]
                        ).length
                      }{" "}
                      از {activeStep.keyCompetencies.length} تسلط‌یافته
                    </span>
                  </div>

                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                    {activeStep.keyCompetencies.map((comp, cIdx) => {
                      const compKey = `${activeStep.id}-comp-${cIdx}`;
                      const isChecked = !!competencyChecks[compKey];

                      return (
                        <li
                          key={cIdx}
                          onClick={() => toggleCompetency(compKey)}
                          className={cn(
                            "p-3 rounded-xl border flex items-start gap-2.5 transition-all cursor-pointer select-none",
                            isChecked
                              ? "bg-neutral-50/90 border-neutral-300 text-neutral-900 font-medium"
                              : "bg-white hover:bg-neutral-50/80 border-neutral-200 text-neutral-600"
                          )}
                        >
                          <span
                            className={cn(
                              "w-4 h-4 rounded flex items-center justify-center shrink-0 mt-0.5 transition-colors",
                              isChecked
                                ? "bg-black text-white"
                                : "border border-neutral-300 bg-white"
                            )}
                          >
                            {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                          </span>
                          <span className="leading-relaxed flex-1 break-words">{comp}</span>
                        </li>
                      );
                    })}
                  </ul>
                </div>

                {/* Technical References & Tool Launchers */}
                <div className="pt-2 flex flex-wrap items-center gap-2">
                  {activeStep.articleId && (
                    <button
                      type="button"
                      onClick={() => onNavigateToArticle?.(activeStep.articleId!, activeStep.sectionId)}
                      className="px-3.5 py-2 rounded-xl border border-neutral-200 hover:border-black text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer text-neutral-700 hover:text-black bg-white"
                    >
                      <BookOpen className="w-3.5 h-3.5 text-neutral-500" />
                      <span>مطالعه مقاله تفصیلی در دانشنامه</span>
                    </button>
                  )}

                  {activeStep.toolsAction === "racks" && (
                    <button
                      type="button"
                      onClick={() => onOpenRacksMap?.("racks")}
                      className="px-3.5 py-2 rounded-xl border border-neutral-200 hover:border-black text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer text-neutral-700 hover:text-black bg-white"
                    >
                      <Server className="w-3.5 h-3.5 text-neutral-500" />
                      <span>{activeStep.actionLabel || "مشاهده در اطلس رک‌ها"}</span>
                    </button>
                  )}

                  {activeStep.toolsAction === "simulator" && (
                    <button
                      type="button"
                      onClick={() => onOpenSimulator?.()}
                      className="px-3.5 py-2 rounded-xl border border-neutral-200 hover:border-black text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer text-neutral-700 hover:text-black bg-white"
                    >
                      <Play className="w-3.5 h-3.5 fill-current text-neutral-700" />
                      <span>{activeStep.actionLabel || "اجرا در شبیه‌ساز CTC"}</span>
                    </button>
                  )}
                </div>

                {/* Inline Checkpoint Question (Self-Assessment for this step) */}
                {activeStep.checkpointQuestions && activeStep.checkpointQuestions.length > 0 && (
                  <div className="pt-2">
                    <div className="p-4 sm:p-5 rounded-2xl bg-neutral-50 border border-neutral-200 space-y-3">
                      <div className="flex items-center gap-2 text-xs font-bold text-neutral-800">
                        <HelpCircle className="w-4 h-4 text-neutral-500" />
                        <span>چک‌پوینت تسلط و سوال خودآزمایی این مبحث:</span>
                      </div>

                      {activeStep.checkpointQuestions.map((q, qIdx) => {
                        const answerKey = `${activeStep.id}-q-${qIdx}`;
                        const selectedAnswer = stepQuizAnswers[answerKey];
                        const isAnswered = selectedAnswer !== undefined;
                        const isCorrect = selectedAnswer === q.correctIndex;

                        return (
                          <div key={qIdx} className="space-y-3 pt-1">
                            <p className="text-xs sm:text-sm font-bold text-neutral-900 leading-snug">
                              {q.question}
                            </p>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              {q.options.map((opt, optIdx) => {
                                const isOptionSelected = selectedAnswer === optIdx;
                                const isOptionCorrect = optIdx === q.correctIndex;

                                return (
                                  <button
                                    key={optIdx}
                                    type="button"
                                    onClick={() => {
                                      setStepQuizAnswers((prev) => ({
                                        ...prev,
                                        [answerKey]: optIdx,
                                      }));
                                    }}
                                    className={cn(
                                      "p-2.5 rounded-xl border text-right text-xs transition-all cursor-pointer flex items-center gap-2",
                                      isAnswered
                                        ? isOptionCorrect
                                          ? "bg-emerald-50 border-emerald-300 text-emerald-950 font-bold"
                                          : isOptionSelected
                                          ? "bg-rose-50 border-rose-300 text-rose-950"
                                          : "bg-white border-neutral-200 text-neutral-500 opacity-60"
                                        : isOptionSelected
                                        ? "bg-black text-white border-black font-bold"
                                        : "bg-white hover:bg-neutral-50 border-neutral-200 text-neutral-800"
                                    )}
                                  >
                                    <span
                                      className={cn(
                                        "w-5 h-5 rounded-full flex items-center justify-center font-mono text-[10px] shrink-0 font-bold",
                                        isAnswered
                                          ? isOptionCorrect
                                            ? "bg-emerald-600 text-white"
                                            : isOptionSelected
                                            ? "bg-rose-600 text-white"
                                            : "bg-neutral-200 text-neutral-600"
                                          : isOptionSelected
                                          ? "bg-white text-black"
                                          : "bg-neutral-100 text-neutral-700"
                                      )}
                                    >
                                      {optIdx + 1}
                                    </span>
                                    <span className="flex-1 leading-snug">{opt}</span>
                                  </button>
                                );
                              })}
                            </div>

                            {isAnswered && (
                              <div
                                className={cn(
                                  "p-3 rounded-xl text-xs leading-relaxed animate-in fade-in duration-150",
                                  isCorrect
                                    ? "bg-emerald-50 text-emerald-900 border border-emerald-200"
                                    : "bg-rose-50 text-rose-900 border border-rose-200"
                                )}
                              >
                                <strong className="block font-bold mb-1">
                                  {isCorrect ? "✓ پاسخ کاملاً صحیح است!" : "✗ نیاز به مرور دارد"}
                                </strong>
                                <span>{q.explanation}</span>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* DEDICATED PREVIOUS & NEXT TOPIC NAVIGATION (دکمه‌های مبحث بعدی و قبلی) */}
                <div className="pt-6 sm:pt-8 border-t border-neutral-100 space-y-3">
                  <div className="flex items-center justify-between text-xs font-bold text-neutral-400">
                    <span>پیمایش بین مباحث آموزشی دوره</span>
                    <span className="font-mono text-neutral-500 font-bold">
                      مبحث {currentStepIndex + 1} از {activeRoadmap.steps.length}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    {/* Previous Topic (Right in RTL) */}
                    {prevStep ? (
                      <button
                        type="button"
                        onClick={handleGoToPrevStep}
                        className="p-4 rounded-2xl border border-neutral-200 bg-neutral-50/70 hover:bg-neutral-100 hover:border-black text-right transition-all group flex items-start gap-3 cursor-pointer"
                      >
                        <div className="p-2 rounded-xl bg-white border border-neutral-200 text-neutral-600 group-hover:border-black group-hover:text-black transition-colors shrink-0 mt-0.5">
                          <ChevronRight className="w-4 h-4" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <span className="text-[11px] font-bold text-neutral-400 block mb-0.5">
                            مبحث قبلی
                          </span>
                          <h4 className="text-sm font-bold text-neutral-900 group-hover:text-black leading-snug line-clamp-2">
                            {prevStep.title}
                          </h4>
                          <span className="text-[10px] text-neutral-500 font-medium block mt-1">
                            {prevStep.category} · {prevStep.duration}
                          </span>
                        </div>
                      </button>
                    ) : (
                      <div className="p-4 rounded-2xl border border-dashed border-neutral-200 bg-neutral-50/40 text-neutral-400 text-xs flex items-center justify-center">
                        <span>نخستین مبحث این دوره آموزشی</span>
                      </div>
                    )}

                    {/* Next Topic (Left in RTL) */}
                    {nextStep ? (
                      <button
                        type="button"
                        onClick={() => handleCompleteAndNext(activeStep)}
                        className="p-4 rounded-2xl border-2 border-black bg-black text-white hover:bg-neutral-900 text-right transition-all group flex items-start justify-between gap-3 cursor-pointer shadow-sm"
                      >
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 mb-0.5">
                            <span className="text-[11px] font-bold text-neutral-300">
                              مبحث بعدی ⬅
                            </span>
                            <span className="text-[10px] bg-white/20 text-white px-1.5 py-0.2 rounded font-mono">
                              تکمیل و رفتن به بعد
                            </span>
                          </div>
                          <h4 className="text-sm font-bold text-white leading-snug line-clamp-2">
                            {nextStep.title}
                          </h4>
                          <span className="text-[10px] text-neutral-300 font-medium block mt-1">
                            {nextStep.category} · {nextStep.duration}
                          </span>
                        </div>
                        <div className="p-2 rounded-xl bg-white/10 text-white shrink-0 mt-0.5 group-hover:-translate-x-1 transition-transform">
                          <ChevronLeft className="w-4 h-4" />
                        </div>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          if (!currentCompletedList.includes(activeStep.id)) {
                            toggleStepCompletion(activeStep.id);
                          }
                          setMainTab("exam");
                          handleStartExam("comprehensive");
                        }}
                        className="p-4 rounded-2xl border-2 border-neutral-900 bg-neutral-900 hover:bg-black text-white text-right transition-all group flex items-start justify-between gap-3 cursor-pointer shadow-sm"
                      >
                        <div className="min-w-0 flex-1">
                          <span className="text-[11px] font-bold text-amber-300 block mb-0.5">
                            پایان سرفصل‌های دوره 🎓
                          </span>
                          <h4 className="text-sm font-bold text-white leading-snug">
                            ورود به آزمون جامع سنجش شایستگی
                          </h4>
                          <span className="text-[10px] text-neutral-300 font-medium block mt-1">
                            شروع ارزیابی رسمی استاندارد CENELEC
                          </span>
                        </div>
                        <div className="p-2 rounded-xl bg-white/15 text-white shrink-0 mt-0.5 group-hover:-translate-x-1 transition-transform">
                          <Award className="w-4 h-4 text-amber-400" />
                        </div>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* MODE 2: FULL CURRICULUM OVERVIEW LIST */}
            {learningViewMode === "list" && (
              <div className="space-y-4 animate-in fade-in duration-100">
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
                    {visibleSteps.length} گام درسی
                  </span>
                </div>

                {/* Step Timeline Cards */}
                <div className="space-y-3">
                  {visibleSteps.map((step) => {
                    const isDone = currentCompletedList.includes(step.id);
                    const isExpanded = expandedStepId === step.id;

                    return (
                      <div
                        key={step.id}
                        id={`step-card-${step.id}`}
                        className={cn(
                          "rounded-2xl border transition-all overflow-hidden bg-white shadow-2xs",
                          isDone
                            ? "border-emerald-300 ring-1 ring-emerald-300/40"
                            : isExpanded
                            ? "border-neutral-900 ring-2 ring-neutral-900/10 shadow-sm"
                            : "border-neutral-200 hover:border-neutral-300"
                        )}
                      >
                        {/* Step Header Accordion */}
                        <div
                          onClick={() => {
                            setExpandedStepId(isExpanded ? null : step.id);
                          }}
                          className="p-3.5 sm:p-4 flex items-center justify-between gap-3 cursor-pointer hover:bg-neutral-50/60 transition-colors"
                        >
                          <div className="flex items-center gap-3 min-w-0 flex-1">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleStepCompletion(step.id);
                              }}
                              className={cn(
                                "w-6 h-6 rounded-lg flex items-center justify-center transition-all cursor-pointer shrink-0 border",
                                isDone
                                  ? "bg-black border-black text-white"
                                  : "bg-white border-neutral-300 text-neutral-400 hover:border-black"
                              )}
                              title={isDone ? "لغو تیک این گام" : "تیک زدن و تکمیل این گام"}
                            >
                              {isDone ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : <span className="w-1.5 h-1.5 rounded-full bg-neutral-300" />}
                            </button>

                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-[11px] font-mono text-neutral-400 font-bold">
                                  گام {step.order}
                                </span>
                                <span className="text-neutral-300">·</span>
                                <span className="text-[11px] text-neutral-500">
                                  {step.category}
                                </span>
                                <span className="text-neutral-300">·</span>
                                <span className="text-[11px] font-mono text-neutral-400">
                                  {step.duration}
                                </span>
                                {isDone && (
                                  <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded font-mono">
                                    تکمیل‌شده ✓
                                  </span>
                                )}
                              </div>

                              <h3
                                className={cn(
                                  "text-sm font-bold text-neutral-900 truncate mt-0.5",
                                  isDone ? "text-neutral-400 line-through" : ""
                                )}
                              >
                                {step.title}
                              </h3>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <span className="text-xs text-neutral-400 hidden sm:inline font-medium">
                              {isExpanded ? "بستن" : "مشاهده جزئیات"}
                            </span>
                            <ChevronDown
                              className={cn(
                                "w-4 h-4 text-neutral-400 transition-transform duration-150",
                                isExpanded && "rotate-180 text-black"
                              )}
                            />
                          </div>
                        </div>

                        {/* Step Expanded Content */}
                        {isExpanded && (
                          <div className="p-4 sm:p-5 border-t border-neutral-100 bg-white space-y-4 animate-in fade-in duration-100 min-w-0">
                            <div className="text-xs sm:text-sm text-neutral-700 leading-relaxed text-justify break-words border-s-2 border-black ps-3.5 py-0.5">
                              {step.summary}
                            </div>

                            {/* Interactive Competencies Checklist */}
                            <div className="pt-2 border-t border-neutral-100 space-y-2.5">
                              <div className="flex items-center justify-between text-xs">
                                <span className="font-bold text-neutral-800">
                                  مهارت‌ها و شایستگی‌های محوری:
                                </span>
                                <span className="text-[11px] font-mono text-neutral-400">
                                  {
                                    step.keyCompetencies.filter(
                                      (_, cIdx) => competencyChecks[`${step.id}-comp-${cIdx}`]
                                    ).length
                                  }{" "}
                                  از {step.keyCompetencies.length} تسلط‌یافته
                                </span>
                              </div>

                              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                                {step.keyCompetencies.map((comp, cIdx) => {
                                  const compKey = `${step.id}-comp-${cIdx}`;
                                  const isChecked = !!competencyChecks[compKey];

                                  return (
                                    <li
                                      key={cIdx}
                                      onClick={() => toggleCompetency(compKey)}
                                      className={cn(
                                        "p-2.5 rounded-lg border flex items-start gap-2.5 transition-all cursor-pointer select-none",
                                        isChecked
                                          ? "bg-neutral-50 border-neutral-300 text-neutral-900 font-medium"
                                          : "bg-white hover:bg-neutral-50/80 border-neutral-200 text-neutral-600"
                                      )}
                                    >
                                      <span
                                        className={cn(
                                          "w-4 h-4 rounded flex items-center justify-center shrink-0 mt-0.5 transition-colors",
                                          isChecked
                                            ? "bg-black text-white"
                                            : "border border-neutral-300 bg-white"
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
                            <div className="pt-3 border-t border-neutral-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                              <div className="flex flex-wrap items-center gap-2">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setExpandedStepId(step.id);
                                    setLearningViewMode("reader");
                                    setTimeout(() => {
                                      document.getElementById("active-topic-reader")?.scrollIntoView({ behavior: "smooth", block: "start" });
                                    }, 50);
                                  }}
                                  className="px-3 py-1.5 rounded-lg bg-neutral-900 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer hover:bg-black"
                                >
                                  <BookOpen className="w-3.5 h-3.5" />
                                  <span>مطالعه متمرکز این مبحث</span>
                                </button>

                                {step.articleId && (
                                  <button
                                    type="button"
                                    onClick={() => onNavigateToArticle?.(step.articleId!, step.sectionId)}
                                    className="px-3 py-1.5 rounded-lg border border-neutral-200 hover:border-black text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer text-neutral-700 hover:text-black"
                                  >
                                    <BookOpen className="w-3.5 h-3.5 text-neutral-500" />
                                    <span>مطالعه در دانشنامه</span>
                                  </button>
                                )}

                                {step.toolsAction === "racks" && (
                                  <button
                                    type="button"
                                    onClick={() => onOpenRacksMap?.("racks")}
                                    className="px-3 py-1.5 rounded-lg border border-neutral-200 hover:border-black text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer text-neutral-700 hover:text-black"
                                  >
                                    <Server className="w-3.5 h-3.5 text-neutral-500" />
                                    <span>{step.actionLabel || "مشاهده در اطلس"}</span>
                                  </button>
                                )}

                                {step.toolsAction === "simulator" && (
                                  <button
                                    type="button"
                                    onClick={() => onOpenSimulator?.()}
                                    className="px-3 py-1.5 rounded-lg border border-neutral-200 hover:border-black text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer text-neutral-700 hover:text-black"
                                  >
                                    <Play className="w-3.5 h-3.5 fill-current text-neutral-700" />
                                    <span>{step.actionLabel || "اجرا در شبیه‌ساز"}</span>
                                  </button>
                                )}
                              </div>

                              {/* Step Completion & Auto Advance Button */}
                              <button
                                type="button"
                                onClick={() => handleCompleteAndNext(step)}
                                className={cn(
                                  "px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer shrink-0",
                                  isDone
                                    ? "bg-neutral-100 text-neutral-700 hover:bg-neutral-200"
                                    : "bg-black hover:bg-neutral-800 text-white shadow-2xs"
                                )}
                              >
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>{isDone ? "تکمیل شده (مبحث بعدی ⬅)" : "تیک زدن و مبحث بعد ⬅"}</span>
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
