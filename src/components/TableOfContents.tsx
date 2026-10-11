import React from "react";
import { ArticleSection } from "../data/encyclopediaData";
import { ArticleAnnotation } from "../types/annotation";
import { AlignRight, Highlighter, Trash2 } from "lucide-react";
import { cn } from "../lib/utils";

interface TableOfContentsProps {
  sections: ArticleSection[];
  activeSectionId: string;
  onScrollToSection: (sectionId: string) => void;
  annotations?: ArticleAnnotation[];
  onSelectAnnotation?: (annotation: ArticleAnnotation) => void;
  onDeleteAnnotation?: (id: string) => void;
}

export const TableOfContents: React.FC<TableOfContentsProps> = ({
  sections,
  activeSectionId,
  onScrollToSection,
  annotations = [],
  onSelectAnnotation,
  onDeleteAnnotation,
}) => {
  return (
    <div className="w-64 xl:w-72 shrink-0 hidden xl:block h-full overflow-y-auto p-4 space-y-6 border-s border-neutral-100 bg-white">
      {/* Sections Table */}
      <div>
        <div className="flex items-center gap-2 mb-3 text-xs font-bold text-black uppercase tracking-wider">
          <AlignRight className="w-3.5 h-3.5" />
          <span>فهرست محتوای مقاله</span>
        </div>
        <nav className="space-y-1">
          {sections.map((sec) => {
            const isActive = activeSectionId === sec.id;
            return (
              <button
                key={sec.id}
                type="button"
                onClick={() => onScrollToSection(sec.id)}
                className={cn(
                  "w-full text-right py-1.5 px-2.5 rounded-sm text-xs transition-colors duration-150 block truncate cursor-pointer",
                  isActive
                    ? "bg-black text-white font-semibold"
                    : "text-neutral-500 hover:text-black hover:bg-neutral-50"
                )}
              >
                {sec.title}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Article Highlights / Notes list in TOC */}
      {annotations.length > 0 && (
        <div className="pt-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-black">
              <Highlighter className="w-3.5 h-3.5" />
              <span>هایلایت‌های این مقاله</span>
            </div>
            <span className="text-[10px] font-mono text-neutral-400">
              {annotations.length}
            </span>
          </div>
          <div className="space-y-1.5">
            {annotations.map((anno) => (
              <div
                key={anno.id}
                onClick={() => onSelectAnnotation?.(anno)}
                className="group p-2 bg-neutral-50 hover:bg-neutral-100 rounded-sm cursor-pointer transition-colors text-right"
              >
                <div className="text-[11px] font-medium text-black line-clamp-1 italic">
                  «{anno.highlightedText}»
                </div>
                {anno.note && (
                  <div className="text-[10px] text-neutral-500 line-clamp-1 mt-0.5">
                    {anno.note}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Reading & Highlighting hints */}
      <div className="pt-4 text-[11px] text-neutral-400 space-y-2">
        <p className="leading-relaxed">
          💡 برای هایلایت کردن، متنی از مقاله را با ماوس انتخاب کنید.
        </p>
      </div>
    </div>
  );
};
