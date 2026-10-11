import React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { ArticleAnnotation } from "../types/annotation";
import { Highlighter, X, Trash2, StickyNote, Calendar } from "lucide-react";
import { cn } from "../lib/utils";

interface ViewAnnotationModalProps {
  annotation: ArticleAnnotation | null;
  onClose: () => void;
  onDelete: (id: string) => void;
}

export const ViewAnnotationModal: React.FC<ViewAnnotationModalProps> = ({
  annotation,
  onClose,
  onDelete,
}) => {
  if (!annotation) return null;

  return (
    <DialogPrimitive.Root open={!!annotation} onOpenChange={(open) => !open && onClose()}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-2xs z-50 animate-in fade-in duration-150 p-4 sm:p-6 flex items-center justify-center overflow-y-auto">
          <DialogPrimitive.Content
            dir="rtl"
            onClick={(e) => e.stopPropagation()}
            className={cn(
              "w-full max-w-md my-auto",
              "bg-white border border-neutral-300 shadow-2xl rounded-lg overflow-hidden",
              "text-black font-sans focus:outline-none animate-in fade-in zoom-in-95 duration-150"
            )}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-neutral-200">
              <div className="flex items-center gap-2 text-xs font-bold text-black">
                <Highlighter className="w-4 h-4 text-black" />
                <span>یادداشت هایلایت</span>
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

            {/* Content */}
            <div className="p-5 space-y-4">
              <div className="space-y-1">
                <span className="text-[11px] font-semibold text-neutral-400 uppercase">
                  متن برگزیده:
                </span>
                <blockquote className="p-3 bg-neutral-100 border-r-2 border-black rounded-xs text-xs text-black font-medium leading-relaxed italic">
                  «{annotation.highlightedText}»
                </blockquote>
              </div>

              {annotation.note ? (
                <div className="space-y-1">
                  <span className="text-[11px] font-semibold text-neutral-400 uppercase flex items-center gap-1">
                    <StickyNote className="w-3 h-3 text-neutral-500" />
                    <span>یادداشت شخصی شما:</span>
                  </span>
                  <p className="p-3 bg-neutral-50 border border-neutral-200 rounded-md text-xs text-neutral-800 leading-relaxed text-justify">
                    {annotation.note}
                  </p>
                </div>
              ) : (
                <div className="text-xs text-neutral-400 italic">
                  بدون یادداشت متنی (تنها هایلایت علامت‌گذاری‌شده).
                </div>
              )}

              <div className="flex items-center gap-1.5 text-[10px] text-neutral-400 font-mono">
                <Calendar className="w-3 h-3" />
                <span>ثبت‌شده در: {annotation.createdAt}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="px-5 py-3.5 bg-neutral-50 border-t border-neutral-150 flex items-center justify-between">
              <button
                type="button"
                onClick={() => {
                  onDelete(annotation.id);
                  onClose();
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-neutral-600 hover:text-black hover:bg-neutral-200 rounded transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>حذف هایلایت</span>
              </button>

              <DialogPrimitive.Close asChild>
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-1.5 bg-black text-white hover:bg-neutral-800 text-xs font-semibold rounded-xs transition-colors cursor-pointer"
                >
                  بستن
                </button>
              </DialogPrimitive.Close>
            </div>
          </DialogPrimitive.Content>
        </DialogPrimitive.Overlay>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
};
