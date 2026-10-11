import React, { ReactNode } from "react";
import { WikiWord } from "./WikiWord";
import { ModernTable } from "./ModernTable";
import { TechnicalFigurePlaceholder } from "./TechnicalFigurePlaceholder";
import { encyclopediaTerms } from "../data/encyclopediaData";
import { ArticleAnnotation } from "../types/annotation";
import { Info, AlertCircle, FileText, CheckCircle2 } from "lucide-react";
import { cn } from "../lib/utils";

interface RichContentRendererProps {
  content: string;
  onSelectTerm?: (term: string) => void;
  onNavigateToArticle?: (articleId: string) => void;
  annotations?: ArticleAnnotation[];
  onSelectAnnotation?: (annotation: ArticleAnnotation) => void;
}

interface InlineToken {
  type: "wikiword_tag" | "bold" | "code";
  start: number;
  end: number;
  term?: string;
  definition?: string;
  text?: string;
}

export const RichContentRenderer: React.FC<RichContentRendererProps> = ({
  content,
  onSelectTerm,
  onNavigateToArticle,
  annotations = [],
  onSelectAnnotation,
}) => {
  // Helper to highlight user notes / annotations within plain text
  const renderTextWithAnnotations = (rawText: string, keyPrefix: string): ReactNode[] => {
    if (!rawText) return [];
    if (!annotations || annotations.length === 0) {
      return [rawText];
    }

    // Find annotations that match inside this text segment
    const activeAnnotations = annotations.filter(
      (a) => a.highlightedText && rawText.includes(a.highlightedText)
    );

    if (activeAnnotations.length === 0) {
      return [rawText];
    }

    // Safety check: if rawText contains <WikiWord, rescue it and parse with renderInline
    if (rawText.includes("<WikiWord")) {
      return renderInline(rawText, `${keyPrefix}-rescue`);
    }

    // Take the first matching annotation and split
    const matchedAnno = activeAnnotations[0];
    const matchIndex = rawText.indexOf(matchedAnno.highlightedText);
    if (matchIndex === -1) return [rawText];

    const before = rawText.substring(0, matchIndex);
    const match = matchedAnno.highlightedText;
    const after = rawText.substring(matchIndex + match.length);

    return [
      ...renderTextWithAnnotations(before, `${keyPrefix}-b`),
      <mark
        key={`hl-${keyPrefix}-${matchedAnno.id}`}
        onClick={(e) => {
          e.stopPropagation();
          if (onSelectAnnotation) onSelectAnnotation(matchedAnno);
        }}
        title={matchedAnno.note ? `یادداشت: ${matchedAnno.note}` : "متن هایلایت شده (برای مشاهده کلیک کنید)"}
        className="bg-neutral-200/95 text-black px-1 py-0.5 rounded-xs border-b border-black font-medium cursor-pointer hover:bg-neutral-300 transition-colors inline-block selection:bg-black selection:text-white"
      >
        {match}
      </mark>,
      ...renderTextWithAnnotations(after, `${keyPrefix}-a`),
    ];
  };

  // Comprehensive Inline Parser: handles <WikiWord ... />, **bold**, and `code`
  const renderInline = (text: string, keyPrefix: string = "inline"): ReactNode[] => {
    if (!text) return [];

    const tokens: InlineToken[] = [];

    // 1. Match <WikiWord ... /> with flexible attribute order, quotes, and whitespace
    const wikiWordRegex = /<WikiWord\b([^>]*)\/?>/g;
    let match: RegExpExecArray | null;
    while ((match = wikiWordRegex.exec(text)) !== null) {
      const attrs = match[1];
      const termMatch = attrs.match(/term=["']([^"']+)["']/);
      const defMatch = attrs.match(/definition=["']([^"']*)["']/);
      if (termMatch) {
        tokens.push({
          type: "wikiword_tag",
          start: match.index,
          end: wikiWordRegex.lastIndex,
          term: termMatch[1],
          definition: defMatch ? defMatch[1] : undefined,
        });
      }
    }

    // 2. Match **bold**
    const boldRegex = /\*\*([^*]+)\*\*/g;
    while ((match = boldRegex.exec(text)) !== null) {
      tokens.push({
        type: "bold",
        start: match.index,
        end: boldRegex.lastIndex,
        text: match[1],
      });
    }

    // 3. Match `code`
    const codeRegex = /`([^`]+)`/g;
    while ((match = codeRegex.exec(text)) !== null) {
      tokens.push({
        type: "code",
        start: match.index,
        end: codeRegex.lastIndex,
        text: match[1],
      });
    }

    // Sort tokens by start index (wider span first if starts match)
    tokens.sort((a, b) =>
      a.start === b.start ? (b.end - b.start) - (a.end - a.start) : a.start - b.start
    );

    // Filter out overlapping tokens
    const nonOverlapping: InlineToken[] = [];
    let currentEnd = 0;
    for (const token of tokens) {
      if (token.start >= currentEnd) {
        nonOverlapping.push(token);
        currentEnd = token.end;
      }
    }

    const result: ReactNode[] = [];
    let lastIdx = 0;

    nonOverlapping.forEach((tok, i) => {
      // Append text before token
      if (tok.start > lastIdx) {
        const plainText = text.substring(lastIdx, tok.start);
        result.push(...renderTextWithAnnotations(plainText, `${keyPrefix}-txt-${i}`));
      }

      // Render token
      if (tok.type === "wikiword_tag" && tok.term) {
        result.push(
          <WikiWord
            key={`${keyPrefix}-wwtag-${i}-${tok.term}`}
            term={tok.term}
            definition={tok.definition}
            onSelectTerm={onSelectTerm}
            onNavigateToArticle={onNavigateToArticle}
          />
        );
      } else if (tok.type === "bold" && tok.text) {
        const boldText = tok.text;
        // If bold term exists directly in dictionary and doesn't contain tags, make it an interactive WikiWord
        if (!boldText.includes("<WikiWord") && encyclopediaTerms[boldText]) {
          result.push(
            <WikiWord
              key={`${keyPrefix}-wwbold-${i}-${boldText}`}
              term={boldText}
              onSelectTerm={onSelectTerm}
              onNavigateToArticle={onNavigateToArticle}
            />
          );
        } else {
          // Recursively render inline children inside the <strong> tag!
          result.push(
            <strong key={`${keyPrefix}-bold-${i}`} className="font-bold text-neutral-900">
              {renderInline(boldText, `${keyPrefix}-b-${i}`)}
            </strong>
          );
        }
      } else if (tok.type === "code" && tok.text) {
        result.push(
          <code
            key={`${keyPrefix}-code-${i}`}
            className="font-mono text-xs px-1.5 py-0.5 rounded-sm bg-neutral-100 text-neutral-800 border border-neutral-200 dir-ltr inline-block mx-0.5 font-medium"
          >
            {tok.text}
          </code>
        );
      }

      lastIdx = tok.end;
    });

    // Append remaining plain text
    if (lastIdx < text.length) {
      const remaining = text.substring(lastIdx);
      result.push(...renderTextWithAnnotations(remaining, `${keyPrefix}-tail`));
    }

    return result;
  };

  // Block parser: Break content into semantic blocks (tables, headings, notes, lists, paragraphs)
  const renderBlocks = (): ReactNode[] => {
    const rawLines = content.split("\n");
    const blocks: ReactNode[] = [];
    let lineIdx = 0;

    while (lineIdx < rawLines.length) {
      const line = rawLines[lineIdx];
      const trimmed = line.trim();

      // Empty line
      if (trimmed.length === 0) {
        lineIdx++;
        continue;
      }

      // 0. Technical Figure Placeholder tag (<TechnicalFigure ... /> or [تصویر: ...])
      if (
        trimmed.startsWith("<TechnicalFigure") ||
        trimmed.startsWith("![") ||
        /^\[(تصویر|شکل|دیاگرام|نمودار|نقشه|طرح)/i.test(trimmed)
      ) {
        // Tag based: <TechnicalFigure ... />
        if (trimmed.startsWith("<TechnicalFigure")) {
          const titleMatch = trimmed.match(/title=["']([^"']+)["']/);
          const figNoMatch = trimmed.match(/figureNumber=["']([^"']+)["']/);
          const subMatch = trimmed.match(/subtitle=["']([^"']+)["']/);
          const catMatch = trimmed.match(/category=["']([^"']+)["']/);
          const capMatch = trimmed.match(/caption=["']([^"']+)["']/);
          const typeMatch = trimmed.match(/type=["']([^"']+)["']/);
          const stdMatch = trimmed.match(/standard=["']([^"']+)["']/);
          const docMatch = trimmed.match(/docCode=["']([^"']+)["']/);

          blocks.push(
            <TechnicalFigurePlaceholder
              key={`tech-fig-${lineIdx}`}
              figureNumber={figNoMatch ? figNoMatch[1] : undefined}
              title={titleMatch ? titleMatch[1] : "طرح شماتیک مهندسی"}
              subtitle={subMatch ? subMatch[1] : undefined}
              category={catMatch ? catMatch[1] : undefined}
              caption={capMatch ? capMatch[1] : undefined}
              type={(typeMatch ? typeMatch[1] : "generic") as any}
              blueprintSpec={{
                standard: stdMatch ? stdMatch[1] : undefined,
                docCode: docMatch ? docMatch[1] : undefined,
              }}
            />
          );
          lineIdx++;
          continue;
        }

        // Bracket based: [تصویر ۱: دیاگرام بلوکی سیستم | category="معماری" | type="axle_counter"]
        if (trimmed.startsWith("[")) {
          const inner = trimmed.replace(/^\[/, "").replace(/\]$/, "");
          const parts = inner.split("|").map((p) => p.trim());
          const mainPart = parts[0] || "";
          let figNumber = "شکل";
          let figTitle = mainPart;

          if (mainPart.includes(":")) {
            const [num, ...rest] = mainPart.split(":");
            figNumber = num.trim();
            figTitle = rest.join(":").trim();
          }

          let figType: any = "generic";
          let figCat = "طرح شماتیک مهندسی";
          let figCaption = "";
          let figStd = "CENELEC SIL 4";
          let figDoc = "";

          parts.slice(1).forEach((part) => {
            const [k, v] = part.split("=").map((s) => s.trim().replace(/^["']|["']$/g, ""));
            if (k === "type") figType = v;
            if (k === "category") figCat = v;
            if (k === "caption") figCaption = v;
            if (k === "standard") figStd = v;
            if (k === "docCode") figDoc = v;
          });

          blocks.push(
            <TechnicalFigurePlaceholder
              key={`bracket-fig-${lineIdx}`}
              figureNumber={figNumber}
              title={figTitle}
              category={figCat}
              caption={figCaption || undefined}
              type={figType}
              blueprintSpec={{
                standard: figStd,
                docCode: figDoc || undefined,
              }}
            />
          );
          lineIdx++;
          continue;
        }

        // Standard Markdown image: ![Alt Text](url or caption)
        const mdImgMatch = trimmed.match(/^!\[(.*?)\]\((.*?)\)/);
        if (mdImgMatch) {
          const alt = mdImgMatch[1];
          const caption = mdImgMatch[2];
          blocks.push(
            <TechnicalFigurePlaceholder
              key={`md-img-${lineIdx}`}
              figureNumber="تصویر"
              title={alt || "طرح فنی و دیاگرام"}
              caption={caption || alt}
              type="generic"
            />
          );
          lineIdx++;
          continue;
        }
      }

      // 1. Table Detection (Line starts and ends with | or contains multiple |)
      if (trimmed.startsWith("|") && trimmed.includes("|", 1)) {
        const tableLines: string[] = [];
        while (
          lineIdx < rawLines.length &&
          rawLines[lineIdx].trim().startsWith("|")
        ) {
          tableLines.push(rawLines[lineIdx].trim());
          lineIdx++;
        }

        if (tableLines.length >= 2) {
          // Parse Header
          const headerCells = tableLines[0]
            .split("|")
            .map((c) => c.trim())
            .filter((c, idx, arr) => idx > 0 && idx < arr.length - 1);

          // Check if line 1 is separator (e.g. | :--- | :---: | ---: |)
          let hasSeparator = false;
          let alignments: ("right" | "center" | "left")[] = [];

          if (tableLines.length > 1 && tableLines[1].includes("-")) {
            const sepCells = tableLines[1]
              .split("|")
              .map((c) => c.trim())
              .filter((c, idx, arr) => idx > 0 && idx < arr.length - 1);

            hasSeparator = true;
            alignments = sepCells.map((cell) => {
              const startsWithColon = cell.startsWith(":");
              const endsWithColon = cell.endsWith(":");
              if (startsWithColon && endsWithColon) return "center";
              if (endsWithColon) return "left";
              return "right";
            });
          }

          const startRowIdx = hasSeparator ? 2 : 1;
          const bodyRows: string[][] = [];

          for (let r = startRowIdx; r < tableLines.length; r++) {
            const rowCells = tableLines[r]
              .split("|")
              .map((c) => c.trim())
              .filter((c, idx, arr) => idx > 0 && idx < arr.length - 1);
            if (rowCells.length > 0) {
              bodyRows.push(rowCells);
            }
          }

          blocks.push(
            <ModernTable
              key={`table-block-${lineIdx}`}
              tableId={`tbl-${lineIdx}`}
              headerCells={headerCells}
              alignments={alignments}
              bodyRows={bodyRows}
              renderInline={renderInline}
            />
          );
          continue;
        }
      }

      // 2. Headings (### or ####)
      if (trimmed.startsWith("### ")) {
        const headingText = trimmed.replace(/^###\s+/, "");
        blocks.push(
          <h3
            key={`h3-${lineIdx}`}
            className="text-base md:text-lg font-bold text-neutral-900 mt-6 mb-3 flex items-center gap-2.5 border-r-4 border-black pr-3 break-words min-w-0"
          >
            {renderInline(headingText, `h3-${lineIdx}`)}
          </h3>
        );
        lineIdx++;
        continue;
      }

      if (trimmed.startsWith("#### ")) {
        const headingText = trimmed.replace(/^####\s+/, "");
        blocks.push(
          <h4
            key={`h4-${lineIdx}`}
            className="text-sm md:text-base font-bold text-neutral-800 mt-4 mb-2 flex items-center gap-2 border-r-2 border-neutral-400 pr-2 break-words min-w-0"
          >
            {renderInline(headingText, `h4-${lineIdx}`)}
          </h4>
        );
        lineIdx++;
        continue;
      }

      // 3. Callout / Note / Warning box (Starts with > or *(نکته: or نکته:)
      if (
        trimmed.startsWith("> ") ||
        /^\*\(نکته:/i.test(trimmed) ||
        /^\*\(توجه:/i.test(trimmed) ||
        /^\(نکته:/i.test(trimmed) ||
        /^نکته:/i.test(trimmed)
      ) {
        let noteText = trimmed;
        if (noteText.startsWith("> ")) {
          noteText = noteText.replace(/^>\s+/, "");
        } else if (/^\*\((.*?)\)\*/.test(noteText)) {
          noteText = noteText.replace(/^\*\((.*?)\)\*/, "$1");
        } else if (/^\((.*?)\)/.test(noteText)) {
          noteText = noteText.replace(/^\((.*?)\)/, "$1");
        }

        blocks.push(
          <div
            key={`callout-${lineIdx}`}
            className="my-4 p-4 rounded-xl bg-neutral-50 border-r-4 border-black text-neutral-800 text-xs md:text-sm flex items-start gap-3 shadow-xs break-words min-w-0"
          >
            <div className="p-1 rounded-md bg-neutral-200 text-neutral-800 shrink-0 mt-0.5">
              <Info className="w-4 h-4" />
            </div>
            <div className="flex-1 leading-relaxed break-words min-w-0">
              {renderInline(noteText, `callout-${lineIdx}`)}
            </div>
          </div>
        );
        lineIdx++;
        continue;
      }

      // 4. Unordered Lists (- or *)
      if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
        const listItems: string[] = [];
        while (
          lineIdx < rawLines.length &&
          (rawLines[lineIdx].trim().startsWith("- ") ||
            rawLines[lineIdx].trim().startsWith("* "))
        ) {
          listItems.push(rawLines[lineIdx].trim().replace(/^[-*]\s+/, ""));
          lineIdx++;
        }

        blocks.push(
          <ul
            key={`ul-${lineIdx}`}
            className="my-3 space-y-2 pe-1 text-sm md:text-base text-neutral-800 min-w-0"
          >
            {listItems.map((item, itemIdx) => (
              <li key={itemIdx} className="flex items-start gap-2.5 leading-relaxed min-w-0 break-words">
                <span className="w-1.5 h-1.5 rounded-full bg-neutral-800 shrink-0 mt-2.5" />
                <div className="flex-1 text-justify break-words min-w-0 [overflow-wrap:break-word]">
                  {renderInline(item, `ul-${lineIdx}-${itemIdx}`)}
                </div>
              </li>
            ))}
          </ul>
        );
        continue;
      }

      // 5. Ordered Lists (1. or ۱.)
      if (/^(\d+|[۰-۹]+)\./.test(trimmed)) {
        const listItems: string[] = [];
        while (
          lineIdx < rawLines.length &&
          /^(\d+|[۰-۹]+)\./.test(rawLines[lineIdx].trim())
        ) {
          listItems.push(
            rawLines[lineIdx].trim().replace(/^(\d+|[۰-۹]+)\.\s+/, "")
          );
          lineIdx++;
        }

        blocks.push(
          <ol
            key={`ol-${lineIdx}`}
            className="my-3 space-y-2 pe-1 text-sm md:text-base text-neutral-800 min-w-0"
          >
            {listItems.map((item, itemIdx) => (
              <li key={itemIdx} className="flex items-start gap-2.5 leading-relaxed min-w-0 break-words">
                <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-neutral-100 text-neutral-800 text-xs font-bold shrink-0 mt-1">
                  {itemIdx + 1}
                </span>
                <div className="flex-1 text-justify break-words min-w-0 [overflow-wrap:break-word]">
                  {renderInline(item, `ol-${lineIdx}-${itemIdx}`)}
                </div>
              </li>
            ))}
          </ol>
        );
        continue;
      }

      // 6. Regular Paragraph (Collect until empty line or special token)
      const paragraphLines: string[] = [];
      while (
        lineIdx < rawLines.length &&
        rawLines[lineIdx].trim().length > 0 &&
        !rawLines[lineIdx].trim().startsWith("### ") &&
        !rawLines[lineIdx].trim().startsWith("#### ") &&
        !rawLines[lineIdx].trim().startsWith("- ") &&
        !rawLines[lineIdx].trim().startsWith("* ") &&
        !/^(\d+|[۰-۹]+)\./.test(rawLines[lineIdx].trim()) &&
        !rawLines[lineIdx].trim().startsWith("> ") &&
        !rawLines[lineIdx].trim().startsWith("<TechnicalFigure") &&
        !rawLines[lineIdx].trim().startsWith("![") &&
        !/^\[(تصویر|شکل|دیاگرام|نمودار|نقشه|طرح)/i.test(rawLines[lineIdx].trim())
      ) {
        paragraphLines.push(rawLines[lineIdx].trim());
        lineIdx++;
      }

      if (paragraphLines.length > 0) {
        const paragraphText = paragraphLines.join(" ");
        blocks.push(
          <p
            key={`p-${lineIdx}`}
            className="text-sm md:text-base text-neutral-800 leading-relaxed md:leading-loose text-justify font-normal my-2.5 break-words min-w-0 [overflow-wrap:break-word]"
          >
            {renderInline(paragraphText, `p-${lineIdx}`)}
          </p>
        );
      }
    }

    return blocks;
  };

  return (
    <div className="space-y-2 select-text leading-relaxed min-w-0 max-w-full break-words">
      {renderBlocks()}
    </div>
  );
};
