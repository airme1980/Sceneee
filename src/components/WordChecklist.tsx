import type { WordItem } from "@/types";

type WordChecklistProps = {
  words: WordItem[];
};

export function WordChecklist({ words }: WordChecklistProps) {
  return (
    <section className="pixel-panel bg-slate-900 p-3 text-white">
      <div className="mb-3 flex items-center justify-between border-b-2 border-slate-700 pb-2 font-pixel text-xs font-bold">
        <span>WORDS ({words.filter((word) => word.learned).length}/{words.length})</span>
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
              <span className={word.learned ? "text-white" : "text-slate-400"}>{word.text}</span>
            </span>
            <span
              className={`grid h-5 w-5 place-items-center rounded-full border-2 text-[10px] ${
                word.learned
                  ? "border-emerald-300 bg-emerald-500 text-slate-950"
                  : "border-slate-500 bg-slate-700 text-slate-500"
              }`}
            >
              {word.learned ? "✓" : ""}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
