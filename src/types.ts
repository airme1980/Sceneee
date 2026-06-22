export type WordStatus = "new" | "seen" | "mastered";

export type WordItem = {
  text: string;
  status: WordStatus;
  icon?: string;
};

export type TaskSpec = {
  id: string;
  label: string;
};

export type TaskItem = {
  id: string;
  label: string;
  completed: boolean;
};

export type DialogueState = {
  speaker: string;
  text: string;
  highlights: string[];
};

export type MapPosition = {
  x: number;
  y: number;
};

export type SceneRecord = {
  id: string;
  title: string;
  words: string[];
  goal: string;
  difficulty: string;
  createdAt: string;
  sceneId?: string;
};

export type QuizQuestion = {
  prompt: string;
  answer: string;
};

export type InteractionSpec = {
  id: string;
  kind: "npc" | "object";
  speaker: string;
  text: string;
  highlights: string[];
  words: string[];
  position: MapPosition;
  interactAt: MapPosition;
  bubbleAt: MapPosition;
  tasks?: string[];
};

export type AutoCompleteTaskSpec = {
  id: string;
  requiresWords: string[];
};

export type SceneSpec = {
  id: string;
  title: string;
  setting: string;
  hudLabel: string;
  words: string[];
  wordIcons: Record<string, string>;
  tasks: TaskSpec[];
  autoCompleteTasks: AutoCompleteTaskSpec[];
  interactions: Record<string, InteractionSpec>;
  startDialogue: DialogueState;
  quiz: QuizQuestion[];
};

export type SceneProgress = {
  recordId: string;
  seenWords: string[];
  masteredWords: string[];
  completedTasks: string[];
  exploredInteractions: string[];
  quizBestScore: number;
  quizLastScore?: number;
  quizAttempts: number;
  quizMistakes: string[];
  updatedAt: string;
};

export type QuizAnswerResult = {
  prompt: string;
  answer: string;
  userAnswer: string;
  correct: boolean;
};

export type QuizResult = {
  score: number;
  total: number;
  answers: QuizAnswerResult[];
  mistakes: string[];
};
