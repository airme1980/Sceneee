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
import type { SceneProgress, SceneRecord } from "@/types";

const RECORDS_STORAGE_KEY = "word-scene-trainer:recent-scenes";
const PROGRESS_STORAGE_KEY = "word-scene-trainer:scene-progress";

export function AppShell() {
  const [wordInput, setWordInput] = useState(DEFAULT_WORDS.join("\n"));
  const [goal, setGoal] = useState("工作英语");
  const [difficulty, setDifficulty] = useState("普通");
  const [storedRecords, setStoredRecords] = useState<SceneRecord[]>([]);
  const [progressByRecord, setProgressByRecord] = useState<Record<string, SceneProgress>>({});
  const [storageReady, setStorageReady] = useState(false);
  const [activeRecord, setActiveRecord] = useState<SceneRecord>(DEFAULT_SCENE_RECORD);
  const [sceneResetKey, setSceneResetKey] = useState(0);

  useEffect(() => {
    try {
      const rawRecords = window.localStorage.getItem(RECORDS_STORAGE_KEY);
      if (rawRecords) {
        const parsedRecords = JSON.parse(rawRecords) as SceneRecord[];
        if (Array.isArray(parsedRecords)) {
          setStoredRecords(parsedRecords.filter((record) => record?.id && Array.isArray(record.words)));
        }
      }

      const rawProgress = window.localStorage.getItem(PROGRESS_STORAGE_KEY);
      if (rawProgress) {
        const parsedProgress = JSON.parse(rawProgress) as Record<string, SceneProgress>;
        if (parsedProgress && typeof parsedProgress === "object") {
          setProgressByRecord(parsedProgress);
        }
      }
    } catch {
      setStoredRecords([]);
      setProgressByRecord({});
    } finally {
      setStorageReady(true);
    }
  }, []);

  useEffect(() => {
    if (!storageReady) {
      return;
    }

    window.localStorage.setItem(RECORDS_STORAGE_KEY, JSON.stringify(storedRecords.slice(0, 6)));
  }, [storageReady, storedRecords]);

  useEffect(() => {
    if (!storageReady) {
      return;
    }

    window.localStorage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify(progressByRecord));
  }, [storageReady, progressByRecord]);

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
            progressByRecord={progressByRecord}
            records={historyRecords}
            onSelectRecord={handleSelectRecord}
          />
        </aside>

        <PixelGameScene
          initialProgress={progressByRecord[activeRecord.id]}
          onProgressChange={(progress) =>
            setProgressByRecord((current) => ({
              ...current,
              [activeRecord.id]: progress,
            }))
          }
          record={activeRecord}
          resetKey={sceneResetKey}
        />
      </div>
    </main>
  );
}
