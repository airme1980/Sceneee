import { OFFICE_MEETING_SCENE } from "@/lib/scenes/officeMeeting";
import type { SceneRecord } from "@/types";

export const DEFAULT_WORDS = OFFICE_MEETING_SCENE.words;

export const GOAL_OPTIONS = ["工作英语", "日常口语", "TOEIC"];

export const DIFFICULTY_OPTIONS = ["简单", "普通", "稍难"];

export const MOCK_HISTORY: SceneRecord[] = [
  {
    id: "mock-project-meeting-delay",
    title: "Project Meeting Delay",
    words: DEFAULT_WORDS,
    goal: "工作英语",
    difficulty: "普通",
    createdAt: "2026-06-20T09:00:00.000Z",
    sceneId: OFFICE_MEETING_SCENE.id,
  },
  {
    id: "mock-airport-check-in",
    title: "Airport Check-in",
    words: ["confirm", "delay", "available", "schedule", "client", "urgent", "arrange"],
    goal: "日常口语",
    difficulty: "简单",
    createdAt: "2026-06-18T11:30:00.000Z",
    sceneId: OFFICE_MEETING_SCENE.id,
  },
];

export const DEFAULT_SCENE_RECORD: SceneRecord = {
  id: "default-office-meeting",
  title: OFFICE_MEETING_SCENE.title,
  words: DEFAULT_WORDS,
  goal: "工作英语",
  difficulty: "普通",
  createdAt: new Date("2026-06-22T00:00:00.000Z").toISOString(),
  sceneId: OFFICE_MEETING_SCENE.id,
};

export function parseWords(input: string): string[] {
  const words = input
    .split(/\n|,|;/)
    .map((word) => word.trim().toLowerCase())
    .filter(Boolean);

  return Array.from(new Set(words));
}

export function createSceneRecord(words: string[], goal: string, difficulty: string): SceneRecord {
  const safeWords = words.length > 0 ? words : DEFAULT_WORDS;
  const title = safeWords.includes("delay")
    ? "Project Meeting Delay"
    : `${toTitleCase(safeWords.slice(0, 3).join(" "))} Scene`;

  return {
    id: `scene-${Date.now()}`,
    title,
    words: safeWords,
    goal,
    difficulty,
    createdAt: new Date().toISOString(),
    sceneId: OFFICE_MEETING_SCENE.id,
  };
}

export function formatRecordDate(value: string): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "recent";
  }

  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function toTitleCase(value: string): string {
  if (!value) {
    return "Office";
  }

  return value
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}
