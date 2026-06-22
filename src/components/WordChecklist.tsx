import type { WordItem } from "@/types";

type WordChecklistProps = {
  words: WordItem[];
};

export function WordChecklist({ words }: WordChecklistProps) {
  const activeCount = words.filter((word) => word.status !== "new").length;

  return (
    <section className="pixel-panel bg-slate-900 p-3 text-white">
      <div className="mb-3 flex items-center justify-between border-b-2 border-slate-700 pb-2 font-pixel text-xs font-bold">
        <span>WORDS ({activeCount}/{words.length})</span>
        <span className="text-emerald-300">LEXICON</span>
      </div>

      <ul className="space-y-2">
        {words.map((word) => (
          <li
            key={word.text}
            className="flex items-center justify-between rounded-md border-2 border-slate-700 bg-slate-800 px-2.5 py-2 font-pixel text-xs"
          >
            <span className="flex items-center gap-2">
              <span aria-hidden="true">{word.icon ?? "◆"}</span>
              <span className={word.status === "new" ? "text-slate-400" : "text-white"}>{word.text}</span>
            </span>
            <WordStatusBadge status={word.status} />
          </li>
        ))}
      </ul>
    </section>
  );
}

function WordStatusBadge({ status }: { status: WordItem["status"] }) {
  if (status === "mastered") {
    return (
      <span className="grid h-5 w-5 place-items-center rounded-full border-2 border-emerald-300 bg-emerald-500 text-[10px] text-slate-950">
        ✓
      </span>
    );
  }

  if (status === "seen") {
    return (
      <span className="grid h-5 w-5 place-items-center rounded-full border-2 border-blue-300 bg-blue-500 text-[10px] text-white">
        •
      </span>
    );
  }

  return <span className="grid h-5 w-5 rounded-full border-2 border-slate-500 bg-slate-700" />;
}
