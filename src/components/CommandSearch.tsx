import React, { useState, useEffect, useRef } from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { Search, X, BookOpen, Layers, ArrowLeft } from "lucide-react";
import { encyclopediaTerms, sampleArticles, Article, TermDefinition } from "../data/encyclopediaData";
import { cn } from "../lib/utils";

interface CommandSearchProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectArticle: (articleId: string) => void;
  onSelectTerm: (termKey: string) => void;
}

export const CommandSearch: React.FC<CommandSearchProps> = ({
  isOpen,
  onClose,
  onSelectArticle,
  onSelectTerm,
}) => {
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery("");
    }
  }, [isOpen]);

  // Filter terms and articles
  const filteredTerms = Object.entries(encyclopediaTerms).filter(([term, data]) => {
    const q = query.trim().toLowerCase();
    if (!q) return true;
    return (
      term.toLowerCase().includes(q) ||
      data.title.toLowerCase().includes(q) ||
      data.summary.toLowerCase().includes(q) ||
      data.category.toLowerCase().includes(q)
    );
  });

  const filteredArticles = sampleArticles.filter((art) => {
    const q = query.trim().toLowerCase();
    if (!q) return true;
    return (
      art.title.toLowerCase().includes(q) ||
      art.subtitle.toLowerCase().includes(q) ||
      art.summary.toLowerCase().includes(q) ||
      art.category.toLowerCase().includes(q)
    );
  });

  return (
    <DialogPrimitive.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogPrimitive.Portal>
        {/* Fullscreen Overlay with fixed centering flexbox to prevent any RTL transform offset */}
        <DialogPrimitive.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-2xs z-50 animate-in fade-in duration-150 p-4 sm:p-6 flex items-start justify-center overflow-y-auto">
          <DialogPrimitive.Content
            dir="rtl"
            onClick={(e) => e.stopPropagation()}
            className={cn(
              "w-full max-w-xl my-8 sm:my-16",
              "bg-white border border-neutral-300 shadow-2xl rounded-lg overflow-hidden",
              "text-black font-sans focus:outline-none animate-in fade-in zoom-in-95 duration-150"
            )}
          >
            {/* Search Input Bar */}
            <div className="flex items-center px-4 py-3.5 border-b border-neutral-200">
              <Search className="w-5 h-5 text-neutral-400 ms-1 me-2 shrink-0" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="جستجوی اصطلاحات، استانداردها، مقالات ریلی..."
                className="w-full bg-transparent text-sm md:text-base text-black placeholder:text-neutral-400 focus:outline-none"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  className="p-1 text-neutral-400 hover:text-black transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
              <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-mono text-neutral-400 border border-neutral-200 rounded ms-2">
                ESC
              </kbd>
            </div>

            {/* Search Results List */}
            <div className="max-h-[60vh] overflow-y-auto p-2 divide-y divide-neutral-100">
              {/* Articles Group */}
              {filteredArticles.length > 0 && (
                <div className="py-2">
                  <div className="px-3 py-1 text-[11px] font-semibold text-neutral-400 uppercase tracking-wider flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>مقالات دانشنامه</span>
                  </div>
                  <div className="mt-1 space-y-1">
                    {filteredArticles.map((article) => (
                      <button
                        key={article.id}
                        type="button"
                        onClick={() => {
                          onSelectArticle(article.id);
                          onClose();
                        }}
                        className="w-full text-right p-2.5 rounded-md hover:bg-neutral-100 transition-colors flex items-start justify-between group cursor-pointer"
                      >
                        <div className="space-y-0.5">
                          <div className="text-sm font-semibold text-black group-hover:text-black">
                            {article.title}
                          </div>
                          <div className="text-xs text-neutral-500 line-clamp-1">
                            {article.subtitle}
                          </div>
                        </div>
                        <span className="text-[11px] text-neutral-400 font-mono shrink-0 ms-2">
                          {article.readingTime}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Terms Group */}
              {filteredTerms.length > 0 && (
                <div className="py-2">
                  <div className="px-3 py-1 text-[11px] font-semibold text-neutral-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5" />
                    <span>اصطلاحات تخصصی و تعاریف متصل</span>
                  </div>
                  <div className="mt-1 space-y-1">
                    {filteredTerms.map(([term, termData]) => (
                      <button
                        key={term}
                        type="button"
                        onClick={() => {
                          onSelectTerm(term);
                          onClose();
                        }}
                        className="w-full text-right p-2.5 rounded-md hover:bg-neutral-100 transition-colors flex items-center justify-between group cursor-pointer"
                      >
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-sm text-black border-b border-black/30">
                            {term}
                          </span>
                          <span className="text-xs text-neutral-400 font-normal">
                            — {termData.title}
                          </span>
                        </div>
                        <ArrowLeft className="w-4 h-4 text-neutral-300 group-hover:text-black transition-colors" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Empty state */}
              {filteredArticles.length === 0 && filteredTerms.length === 0 && (
                <div className="py-12 text-center text-neutral-500 text-sm">
                  موردی برای جستجوی «{query}» یافت نشد.
                </div>
              )}
            </div>

            {/* Footer note */}
            <div className="p-3 bg-neutral-50 border-t border-neutral-200 text-xs text-neutral-400 flex items-center justify-between">
              <span>از کلیدهای ⇡ و ⇣ برای پیمایش استفاده کنید</span>
              <span className="font-mono text-[11px]">دانشنامک ۱.۰</span>
            </div>
          </DialogPrimitive.Content>
        </DialogPrimitive.Overlay>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
};
