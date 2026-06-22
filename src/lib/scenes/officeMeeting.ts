import type { SceneSpec } from "@/types";

export const OFFICE_MEETING_SCENE: SceneSpec = {
  id: "office-meeting",
  title: "Project Meeting Delay",
  setting: "办公室会议室",
  hudLabel: "OFFICE QUEST",
  words: [
    "confirm",
    "delay",
    "arrange",
    "urgent",
    "available",
    "schedule",
    "client",
  ],
  wordIcons: {
    confirm: "✓",
    delay: "!",
    arrange: "▣",
    urgent: "▲",
    available: "●",
    schedule: "□",
    client: "◆",
  },
  tasks: [
    { id: "manager", label: "Talk to manager" },
    { id: "coworker", label: "Check who is available" },
    { id: "confirmSchedule", label: "Confirm the schedule" },
    { id: "client", label: "Talk to client" },
  ],
  autoCompleteTasks: [
    {
      id: "confirmSchedule",
      requiresWords: ["confirm", "schedule"],
    },
  ],
  interactions: {
    manager: {
      id: "manager",
      kind: "npc",
      speaker: "Manager",
      text: "Please arrange another meeting and confirm the schedule.",
      highlights: ["arrange", "confirm", "schedule"],
      words: ["arrange", "confirm", "schedule"],
      position: { x: 50, y: 37 },
      interactAt: { x: 50, y: 51 },
      bubbleAt: { x: 50, y: 25 },
      tasks: ["manager"],
    },
    coworker: {
      id: "coworker",
      kind: "npc",
      speaker: "Coworker",
      text: "I am available this afternoon.",
      highlights: ["available"],
      words: ["available"],
      position: { x: 21, y: 60 },
      interactAt: { x: 31, y: 64 },
      bubbleAt: { x: 26, y: 49 },
      tasks: ["coworker"],
    },
    client: {
      id: "client",
      kind: "npc",
      speaker: "Client",
      text: "Please confirm the new schedule.",
      highlights: ["client", "confirm", "schedule"],
      words: ["client", "confirm", "schedule"],
      position: { x: 79, y: 58 },
      interactAt: { x: 70, y: 63 },
      bubbleAt: { x: 76, y: 47 },
      tasks: ["client"],
    },
    urgentNotice: {
      id: "urgentNotice",
      kind: "object",
      speaker: "Notice",
      text: "This is an urgent notice from the client.",
      highlights: ["urgent"],
      words: ["urgent"],
      position: { x: 52, y: 13 },
      interactAt: { x: 52, y: 27 },
      bubbleAt: { x: 52, y: 5 },
    },
    delayWhiteboard: {
      id: "delayWhiteboard",
      kind: "object",
      speaker: "Whiteboard",
      text: "The project may be delayed because of a vendor response.",
      highlights: ["delay"],
      words: ["delay"],
      position: { x: 30, y: 24 },
      interactAt: { x: 38, y: 35 },
      bubbleAt: { x: 30, y: 12 },
    },
    scheduleCalendar: {
      id: "scheduleCalendar",
      kind: "object",
      speaker: "Calendar",
      text: "The schedule has changed.",
      highlights: ["schedule"],
      words: ["schedule"],
      position: { x: 77, y: 24 },
      interactAt: { x: 66, y: 35 },
      bubbleAt: { x: 77, y: 12 },
    },
  },
  startDialogue: {
    speaker: "Coach",
    text: "Click highlighted NPCs and office objects to learn the meeting words.",
    highlights: [],
  },
  quiz: [
    {
      prompt: "Please a_______ another meeting.",
      answer: "arrange",
    },
    {
      prompt: "Can you c_______ the new schedule?",
      answer: "confirm",
    },
    {
      prompt: "Are you a_______ this afternoon?",
      answer: "available",
    },
    {
      prompt: "This is an u_______ issue.",
      answer: "urgent",
    },
  ],
};

export const SCENE_LIBRARY = {
  [OFFICE_MEETING_SCENE.id]: OFFICE_MEETING_SCENE,
} satisfies Record<string, SceneSpec>;

export function getSceneSpec(sceneId?: string): SceneSpec {
  if (sceneId && sceneId in SCENE_LIBRARY) {
    return SCENE_LIBRARY[sceneId];
  }

  return OFFICE_MEETING_SCENE;
}
