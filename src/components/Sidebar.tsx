import React, { useState } from "react";
import {
  Bookmark,
  FileText,
  ChevronDown,
  Trash2,
  History,
  FolderTree,
  Folder,
  FolderOpen,
  Hash,
  X,
  Sparkles,
  Wrench,
  Radio,
  Activity,
  Play,
  Sliders,
  MapPin,
  Layers,
  Server,
} from "lucide-react";
import { sampleArticles, encyclopediaTerms } from "../data/encyclopediaData";
import { MetroLogo } from "./MetroLogo";
import { cn } from "../lib/utils";

interface SidebarProps {
  currentArticleId: string;
  onSelectArticle: (id: string) => void;
  onSelectSection?: (articleId: string, sectionId: string) => void;
  onSelectTerm: (term: string) => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
  bookmarkedIds: string[];
  onRemoveBookmark: (id: string) => void;
  recentlyViewedIds: string[];
  onClearRecentlyViewed: () => void;
  activeSectionId?: string;
  onOpenCtcSimulator?: () => void;
  onOpenStationAtlas?: (targetTab?: "racks" | "cards" | "table") => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentArticleId,
  onSelectArticle,
  onSelectSection,
  onSelectTerm,
  isOpenMobile,
  onCloseMobile,
  bookmarkedIds,
  onRemoveBookmark,
  recentlyViewedIds,
  onClearRecentlyViewed,
  activeSectionId,
  onOpenCtcSimulator,
  onOpenStationAtlas,
}) => {
  // Navigation tabs for clean separation of concerns
  const [activeTab, setActiveTab] = useState<"tree" | "tools" | "bookmarks" | "recent" | "terms">("tree");

  // Tree-view expanded articles state
  const [expandedArticleIds, setExpandedArticleIds] = useState<Record<string, boolean>>({
    [currentArticleId]: true,
  });

  const toggleArticleTree = (articleId: string) => {
    setExpandedArticleIds((prev) => ({
      ...prev,
      [articleId]: !prev[articleId],
    }));
  };

  // Group articles by category
  const categories = Array.from(new Set(sampleArticles.map((a) => a.category)));
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    categories.forEach((cat) => {
      initial[cat] = true;
    });
    return initial;
  });

  const toggleCategoryTree = (category: string) => {
    setExpandedCategories((prev) => ({
      ...prev,
      [category]: !prev[category],
    }));
  };

  const savedArticles = sampleArticles.filter((art) => bookmarkedIds.includes(art.id));
  const recentArticles = recentlyViewedIds
    .map((id) => sampleArticles.find((art) => art.id === id))
    .filter((art): art is typeof sampleArticles[number] => Boolean(art))
    .slice(0, 5);

  return (
    <>
      {/* Mobile backdrop with higher z-index to fully cover header */}
      {isOpenMobile && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 bg-black/60 z-[70] lg:hidden backdrop-blur-2xs"
        />
      )}

      {/* Fixed sidebar on desktop with independent scrolling and clean border separation */}
      <aside
        className={cn(
          "fixed inset-0 lg:static lg:inset-auto",
          "w-full lg:w-72 xl:w-80 shrink-0 bg-white z-[80] lg:z-10",
          "flex flex-col transition-transform duration-200 ease-in-out",
          "h-screen lg:h-full border-e border-neutral-100",
          isOpenMobile ? "translate-x-0" : "translate-x-full lg:translate-x-0"
        )}
      >
        {/* Full-width header on mobile to completely hide/replace the site header */}
        <div className="flex items-center justify-between px-4 py-3.5 border-b border-neutral-100 lg:hidden">
          <div className="flex items-center gap-2">
            <MetroLogo size="sm" />
            <div className="flex flex-col">
              <span className="text-sm font-extrabold text-black leading-tight">دانشنامک</span>
              <span className="text-[10px] text-neutral-400 font-sans">فهرست موضوعی و ناوبری</span>
            </div>
          </div>
          <button
            type="button"
            onClick={onCloseMobile}
            className="p-1.5 text-neutral-600 hover:text-black rounded-md hover:bg-neutral-100 transition-colors cursor-pointer flex items-center gap-1.5 text-xs font-medium"
            aria-label="بستن منو"
          >
            <span>بستن</span>
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Clean Categorized Switcher Tabs - With Tools (تولز) Tab */}
        <div className="px-3 pt-3 pb-2">
          <div className="grid grid-cols-5 gap-1 p-1 bg-neutral-100/90 rounded-xl text-xs font-medium">
            <button
              type="button"
              onClick={() => setActiveTab("tree")}
              className={cn(
                "py-1.5 px-1 rounded-lg transition-all text-center truncate cursor-pointer text-[11px]",
                activeTab === "tree"
                  ? "bg-white text-black font-bold shadow-xs"
                  : "text-neutral-500 hover:text-black"
              )}
            >
              فهرست
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("tools")}
              className={cn(
                "py-1.5 px-1 rounded-lg transition-all text-center truncate cursor-pointer text-[11px] flex items-center justify-center gap-1",
                activeTab === "tools"
                  ? "bg-white text-black font-bold shadow-xs"
                  : "text-neutral-500 hover:text-black"
              )}
            >
              <span>ابزارها</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("bookmarks")}
              className={cn(
                "py-1.5 px-1 rounded-lg transition-all text-center truncate cursor-pointer text-[11px] flex items-center justify-center gap-0.5",
                activeTab === "bookmarks"
                  ? "bg-white text-black font-bold shadow-xs"
                  : "text-neutral-500 hover:text-black"
              )}
            >
              <span>نشان‌ها</span>
              {savedArticles.length > 0 && (
                <span className="w-3.5 h-3.5 rounded-full bg-neutral-200 text-[9px] flex items-center justify-center">
                  {savedArticles.length}
                </span>
              )}
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("recent")}
              className={cn(
                "py-1.5 px-1 rounded-lg transition-all text-center truncate cursor-pointer text-[11px]",
                activeTab === "recent"
                  ? "bg-white text-black font-bold shadow-xs"
                  : "text-neutral-500 hover:text-black"
              )}
            >
              بازدیدها
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("terms")}
              className={cn(
                "py-1.5 px-1 rounded-lg transition-all text-center truncate cursor-pointer text-[11px]",
                activeTab === "terms"
                  ? "bg-white text-black font-bold shadow-xs"
                  : "text-neutral-500 hover:text-black"
              )}
            >
              واژه‌نامه
            </button>
          </div>
        </div>

        {/* Tab Contents: Scrollable */}
        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4">
          {/* TAB: Tools (ابزارها و تولز) */}
          {activeTab === "tools" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-neutral-800">ابزارها و نقشه‌های تخصصی</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded-sm bg-emerald-100 text-emerald-800 font-mono font-semibold">
                  SCADA & RACKS
                </span>
              </div>

              {/* 1. Simulation Card and Launch Button */}
              <div className="p-3.5 rounded-xl bg-neutral-950 text-white border border-neutral-800 shadow-sm space-y-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <h3 className="text-xs font-extrabold text-white">
                      شبیه‌ساز و مانیتورینگ متمرکز CTC
                    </h3>
                  </div>
                  <p className="text-[11px] text-neutral-400 leading-relaxed">
                    شبیه‌ساز زنده ترافیک، کنترل سوزن‌ها، چراغ‌های سیگنال، روتینگ و حرکت قطارهای خط ۱ مترو (SCADA).
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[10px] text-neutral-300 pt-1 border-t border-neutral-800">
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                    <span>۲۰ ایستگاه خط ۱</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    <span>روتینگ Running/Shunting</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    onOpenCtcSimulator?.();
                    onCloseMobile();
                  }}
                  className="w-full py-2.5 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-sm active:scale-[0.99]"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>اجرای شبیه‌ساز CTC</span>
                </button>
              </div>

              {/* 2. Visual Rack Elevations & Signaling Rooms */}
              <div className="p-3.5 rounded-xl bg-white text-neutral-900 border border-neutral-200 shadow-2xs space-y-3">
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <Server className="w-3.5 h-3.5 text-sky-600" />
                      <h3 className="text-xs font-extrabold text-neutral-900">
                        ترسیم بصری رک‌ها و اتاق‌های سیگنال
                      </h3>
                    </div>
                    <span className="text-[9px] px-1.5 py-0.5 rounded-sm bg-sky-50 text-sky-700 font-mono border border-sky-200 font-bold">
                      42U VISUAL
                    </span>
                  </div>
                  <p className="text-[11px] text-neutral-500 leading-relaxed">
                    ترسیم شماتیک و فیزیکی ۴۲ یونیت رک‌های ۱۹ اینچ (U01-U42)، بردهای سخت‌افزاری و پروتکل‌های شبکه صنعتی.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    onOpenStationAtlas?.("racks");
                    onCloseMobile();
                  }}
                  className="w-full py-2 px-3 rounded-lg bg-neutral-900 hover:bg-black text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-2xs active:scale-[0.99]"
                >
                  <Server className="w-3.5 h-3.5 text-sky-400" />
                  <span>مشاهده ترسیم بصری رک‌ها (SER/CER)</span>
                </button>
              </div>

              {/* 3. Station Atlas Cards & Technical Matrix */}
              <div className="p-3 rounded-xl bg-neutral-50 border border-neutral-200 space-y-2">
                <span className="text-xs font-bold text-neutral-800 block">
                  اطلس ساختاری و ماتریس خط ۱:
                </span>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => {
                      onOpenStationAtlas?.("cards");
                      onCloseMobile();
                    }}
                    className="p-2 rounded-lg bg-white hover:bg-neutral-100 border border-neutral-250 text-right transition-colors cursor-pointer"
                  >
                    <span className="font-bold text-neutral-900 block text-[11px]">کارت‌های ایستگاه</span>
                    <span className="text-[10px] text-neutral-500">۲۰ ایستگاه و سکوها</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      onOpenStationAtlas?.("table");
                      onCloseMobile();
                    }}
                    className="p-2 rounded-lg bg-white hover:bg-neutral-100 border border-neutral-250 text-right transition-colors cursor-pointer"
                  >
                    <span className="font-bold text-neutral-900 block text-[11px]">ماتریس فنی خط ۱</span>
                    <span className="text-[10px] text-neutral-500">جدول سوزن‌ها و روت</span>
                  </button>
                </div>
              </div>

              {/* Quick Operation Guide */}
              <div className="p-3 rounded-xl bg-neutral-50 border border-neutral-200 text-[11px] space-y-1.5 text-neutral-600">
                <span className="font-bold text-neutral-800 block text-xs">
                  راهنمای سریع:
                </span>
                <ul className="space-y-1 list-disc list-inside leading-relaxed text-[11px]">
                  <li>کلیک روی هر ساب‌رک در ترسیم بصری = مشاهده بردهای داخلی.</li>
                  <li>امکان تغییر حالت بین ترسیم ۴۲ یونیت و متن کاتالوگ قطعات.</li>
                  <li>دکمه مودال تمام‌صفحه برای بررسی دقیق در مانیتور یا موبایل.</li>
                </ul>
              </div>
            </div>
          )}

          {/* TAB 1: Tree View */}
          {activeTab === "tree" && (
            <div className="space-y-4">
              <div className="space-y-3">
                {categories.map((category) => {
                  const categoryArticles = sampleArticles.filter((a) => a.category === category);
                  const isCatExpanded = !!expandedCategories[category];

                  return (
                    <div key={category} className="space-y-1.5">
                      {/* Category Header */}
                      <button
                        type="button"
                        onClick={() => toggleCategoryTree(category)}
                        className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-neutral-50 text-right transition-colors cursor-pointer group"
                      >
                        <div className="flex items-center gap-2 font-bold text-xs text-neutral-800 group-hover:text-black">
                          {isCatExpanded ? (
                            <FolderOpen className="w-4 h-4 text-black shrink-0" />
                          ) : (
                            <Folder className="w-4 h-4 text-neutral-400 shrink-0" />
                          )}
                          <span>{category}</span>
                        </div>
                        <ChevronDown
                          className={cn(
                            "w-3.5 h-3.5 text-neutral-400 transition-transform duration-150 shrink-0",
                            !isCatExpanded && "rotate-90"
                          )}
                        />
                      </button>

                      {/* Category Articles */}
                      {isCatExpanded && (
                        <div className="space-y-1 me-1 ms-3">
                          {categoryArticles.map((art) => {
                            const isArticleActive = art.id === currentArticleId;
                            const isArtExpanded =
                              expandedArticleIds[art.id] !== undefined
                                ? expandedArticleIds[art.id]
                                : isArticleActive;
                            const isBookmarked = bookmarkedIds.includes(art.id);

                            return (
                              <div key={art.id} className="space-y-1">
                                {/* Article Pill */}
                                <div
                                  className={cn(
                                    "flex items-center justify-between rounded-lg transition-all",
                                    isArticleActive
                                      ? "bg-black text-white"
                                      : "text-neutral-700 hover:bg-neutral-100 hover:text-black"
                                  )}
                                >
                                  <button
                                    type="button"
                                    onClick={() => {
                                      onSelectArticle(art.id);
                                      setExpandedArticleIds((prev) => ({ ...prev, [art.id]: true }));
                                      onCloseMobile();
                                    }}
                                    className="flex-1 text-right py-2 px-3 flex items-center gap-2 truncate cursor-pointer"
                                  >
                                    {isBookmarked && (
                                      <Bookmark
                                        className={cn(
                                          "w-3 h-3 shrink-0 fill-current",
                                          isArticleActive ? "text-white" : "text-black"
                                        )}
                                      />
                                    )}
                                    <FileText className="w-3.5 h-3.5 shrink-0 opacity-70" />
                                    <span className="truncate text-xs font-medium leading-snug">
                                      {art.title}
                                    </span>
                                  </button>

                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      toggleArticleTree(art.id);
                                    }}
                                    className={cn(
                                      "p-2 me-1 rounded-md transition-colors cursor-pointer",
                                      isArticleActive
                                        ? "hover:bg-white/20 text-white"
                                        : "hover:bg-neutral-200 text-neutral-400"
                                    )}
                                    title="نمایش فصول و بخش‌ها"
                                  >
                                    <ChevronDown
                                      className={cn(
                                        "w-3.5 h-3.5 transition-transform duration-150",
                                        !isArtExpanded && "rotate-90"
                                      )}
                                    />
                                  </button>
                                </div>

                                {/* Article Sections Sub-Tree */}
                                {isArtExpanded && art.sections && (
                                  <div className="ms-4 me-1 space-y-0.5 py-1">
                                    {art.sections.map((sec) => {
                                      const isSectionActive =
                                        isArticleActive && activeSectionId === sec.id;
                                      return (
                                        <button
                                          key={sec.id}
                                          type="button"
                                          onClick={() => {
                                            if (onSelectSection) {
                                              onSelectSection(art.id, sec.id);
                                            } else {
                                              onSelectArticle(art.id);
                                              setTimeout(() => {
                                                const el = document.getElementById(sec.id);
                                                el?.scrollIntoView({ behavior: "smooth" });
                                              }, 100);
                                            }
                                            onCloseMobile();
                                          }}
                                          className={cn(
                                            "w-full text-right py-1.5 px-2.5 rounded-md text-[11px] transition-colors flex items-center gap-2 truncate cursor-pointer",
                                            isSectionActive
                                              ? "bg-neutral-150 text-black font-bold"
                                              : "text-neutral-500 hover:text-black hover:bg-neutral-50"
                                          )}
                                        >
                                          <Hash className="w-3 h-3 opacity-40 shrink-0" />
                                          <span className="truncate">{sec.title}</span>
                                        </button>
                                      );
                                    })}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 2: Bookmarks */}
          {activeTab === "bookmarks" && (
            <div className="space-y-3">
              <div className="text-xs font-semibold text-neutral-400">
                مقالات ذخیره‌شده برای مطالعه بعدی
              </div>
              {savedArticles.length > 0 ? (
                <div className="space-y-1.5">
                  {savedArticles.map((art) => {
                    const isActive = art.id === currentArticleId;
                    return (
                      <div
                        key={`saved-${art.id}`}
                        className={cn(
                          "group flex items-center justify-between p-2.5 rounded-lg text-xs transition-colors",
                          isActive
                            ? "bg-black text-white font-semibold"
                            : "bg-neutral-50 hover:bg-neutral-100 text-neutral-800"
                        )}
                      >
                        <button
                          type="button"
                          onClick={() => {
                            onSelectArticle(art.id);
                            onCloseMobile();
                          }}
                          className="flex-1 text-right truncate cursor-pointer flex items-center gap-2"
                        >
                          <Bookmark
                            className={cn(
                              "w-3.5 h-3.5 shrink-0 fill-current",
                              isActive ? "text-white" : "text-black"
                            )}
                          />
                          <span className="truncate">{art.title}</span>
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onRemoveBookmark(art.id);
                          }}
                          title="حذف از نشان‌شده‌ها"
                          className={cn(
                            "p-1 rounded transition-colors cursor-pointer",
                            isActive ? "hover:bg-white/20 text-white" : "hover:text-black text-neutral-400"
                          )}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="p-8 text-center text-xs text-neutral-400 leading-relaxed bg-neutral-50 rounded-xl">
                  هنوز مقاله‌ای نشان نشده است.
                </div>
              )}
            </div>
          )}

          {/* TAB 3: Recently Viewed */}
          {activeTab === "recent" && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs font-semibold text-neutral-400">
                <span>آخرین صفحات بازدیدشده</span>
                {recentArticles.length > 0 && (
                  <button
                    type="button"
                    onClick={onClearRecentlyViewed}
                    className="text-[11px] text-neutral-400 hover:text-black cursor-pointer"
                  >
                    پاک‌کردن
                  </button>
                )}
              </div>
              {recentArticles.length > 0 ? (
                <div className="space-y-1.5">
                  {recentArticles.map((art) => {
                    const isActive = art.id === currentArticleId;
                    return (
                      <button
                        key={`recent-${art.id}`}
                        type="button"
                        onClick={() => {
                          onSelectArticle(art.id);
                          onCloseMobile();
                        }}
                        className={cn(
                          "w-full text-right p-2.5 rounded-lg text-xs transition-colors flex items-center justify-between group cursor-pointer",
                          isActive
                            ? "bg-black text-white font-semibold"
                            : "bg-neutral-50 hover:bg-neutral-100 text-neutral-800"
                        )}
                      >
                        <div className="flex items-center gap-2 truncate">
                          <History className="w-3.5 h-3.5 opacity-60 shrink-0" />
                          <span className="truncate">{art.title}</span>
                        </div>
                        <span className="text-[10px] opacity-60 shrink-0 ms-1 font-sans">
                          {art.readingTime}
                        </span>
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="p-8 text-center text-xs text-neutral-400 leading-relaxed bg-neutral-50 rounded-xl">
                  تاریخچه بازدید خالی است.
                </div>
              )}
            </div>
          )}

          {/* TAB 4: Glossary Terms */}
          {activeTab === "terms" && (
            <div className="space-y-3">
              <div className="text-xs font-semibold text-neutral-400">
                واژه‌نامه و اصطلاحات تخصصی ریلی
              </div>
              <div className="flex flex-wrap gap-1.5">
                {Object.keys(encyclopediaTerms).map((term) => (
                  <button
                    key={term}
                    type="button"
                    onClick={() => {
                      onSelectTerm(term);
                      onCloseMobile();
                    }}
                    className={cn(
                      "text-xs px-2.5 py-1.5 rounded-md bg-neutral-100 text-neutral-800",
                      "hover:bg-black hover:text-white transition-all cursor-pointer"
                    )}
                  >
                    {term}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </aside>
    </>
  );
};
