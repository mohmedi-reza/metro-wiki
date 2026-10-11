import React, { useState, useEffect, useRef } from "react";
import { Sidebar } from "./components/Sidebar";
import { TableOfContents } from "./components/TableOfContents";
import { RichContentRenderer } from "./components/RichContentRenderer";
import { CommandSearch } from "./components/CommandSearch";
import { TermDetailModal } from "./components/TermDetailModal";
import { AddNoteModal } from "./components/AddNoteModal";
import { ViewAnnotationModal } from "./components/ViewAnnotationModal";
import { MetroLogo } from "./components/MetroLogo";
import { ArticleAnnotation } from "./types/annotation";
import { sampleArticles, encyclopediaTerms, Article } from "./data/encyclopediaData";
import { CtcSimulator } from "./components/scada/CtcSimulator";
import { StationAtlasPage } from "./components/StationAtlasPage";
import {
  Search,
  Menu,
  X,
  BookOpen,
  Share2,
  Printer,
  Calendar,
  Clock,
  ChevronLeft,
  BookmarkCheck,
  Bookmark,
  Check,
  Highlighter,
  Radio,
  Layers,
  Play,
} from "lucide-react";
import { cn } from "./lib/utils";

const BOOKMARKS_STORAGE_KEY = "daneshnamak_saved_articles";
const RECENTLY_VIEWED_STORAGE_KEY = "daneshnamak_recently_viewed";
const ANNOTATIONS_STORAGE_KEY = "daneshnamak_annotations";

export default function App() {
  const [currentArticleId, setCurrentArticleId] = useState<string>("railway-signaling");
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const [activeSectionId, setActiveSectionId] = useState<string>("intro");
  const [selectedTermModal, setSelectedTermModal] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);
  const [scrollProgress, setScrollProgress] = useState<number>(0);
  const [activeView, setActiveView] = useState<"article" | "atlas" | "simulator">("article");
  const [simulatorInitialStationId, setSimulatorInitialStationId] = useState<number | undefined>(undefined);

  // Annotations (Highlights & Notes) state from localStorage
  const [annotations, setAnnotations] = useState<ArticleAnnotation[]>(() => {
    try {
      const saved = localStorage.getItem(ANNOTATIONS_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // Fallback
    }
    // Seed initial helpful annotation
    return [
      {
        id: "anno-initial-1",
        articleId: "railway-signaling",
        highlightedText: "سرفاصله زمانی حرکت (هدوی): طراحی بر مبنای هدوی ۲.۵ دقیقه",
        note: "نکته کلیدی: استاندارد مترو تهران و اصفهان بر مبنای اعزام حداکثر ۲۴ قطار در ساعت است.",
        createdAt: "امروز",
      },
    ];
  });

  // Floating highlight trigger state
  const [selectionRange, setSelectionRange] = useState<{
    text: string;
    x: number;
    y: number;
  } | null>(null);

  // Modals for notes
  const [isAddNoteModalOpen, setIsAddNoteModalOpen] = useState<boolean>(false);
  const [activeSelectedText, setActiveSelectedText] = useState<string>("");
  const [viewingAnnotation, setViewingAnnotation] = useState<ArticleAnnotation | null>(null);

  // Bookmarking state from localStorage
  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(BOOKMARKS_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // Fallback
    }
    // Default initial bookmark for great first impression
    return ["railway-signaling"];
  });

  // Recently viewed articles state from localStorage (last 5 visited)
  const [recentlyViewedIds, setRecentlyViewedIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(RECENTLY_VIEWED_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // Fallback
    }
    return ["railway-signaling"];
  });

  const currentArticle: Article =
    sampleArticles.find((a) => a.id === currentArticleId) || sampleArticles[0];

  const isCurrentBookmarked = bookmarkedIds.includes(currentArticle.id);

  // Track visit to current article and persist top 5 in localStorage
  useEffect(() => {
    setRecentlyViewedIds((prev) => {
      const filtered = prev.filter((id) => id !== currentArticleId);
      const updated = [currentArticleId, ...filtered].slice(0, 5);
      try {
        localStorage.setItem(RECENTLY_VIEWED_STORAGE_KEY, JSON.stringify(updated));
      } catch {
        // Ignore storage error
      }
      return updated;
    });
  }, [currentArticleId]);

  // Sync bookmarks to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(BOOKMARKS_STORAGE_KEY, JSON.stringify(bookmarkedIds));
    } catch {
      // Ignore storage errors
    }
  }, [bookmarkedIds]);

  // Sync annotations to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(ANNOTATIONS_STORAGE_KEY, JSON.stringify(annotations));
    } catch {
      // Ignore
    }
  }, [annotations]);

  // Listen to mouseup / touchend for text selection to show floating highlight prompt
  useEffect(() => {
    const handleMouseUp = () => {
      const selection = window.getSelection();
      if (!selection || selection.isCollapsed) {
        setSelectionRange(null);
        return;
      }

      const text = selection.toString().trim();
      if (text.length < 3) {
        setSelectionRange(null);
        return;
      }

      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();

      if (rect.width > 0 && rect.height > 0) {
        setSelectionRange({
          text,
          x: rect.left + rect.width / 2,
          y: rect.top - 8,
        });
      }
    };

    const handleMouseDown = (e: MouseEvent) => {
      // If clicking outside the floating trigger, close it
      const target = e.target as HTMLElement;
      if (!target.closest("#floating-highlight-trigger")) {
        setSelectionRange(null);
      }
    };

    document.addEventListener("mouseup", handleMouseUp);
    document.addEventListener("mousedown", handleMouseDown);
    return () => {
      document.removeEventListener("mouseup", handleMouseUp);
      document.removeEventListener("mousedown", handleMouseDown);
    };
  }, []);

  const handleSaveAnnotation = (note: string) => {
    if (!activeSelectedText) return;
    const newAnno: ArticleAnnotation = {
      id: `anno-${Date.now()}`,
      articleId: currentArticleId,
      highlightedText: activeSelectedText,
      note,
      createdAt: new Date().toLocaleDateString("fa-IR"),
    };
    setAnnotations((prev) => [newAnno, ...prev]);
    setSelectionRange(null);
    window.getSelection()?.removeAllRanges();
  };

  const handleDeleteAnnotation = (id: string) => {
    setAnnotations((prev) => prev.filter((a) => a.id !== id));
  };

  const toggleBookmark = (articleId: string) => {
    setBookmarkedIds((prev) =>
      prev.includes(articleId) ? prev.filter((id) => id !== articleId) : [...prev, articleId]
    );
  };

  const clearRecentlyViewed = () => {
    setRecentlyViewedIds([]);
    try {
      localStorage.removeItem(RECENTLY_VIEWED_STORAGE_KEY);
    } catch {
      // Ignore
    }
  };

  const mainScrollRef = useRef<HTMLElement>(null);

  const scrollToTop = () => {
    if (mainScrollRef.current) {
      mainScrollRef.current.scrollTo({ top: 0, behavior: "smooth" });
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Track scroll progress for the current article
  useEffect(() => {
    const handleScroll = () => {
      const mainEl = mainScrollRef.current;
      if (mainEl && mainEl.scrollHeight > mainEl.clientHeight) {
        const scrollTop = mainEl.scrollTop;
        const docHeight = mainEl.scrollHeight - mainEl.clientHeight;
        if (docHeight > 0) {
          const progress = Math.min(Math.max((scrollTop / docHeight) * 100, 0), 100);
          setScrollProgress(progress);
        } else {
          setScrollProgress(0);
        }
      } else {
        const scrollTop = window.scrollY || document.documentElement.scrollTop;
        const docHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        if (docHeight > 0) {
          const progress = Math.min(Math.max((scrollTop / docHeight) * 100, 0), 100);
          setScrollProgress(progress);
        } else {
          setScrollProgress(0);
        }
      }
      setSelectionRange(null);
    };

    const mainEl = mainScrollRef.current;
    if (mainEl) {
      mainEl.addEventListener("scroll", handleScroll, { passive: true });
    }
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => {
      if (mainEl) {
        mainEl.removeEventListener("scroll", handleScroll);
      }
      window.removeEventListener("scroll", handleScroll);
    };
  }, [currentArticleId]);

  // Cmd+K or Ctrl+K shortcut for quick search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Update active section on scroll
  useEffect(() => {
    const mainEl = mainScrollRef.current;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSectionId(entry.target.id);
          }
        });
      },
      {
        root: mainEl || null,
        rootMargin: "-10% 0px -70% 0px",
      }
    );

    currentArticle.sections.forEach((section) => {
      const el = document.getElementById(section.id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [currentArticle]);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    const mainEl = mainScrollRef.current;
    if (element && mainEl && mainEl.scrollHeight > mainEl.clientHeight) {
      const mainRect = mainEl.getBoundingClientRect();
      const elementRect = element.getBoundingClientRect();
      const targetScroll = mainEl.scrollTop + (elementRect.top - mainRect.top) - 24;
      mainEl.scrollTo({
        top: targetScroll,
        behavior: "smooth",
      });
      setActiveSectionId(id);
    } else if (element) {
      const offset = 80;
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = element.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const offsetPosition = elementPosition - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });
      setActiveSectionId(id);
    }
  };

  const handleShare = () => {
    navigator.clipboard?.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div dir="rtl" className="h-screen h-dvh bg-white text-black font-sans selection:bg-black selection:text-white flex flex-col overflow-hidden">
      {/* Ultra-thin monochrome reading progress bar at the very top of the screen */}
      <div
        className="fixed top-0 start-0 end-0 h-[2.5px] bg-neutral-100 z-[60] pointer-events-none"
        role="progressbar"
        aria-valuenow={Math.round(scrollProgress)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="میزان مطالعه مقاله"
      >
        <div
          className="h-full bg-black transition-[width] duration-75 ease-out"
          style={{ width: `${scrollProgress}%` }}
        />
      </div>

      {/* Top Header with subtle border - Only rendered in Encyclopedia and Atlas mode */}
      {activeView !== "simulator" && (
        <header className="sticky top-0 z-50 h-14 shrink-0 bg-white/95 backdrop-blur-xs px-4 lg:px-8 flex items-center justify-between border-b border-neutral-100">
          <div className="flex items-center gap-3">
            {/* Mobile hamburger menu */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-black hover:bg-neutral-100 rounded-md transition-colors"
              aria-label="تغییر وضعیت منو"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            {/* Minimal Logo and brand */}
            <div
              className="flex items-center gap-2 cursor-pointer group"
              onClick={() => {
                setCurrentArticleId("railway-signaling");
                setActiveView("article");
                scrollToTop();
              }}
              title="صفحه اصلی دانشنامه قطار شهری"
            >
              <MetroLogo size="sm" />
              <div className="flex flex-col">
                <span className="text-sm font-extrabold tracking-tight leading-none hidden sm:inline">
                  دانشنامک
                </span>
                <span className="text-[9px] font-mono text-neutral-400 uppercase tracking-widest hidden md:inline">
                  METRO RAIL
                </span>
              </div>
            </div>

            {/* Top View Mode Switcher: Encyclopedia | Atlas | Simulator */}
            <nav className="hidden md:flex items-center gap-1 p-0.5 bg-neutral-100 rounded-lg text-xs font-semibold me-2">
              <button
                type="button"
                onClick={() => setActiveView("article")}
                className={cn(
                  "px-3 py-1 rounded-md transition-all cursor-pointer",
                  activeView === "article"
                    ? "bg-white text-black shadow-2xs font-bold"
                    : "text-neutral-500 hover:text-black"
                )}
              >
                دانشنامه
              </button>
              <button
                type="button"
                onClick={() => setActiveView("atlas")}
                className={cn(
                  "px-3 py-1 rounded-md transition-all cursor-pointer flex items-center gap-1.5",
                  activeView === "atlas"
                    ? "bg-white text-black shadow-2xs font-bold"
                    : "text-neutral-500 hover:text-black"
                )}
              >
                <span>نقشه رک‌ها و اطلس</span>
                <span className="text-[9px] px-1 py-0.2 rounded-sm bg-neutral-200 text-neutral-800 font-mono">
                  SER/CER
                </span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setSimulatorInitialStationId(undefined);
                  setActiveView("simulator");
                }}
                className="px-3 py-1 rounded-md transition-all cursor-pointer flex items-center gap-1.5 text-neutral-500 hover:text-black hover:bg-neutral-200/50"
              >
                <Play className="w-3 h-3 fill-current text-neutral-700" />
                <span>شبیه‌ساز CTC</span>
              </button>
            </nav>
          </div>

          {/* Global Search Bar (Minimal Trigger) */}
          <div className="flex-1 max-w-sm sm:max-w-md mx-2 sm:mx-4">
            <button
              type="button"
              onClick={() => setIsSearchOpen(true)}
              className={cn(
                "w-full flex items-center justify-between px-3 py-1.5",
                "bg-neutral-100/70 hover:bg-neutral-100 rounded-md",
                "text-neutral-500 text-xs transition-all duration-150 cursor-pointer"
              )}
              title="جستجو (Cmd+K)"
            >
              <div className="flex items-center gap-2 truncate">
                <Search className="w-4 h-4 text-neutral-400 shrink-0" />
                <span className="truncate">جستجو...</span>
              </div>
              <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-mono text-neutral-400 bg-white rounded shrink-0 shadow-2xs">
                ⌘K
              </kbd>
            </button>
          </div>

          {/* Minimal Action Icons */}
          <div className="flex items-center gap-1">
            {/* Bookmark Icon Button in Top Header */}
            <button
              type="button"
              onClick={() => toggleBookmark(currentArticle.id)}
              title={isCurrentBookmarked ? "حذف از مقالات نشان‌شده" : "نشان کردن مقاله"}
              className={cn(
                "p-2 rounded-md transition-colors cursor-pointer",
                isCurrentBookmarked
                  ? "bg-black text-white hover:bg-neutral-800"
                  : "text-neutral-600 hover:text-black hover:bg-neutral-100"
              )}
              aria-pressed={isCurrentBookmarked}
            >
              <Bookmark
                className={cn(
                  "w-4 h-4",
                  isCurrentBookmarked ? "fill-white text-white" : "text-neutral-600"
                )}
              />
            </button>

            <button
              type="button"
              onClick={handleShare}
              title="کپی پیوند"
              className="p-2 text-neutral-600 hover:text-black hover:bg-neutral-100 rounded-md transition-colors cursor-pointer"
            >
              {copiedLink ? <Check className="w-4 h-4 text-black" /> : <Share2 className="w-4 h-4" />}
            </button>

            <button
              type="button"
              onClick={handlePrint}
              title="نسخه چاپی"
              className="p-2 text-neutral-600 hover:text-black hover:bg-neutral-100 rounded-md transition-colors cursor-pointer"
            >
              <Printer className="w-4 h-4" />
            </button>
          </div>
        </header>
      )}

      {/* Main Container: CTC Simulator, Station Atlas Page, or Technical Encyclopedia */}
      {activeView === "simulator" ? (
        <div className="flex-1 w-full flex flex-col overflow-hidden min-h-0">
          <CtcSimulator
            onClose={() => setActiveView("article")}
            initialStationId={simulatorInitialStationId}
            onOpenAtlas={() => setActiveView("atlas")}
          />
        </div>
      ) : activeView === "atlas" ? (
        <div className="flex-1 w-full flex overflow-hidden min-h-0">
          <Sidebar
            currentArticleId={currentArticleId}
            onSelectArticle={(id) => {
              setCurrentArticleId(id);
              setActiveView("article");
              scrollToTop();
            }}
            onSelectSection={(articleId, sectionId) => {
              setCurrentArticleId(articleId);
              setActiveView("article");
              setTimeout(() => {
                scrollToSection(sectionId);
              }, 80);
            }}
            onSelectTerm={(term) => setSelectedTermModal(term)}
            isOpenMobile={mobileMenuOpen}
            onCloseMobile={() => setMobileMenuOpen(false)}
            bookmarkedIds={bookmarkedIds}
            onRemoveBookmark={(id) => {
              setBookmarkedIds((prev) => prev.filter((item) => item !== id));
            }}
            recentlyViewedIds={recentlyViewedIds}
            onClearRecentlyViewed={clearRecentlyViewed}
            activeSectionId={activeSectionId}
            onOpenCtcSimulator={() => {
              setSimulatorInitialStationId(undefined);
              setActiveView("simulator");
            }}
            onOpenStationAtlas={() => setActiveView("atlas")}
          />

          <StationAtlasPage
            onSelectStationInSimulator={(stId) => {
              setSimulatorInitialStationId(stId);
              setActiveView("simulator");
            }}
            onNavigateToArticle={(artId, secId) => {
              setCurrentArticleId(artId);
              setActiveView("article");
              if (secId) {
                setTimeout(() => {
                  const el = document.getElementById(secId);
                  el?.scrollIntoView({ behavior: "smooth" });
                }, 150);
              } else {
                scrollToTop();
              }
            }}
            onBackToEncyclopedia={() => setActiveView("article")}
            onOpenSimulator={() => {
              setSimulatorInitialStationId(undefined);
              setActiveView("simulator");
            }}
          />
        </div>
      ) : (
        <div className="flex-1 w-full flex overflow-hidden min-h-0">
          {/* Left/Sidebar navigation (Fixed in place) */}
          <Sidebar
            currentArticleId={currentArticleId}
            onSelectArticle={(id) => {
              setCurrentArticleId(id);
              scrollToTop();
            }}
            onSelectSection={(articleId, sectionId) => {
              if (articleId !== currentArticleId) {
                setCurrentArticleId(articleId);
              }
              setTimeout(() => {
                scrollToSection(sectionId);
              }, 80);
            }}
            onSelectTerm={(term) => setSelectedTermModal(term)}
            isOpenMobile={mobileMenuOpen}
            onCloseMobile={() => setMobileMenuOpen(false)}
            bookmarkedIds={bookmarkedIds}
            onRemoveBookmark={(id) => {
              setBookmarkedIds((prev) => prev.filter((item) => item !== id));
            }}
            recentlyViewedIds={recentlyViewedIds}
            onClearRecentlyViewed={clearRecentlyViewed}
            activeSectionId={activeSectionId}
            onOpenCtcSimulator={() => {
              setSimulatorInitialStationId(undefined);
              setActiveView("simulator");
            }}
            onOpenStationAtlas={() => setActiveView("atlas")}
          />

        {/* Middle Main Article Area (Scrollable text content) */}
        <main
          ref={mainScrollRef}
          tabIndex={0}
          className="flex-1 min-w-0 px-4 md:px-8 xl:px-12 py-8 md:py-10 h-full overflow-y-auto scroll-smooth focus:outline-hidden"
        >
          <article className="max-w-3xl xl:max-w-4xl mx-auto space-y-8">
            {/* Breadcrumb & Metadata */}
            <div className="space-y-3 pb-6">
              <div className="flex flex-wrap items-center gap-2 text-xs text-neutral-500">
                <span className="font-medium text-black">دانشنامه مهندسی</span>
                <ChevronLeft className="w-3.5 h-3.5 text-neutral-300" />
                <span>{currentArticle.category}</span>
                <ChevronLeft className="w-3.5 h-3.5 text-neutral-300" />
                <span className="text-neutral-400 truncate max-w-[200px]">{currentArticle.title}</span>
              </div>

              {/* Title & Subtitle */}
              <h1 className="text-2xl md:text-4xl font-extrabold text-black tracking-tight leading-snug md:leading-tight">
                {currentArticle.title}
              </h1>
              <p className="text-sm md:text-base text-neutral-600 leading-relaxed font-normal">
                {currentArticle.subtitle}
              </p>

              {/* Meta tags bar - clean, unified, right-to-left layout */}
              <div className="pt-2 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-neutral-500 font-sans">
                <div className="inline-flex items-center gap-1.5 leading-none">
                  <Calendar className="w-4 h-4 text-neutral-400 shrink-0" />
                  <span className="leading-none">{currentArticle.lastUpdated}</span>
                </div>
                <div className="inline-flex items-center gap-1.5 leading-none">
                  <Clock className="w-4 h-4 text-neutral-400 shrink-0" />
                  <span className="leading-none">{currentArticle.readingTime}</span>
                </div>
                <div className="inline-flex items-center gap-1.5 leading-none text-black font-semibold">
                  <BookmarkCheck className="w-4 h-4 text-black shrink-0" />
                  <span className="leading-none">تأییدشده فنی</span>
                </div>
              </div>
            </div>

            {/* Quick Callout / Executive Summary */}
            <div className="p-4 md:p-5 bg-neutral-50 rounded-lg">
              <div className="text-xs font-bold text-neutral-800 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5" />
                <span>خلاصه اجرایی مدخل</span>
              </div>
              <p className="text-xs md:text-sm text-neutral-700 leading-relaxed text-justify">
                {currentArticle.summary}
              </p>
            </div>

            {/* Article Sections */}
            <div className="space-y-12">
              {currentArticle.sections.map((section) => (
                <section key={section.id} id={section.id} className="scroll-mt-24 space-y-4">
                  <h2 className="text-lg md:text-2xl font-bold text-black pb-2 flex items-center justify-between">
                    <span>{section.title}</span>
                    <a
                      href={`#${section.id}`}
                      className="text-xs font-mono text-neutral-300 hover:text-black transition-colors"
                      title="پیوند به این بخش"
                    >
                      #
                    </a>
                  </h2>

                  <RichContentRenderer
                    content={section.content}
                    onSelectTerm={(term) => setSelectedTermModal(term)}
                    onNavigateToArticle={(artId) => {
                      setCurrentArticleId(artId);
                      scrollToTop();
                    }}
                    annotations={annotations.filter((a) => a.articleId === currentArticle.id)}
                    onSelectAnnotation={(anno) => setViewingAnnotation(anno)}
                  />
                </section>
              ))}
            </div>

            {/* Related Articles Footer Section */}
            {currentArticle.relatedArticles && currentArticle.relatedArticles.length > 0 && (
              <div className="pt-8 space-y-4">
                <h3 className="text-base font-bold text-black flex items-center gap-2">
                  <BookOpen className="w-4 h-4" />
                  <span>مدخل‌های مرتبط در دانشنامه</span>
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {currentArticle.relatedArticles.map((rel) => (
                    <button
                      key={rel.id}
                      type="button"
                      onClick={() => {
                        setCurrentArticleId(rel.id);
                        scrollToTop();
                      }}
                      className="text-right p-4 rounded-lg bg-neutral-50 hover:bg-neutral-100 transition-all group"
                    >
                      <span className="text-[10px] text-neutral-400 uppercase font-mono block mb-1">
                        {rel.category}
                      </span>
                      <span className="text-sm font-semibold text-black group-hover:underline flex items-center justify-between">
                        {rel.title}
                        <ChevronLeft className="w-4 h-4 text-neutral-300 group-hover:text-black transition-colors" />
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </article>
        </main>

        {/* Right Sticky Table of Contents (Desktop) */}
        <TableOfContents
          sections={currentArticle.sections}
          activeSectionId={activeSectionId}
          onScrollToSection={scrollToSection}
          annotations={annotations.filter((a) => a.articleId === currentArticle.id)}
          onSelectAnnotation={(anno) => setViewingAnnotation(anno)}
          onDeleteAnnotation={handleDeleteAnnotation}
        />
      </div>
    )}

      {/* Floating Highlight Toolbar on text selection */}
      {selectionRange && (
        <div
          id="floating-highlight-trigger"
          className="fixed z-50 transform -translate-x-1/2 -translate-y-full mb-2 bg-black text-white rounded-md shadow-2xl px-3 py-1.5 flex items-center gap-2 border border-neutral-700 animate-in fade-in zoom-in-95 duration-100"
          style={{
            left: `${selectionRange.x}px`,
            top: `${selectionRange.y}px`,
          }}
        >
          <button
            type="button"
            onClick={() => {
              setActiveSelectedText(selectionRange.text);
              setIsAddNoteModalOpen(true);
            }}
            className="flex items-center gap-1.5 text-xs font-semibold hover:text-neutral-300 transition-colors cursor-pointer"
          >
            <Highlighter className="w-3.5 h-3.5" />
            <span>هایلایت و یادداشت</span>
          </button>
        </div>
      )}

      {/* Modal to add personal note to highlight */}
      <AddNoteModal
        isOpen={isAddNoteModalOpen}
        onClose={() => setIsAddNoteModalOpen(false)}
        selectedText={activeSelectedText}
        onSave={handleSaveAnnotation}
      />

      {/* Modal to view or delete existing annotation */}
      <ViewAnnotationModal
        annotation={viewingAnnotation}
        onClose={() => setViewingAnnotation(null)}
        onDelete={handleDeleteAnnotation}
      />

      {/* Global Quick Search Modal (Cmd+K) */}
      <CommandSearch
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onSelectArticle={(id) => {
          setCurrentArticleId(id);
          scrollToTop();
        }}
        onSelectTerm={(term) => {
          setSelectedTermModal(term);
        }}
      />

      {/* Term Detail Modal when user clicks Read More */}
      <TermDetailModal
        termKey={selectedTermModal}
        onClose={() => setSelectedTermModal(null)}
        onNavigateToArticle={(artId) => {
          setCurrentArticleId(artId);
          scrollToTop();
        }}
      />
    </div>
  );
}
