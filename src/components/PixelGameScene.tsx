"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { DialogueBox } from "@/components/DialogueBox";
import { GameHUD } from "@/components/GameHUD";
import { PixelNpc } from "@/components/PixelNpc";
import { PixelObject } from "@/components/PixelObject";
import { SpeechBubble } from "@/components/SpeechBubble";
import { SpellingQuiz } from "@/components/SpellingQuiz";
import { getSceneSpec } from "@/lib/scenes/officeMeeting";
import type {
  DialogueState,
  MapPosition,
  QuizResult,
  SceneProgress,
  SceneRecord,
  SceneSpec,
  TaskItem,
  WordItem,
} from "@/types";

type PixelGameSceneProps = {
  record: SceneRecord;
  resetKey: number;
  initialProgress?: SceneProgress;
  onProgressChange: (progress: SceneProgress) => void;
};

const START_PLAYER_POSITION: MapPosition = { x: 50, y: 74 };

export function PixelGameScene({
  initialProgress,
  onProgressChange,
  record,
  resetKey,
}: PixelGameSceneProps) {
  const scene = getSceneSpec(record.sceneId);
  const [seenWords, setSeenWords] = useState<Set<string>>(new Set());
  const [masteredWords, setMasteredWords] = useState<Set<string>>(new Set());
  const [completedTaskIds, setCompletedTaskIds] = useState<Set<string>>(new Set());
  const [exploredInteractions, setExploredInteractions] = useState<Set<string>>(new Set());
  const [dialogue, setDialogue] = useState<DialogueState>(scene.startDialogue);
  const [toast, setToast] = useState<string | null>(null);
  const [playerPosition, setPlayerPosition] = useState<MapPosition>(START_PLAYER_POSITION);
  const [movementMs, setMovementMs] = useState(0);
  const [isMoving, setIsMoving] = useState(false);
  const [activeBubbleInteractionId, setActiveBubbleInteractionId] = useState<string | null>(null);
  const [quizOpen, setQuizOpen] = useState(false);
  const movementTimerRef = useRef<number | null>(null);

  useEffect(() => {
    if (movementTimerRef.current) {
      window.clearTimeout(movementTimerRef.current);
      movementTimerRef.current = null;
    }

    setSeenWords(new Set(initialProgress?.seenWords ?? []));
    setMasteredWords(new Set(initialProgress?.masteredWords ?? []));
    setCompletedTaskIds(new Set(initialProgress?.completedTasks ?? []));
    setExploredInteractions(new Set(initialProgress?.exploredInteractions ?? []));
    setDialogue(scene.startDialogue);
    setPlayerPosition(START_PLAYER_POSITION);
    setMovementMs(0);
    setIsMoving(false);
    setActiveBubbleInteractionId(null);
    setQuizOpen(false);
    setToast(null);
  }, [record.id, resetKey]);

  useEffect(() => {
    return () => {
      if (movementTimerRef.current) {
        window.clearTimeout(movementTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!toast) {
      return;
    }

    const timeoutId = window.setTimeout(() => setToast(null), 1600);
    return () => window.clearTimeout(timeoutId);
  }, [toast]);

  const effectiveCompletedTasks = useMemo(
    () => getCompletedTaskIds(scene, seenWords, completedTaskIds),
    [completedTaskIds, scene, seenWords],
  );

  const words: WordItem[] = useMemo(
    () =>
      scene.words.map((word) => ({
        text: word,
        status: masteredWords.has(word) ? "mastered" : seenWords.has(word) ? "seen" : "new",
        icon: scene.wordIcons[word],
      })),
    [masteredWords, scene, seenWords],
  );

  const tasks: TaskItem[] = useMemo(
    () =>
      scene.tasks.map((task) => ({
        ...task,
        completed: effectiveCompletedTasks.has(task.id),
      })),
    [effectiveCompletedTasks, scene],
  );

  const completedTaskCount = tasks.filter((task) => task.completed).length;
  const quizBestScore = initialProgress?.quizBestScore ?? 0;
  const quizAttempts = initialProgress?.quizAttempts ?? 0;
  const activeBubbleInteraction = activeBubbleInteractionId
    ? scene.interactions[activeBubbleInteractionId]
    : null;

  function persistProgress(
    nextSeenWords: Set<string>,
    nextMasteredWords: Set<string>,
    nextCompletedTaskIds: Set<string>,
    nextExploredInteractions: Set<string>,
    quizPatch: Partial<Pick<SceneProgress, "quizAttempts" | "quizBestScore" | "quizLastScore" | "quizMistakes">> = {},
  ) {
    onProgressChange({
      recordId: record.id,
      seenWords: Array.from(nextSeenWords),
      masteredWords: Array.from(nextMasteredWords),
      completedTasks: Array.from(getCompletedTaskIds(scene, nextSeenWords, nextCompletedTaskIds)),
      exploredInteractions: Array.from(nextExploredInteractions),
      quizBestScore: initialProgress?.quizBestScore ?? 0,
      quizLastScore: initialProgress?.quizLastScore,
      quizAttempts: initialProgress?.quizAttempts ?? 0,
      quizMistakes: initialProgress?.quizMistakes ?? [],
      ...quizPatch,
      updatedAt: new Date().toISOString(),
    });
  }

  function moveToInteraction(interactionId: string) {
    const interaction = scene.interactions[interactionId];
    if (!interaction || isMoving) {
      return;
    }

    const duration = getMovementDuration(playerPosition, interaction.interactAt);
    if (movementTimerRef.current) {
      window.clearTimeout(movementTimerRef.current);
    }

    setActiveBubbleInteractionId(null);
    setMovementMs(duration);
    setIsMoving(true);
    setToast(`Walking to ${interaction.speaker}...`);
    setPlayerPosition(interaction.interactAt);

    movementTimerRef.current = window.setTimeout(() => {
      setIsMoving(false);
      setToast(null);
      triggerInteraction(interactionId);
      movementTimerRef.current = null;
    }, duration);
  }

  function triggerInteraction(interactionId: string) {
    const interaction = scene.interactions[interactionId];
    if (!interaction) {
      return;
    }

    const previousTasks = getCompletedTaskIds(scene, seenWords, completedTaskIds);
    const nextSeenWords = new Set(seenWords);
    const nextCompletedTaskIds = new Set(completedTaskIds);
    const nextExploredInteractions = new Set(exploredInteractions);

    interaction.words.forEach((word) => nextSeenWords.add(word));
    interaction.tasks?.forEach((taskId) => nextCompletedTaskIds.add(taskId));
    nextExploredInteractions.add(interaction.id);

    const nextTasks = getCompletedTaskIds(scene, nextSeenWords, nextCompletedTaskIds);
    const newTaskLabels = scene.tasks
      .filter((task) => !previousTasks.has(task.id) && nextTasks.has(task.id))
      .map((task) => task.label);

    setDialogue({
      speaker: interaction.speaker,
      text: interaction.text,
      highlights: interaction.highlights,
    });
    setActiveBubbleInteractionId(interaction.id);
    setSeenWords(nextSeenWords);
    setCompletedTaskIds(nextCompletedTaskIds);
    setExploredInteractions(nextExploredInteractions);
    setToast(newTaskLabels.length > 0 ? `Task Complete: ${newTaskLabels[0]}` : "Word discovered");
    persistProgress(nextSeenWords, masteredWords, nextCompletedTaskIds, nextExploredInteractions);
  }

  function handleQuizComplete(result: QuizResult) {
    const nextSeenWords = new Set(seenWords);
    const nextMasteredWords = new Set(masteredWords);

    result.answers
      .filter((answer) => answer.correct)
      .forEach((answer) => {
        nextSeenWords.add(answer.answer);
        nextMasteredWords.add(answer.answer);
      });

    const quizPatch = {
      quizAttempts: (initialProgress?.quizAttempts ?? 0) + 1,
      quizBestScore: Math.max(initialProgress?.quizBestScore ?? 0, result.score),
      quizLastScore: result.score,
      quizMistakes: result.mistakes,
    };

    setSeenWords(nextSeenWords);
    setMasteredWords(nextMasteredWords);
    persistProgress(nextSeenWords, nextMasteredWords, completedTaskIds, exploredInteractions, quizPatch);
  }

  return (
    <section className="relative overflow-hidden rounded-[22px] bg-slate-950 p-3 text-white shadow-soft">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-700 bg-slate-900 px-4 py-3">
        <div>
          <p className="font-pixel text-xs text-blue-300">{scene.hudLabel}</p>
          <h2 className="text-xl font-bold tracking-normal">{record.title}</h2>
          <p className="mt-1 text-xs text-slate-400">{scene.setting} · progress is saved locally</p>
        </div>
        <div className="flex flex-wrap gap-2 font-pixel text-[11px]">
          <span className="border-2 border-slate-600 bg-slate-800 px-2 py-1">{record.goal}</span>
          <span className="border-2 border-slate-600 bg-slate-800 px-2 py-1">{record.difficulty}</span>
          <span className="border-2 border-emerald-500 bg-emerald-500/15 px-2 py-1 text-emerald-200">
            {completedTaskCount}/{scene.tasks.length} tasks
          </span>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_230px]">
        <div className="pixel-map pixelated relative min-h-[620px] overflow-hidden border-[6px] border-slate-950 bg-slate-800 sm:min-h-[660px]">
          <div className="absolute inset-x-0 top-0 h-28 border-b-[6px] border-slate-950 bg-[#6f8fb0]" />
          <div className="absolute left-8 top-5 h-12 w-24 border-4 border-slate-950 bg-[#d8f1ff]">
            <div className="h-full w-1/2 border-r-4 border-slate-950 bg-[#b8ddf2]" />
          </div>
          <div className="absolute right-8 top-5 h-12 w-24 border-4 border-slate-950 bg-[#d8f1ff]">
            <div className="h-full w-1/2 border-r-4 border-slate-950 bg-[#b8ddf2]" />
          </div>

          <PixelObject
            ariaLabel="Read urgent notice"
            explored={exploredInteractions.has("urgentNotice")}
            onClick={() => moveToInteraction("urgentNotice")}
            className="left-[42%] top-5 border-4 border-slate-950 bg-red-500 px-5 py-3 text-center font-pixel text-xs font-bold text-white shadow-[0_4px_0_#111827]"
          >
            <span className="block text-[10px] text-red-100">NOTICE</span>
            <span className="block text-base">URGENT</span>
          </PixelObject>

          <PixelObject
            ariaLabel="Read delay whiteboard"
            explored={exploredInteractions.has("delayWhiteboard")}
            onClick={() => moveToInteraction("delayWhiteboard")}
            className="left-[12%] top-24 w-44 border-4 border-slate-950 bg-white p-3 font-pixel text-slate-950 shadow-[0_4px_0_#111827]"
          >
            <span className="block text-[10px] text-slate-500">WHITEBOARD</span>
            <span className="mt-1 block text-2xl font-bold text-blue-700">DELAY</span>
            <span className="mt-2 block h-2 w-28 bg-slate-300" />
          </PixelObject>

          <PixelObject
            ariaLabel="Check schedule calendar"
            explored={exploredInteractions.has("scheduleCalendar")}
            onClick={() => moveToInteraction("scheduleCalendar")}
            className="right-[10%] top-24 w-36 border-4 border-slate-950 bg-blue-100 p-3 text-center font-pixel text-slate-950 shadow-[0_4px_0_#111827]"
          >
            <span className="block border-b-4 border-slate-950 bg-blue-500 py-1 text-[10px] text-white">
              JUNE
            </span>
            <span className="mt-2 block text-lg font-bold">SCHEDULE</span>
            <span className="mt-2 grid grid-cols-4 gap-1">
              {Array.from({ length: 8 }).map((_, index) => (
                <span key={index} className="h-2 bg-blue-300" />
              ))}
            </span>
          </PixelObject>

          <PixelObject className="left-[34%] top-[37%] h-28 w-[32%] border-[6px] border-slate-950 bg-[#546a86] shadow-[0_8px_0_#111827]">
            <span className="absolute left-4 top-4 h-5 w-12 border-2 border-slate-950 bg-slate-200" />
            <span className="absolute right-5 top-5 h-4 w-16 border-2 border-slate-950 bg-blue-200" />
            <span className="absolute bottom-4 left-1/2 h-5 w-24 -translate-x-1/2 border-2 border-slate-950 bg-slate-300" />
          </PixelObject>

          {[
            ["31%", "34%"],
            ["47%", "33%"],
            ["63%", "34%"],
            ["31%", "55%"],
            ["47%", "58%"],
            ["63%", "55%"],
          ].map(([left, top]) => (
            <PixelObject
              key={`${left}-${top}`}
              className="h-10 w-12 border-4 border-slate-950 bg-[#334155]"
              style={{ left, top }}
            >
              <span className="block h-3 border-b-4 border-slate-950 bg-[#64748b]" />
            </PixelObject>
          ))}

          <PixelObject className="left-8 top-[43%] h-20 w-24 border-4 border-slate-950 bg-[#5f7898]">
            <span className="block h-5 border-b-4 border-slate-950 bg-[#88a3bf]" />
            <span className="mx-auto mt-4 block h-8 w-14 border-4 border-slate-950 bg-slate-200" />
          </PixelObject>

          <PixelObject className="right-10 top-[43%] h-20 w-16 border-4 border-slate-950 bg-[#46637f]">
            <span className="mx-auto mt-3 block h-10 w-9 border-4 border-slate-950 bg-emerald-500" />
            <span className="mx-auto block h-5 w-12 border-4 border-slate-950 bg-slate-700" />
          </PixelObject>

          <PixelObject className="left-[10%] top-[32%] h-8 w-14 border-4 border-slate-950 bg-[#c08457]">
            <span className="mx-auto mt-1 block h-3 w-8 bg-yellow-200" />
          </PixelObject>
          <PixelObject className="right-[28%] top-[30%] h-7 w-12 border-4 border-slate-950 bg-[#c2410c]">
            <span className="block h-2 bg-orange-200" />
          </PixelObject>

          <PixelNpc
            name="Manager"
            role="ARRANGE"
            color="#2563eb"
            explored={exploredInteractions.has("manager")}
            x="50%"
            y="37%"
            onClick={() => moveToInteraction("manager")}
          />

          <PixelNpc
            name="Coworker"
            role="AVAILABLE"
            color="#16a34a"
            explored={exploredInteractions.has("coworker")}
            x="21%"
            y="60%"
            onClick={() => moveToInteraction("coworker")}
          />

          <PixelNpc
            name="Client"
            role="CLIENT"
            color="#7c3aed"
            explored={exploredInteractions.has("client")}
            x="79%"
            y="58%"
            onClick={() => moveToInteraction("client")}
          />

          <PixelNpc
            name="You"
            role={isMoving ? "MOVING" : "PLAYER"}
            color="#f59e0b"
            transitionMs={movementMs}
            x={`${playerPosition.x}%`}
            y={`${playerPosition.y}%`}
          />

          <PixelObject className="left-[14%] top-[76%] h-10 w-16 border-4 border-slate-950 bg-slate-600">
            <span className="mx-auto mt-2 block h-3 w-10 bg-slate-300" />
          </PixelObject>
          <PixelObject className="right-[18%] top-[76%] h-10 w-20 border-4 border-slate-950 bg-slate-600">
            <span className="mx-auto mt-2 block h-3 w-12 bg-slate-300" />
          </PixelObject>

          <div className="absolute left-4 top-[61%] rounded-sm border-2 border-slate-950 bg-yellow-200 px-2 py-1 font-pixel text-[10px] font-bold text-slate-950">
            available?
          </div>
          <div className="absolute right-[24%] top-[48%] rounded-sm border-2 border-slate-950 bg-yellow-200 px-2 py-1 font-pixel text-[10px] font-bold text-slate-950">
            client
          </div>

          {toast ? (
            <div className="absolute left-1/2 top-4 z-40 -translate-x-1/2 border-4 border-slate-950 bg-yellow-300 px-4 py-2 font-pixel text-xs font-bold text-slate-950 shadow-[0_4px_0_#111827]">
              {toast}
            </div>
          ) : null}

          {activeBubbleInteraction ? (
            <SpeechBubble
              dialogue={{
                speaker: activeBubbleInteraction.speaker,
                text: activeBubbleInteraction.text,
                highlights: activeBubbleInteraction.highlights,
              }}
              position={activeBubbleInteraction.bubbleAt}
            />
          ) : null}

          <DialogueBox dialogue={dialogue} />

          {quizOpen ? (
            <SpellingQuiz
              questions={scene.quiz}
              onClose={() => setQuizOpen(false)}
              onComplete={handleQuizComplete}
            />
          ) : null}
        </div>

        <GameHUD
          words={words}
          tasks={tasks}
          quizAttempts={quizAttempts}
          quizAvailable={completedTaskCount >= 3}
          quizBestScore={quizBestScore}
          quizOpen={quizOpen}
          quizTotal={scene.quiz.length}
          onStartQuiz={() => setQuizOpen(true)}
        />
      </div>
    </section>
  );
}

function getMovementDuration(from: MapPosition, to: MapPosition) {
  const distance = Math.hypot(to.x - from.x, to.y - from.y);
  return Math.min(1100, Math.max(460, Math.round(distance * 24)));
}

function getCompletedTaskIds(
  scene: SceneSpec,
  seenWords: Set<string>,
  completedTaskIds: Set<string>,
) {
  const result = new Set(completedTaskIds);

  scene.autoCompleteTasks.forEach((task) => {
    if (task.requiresWords.every((word) => seenWords.has(word))) {
      result.add(task.id);
    }
  });

  return result;
}
