import type { DialogueState, MapPosition } from "@/types";

type SpeechBubbleProps = {
  dialogue: DialogueState;
  position: MapPosition;
};

export function SpeechBubble({ dialogue, position }: SpeechBubbleProps) {
  const placement = position.y < 18 ? "below" : "above";

  return (
    <div
      className={`pointer-events-none absolute z-40 max-w-[240px] -translate-x-1/2 border-4 border-slate-950 bg-white px-3 py-2 font-pixel text-[11px] font-bold leading-5 text-slate-950 shadow-[0_4px_0_#111827] ${
        placement === "above" ? "-translate-y-full" : "translate-y-3"
      }`}
      style={{
        left: `${position.x}%`,
        top: `${position.y}%`,
      }}
    >
      <div className="mb-1 text-[10px] text-blue-700">{dialogue.speaker}</div>
      <div>{highlightText(dialogue.text, dialogue.highlights)}</div>
      <span
        className={`absolute left-1/2 h-4 w-4 -translate-x-1/2 rotate-45 border-slate-950 bg-white ${
          placement === "above"
            ? "-bottom-3 border-b-4 border-r-4"
            : "-top-3 border-l-4 border-t-4"
        }`}
      />
    </div>
  );
}

function highlightText(text: string, highlights: string[]) {
  if (highlights.length === 0) {
    return text;
  }

  const escaped = highlights.map(escapeRegExp).join("|");
  const pattern = new RegExp(`\\b(${escaped})(ed|d|s)?\\b`, "gi");
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;

  for (const match of text.matchAll(pattern)) {
    const index = match.index ?? 0;
    if (index > lastIndex) {
      parts.push(text.slice(lastIndex, index));
    }

    parts.push(
      <mark
        key={`${match[0]}-${index}`}
        className="rounded-sm bg-yellow-300 px-1 text-slate-950"
      >
        {match[0]}
      </mark>,
    );
    lastIndex = index + match[0].length;
  }

  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return parts;
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
