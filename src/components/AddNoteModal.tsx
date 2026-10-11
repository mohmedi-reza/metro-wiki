import React, { useState } from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { Highlighter, X, Check, Trash2, StickyNote, Calendar } from "lucide-react";
import { cn } from "../lib/utils";

interface AddNoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedText: string;
  onSave: (note: string) => void;
}

export const AddNoteModal: React.FC<AddNoteModalProps> = ({
  isOpen,
  onClose,
  selectedText,
  onSave,
}) => {
  const [note, setNote] = useState("");

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(note.trim());
    setNote("");
    onClose();
  };

  return (
    <DialogPrimitive.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
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
                <span>افزودن هایلایت و یادداشت شخصی</span>
              </div>
              <DialogPrimitive.Close asChild>
                <button
                  type="button"
                  onClick={onClose}
                  className="p-1 text-neutral-400 hover:text-black transition-colors rounded-sm cursor-pointer"
                  aria-label="بستن"
                >
                  <X className="w-4 h-4" />
                </button>
              </DialogPrimitive.Close>
            </div>

            {/* Content Form */}
            <form onSubmit={handleSave} className="p-5 space-y-4">
              {/* Highlighted text preview */}
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-neutral-500 uppercase">
                  متن انتخاب‌شده برای هایلایت:
                </label>
                <div className="p-3 bg-neutral-100 border-r-2 border-black rounded-xs text-xs text-black font-medium leading-relaxed max-h-24 overflow-y-auto italic">
                  «{selectedText}»
                </div>
              </div>

              {/* Note input */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-black flex items-center gap-1.5">
                  <StickyNote className="w-3.5 h-3.5 text-neutral-500" />
                  <span>یادداشت شخصی شما (اختیاری):</span>
                </label>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="نکته، جمع‌بندی یا تحلیل خود درباره این بخش را بنویسید..."
                  rows={3}
                  className={cn(
                    "w-full p-2.5 text-xs text-black bg-white border border-neutral-300 rounded-md",
                    "focus:border-black focus:outline-none placeholder:text-neutral-400 leading-relaxed resize-none"
                  )}
                />
              </div>

              {/* Actions */}
              <div className="pt-2 border-t border-neutral-150 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-3 py-1.5 text-xs text-neutral-600 hover:text-black transition-colors cursor-pointer"
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  className={cn(
                    "flex items-center gap-1.5 px-4 py-2 bg-black text-white hover:bg-neutral-800",
                    "text-xs font-semibold rounded-xs transition-colors cursor-pointer"
                  )}
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>ذخیره هایلایت</span>
                </button>
              </div>
            </form>
          </DialogPrimitive.Content>
        </DialogPrimitive.Overlay>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
};
