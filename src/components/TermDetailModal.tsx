import React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X, Layers, BookOpen, Clock, Tag, ArrowLeft } from "lucide-react";
import { TechnicalFigurePlaceholder } from "./TechnicalFigurePlaceholder";
import { encyclopediaTerms, TermDefinition } from "../data/encyclopediaData";
import { cn } from "../lib/utils";

interface TermDetailModalProps {
  termKey: string | null;
  onClose: () => void;
  onNavigateToArticle: (articleId: string) => void;
}

export const TermDetailModal: React.FC<TermDetailModalProps> = ({
  termKey,
  onClose,
  onNavigateToArticle,
}) => {
  if (!termKey) return null;
  const data: TermDefinition | undefined = encyclopediaTerms[termKey];

  if (!data) return null;

  return (
    <DialogPrimitive.Root open={!!termKey} onOpenChange={(open) => !open && onClose()}>
      <DialogPrimitive.Portal>
        {/* Fullscreen Overlay with flexbox centering to avoid translate-x issues in RTL */}
        <DialogPrimitive.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-2xs z-50 animate-in fade-in duration-150 p-4 sm:p-6 flex items-center justify-center overflow-y-auto">
          <DialogPrimitive.Content
            dir="rtl"
            onClick={(e) => e.stopPropagation()}
            className={cn(
              "w-full max-w-lg my-auto",
              "bg-white border border-neutral-300 shadow-2xl rounded-lg overflow-hidden",
              "text-black font-sans focus:outline-none animate-in fade-in zoom-in-95 duration-150"
            )}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-200">
              <div className="flex items-center gap-2 text-xs text-neutral-500 font-medium">
                <Layers className="w-4 h-4 text-black" />
                <span>{data.category}</span>
              </div>
              <DialogPrimitive.Close asChild>
                <button
                  type="button"
                  onClick={onClose}
                  className="p-1 text-neutral-400 hover:text-black transition-colors rounded-sm cursor-pointer"
                  aria-label="بستن"
                >
                  <X className="w-5 h-5" />
                </button>
              </DialogPrimitive.Close>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
              <div>
                <span className="text-[11px] font-mono px-2 py-0.5 bg-neutral-100 text-neutral-700 rounded-xs border border-neutral-200 uppercase">
                  واژه مرجع
                </span>
                <h2 className="text-xl md:text-2xl font-bold text-black mt-2">
                  {data.title}
                </h2>
                <p className="text-xs text-neutral-400 font-mono mt-1">
                  کد مدخل: #{data.id.toUpperCase()}
                </p>
              </div>

              {/* Rich Technical Schematic Diagram */}
              <TechnicalFigurePlaceholder
                figureNumber={`دیاگرام #${data.id.toUpperCase()}`}
                title={`معماری و دیاگرام ${data.title}`}
                subtitle={data.category}
                category="استاندارد CENELEC"
                type={
                  data.term.includes("محور شمار") || data.term.includes("MH-AX")
                    ? "axle_counter"
                    : data.term.includes("تراک") || data.term.includes("MH-TC")
                    ? "track_circuit"
                    : data.term.includes("ATP") || data.term.includes("ATO") || data.term.includes("کنترل قطار")
                    ? "atc_onboard"
                    : data.term.includes("اینترلاکینگ") || data.term.includes("EIL")
                    ? "interlocking"
                    : data.term.includes("CTC")
                    ? "ctc_network"
                    : "generic"
                }
                caption={`طرح شماتیک و ارتباطات فنی ماژول ${data.term} با هسته کنترلی و سیستم‌های مرتبط`}
              />

              <div className="space-y-3 text-sm text-neutral-700 leading-relaxed text-justify">
                <p className="font-medium text-black">
                  {data.summary}
                </p>
                <p>
                  {data.fullDescription}
                </p>
              </div>

              {/* Key Facts Table */}
              {data.keyFacts && data.keyFacts.length > 0 && (
                <div className="pt-2">
                  <h4 className="text-xs font-bold text-black mb-2 flex items-center gap-1.5">
                    <Tag className="w-3.5 h-3.5" />
                    <span>مشخصات و ارقام فنی</span>
                  </h4>
                  <div className="border border-neutral-200 rounded-md divide-y divide-neutral-100 text-xs">
                    {data.keyFacts.map((fact, idx) => (
                      <div key={idx} className="flex justify-between p-2.5 bg-neutral-50/50">
                        <span className="text-neutral-500">{fact.label}</span>
                        <span className="font-semibold text-black">{fact.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-6 py-3.5 bg-neutral-50 border-t border-neutral-200 flex items-center justify-between">
              <DialogPrimitive.Close asChild>
                <button
                  type="button"
                  onClick={onClose}
                  className="text-xs font-medium text-neutral-600 hover:text-black cursor-pointer px-3 py-1.5"
                >
                  بستن پنجره
                </button>
              </DialogPrimitive.Close>

              {data.articleId && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onNavigateToArticle(data.articleId!);
                  }}
                  className={cn(
                    "flex items-center gap-1.5 px-3.5 py-2 bg-black text-white hover:bg-neutral-800",
                    "text-xs font-semibold rounded-xs transition-colors cursor-pointer"
                  )}
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>مشاهده مقاله کامل</span>
                  <ArrowLeft className="w-3.5 h-3.5 ms-0.5" />
                </button>
              )}
            </div>
          </DialogPrimitive.Content>
        </DialogPrimitive.Overlay>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
};
