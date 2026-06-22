"use client";

import { DIFFICULTY_OPTIONS, GOAL_OPTIONS } from "@/lib/mockScene";

type WordInputPanelProps = {
  wordInput: string;
  goal: string;
  difficulty: string;
  onWordInputChange: (value: string) => void;
  onGoalChange: (value: string) => void;
  onDifficultyChange: (value: string) => void;
  onGenerate: () => void;
};

export function WordInputPanel({
  difficulty,
  goal,
  onDifficultyChange,
  onGenerate,
  onGoalChange,
  onWordInputChange,
  wordInput,
}: WordInputPanelProps) {
  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <div className="inline-flex rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
          MVP Demo
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-normal text-slate-950">Word Scene Trainer</h1>
          <p className="mt-2 text-sm text-slate-500">输入单词 → 生成场景 → 游戏练习</p>
        </div>
      </header>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-sm font-semibold text-slate-800" htmlFor="word-input">
            单词输入
          </label>
          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs text-slate-500">一行一个</span>
        </div>
        <textarea
          id="word-input"
          value={wordInput}
          onChange={(event) => onWordInputChange(event.target.value)}
          className="min-h-52 w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 p-4 font-mono text-sm leading-7 text-slate-900 outline-none transition focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-100"
          spellCheck={false}
        />
      </section>

      <SegmentedControl
        label="学习目标"
        options={GOAL_OPTIONS}
        value={goal}
        onChange={onGoalChange}
      />

      <SegmentedControl
        label="难度选择"
        options={DIFFICULTY_OPTIONS}
        value={difficulty}
        onChange={onDifficultyChange}
      />

      <button
        type="button"
        onClick={onGenerate}
        className="w-full rounded-2xl bg-blue-600 px-5 py-4 text-sm font-bold text-white shadow-lg shadow-blue-600/25 transition hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-200"
      >
        生成单词场景
      </button>
    </div>
  );
}

type SegmentedControlProps = {
  label: string;
  options: string[];
  value: string;
  onChange: (value: string) => void;
};

function SegmentedControl({ label, onChange, options, value }: SegmentedControlProps) {
  return (
    <section className="space-y-3">
      <h2 className="text-sm font-semibold text-slate-800">{label}</h2>
      <div className="grid grid-cols-3 gap-2 rounded-2xl bg-slate-100 p-1.5">
        {options.map((option) => (
          <button
            type="button"
            key={option}
            onClick={() => onChange(option)}
            className={`rounded-xl px-3 py-2.5 text-sm font-semibold transition ${
              option === value
                ? "bg-white text-blue-700 shadow-sm"
                : "text-slate-500 hover:bg-white/70 hover:text-slate-800"
            }`}
          >
            {option}
          </button>
        ))}
      </div>
    </section>
  );
}
