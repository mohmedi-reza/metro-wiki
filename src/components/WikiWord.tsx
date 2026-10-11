import React, { useState } from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { motion } from "motion/react";
import { encyclopediaTerms, TermDefinition } from "../data/encyclopediaData";
import { ArrowLeft, BookOpen, Layers, X, Clock, CheckCircle2 } from "lucide-react";
import { cn } from "../lib/utils";

interface WikiWordProps {
  term: string;
  definition?: string;
  className?: string;
  onSelectTerm?: (termKey: string) => void;
  onNavigateToArticle?: (articleId: string) => void;
}

export const WikiWord: React.FC<WikiWordProps> = ({
  term,
  definition,
  className,
  onSelectTerm,
  onNavigateToArticle,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const data: TermDefinition | undefined = encyclopediaTerms[term];
  const displayTitle = data ? data.title : term;
  const displaySummary = definition || (data ? data.summary : "تعریف برای این مدخل در دسترس است.");
  const displayCategory = data?.category || "مدخل دانشنامه";
  const displayReadTime = data?.readTime || "۲ دقیقه";

  const closeBottomSheet = () => {
    setIsOpen(false);
  };

  const contentMarkup = (
    <div className="text-right text-black font-sans select-none space-y-4">
      {/* Drag handle indicator */}
      <div className="w-10 h-1 bg-neutral-200 rounded-full mx-auto" />

      {/* Header bar: Aligned with the minimalist site design */}
      <div className="flex items-center justify-between pb-1">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-neutral-100 flex items-center justify-center text-black">
            <Layers className="w-3.5 h-3.5" />
          </div>
          <span className="text-xs font-semibold text-neutral-600">{displayCategory}</span>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 text-xs text-neutral-400 font-sans">
            <Clock className="w-3.5 h-3.5" />
            <span>{displayReadTime}</span>
          </div>
          <button
            type="button"
            onClick={closeBottomSheet}
            className="p-1.5 text-neutral-400 hover:text-black hover:bg-neutral-100 rounded-md transition-colors cursor-pointer"
            aria-label="بستن پنجره"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Title block */}
      <div>
        <div className="flex items-baseline gap-2">
          <h3 className="text-xl font-extrabold text-black tracking-tight leading-snug">
            {displayTitle}
          </h3>
          <span className="text-[10px] font-mono px-1.5 py-0.5 bg-neutral-100 text-neutral-600 rounded-xs">
            #{data?.id?.toUpperCase() || "TERM"}
          </span>
        </div>
      </div>

      {/* Summary Content */}
      <div className="p-4 bg-neutral-50 rounded-xl space-y-2">
        <p className="text-xs md:text-sm text-neutral-700 leading-relaxed text-justify font-normal">
          {displaySummary}
        </p>
      </div>

      {/* Key Facts if present (clean grid layout) */}
      {data?.keyFacts && data.keyFacts.length > 0 && (
        <div className="grid grid-cols-2 gap-2">
          {data.keyFacts.slice(0, 4).map((fact, idx) => (
            <div
              key={idx}
              className="p-3 bg-neutral-50/80 rounded-lg text-right flex flex-col gap-0.5"
            >
              <span className="text-[11px] text-neutral-400 font-sans">{fact.label}</span>
              <span className="text-xs font-bold text-black">{fact.value}</span>
            </div>
          ))}
        </div>
      )}

      {/* Actions Bar */}
      <div className="pt-2 flex items-center gap-2">
        {data?.articleId && onNavigateToArticle ? (
          <button
            type="button"
            onClick={() => {
              closeBottomSheet();
              onNavigateToArticle(data.articleId!);
            }}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 py-2.5 px-4",
              "bg-black text-white hover:bg-neutral-800 text-xs font-semibold rounded-lg",
              "transition-colors duration-150 cursor-pointer"
            )}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>مشاهده مقاله کامل</span>
            <ArrowLeft className="w-3.5 h-3.5 ms-0.5" />
          </button>
        ) : (
          <button
            type="button"
            onClick={() => {
              closeBottomSheet();
              if (onSelectTerm) onSelectTerm(term);
            }}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 py-2.5 px-4",
              "bg-black text-white hover:bg-neutral-800 text-xs font-semibold rounded-lg",
              "transition-colors duration-150 cursor-pointer"
            )}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>مشاهده در واژه‌نامه</span>
          </button>
        )}
        <button
          type="button"
          onClick={closeBottomSheet}
          className="px-4 py-2.5 rounded-lg bg-neutral-100 hover:bg-neutral-200 text-neutral-700 text-xs font-medium transition-colors cursor-pointer"
        >
          بستن
        </button>
      </div>
    </div>
  );

  return (
    <>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen((prev) => !prev);
        }}
        title={`${displayTitle}${displaySummary ? ` — ${displaySummary}` : ""}`}
        className={cn(
          "inline-flex items-baseline font-medium cursor-pointer transition-colors duration-150",
          "border-b border-dashed border-neutral-700 text-neutral-900 hover:text-black hover:bg-neutral-100 hover:border-solid hover:border-black px-1 py-0.5 rounded-xs",
          "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-black",
          isOpen && "bg-neutral-100 border-solid border-black",
          className
        )}
        aria-haspopup="dialog"
        aria-expanded={isOpen}
      >
        <span>{term}</span>
      </button>

      {/* Modern aligned Bottom Sheet dialog */}
      <DialogPrimitive.Root open={isOpen} onOpenChange={setIsOpen}>
        <DialogPrimitive.Portal>
          <DialogPrimitive.Overlay className="fixed inset-0 bg-black/40 backdrop-blur-2xs z-50 animate-in fade-in duration-150" />

          <DialogPrimitive.Content
            dir="rtl"
            className="fixed inset-x-0 bottom-0 z-50 p-0 focus:outline-none flex justify-center"
          >
            <motion.div
              initial={{ y: "100%", opacity: 0.8 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: "100%", opacity: 0 }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className={cn(
                "w-full max-w-xl bg-white shadow-2xl",
                "rounded-t-2xl p-5 md:p-6 pb-7 max-h-[85vh] overflow-y-auto"
              )}
            >
              {contentMarkup}
            </motion.div>
          </DialogPrimitive.Content>
        </DialogPrimitive.Portal>
      </DialogPrimitive.Root>
    </>
  );
};
