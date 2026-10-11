import React, { useState, useMemo, ReactNode } from "react";
import { Search, Copy, Check, Filter, Maximize2, Minimize2, ListFilter, ArrowUpDown } from "lucide-react";
import { cn } from "../lib/utils";

interface ModernTableProps {
  headerCells: string[];
  alignments: ("right" | "center" | "left")[];
  bodyRows: string[][];
  renderInline: (text: string, keyPrefix: string) => ReactNode[];
  tableId: string;
}

export const ModernTable: React.FC<ModernTableProps> = ({
  headerCells,
  alignments,
  bodyRows,
  renderInline,
  tableId,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [copied, setCopied] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [density, setDensity] = useState<"compact" | "normal">("compact");
  const [sortColIndex, setSortColIndex] = useState<number | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  // Determine if this is a technical heavy/long dataset (like stations or frequencies)
  const isLongDataset = bodyRows.length >= 8;
  const isWideDataset = headerCells.length >= 5;

  // Sorting handler
  const handleSort = (colIdx: number) => {
    if (sortColIndex === colIdx) {
      if (sortDirection === "asc") {
        setSortDirection("desc");
      } else {
        setSortColIndex(null);
        setSortDirection("asc");
      }
    } else {
      setSortColIndex(colIdx);
      setSortDirection("asc");
    }
  };

  // Filter rows by search term if search query is entered
  const filteredAndSortedRows = useMemo(() => {
    let result = bodyRows;
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      result = result.filter((row) =>
        row.some((cell) => cell.toLowerCase().includes(query))
      );
    }

    if (sortColIndex !== null) {
      result = [...result].sort((a, b) => {
        const valA = a[sortColIndex] || "";
        const valB = b[sortColIndex] || "";
        // Try numerical comparison first
        const numA = parseFloat(valA.replace(/[^0-9.-]+/g, ""));
        const numB = parseFloat(valB.replace(/[^0-9.-]+/g, ""));
        if (!isNaN(numA) && !isNaN(numB)) {
          return sortDirection === "asc" ? numA - numB : numB - numA;
        }
        return sortDirection === "asc"
          ? valA.localeCompare(valB, "fa")
          : valB.localeCompare(valA, "fa");
      });
    }

    return result;
  }, [bodyRows, searchQuery, sortColIndex, sortDirection]);

  // Copy table as TSV (Tab Separated Values) or Markdown for pasting in Excel / Word
  const handleCopyTable = () => {
    try {
      const headerLine = headerCells.join("\t");
      const bodyLines = bodyRows.map((r) => r.join("\t")).join("\n");
      const tsvData = `${headerLine}\n${bodyLines}`;
      navigator.clipboard.writeText(tsvData);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  return (
    <div
      className={cn(
        "my-6 overflow-hidden rounded-xl border border-neutral-200/90 bg-white shadow-xs transition-all",
        isExpanded && "ring-2 ring-black/10 shadow-md"
      )}
    >
      {/* Table Utility Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 px-3.5 py-2 bg-neutral-50/90 border-b border-neutral-200/80 text-xs">
        {/* Left: Row Count & Badge */}
        <div className="flex items-center gap-2 text-neutral-600 font-medium">
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-neutral-200/70 text-neutral-800 text-[11px] font-mono font-semibold">
            <Filter className="w-3 h-3 text-neutral-500" />
            {filteredAndSortedRows.length === bodyRows.length ? (
              `${bodyRows.length} سطر`
            ) : (
              `${filteredAndSortedRows.length} از ${bodyRows.length} سطر`
            )}
          </span>
          <span className="hidden sm:inline text-neutral-300">|</span>
          <span className="hidden sm:inline text-[11px] text-neutral-500">
            {headerCells.length} ستون
          </span>
          {sortColIndex !== null && (
            <span className="inline-flex items-center gap-1 text-[10px] text-neutral-600 bg-neutral-200/60 px-1.5 py-0.5 rounded">
              مرتب بر اساس: {headerCells[sortColIndex]} ({sortDirection === "asc" ? "صعودی" : "نزولی"})
              <button
                type="button"
                onClick={() => setSortColIndex(null)}
                className="hover:text-black font-bold mr-1"
                title="حذف مرتب‌سازی"
              >
                ✕
              </button>
            </span>
          )}
        </div>

        {/* Right: Search filter & Actions */}
        <div className="flex items-center gap-1.5 flex-1 sm:flex-initial justify-end">
          {/* Quick Search */}
          {bodyRows.length > 2 && (
            <div className="relative flex-1 sm:w-44">
              <Search className="w-3.5 h-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="فیلتر آنی داده‌ها..."
                className="w-full pl-2 pr-7 py-1 text-xs rounded-lg border border-neutral-200 bg-white focus:outline-none focus:ring-1 focus:ring-black placeholder:text-neutral-400 text-neutral-800"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute left-2 top-1/2 -translate-y-1/2 text-[10px] text-neutral-400 hover:text-neutral-700"
                >
                  ✕
                </button>
              )}
            </div>
          )}

          {/* Density Toggle */}
          <button
            type="button"
            onClick={() => setDensity(density === "compact" ? "normal" : "compact")}
            title={density === "compact" ? "نمایش خوانای بازتر" : "نمایش فشرده مهندسی"}
            className="p-1 rounded-lg border border-neutral-200 bg-white hover:bg-neutral-100 text-neutral-600 transition-colors shrink-0"
          >
            <ListFilter className="w-3.5 h-3.5" />
          </button>

          {/* Copy Table Button */}
          <button
            type="button"
            onClick={handleCopyTable}
            title="کپی داده‌های جدول برای اکسل یا ورد"
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-neutral-200 bg-white hover:bg-neutral-100 text-neutral-700 transition-colors text-[11px] font-medium shrink-0"
          >
            {copied ? (
              <>
                <Check className="w-3 h-3 text-emerald-600" />
                <span className="text-emerald-700 font-semibold">کپی شد</span>
              </>
            ) : (
              <>
                <Copy className="w-3 h-3 text-neutral-500" />
                <span>کپی</span>
              </>
            )}
          </button>

          {/* Expand/Collapse Max Height */}
          {isLongDataset && (
            <button
              type="button"
              onClick={() => setIsExpanded((prev) => !prev)}
              title={isExpanded ? "نمایش اسکرولی" : "نمایش تمام‌صفحه"}
              className="p-1 rounded-lg border border-neutral-200 bg-white hover:bg-neutral-100 text-neutral-600 transition-colors shrink-0"
            >
              {isExpanded ? (
                <Minimize2 className="w-3.5 h-3.5" />
              ) : (
                <Maximize2 className="w-3.5 h-3.5" />
              )}
            </button>
          )}
        </div>
      </div>

      {/* Table Content Container */}
      <div
        className={cn(
          "overflow-x-auto overflow-y-auto transition-[max-height] duration-200",
          !isExpanded && isLongDataset ? "max-h-[520px]" : "max-h-none"
        )}
      >
        <table
          className={cn(
            "w-full text-right border-collapse",
            density === "compact" ? "text-[12px] md:text-[13px]" : "text-xs md:text-sm",
            isWideDataset ? "min-w-[620px]" : "min-w-[480px]"
          )}
        >
          <thead className="bg-neutral-100/95 text-neutral-900 border-b border-neutral-200 sticky top-0 z-10 backdrop-blur-xs select-none">
            <tr>
              <th className="py-2.5 px-2.5 w-10 text-center font-bold text-neutral-500 text-[11px] border-e border-neutral-200/80 bg-neutral-100/95 select-none">
                #
              </th>
              {headerCells.map((hCell, hIdx) => {
                const align = alignments[hIdx] || "right";
                const isSorted = sortColIndex === hIdx;
                return (
                  <th
                    key={hIdx}
                    onClick={() => handleSort(hIdx)}
                    className={cn(
                      "py-2.5 px-3 md:px-3.5 font-bold text-neutral-900 border-e border-neutral-200/80 last:border-e-0 whitespace-nowrap cursor-pointer hover:bg-neutral-200/70 transition-colors group",
                      align === "center" && "text-center",
                      align === "left" && "text-left",
                      align === "right" && "text-right"
                    )}
                  >
                    <div className={cn("inline-flex items-center gap-1", align === "center" && "justify-center")}>
                      <span>{renderInline(hCell, `th-${tableId}-${hIdx}`)}</span>
                      <ArrowUpDown className={cn("w-3 h-3 text-neutral-400 group-hover:text-black transition-colors shrink-0", isSorted && "text-black font-bold")} />
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100/90 font-normal">
            {filteredAndSortedRows.length === 0 ? (
              <tr>
                <td
                  colSpan={headerCells.length + 1}
                  className="py-10 text-center text-neutral-400 text-xs italic bg-neutral-50/30"
                >
                  هیچ موردی با عبارت «{searchQuery}» پیدا نشد.
                </td>
              </tr>
            ) : (
              filteredAndSortedRows.map((row, rIdx) => (
                <tr
                  key={rIdx}
                  className="hover:bg-neutral-100/80 transition-colors odd:bg-white even:bg-neutral-50/40"
                >
                  <td className="py-2 px-2 text-center text-[10px] font-mono text-neutral-400 border-e border-neutral-100 select-none bg-neutral-50/20">
                    {rIdx + 1}
                  </td>
                  {row.map((cell, cIdx) => {
                    const align = alignments[cIdx] || "right";
                    return (
                      <td
                        key={cIdx}
                        className={cn(
                          "text-neutral-800 border-e border-neutral-100 last:border-e-0 leading-relaxed align-middle",
                          density === "compact" ? "py-2 px-3 md:px-3.5" : "py-3 px-3.5 md:px-4",
                          align === "center" && "text-center font-mono",
                          align === "left" && "text-left font-mono",
                          align === "right" && "text-right"
                        )}
                      >
                        {renderInline(cell, `td-${tableId}-${rIdx}-${cIdx}`)}
                      </td>
                    );
                  })}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Footer hint if table has many rows and collapsed */}
      {!isExpanded && isLongDataset && (
        <div className="py-1.5 px-4 bg-neutral-50/80 border-t border-neutral-200/70 text-center text-[11px] text-neutral-500 flex items-center justify-between gap-2">
          <span>نمایش اسکرولی بهینه ({bodyRows.length} سطر فنی)</span>
          <button
            type="button"
            onClick={() => setIsExpanded(true)}
            className="text-black font-semibold hover:underline cursor-pointer"
          >
            گسترش و نمایش تمام‌صفحه ⤢
          </button>
        </div>
      )}
    </div>
  );
};
