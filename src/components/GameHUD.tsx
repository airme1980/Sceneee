"use client";

import { TaskPanel } from "@/components/TaskPanel";
import { WordChecklist } from "@/components/WordChecklist";
import type { TaskItem, WordItem } from "@/types";

type GameHUDProps = {
  words: WordItem[];
  tasks: TaskItem[];
  quizAttempts: number;
  quizAvailable: boolean;
  quizBestScore: number;
  quizOpen: boolean;
  quizTotal: number;
  onStartQuiz: () => void;
};

export function GameHUD({
  onStartQuiz,
  quizAttempts,
  quizAvailable,
  quizBestScore,
  quizOpen,
  quizTotal,
  tasks,
  words,
}: GameHUDProps) {
  return (
    <aside className="grid content-start gap-4">
      <WordChecklist words={words} />
      <TaskPanel tasks={tasks} />

      {quizAvailable ? (
        <div className="space-y-3">
          <button
            type="button"
            onClick={onStartQuiz}
            disabled={quizOpen}
            className="pixel-button w-full bg-yellow-300 px-4 py-3 font-pixel text-sm font-bold text-slate-950 disabled:cursor-not-allowed disabled:opacity-60"
          >
            开始拼写练习
          </button>
          <div className="pixel-panel bg-slate-800 p-3 font-pixel text-xs leading-5 text-slate-300">
            Best score: {quizBestScore}/{quizTotal}
            <br />
            Attempts: {quizAttempts}
          </div>
        </div>
      ) : (
        <div className="pixel-panel bg-slate-800 p-3 font-pixel text-xs leading-5 text-slate-300">
          Complete 3 tasks to unlock spelling practice.
        </div>
      )}
    </aside>
  );
}
