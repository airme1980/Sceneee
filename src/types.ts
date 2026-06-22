export type WordItem = {
  text: string;
  learned: boolean;
  icon?: string;
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

export type SceneRecord = {
  id: string;
  title: string;
  words: string[];
  goal: string;
  difficulty: string;
  createdAt: string;
};

export type QuizQuestion = {
  prompt: string;
  answer: string;
};
