import type { DialogueState } from "@/types";

type DialogueBoxProps = {
  dialogue: DialogueState;
};

export function DialogueBox({ dialogue }: DialogueBoxProps) {
  const speakerIsHighlighted = dialogue.highlights.includes(dialogue.speaker.toLowerCase());

  return (
    <div className="pixel-panel absolute inset-x-4 bottom-4 z-30 bg-slate-950 p-4 font-pixel text-white">
      <div className="mb-2 flex items-center gap-2">
        <span className="h-3 w-3 bg-blue-400" />
        <span className={speakerIsHighlighted ? "bg-yellow-300 px-1.5 py-0.5 text-slate-950" : "text-blue-200"}>
          {dialogue.speaker}
        </span>
      </div>
      <p className="min-h-12 text-sm leading-7 text-slate-100">
        {highlightText(dialogue.text, dialogue.highlights)}
      </p>
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
        className="rounded-sm bg-yellow-300 px-1.5 py-0.5 font-bold text-slate-950"
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
