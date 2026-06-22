"use client";

import { getSceneSpec } from "@/lib/scenes/officeMeeting";
import { formatRecordDate } from "@/lib/mockScene";
import type { SceneProgress, SceneRecord } from "@/types";

type HistoryListProps = {
  records: SceneRecord[];
  activeRecordId: string;
  progressByRecord: Record<string, SceneProgress>;
  onSelectRecord: (record: SceneRecord) => void;
};

export function HistoryList({
  activeRecordId,
  onSelectRecord,
  progressByRecord,
  records,
}: HistoryListProps) {
  return (
    <section className="mt-7 border-t border-slate-100 pt-6">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-bold text-slate-900">最近记录</h2>
        <span className="text-xs text-slate-400">{records.length} scenes</span>
      </div>

      <div className="space-y-2">
        {records.map((record) => (
          <HistoryButton
            active={activeRecordId === record.id}
            key={record.id}
            progress={progressByRecord[record.id]}
            record={record}
            onSelect={() => onSelectRecord(record)}
          />
        ))}
      </div>
    </section>
  );
}

type HistoryButtonProps = {
  active: boolean;
  progress?: SceneProgress;
  record: SceneRecord;
  onSelect: () => void;
};

function HistoryButton({ active, onSelect, progress, record }: HistoryButtonProps) {
  const scene = getSceneSpec(record.sceneId);
  const seenCount = progress
    ? new Set([...progress.seenWords, ...progress.masteredWords]).size
    : 0;
  const taskCount = progress ? progress.completedTasks.length : 0;

  return (
    <button
      type="button"
      onClick={onSelect}
      className={`w-full rounded-2xl border p-3 text-left transition ${
        active
          ? "border-blue-300 bg-blue-50"
          : "border-slate-100 bg-white hover:border-blue-200 hover:bg-slate-50"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-semibold text-slate-900">{record.title}</p>
          <p className="mt-1 text-xs text-slate-500">
            {record.goal} · {record.difficulty} · {record.words.length} words
          </p>
        </div>
        <span className="shrink-0 rounded-full bg-white px-2 py-1 text-[11px] text-slate-400">
          {formatRecordDate(record.createdAt)}
        </span>
      </div>

      <div className="mt-3 grid grid-cols-3 gap-2 text-[11px] font-semibold">
        <span className="rounded-full bg-slate-100 px-2 py-1 text-slate-500">
          {seenCount}/{scene.words.length} words
        </span>
        <span className="rounded-full bg-slate-100 px-2 py-1 text-slate-500">
          {taskCount}/{scene.tasks.length} tasks
        </span>
        <span className="rounded-full bg-slate-100 px-2 py-1 text-slate-500">
          Best {progress?.quizBestScore ?? 0}/{scene.quiz.length}
        </span>
      </div>
    </button>
  );
}
