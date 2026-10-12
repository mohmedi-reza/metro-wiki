import React, { useState, useEffect, useMemo } from "react";
import {
  FlashcardItem,
  FLASHCARD_DECK,
  QUIZ_CATEGORIES,
} from "../../data/quizAndFlashcardsData";
import {
  RotateCw,
  ChevronLeft,
  ChevronRight,
  Shuffle,
  Bookmark,
  Sparkles,
  Search,
  BookOpen,
  ArrowRight,
  CheckCircle2,
  HelpCircle,
  Play,
  Pause,
  Award,
  Layers,
  Flame,
  Volume2,
} from "lucide-react";
import { cn } from "../../lib/utils";

const FLASHCARDS_STORAGE_KEY = "daneshnamak_flashcards_mastery";
const FLASHCARDS_BOOKMARKS_KEY = "daneshnamak_flashcards_bookmarks";

interface ProfessionalFlashcardsProps {
  onNavigateToArticle?: (articleId: string) => void;
  onBack?: () => void;
}

export const ProfessionalFlashcards: React.FC<ProfessionalFlashcardsProps> = ({
  onNavigateToArticle,
  onBack,
}) => {
  // Mastery state: cardId -> box level (1: Hard, 2: Review, 3: Mastered)
  const [masteryLevels, setMasteryLevels] = useState<Record<string, number>>(() => {
    try {
      const saved = localStorage.getItem(FLASHCARDS_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return {};
  });

  // Bookmarked cards
  const [bookmarkedCardIds, setBookmarkedCardIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(FLASHCARDS_BOOKMARKS_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return [];
  });

  // Active deck settings
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<"all" | "unmastered" | "mastered" | "bookmarked">("all");
  const [isFlipped, setIsFlipped] = useState<boolean>(false);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [showHint, setShowHint] = useState<boolean>(false);
  const [isAutoPlaying, setIsAutoPlaying] = useState<boolean>(false);
  const [shuffledDeck, setShuffledDeck] = useState<FlashcardItem[]>(FLASHCARD_DECK);

  // Sync mastery to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(FLASHCARDS_STORAGE_KEY, JSON.stringify(masteryLevels));
    } catch {
      // ignore
    }
  }, [masteryLevels]);

  // Sync bookmarks to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(FLASHCARDS_BOOKMARKS_KEY, JSON.stringify(bookmarkedCardIds));
    } catch {
      // ignore
    }
  }, [bookmarkedCardIds]);

  // Filter deck based on category, search, and status
  const filteredCards = useMemo(() => {
    return shuffledDeck.filter((card) => {
      // Category filter
      if (selectedCategory !== "all" && card.category !== selectedCategory) {
        return false;
      }

      // Status filter
      const level = masteryLevels[card.id] || 1;
      const isBookmarked = bookmarkedCardIds.includes(card.id);

      if (statusFilter === "unmastered" && level === 3) return false;
      if (statusFilter === "mastered" && level !== 3) return false;
      if (statusFilter === "bookmarked" && !isBookmarked) return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchTitle = card.term.toLowerCase().includes(q);
        const matchEn = card.englishTerm.toLowerCase().includes(q);
        const matchPrompt = card.frontPrompt.toLowerCase().includes(q);
        const matchSummary = card.backSummary.toLowerCase().includes(q);
        return matchTitle || matchEn || matchPrompt || matchSummary;
      }

      return true;
    });
  }, [shuffledDeck, selectedCategory, statusFilter, searchQuery, masteryLevels, bookmarkedCardIds]);

  // Ensure currentIndex stays within bounds
  useEffect(() => {
    if (currentIndex >= filteredCards.length) {
      setCurrentIndex(Math.max(0, filteredCards.length - 1));
    }
    setIsFlipped(false);
    setShowHint(false);
  }, [filteredCards.length]);

  const currentCard: FlashcardItem | undefined = filteredCards[currentIndex];

  // Rate card handler (Leitner system)
  const handleRateCard = (level: 1 | 2 | 3) => {
    if (!currentCard) return;

    setMasteryLevels((prev) => ({
      ...prev,
      [currentCard.id]: level,
    }));

    // Auto advance to next card
    if (currentIndex < filteredCards.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setIsFlipped(false);
      setShowHint(false);
    }
  };

  // Toggle bookmark for current card
  const toggleBookmark = () => {
    if (!currentCard) return;
    setBookmarkedCardIds((prev) =>
      prev.includes(currentCard.id)
        ? prev.filter((id) => id !== currentCard.id)
        : [...prev, currentCard.id]
    );
  };

  // Shuffle handler
  const handleShuffle = () => {
    setShuffledDeck([...FLASHCARD_DECK].sort(() => Math.random() - 0.5));
    setCurrentIndex(0);
    setIsFlipped(false);
    setShowHint(false);
  };

  // Auto-play effect
  useEffect(() => {
    if (!isAutoPlaying || filteredCards.length === 0) return;

    const timer = setInterval(() => {
      setIsFlipped((prev) => {
        if (!prev) {
          return true; // flip to back
        } else {
          // move to next card
          setCurrentIndex((curr) => (curr + 1) % filteredCards.length);
          return false;
        }
      });
    }, 4500);

    return () => clearInterval(timer);
  }, [isAutoPlaying, filteredCards.length]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if typing in search input
      if ((e.target as HTMLElement).tagName === "INPUT") return;

      if (e.code === "Space") {
        e.preventDefault();
        setIsFlipped((prev) => !prev);
      } else if (e.key === "ArrowLeft") {
        // RTL next
        if (currentIndex < filteredCards.length - 1) {
          setCurrentIndex((prev) => prev + 1);
          setIsFlipped(false);
          setShowHint(false);
        }
      } else if (e.key === "ArrowRight") {
        // RTL prev
        if (currentIndex > 0) {
          setCurrentIndex((prev) => prev - 1);
          setIsFlipped(false);
          setShowHint(false);
        }
      } else if (e.key === "1") {
        handleRateCard(1);
      } else if (e.key === "2") {
        handleRateCard(2);
      } else if (e.key === "3") {
        handleRateCard(3);
      } else if (e.key.toLowerCase() === "f") {
        toggleBookmark();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentIndex, filteredCards.length, currentCard]);

  // Global Mastery Stats
  const stats = useMemo(() => {
    const total = FLASHCARD_DECK.length;
    let mastered = 0;
    let reviewing = 0;
    let learning = 0;

    FLASHCARD_DECK.forEach((c) => {
      const lvl = masteryLevels[c.id];
      if (lvl === 3) mastered++;
      else if (lvl === 2) reviewing++;
      else learning++;
    });

    const retentionPct = Math.round((mastered / total) * 100);
    return { total, mastered, reviewing, learning, retentionPct };
  }, [masteryLevels]);

  const isCurrentBookmarked = currentCard ? bookmarkedCardIds.includes(currentCard.id) : false;
  const currentCardLevel = currentCard ? masteryLevels[currentCard.id] || 1 : 1;

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6">
      {/* Top Header */}
      <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-neutral-200 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs text-neutral-500 mb-1">
            <span>سیستم یادگیری فاصله‌دار لایتنر (Spaced Repetition)</span>
            <span aria-hidden="true">·</span>
            <span>مفاهیم کلیدی مترو</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-black tracking-tight">
            فلش‌کارت‌های تخصصی مهندسی مترو
          </h1>
          <p className="text-xs sm:text-sm text-neutral-600 mt-1 max-w-xl leading-relaxed">
            مرور هوشمند استانداردهای سیگنالینگ، اختصارات تخصصی، بردهای سخت‌افزاری و دستورالعمل‌های ایمنی.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              className="px-3.5 py-2 text-xs font-semibold text-neutral-600 hover:text-black border border-neutral-200 hover:border-neutral-400 rounded-lg transition-colors cursor-pointer"
            >
              بازگشت به دانشنامه
            </button>
          )}
        </div>
      </div>

      {/* Leitner Progress Stats Bar */}
      <div className="p-4 rounded-2xl bg-white border border-neutral-200 shadow-2xs mb-6 grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
        <div className="p-2.5 rounded-xl bg-neutral-50 border border-neutral-100">
          <div className="text-lg font-bold font-mono text-black">{stats.total}</div>
          <div className="text-[11px] text-neutral-500">کل کارت‌های تخصصی</div>
        </div>
        <div className="p-2.5 rounded-xl bg-emerald-50/70 border border-emerald-100">
          <div className="text-lg font-bold font-mono text-emerald-800">{stats.mastered}</div>
          <div className="text-[11px] text-emerald-700">کاملاً مسلط‌شده (جعبه ۳)</div>
        </div>
        <div className="p-2.5 rounded-xl bg-amber-50/70 border border-amber-100">
          <div className="text-lg font-bold font-mono text-amber-800">{stats.reviewing}</div>
          <div className="text-[11px] text-amber-700">در حال مرور (جعبه ۲)</div>
        </div>
        <div className="p-2.5 rounded-xl bg-neutral-50 border border-neutral-100">
          <div className="text-lg font-bold font-mono text-neutral-700">{stats.retentionPct}٪</div>
          <div className="text-[11px] text-neutral-500">نرخ یادسپاری کل</div>
        </div>
      </div>

      {/* Filter and Search Controls Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 bg-neutral-50 p-3 rounded-2xl border border-neutral-200">
        {/* Search */}
        <div className="relative w-full sm:w-auto sm:flex-1 sm:max-w-xs">
          <Search className="w-3.5 h-3.5 text-neutral-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="جستجو در اصطلاحات..."
            className="w-full pr-8 pl-3 py-1.5 text-xs bg-white border border-neutral-200 rounded-lg text-neutral-800 placeholder-neutral-400 focus:outline-none focus:border-black"
          />
        </div>

        {/* Categories selector & Status filter tabs */}
        <div className="flex items-center justify-between sm:justify-start gap-2 flex-wrap">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="flex-1 sm:flex-initial px-2.5 py-1.5 text-xs bg-white border border-neutral-200 rounded-lg font-medium text-neutral-700 focus:outline-none focus:border-black"
          >
            {QUIZ_CATEGORIES.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.label}
              </option>
            ))}
          </select>

          {/* Status filter tabs */}
          <div className="flex items-center gap-1 p-0.5 bg-neutral-200/70 rounded-lg text-xs font-medium">
            <button
              type="button"
              onClick={() => setStatusFilter("all")}
              className={cn(
                "px-2 sm:px-2.5 py-1 rounded-md transition-all cursor-pointer text-[11px]",
                statusFilter === "all" ? "bg-white text-black font-bold shadow-2xs" : "text-neutral-600"
              )}
            >
              همه
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter("unmastered")}
              className={cn(
                "px-2 sm:px-2.5 py-1 rounded-md transition-all cursor-pointer text-[11px]",
                statusFilter === "unmastered" ? "bg-white text-black font-bold shadow-2xs" : "text-neutral-600"
              )}
            >
              یادگیری
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter("bookmarked")}
              className={cn(
                "px-2 sm:px-2.5 py-1 rounded-md transition-all cursor-pointer text-[11px] flex items-center gap-1",
                statusFilter === "bookmarked" ? "bg-white text-black font-bold shadow-2xs" : "text-neutral-600"
              )}
            >
              <Bookmark className="w-3 h-3" />
              <span>نشان‌ها</span>
            </button>
          </div>

          {/* Shuffle & Auto-play buttons */}
          <div className="flex items-center gap-1.5 ms-auto sm:ms-0">
            <button
              type="button"
              onClick={handleShuffle}
              title="بر زدن کارت‌ها"
              className="p-1.5 text-neutral-600 hover:text-black hover:bg-white rounded-lg border border-transparent hover:border-neutral-200 transition-colors cursor-pointer"
            >
              <Shuffle className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setIsAutoPlaying(!isAutoPlaying)}
              title={isAutoPlaying ? "توقف پخش خودکار" : "پخش خودکار کارت‌ها"}
              className={cn(
                "p-1.5 rounded-lg border transition-colors cursor-pointer flex items-center gap-1 text-xs font-medium",
                isAutoPlaying
                  ? "bg-black text-white border-black"
                  : "text-neutral-600 hover:text-black hover:bg-white border-transparent hover:border-neutral-200"
              )}
            >
              {isAutoPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              <span className="hidden sm:inline">{isAutoPlaying ? "در حال پخش" : "خودکار"}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Flashcard Stage */}
      {filteredCards.length === 0 ? (
        <div className="p-12 text-center text-neutral-400 border border-dashed rounded-3xl bg-neutral-50/50">
          کارتی با فیلترهای انتخابی یافت نشد. فیلترها را تغییر دهید یا واژه جستجو را پاک کنید.
        </div>
      ) : currentCard ? (
        <div className="space-y-6">
          {/* Card Meta & Navigation Strip */}
          <div className="flex items-center justify-between text-xs text-neutral-500 px-1">
            <div className="flex items-center gap-2">
              <span className="font-mono font-bold text-black">
                کارت {currentIndex + 1} از {filteredCards.length}
              </span>
              <span aria-hidden="true">·</span>
              <span className="text-neutral-600">{currentCard.categoryLabel}</span>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={toggleBookmark}
                className={cn(
                  "flex items-center gap-1 text-xs font-medium cursor-pointer transition-colors",
                  isCurrentBookmarked ? "text-amber-600 font-bold" : "text-neutral-400 hover:text-black"
                )}
              >
                <Bookmark className={cn("w-3.5 h-3.5", isCurrentBookmarked && "fill-current")} />
                <span>{isCurrentBookmarked ? "نشان‌شده" : "نشان کردن"}</span>
              </button>

              <span
                className={cn(
                  "px-2 py-0.5 rounded text-[10px] font-mono font-bold",
                  currentCardLevel === 3
                    ? "bg-emerald-100 text-emerald-800"
                    : currentCardLevel === 2
                    ? "bg-amber-100 text-amber-800"
                    : "bg-neutral-100 text-neutral-600"
                )}
              >
                جعبه لایتنر: سطح {currentCardLevel}
              </span>
            </div>
          </div>

          {/* 3D Flip Card Container */}
          <div
            className="w-full min-h-[380px] sm:min-h-[420px] [perspective:1200px] cursor-pointer select-none"
            onClick={() => setIsFlipped(!isFlipped)}
          >
            <div
              className={cn(
                "relative w-full h-full min-h-[380px] sm:min-h-[420px] rounded-3xl transition-transform duration-500 [transform-style:preserve-3d]",
                isFlipped && "[transform:rotateY(180deg)]"
              )}
            >
              {/* ================= FRONT SIDE ================= */}
              <div className="absolute inset-0 w-full h-full rounded-3xl bg-white border border-neutral-200 p-5 sm:p-8 md:p-10 flex flex-col justify-between shadow-xs [backface-visibility:hidden]">
                <div>
                  {/* Top front header */}
                  <div className="flex items-center justify-between border-b border-neutral-100 pb-3 sm:pb-4 mb-4 sm:mb-6">
                    <div className="min-w-0 flex-1">
                      <span className="text-xs font-mono text-neutral-400 uppercase tracking-widest block truncate">
                        {currentCard.englishTerm}
                      </span>
                      <h2 className="text-lg sm:text-2xl font-black text-black mt-0.5 truncate">
                        {currentCard.term}
                      </h2>
                    </div>

                    <div className="p-2 rounded-xl bg-neutral-100 text-neutral-600 shrink-0">
                      <BookOpen className="w-4 h-4 sm:w-5 sm:h-5" />
                    </div>
                  </div>

                  {/* Main Question / Prompt */}
                  <div className="my-3 sm:my-6">
                    <span className="text-xs font-semibold text-neutral-400 block mb-1 sm:mb-2">
                      پرسش یا مفهوم مهندسی:
                    </span>
                    <p className="text-sm sm:text-lg font-bold text-neutral-900 leading-relaxed">
                      {currentCard.frontPrompt}
                    </p>
                  </div>

                  {/* Optional Hint block */}
                  {showHint && (
                    <div className="mt-3 p-3 rounded-xl bg-amber-50/80 border border-amber-200 text-xs text-amber-900 leading-relaxed animate-in fade-in duration-200">
                      <span className="font-bold block mb-1">راهنمای فنی:</span>
                      {currentCard.backSummary.slice(0, 70)}...
                    </div>
                  )}
                </div>

                {/* Bottom Front Actions */}
                <div className="border-t border-neutral-100 pt-4 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowHint(!showHint);
                    }}
                    className="text-xs font-semibold text-neutral-500 hover:text-black flex items-center gap-1.5 cursor-pointer py-1"
                  >
                    <HelpCircle className="w-3.5 h-3.5" />
                    <span>{showHint ? "بستن راهنما" : "راهنمای فنی"}</span>
                  </button>

                  <div className="flex items-center gap-1.5 text-[11px] sm:text-xs text-neutral-400 font-medium">
                    <RotateCw className="w-3.5 h-3.5 animate-spin-reverse" />
                    <span>کلیک یا چرخش کارت</span>
                  </div>
                </div>
              </div>

              {/* ================= BACK SIDE ================= */}
              <div className="absolute inset-0 w-full h-full rounded-3xl bg-neutral-900 text-white border border-neutral-800 p-5 sm:p-8 md:p-10 flex flex-col justify-between shadow-lg [transform:rotateY(180deg)] [backface-visibility:hidden] overflow-y-auto">
                <div>
                  {/* Top back header */}
                  <div className="flex items-center justify-between border-b border-neutral-800 pb-4 mb-4">
                    <div>
                      <span className="text-xs font-mono text-neutral-400 uppercase tracking-widest block">
                        {currentCard.englishTerm}
                      </span>
                      <h2 className="text-lg sm:text-xl font-bold text-white mt-0.5">
                        {currentCard.term}
                      </h2>
                    </div>

                    <div className="text-[10px] font-mono px-2 py-0.5 rounded bg-neutral-800 text-emerald-400 font-bold">
                      پاسخ تشریحی
                    </div>
                  </div>

                  {/* Summary kicker */}
                  <div className="mb-4 p-3 rounded-xl bg-neutral-800/80 border border-neutral-700/80 text-sm font-semibold text-emerald-300 leading-relaxed">
                    {currentCard.backSummary}
                  </div>

                  {/* Detailed Explanation */}
                  <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed mb-4">
                    {currentCard.detailedExplanation}
                  </p>

                  {/* Specifications Grid */}
                  {currentCard.keySpecifications && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4 text-xs">
                      {currentCard.keySpecifications.map((spec, sIdx) => (
                        <div key={sIdx} className="bg-neutral-800/50 p-2.5 rounded-lg border border-neutral-700/50">
                          <span className="text-neutral-400 block text-[10px]">{spec.label}:</span>
                          <span className="font-medium text-white">{spec.value}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Golden Workshop Rule */}
                  <div className="p-3 rounded-xl bg-amber-950/40 border border-amber-800/40 text-xs text-amber-200 leading-relaxed flex items-start gap-2">
                    <Sparkles className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-amber-300 block">نکته طلایی در کارگاه / اتاق SER:</span>
                      <span>{currentCard.goldenRule}</span>
                    </div>
                  </div>
                </div>

                {/* Bottom Back Actions */}
                <div className="border-t border-neutral-800 pt-4 mt-4 flex items-center justify-between">
                  {currentCard.relatedArticleId && onNavigateToArticle ? (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onNavigateToArticle(currentCard.relatedArticleId!);
                      }}
                      className="text-xs text-neutral-300 hover:text-white font-semibold flex items-center gap-1.5 cursor-pointer py-1"
                    >
                      <span>مطالعه مقاله کامل در دانشنامه</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  ) : (
                    <div />
                  )}

                  <span className="text-[11px] text-neutral-500">
                    برای چرخاندن مجدد کلیک کنید
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Spaced Repetition Rating Buttons Bar */}
          <div className="p-4 rounded-2xl bg-white border border-neutral-200 shadow-2xs space-y-3">
            <div className="text-center text-xs font-semibold text-neutral-600">
              میزان تسلط شما بر این کارت چقدر بود؟ (کلیدهای ۱ تا ۳)
            </div>

            <div className="grid grid-cols-3 gap-2 sm:gap-3">
              {/* Level 1: Hard */}
              <button
                type="button"
                onClick={() => handleRateCard(1)}
                className="py-2.5 sm:py-3 px-1.5 sm:px-2 rounded-xl border border-neutral-200 bg-white hover:bg-neutral-50 hover:border-rose-400 text-neutral-800 transition-all flex flex-col items-center justify-center gap-1 cursor-pointer group"
              >
                <div className="flex items-center gap-1 sm:gap-1.5 font-bold text-[11px] sm:text-xs text-rose-700">
                  <span className="w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full bg-rose-100 flex items-center justify-center font-mono text-[9px] sm:text-[10px]">
                    1
                  </span>
                  <span>سخت<span className="hidden sm:inline"> / دوباره</span></span>
                </div>
                <span className="text-[9px] sm:text-[10px] text-neutral-400">جعبه ۱</span>
              </button>

              {/* Level 2: Review */}
              <button
                type="button"
                onClick={() => handleRateCard(2)}
                className="py-2.5 sm:py-3 px-1.5 sm:px-2 rounded-xl border border-neutral-200 bg-white hover:bg-neutral-50 hover:border-amber-400 text-neutral-800 transition-all flex flex-col items-center justify-center gap-1 cursor-pointer group"
              >
                <div className="flex items-center gap-1 sm:gap-1.5 font-bold text-[11px] sm:text-xs text-amber-700">
                  <span className="w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full bg-amber-100 flex items-center justify-center font-mono text-[9px] sm:text-[10px]">
                    2
                  </span>
                  <span>متوسط<span className="hidden sm:inline"> / در یادگیری</span></span>
                </div>
                <span className="text-[9px] sm:text-[10px] text-neutral-400">جعبه ۲</span>
              </button>

              {/* Level 3: Mastered */}
              <button
                type="button"
                onClick={() => handleRateCard(3)}
                className="py-2.5 sm:py-3 px-1.5 sm:px-2 rounded-xl border border-neutral-200 bg-white hover:bg-neutral-50 hover:border-emerald-400 text-neutral-800 transition-all flex flex-col items-center justify-center gap-1 cursor-pointer group"
              >
                <div className="flex items-center gap-1 sm:gap-1.5 font-bold text-[11px] sm:text-xs text-emerald-700">
                  <span className="w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full bg-emerald-100 flex items-center justify-center font-mono text-[9px] sm:text-[10px]">
                    3
                  </span>
                  <span>مسلط<span className="hidden sm:inline"> / بلد بودم</span></span>
                </div>
                <span className="text-[9px] sm:text-[10px] text-neutral-400">جعبه ۳</span>
              </button>
            </div>
          </div>

          {/* Navigation Controls (Prev / Next) */}
          <div className="flex items-center justify-between px-1">
            <button
              type="button"
              onClick={() => {
                setCurrentIndex((prev) => Math.max(0, prev - 1));
                setIsFlipped(false);
                setShowHint(false);
              }}
              disabled={currentIndex === 0}
              className={cn(
                "px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer",
                currentIndex === 0
                  ? "text-neutral-300 cursor-not-allowed"
                  : "text-neutral-700 hover:text-black hover:bg-neutral-100"
              )}
            >
              <ChevronRight className="w-4 h-4" />
              <span>کارت قبلی</span>
            </button>

            <span className="text-[11px] text-neutral-400 hidden sm:block">
              کلیدهای میانبر: Space برای چرخاندن · فلش‌های چپ و راست برای جابجایی
            </span>

            <button
              type="button"
              onClick={() => {
                setCurrentIndex((prev) => Math.min(filteredCards.length - 1, prev + 1));
                setIsFlipped(false);
                setShowHint(false);
              }}
              disabled={currentIndex === filteredCards.length - 1}
              className={cn(
                "px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer",
                currentIndex === filteredCards.length - 1
                  ? "text-neutral-300 cursor-not-allowed"
                  : "text-neutral-700 hover:text-black hover:bg-neutral-100"
              )}
            >
              <span>کارت بعدی</span>
              <ChevronLeft className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
};
