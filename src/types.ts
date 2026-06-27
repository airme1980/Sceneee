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

export type GridPosition = {
  x: number;
  y: number;
};

export type GridTileType = "floor" | "wall" | "table" | "chair" | "decor";

export type GridTile = {
  type: GridTileType;
  walkable: boolean;
};

export type CharacterSpriteId =
  | "manager_blue"
  | "coworker_green"
  | "client_purple"
  | "staff_red"
  | "traveler_yellow"
  | "barista_brown"
  | "doctor_teal"
  | "student_orange"
  | "guard_gray"
  | "robot_silver";

export type ObjectSpriteId =
  | "urgent_notice"
  | "whiteboard"
  | "calendar"
  | "laptop"
  | "phone"
  | "door"
  | "coffee_machine"
  | "suitcase"
  | "ticket_screen"
  | "menu_board"
  | "plant"
  | "file_box"
  | "desk_lamp"
  | "book_stack"
  | "projector";

export type CharacterSprite = {
  id: CharacterSpriteId;
  label: string;
  color: string;
  roles: string[];
};

export type ObjectSprite = {
  id: ObjectSpriteId;
  label: string;
  symbol: string;
  color: string;
  themes: string[];
};

export type GridNpc = {
  id: string;
  spriteId: CharacterSpriteId;
  name: string;
  role: string;
  position: GridPosition;
  patrol?: GridPosition[];
  dialogue: string;
  words: string[];
  taskIds: string[];
};

export type GridObject = {
  id: string;
  spriteId: ObjectSpriteId;
  label: string;
  position: GridPosition;
  inspectText: string;
  words: string[];
  taskIds: string[];
  blocksMovement: boolean;
  requiredWords?: string[];
  missionClear?: boolean;
};

export type GridMission = {
  id: string;
  title: string;
  theme: "office" | "airport" | "cafe";
  mission: string;
  intro: string;
  startGoal: string;
  taskHints: Record<string, string>;
  finalHint: string;
  mapTemplateId: string;
  targetWords: string[];
  playerStart: GridPosition;
  npcs: GridNpc[];
  objects: GridObject[];
  tasks: TaskSpec[];
  quiz: QuizQuestion[];
  rewardBadge: string;
};
