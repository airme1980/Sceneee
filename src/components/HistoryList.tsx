"use client";

import { formatRecordDate } from "@/lib/mockScene";
import type { SceneRecord } from "@/types";

type HistoryListProps = {
  records: SceneRecord[];
  activeRecordId: string;
  onSelectRecord: (record: SceneRecord) => void;
};

export function HistoryList({ activeRecordId, onSelectRecord, records }: HistoryListProps) {
  return (
    <section className="mt-7 border-t border-slate-100 pt-6">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-bold text-slate-900">最近记录</h2>
        <span className="text-xs text-slate-400">{records.length} scenes</span>
      </div>

      <div className="space-y-2">
        {records.map((record) => (
          <button
            type="button"
            key={record.id}
            onClick={() => onSelectRecord(record)}
            className={`w-full rounded-2xl border p-3 text-left transition ${
              activeRecordId === record.id
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
          </button>
        ))}
      </div>
    </section>
  );
}
