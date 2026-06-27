import { DEFAULT_WORDS } from "@/lib/mockScene";
import type { GridMission, QuizQuestion } from "@/types";

export function generateMockGridMission(words: string[], recordId: string): GridMission {
  const targetWords = normalizeWords(words);
  const quizWords = targetWords.slice(0, 4);

  return {
    id: `grid-${recordId}`,
    title: "AI Draft: Client Meeting Crisis",
    theme: "office",
    mission: "Move around the 20x20 office, talk to people, inspect tools, and confirm the meeting plan.",
    intro: "Mock AI has turned your word list into a tiny office quest. Find the clues, talk to the right people, then unlock the final door.",
    startGoal: "Collect confirm and schedule, then unlock the final door.",
    finalHint: "Return to the Final Door near your start point after you collect confirm and schedule.",
    taskHints: {
      read_notice: "Go to the red notice near the top-left wall.",
      find_delay: "Inspect the whiteboard near the top-right wall.",
      talk_manager: "Find Manager Mia above the meeting table.",
      ask_available: "Talk to Coworker Ken near the lower-left office area.",
      talk_client: "Talk to Client Emma on the right side of the room.",
      check_schedule: "Inspect the calendar beside the whiteboard.",
      final_confirm: "Use the Final Door after confirm and schedule are collected.",
    },
    mapTemplateId: "office_20",
    targetWords,
    playerStart: { x: 10, y: 17 },
    rewardBadge: "Grid Schedule Solver",
    npcs: [
      {
        id: "manager",
        spriteId: "manager_blue",
        name: "Manager Mia",
        role: "project lead",
        position: { x: 9, y: 4 },
        patrol: [
          { x: 9, y: 4 },
          { x: 10, y: 4 },
          { x: 11, y: 4 },
        ],
        dialogue: "Please arrange another meeting and confirm the schedule.",
        words: pickWords(targetWords, ["arrange", "confirm", "schedule"]),
        taskIds: ["talk_manager"],
      },
      {
        id: "coworker",
        spriteId: "coworker_green",
        name: "Coworker Ken",
        role: "helper",
        position: { x: 4, y: 14 },
        patrol: [
          { x: 4, y: 14 },
          { x: 5, y: 14 },
        ],
        dialogue: "I am available this afternoon.",
        words: pickWords(targetWords, ["available"]),
        taskIds: ["ask_available"],
      },
      {
        id: "client",
        spriteId: "client_purple",
        name: "Client Emma",
        role: "guest",
        position: { x: 15, y: 12 },
        patrol: [
          { x: 15, y: 12 },
          { x: 15, y: 13 },
        ],
        dialogue: "Please confirm the new schedule before I leave.",
        words: pickWords(targetWords, ["client", "confirm", "schedule"]),
        taskIds: ["talk_client"],
      },
    ],
    objects: [
      {
        id: "notice",
        spriteId: "urgent_notice",
        label: "Urgent Notice",
        position: { x: 3, y: 3 },
        inspectText: "This is an urgent notice from the client.",
        words: pickWords(targetWords, ["urgent", "client"]),
        taskIds: ["read_notice"],
        blocksMovement: true,
      },
      {
        id: "whiteboard",
        spriteId: "whiteboard",
        label: "Delay Board",
        position: { x: 14, y: 3 },
        inspectText: "The whiteboard says the project has a delay.",
        words: pickWords(targetWords, ["delay"]),
        taskIds: ["find_delay"],
        blocksMovement: true,
      },
      {
        id: "calendar",
        spriteId: "calendar",
        label: "Schedule Calendar",
        position: { x: 16, y: 5 },
        inspectText: "The schedule shows one available time slot.",
        words: pickWords(targetWords, ["schedule", "available"]),
        taskIds: ["check_schedule"],
        blocksMovement: true,
      },
      {
        id: "phone",
        spriteId: "phone",
        label: "Office Phone",
        position: { x: 4, y: 10 },
        inspectText: "A message says: Call the client and confirm the plan.",
        words: pickWords(targetWords, ["client", "confirm"]),
        taskIds: [],
        blocksMovement: true,
      },
      {
        id: "door",
        spriteId: "door",
        label: "Final Door",
        position: { x: 10, y: 18 },
        inspectText: "You use the schedule and confirm the meeting. The door unlocks.",
        words: pickWords(targetWords, ["confirm", "schedule"]),
        taskIds: ["final_confirm"],
        blocksMovement: true,
        requiredWords: pickWords(targetWords, ["confirm", "schedule"]),
        missionClear: true,
      },
      {
        id: "plant",
        spriteId: "plant",
        label: "Plant",
        position: { x: 17, y: 16 },
        inspectText: "A quiet office plant. No clue here, but it makes the room less empty.",
        words: [],
        taskIds: [],
        blocksMovement: true,
      },
      {
        id: "files",
        spriteId: "file_box",
        label: "Files",
        position: { x: 2, y: 16 },
        inspectText: "Old meeting files. The latest file points back to the calendar.",
        words: [],
        taskIds: [],
        blocksMovement: true,
      },
    ],
    tasks: [
      { id: "read_notice", label: "Read the urgent notice" },
      { id: "find_delay", label: "Find the cause of the delay" },
      { id: "talk_manager", label: "Talk to Manager Mia" },
      { id: "ask_available", label: "Check who is available" },
      { id: "talk_client", label: "Talk to Client Emma" },
      { id: "check_schedule", label: "Check the schedule calendar" },
      { id: "final_confirm", label: "Unlock the final door" },
    ],
    quiz: buildQuiz(quizWords),
  };
}

function normalizeWords(words: string[]) {
  const normalized = words.map((word) => word.trim().toLowerCase()).filter(Boolean);
  const merged = [...normalized, ...DEFAULT_WORDS];
  return Array.from(new Set(merged)).slice(0, 8);
}

function pickWords(targetWords: string[], preferred: string[]) {
  return preferred.filter((word) => targetWords.includes(word));
}

function buildQuiz(words: string[]): QuizQuestion[] {
  return words.map((word) => ({
    prompt: `Type the word: ${word.charAt(0)}${"_".repeat(Math.max(3, word.length - 1))}`,
    answer: word,
  }));
}
