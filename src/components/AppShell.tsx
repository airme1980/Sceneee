"use client";

import { useEffect, useMemo, useState } from "react";
import { HistoryList } from "@/components/HistoryList";
import { PixelGameScene } from "@/components/PixelGameScene";
import { WordInputPanel } from "@/components/WordInputPanel";
import {
  DEFAULT_SCENE_RECORD,
  DEFAULT_WORDS,
  MOCK_HISTORY,
  createSceneRecord,
  parseWords,
} from "@/lib/mockScene";
import type { SceneRecord } from "@/types";

const STORAGE_KEY = "word-scene-trainer:recent-scenes";

export function AppShell() {
  const [wordInput, setWordInput] = useState(DEFAULT_WORDS.join("\n"));
  const [goal, setGoal] = useState("工作英语");
  const [difficulty, setDifficulty] = useState("普通");
  const [storedRecords, setStoredRecords] = useState<SceneRecord[]>([]);
  const [storageReady, setStorageReady] = useState(false);
  const [activeRecord, setActiveRecord] = useState<SceneRecord>(DEFAULT_SCENE_RECORD);
  const [sceneResetKey, setSceneResetKey] = useState(0);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as SceneRecord[];
        if (Array.isArray(parsed)) {
          setStoredRecords(parsed.filter((record) => record?.id && Array.isArray(record.words)));
        }
      }
    } catch {
      setStoredRecords([]);
    } finally {
      setStorageReady(true);
    }
  }, []);

  useEffect(() => {
    if (!storageReady) {
      return;
    }

    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(storedRecords.slice(0, 6)));
  }, [storageReady, storedRecords]);

  const historyRecords = useMemo(() => {
    const userIds = new Set(storedRecords.map((record) => record.id));
    return [...storedRecords, ...MOCK_HISTORY.filter((record) => !userIds.has(record.id))].slice(0, 8);
  }, [storedRecords]);

  function handleGenerateScene() {
    const words = parseWords(wordInput);
    const record = createSceneRecord(words, goal, difficulty);

    setStoredRecords((records) => [
      record,
      ...records.filter((item) => item.id !== record.id),
    ].slice(0, 6));
    setActiveRecord(record);
    setSceneResetKey((key) => key + 1);
  }

  function handleSelectRecord(record: SceneRecord) {
    setActiveRecord(record);
    setWordInput(record.words.join("\n"));
    setGoal(record.goal);
    setDifficulty(record.difficulty);
    setSceneResetKey((key) => key + 1);
  }

  return (
    <main className="min-h-screen px-4 py-5 sm:px-6 lg:px-5">
      <div className="mx-auto grid min-h-[calc(100vh-2.5rem)] max-w-[1520px] gap-5 lg:grid-cols-[310px_minmax(0,1fr)]">
        <aside className="rounded-[22px] border border-blue-100 bg-white/95 p-5 shadow-soft backdrop-blur">
          <WordInputPanel
            difficulty={difficulty}
            goal={goal}
            onDifficultyChange={setDifficulty}
            onGenerate={handleGenerateScene}
            onGoalChange={setGoal}
            onWordInputChange={setWordInput}
            wordInput={wordInput}
          />
          <HistoryList
            activeRecordId={activeRecord.id}
            records={historyRecords}
            onSelectRecord={handleSelectRecord}
          />
        </aside>

        <PixelGameScene
          record={activeRecord}
          resetKey={sceneResetKey}
        />
      </div>
    </main>
  );
}
