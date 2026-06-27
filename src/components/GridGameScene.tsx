"use client";

import { useEffect, useMemo, useState } from "react";
import { SpellingQuiz } from "@/components/SpellingQuiz";
import { TaskPanel } from "@/components/TaskPanel";
import { WordChecklist } from "@/components/WordChecklist";
import { getCharacterSprite, getObjectSprite } from "@/lib/grid/assets";
import { buildGridMap } from "@/lib/grid/mapTemplates";
import { generateMockGridMission } from "@/lib/grid/mockGenerator";
import type {
  GridMission,
  GridNpc,
  GridObject,
  GridPosition,
  QuizResult,
  SceneProgress,
  SceneRecord,
  TaskItem,
  WordItem,
} from "@/types";

type GridGameSceneProps = {
  record: SceneRecord;
  resetKey: number;
  initialProgress?: SceneProgress;
  onProgressChange: (progress: SceneProgress) => void;
};

type NpcRuntime = GridNpc & {
  patrolIndex: number;
};

const DIRECTIONS = {
  up: { x: 0, y: -1 },
  down: { x: 0, y: 1 },
  left: { x: -1, y: 0 },
  right: { x: 1, y: 0 },
};

export function GridGameScene({
  initialProgress,
  onProgressChange,
  record,
  resetKey,
}: GridGameSceneProps) {
  const mission = useMemo(
    () => generateMockGridMission(record.words, record.id),
    [record.id, record.words],
  );
  const map = useMemo(() => buildGridMap(mission.mapTemplateId), [mission.mapTemplateId]);
  const [playerPosition, setPlayerPosition] = useState<GridPosition>(mission.playerStart);
  const [npcs, setNpcs] = useState<NpcRuntime[]>(() => buildNpcRuntime(mission.npcs));
  const [seenWords, setSeenWords] = useState<Set<string>>(new Set());
  const [masteredWords, setMasteredWords] = useState<Set<string>>(new Set());
  const [completedTasks, setCompletedTasks] = useState<Set<string>>(new Set());
  const [exploredInteractions, setExploredInteractions] = useState<Set<string>>(new Set());
  const [storyLog, setStoryLog] = useState<string[]>([]);
  const [activeMessage, setActiveMessage] = useState(mission.intro);
  const [missionStarted, setMissionStarted] = useState(false);
  const [missionClear, setMissionClear] = useState(false);
  const [turnsUsed, setTurnsUsed] = useState(0);
  const [quizOpen, setQuizOpen] = useState(false);

  useEffect(() => {
    setPlayerPosition(mission.playerStart);
    setNpcs(buildNpcRuntime(mission.npcs));
    setSeenWords(new Set(initialProgress?.seenWords ?? []));
    setMasteredWords(new Set(initialProgress?.masteredWords ?? []));
    setCompletedTasks(new Set(initialProgress?.completedTasks ?? []));
    setExploredInteractions(new Set(initialProgress?.exploredInteractions ?? []));
    setStoryLog([mission.intro]);
    setActiveMessage(mission.intro);
    setMissionStarted(Boolean(initialProgress?.seenWords.length || initialProgress?.completedTasks.length));
    setMissionClear(initialProgress?.completedTasks.includes("final_confirm") ?? false);
    setTurnsUsed(0);
    setQuizOpen(false);
  }, [record.id, resetKey, mission]);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "ArrowUp" || event.key.toLowerCase() === "w") {
        event.preventDefault();
        movePlayer("up");
      }
      if (event.key === "ArrowDown" || event.key.toLowerCase() === "s") {
        event.preventDefault();
        movePlayer("down");
      }
      if (event.key === "ArrowLeft" || event.key.toLowerCase() === "a") {
        event.preventDefault();
        movePlayer("left");
      }
      if (event.key === "ArrowRight" || event.key.toLowerCase() === "d") {
        event.preventDefault();
        movePlayer("right");
      }
      if (event.key === " " || event.key === "Enter") {
        event.preventDefault();
        interactWithNearest();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  });

  useEffect(() => {
    const timerId = window.setInterval(() => {
      setNpcs((currentNpcs) =>
        currentNpcs.map((npc) => {
          if (!npc.patrol || npc.patrol.length <= 1) {
            return npc;
          }

          const nextIndex = (npc.patrolIndex + 1) % npc.patrol.length;
          const nextPosition = npc.patrol[nextIndex];
          const occupiedByNpc = currentNpcs.some(
            (other) => other.id !== npc.id && isSamePosition(other.position, nextPosition),
          );
          const occupiedByObject = mission.objects.some(
            (object) => object.blocksMovement && isSamePosition(object.position, nextPosition),
          );

          if (!isWalkable(map, nextPosition) || occupiedByNpc || occupiedByObject || isSamePosition(playerPosition, nextPosition)) {
            return npc;
          }

          return {
            ...npc,
            position: nextPosition,
            patrolIndex: nextIndex,
          };
        }),
      );
    }, 1600);

    return () => window.clearInterval(timerId);
  }, [map, mission.objects, playerPosition]);

  const words: WordItem[] = useMemo(
    () =>
      mission.targetWords.map((word) => ({
        text: word,
        icon: wordIcon(word),
        status: masteredWords.has(word) ? "mastered" : seenWords.has(word) ? "seen" : "new",
      })),
    [masteredWords, mission.targetWords, seenWords],
  );

  const tasks: TaskItem[] = useMemo(
    () =>
      mission.tasks.map((task) => ({
        ...task,
        completed: completedTasks.has(task.id),
      })),
    [completedTasks, mission.tasks],
  );

  const nearbyEntities = useMemo(
    () => getNearbyEntities(playerPosition, npcs, mission.objects),
    [mission.objects, npcs, playerPosition],
  );
  const currentTask = tasks.find((task) => !task.completed);
  const currentGoal = missionClear
    ? "Mission clear. Start the final spelling challenge."
    : currentTask?.label ?? "Unlock the final door";
  const currentHint = missionClear
    ? `Badge earned: ${mission.rewardBadge}`
    : currentTask
      ? mission.taskHints[currentTask.id] ?? mission.startGoal
      : mission.finalHint;

  function movePlayer(direction: keyof typeof DIRECTIONS) {
    if (!missionStarted || missionClear) {
      return;
    }

    const delta = DIRECTIONS[direction];
    const nextPosition = {
      x: playerPosition.x + delta.x,
      y: playerPosition.y + delta.y,
    };

    if (!isWalkable(map, nextPosition)) {
      pushLog("Blocked. This tile is not walkable.");
      return;
    }

    if (npcs.some((npc) => isSamePosition(npc.position, nextPosition))) {
      pushLog("Someone is standing there. Move next to them to talk.");
      return;
    }

    if (mission.objects.some((object) => object.blocksMovement && isSamePosition(object.position, nextPosition))) {
      pushLog("There is an object there. Stand next to it and inspect it.");
      return;
    }

    setPlayerPosition(nextPosition);
    setTurnsUsed((value) => value + 1);
  }

  function interactWithNearest() {
    if (!missionStarted) {
      return;
    }

    const firstEntity = nearbyEntities[0];
    if (!firstEntity) {
      pushLog("No one nearby. Move next to a person or object.");
      return;
    }

    if (firstEntity.kind === "npc") {
      interactWithNpc(firstEntity.entity);
      return;
    }

    interactWithObject(firstEntity.entity);
  }

  function interactWithNpc(npc: GridNpc) {
    if (!missionStarted || missionClear) {
      return;
    }

    if (!isAdjacent(playerPosition, npc.position)) {
      pushLog(`Move next to ${npc.name} first.`);
      return;
    }

    applyInteraction({
      id: npc.id,
      message: `${npc.name}: ${npc.dialogue}`,
      words: npc.words,
      taskIds: npc.taskIds,
    });
  }

  function interactWithObject(object: GridObject) {
    if (!missionStarted) {
      return;
    }

    if (!isAdjacent(playerPosition, object.position)) {
      pushLog(`Move next to ${object.label} first.`);
      return;
    }

    const missingWords = object.requiredWords?.filter((word) => !seenWords.has(word) && !masteredWords.has(word)) ?? [];
    if (missingWords.length > 0) {
      pushLog(`${object.label} is locked. Find these word clues first: ${missingWords.join(", ")}.`);
      setTurnsUsed((value) => value + 1);
      return;
    }

    applyInteraction({
      id: object.id,
      message: `${object.label}: ${object.inspectText}`,
      words: object.words,
      taskIds: object.taskIds,
      missionClear: object.missionClear,
    });
  }

  function applyInteraction({
    id,
    message,
    missionClear: nextMissionClear = false,
    taskIds,
    words: interactionWords,
  }: {
    id: string;
    message: string;
    words: string[];
    taskIds: string[];
    missionClear?: boolean;
  }) {
    const nextSeenWords = new Set(seenWords);
    const nextCompletedTasks = new Set(completedTasks);
    const nextExplored = new Set(exploredInteractions);

    interactionWords.forEach((word) => nextSeenWords.add(word));
    taskIds.forEach((taskId) => nextCompletedTasks.add(taskId));
    nextExplored.add(id);

    const collectedCopy = interactionWords.length > 0 ? `Collected: ${interactionWords.join(", ")}` : "No new word clue.";
    const finalCopy = nextMissionClear ? `Mission Clear. Reward badge: ${mission.rewardBadge}` : collectedCopy;
    const logMessage = `${message}\n${finalCopy}`;

    setSeenWords(nextSeenWords);
    setCompletedTasks(nextCompletedTasks);
    setExploredInteractions(nextExplored);
    setActiveMessage(logMessage);
    setStoryLog((entries) => [logMessage, ...entries].slice(0, 8));
    setMissionClear((current) => current || nextMissionClear);
    setTurnsUsed((value) => value + 1);
    persistProgress(nextSeenWords, masteredWords, nextCompletedTasks, nextExplored);
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

    setSeenWords(nextSeenWords);
    setMasteredWords(nextMasteredWords);
    persistProgress(nextSeenWords, nextMasteredWords, completedTasks, exploredInteractions, {
      quizAttempts: (initialProgress?.quizAttempts ?? 0) + 1,
      quizBestScore: Math.max(initialProgress?.quizBestScore ?? 0, result.score),
      quizLastScore: result.score,
      quizMistakes: result.mistakes,
    });
  }

  function persistProgress(
    nextSeenWords: Set<string>,
    nextMasteredWords: Set<string>,
    nextCompletedTasks: Set<string>,
    nextExploredInteractions: Set<string>,
    quizPatch: Partial<Pick<SceneProgress, "quizAttempts" | "quizBestScore" | "quizLastScore" | "quizMistakes">> = {},
  ) {
    onProgressChange({
      recordId: record.id,
      seenWords: Array.from(nextSeenWords),
      masteredWords: Array.from(nextMasteredWords),
      completedTasks: Array.from(nextCompletedTasks),
      exploredInteractions: Array.from(nextExploredInteractions),
      quizBestScore: initialProgress?.quizBestScore ?? 0,
      quizLastScore: initialProgress?.quizLastScore,
      quizAttempts: initialProgress?.quizAttempts ?? 0,
      quizMistakes: initialProgress?.quizMistakes ?? [],
      ...quizPatch,
      updatedAt: new Date().toISOString(),
    });
  }

  function pushLog(message: string) {
    setActiveMessage(message);
    setStoryLog((entries) => [message, ...entries].slice(0, 8));
  }

  function replayMission() {
    setPlayerPosition(mission.playerStart);
    setNpcs(buildNpcRuntime(mission.npcs));
    setSeenWords(new Set());
    setMasteredWords(new Set());
    setCompletedTasks(new Set());
    setExploredInteractions(new Set());
    setStoryLog([mission.intro]);
    setActiveMessage(mission.intro);
    setMissionStarted(true);
    setMissionClear(false);
    setTurnsUsed(0);
    setQuizOpen(false);
    persistProgress(new Set(), new Set(), new Set(), new Set());
  }

  return (
    <section className="relative overflow-hidden rounded-[22px] bg-slate-950 p-3 text-white shadow-soft">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-700 bg-slate-900 px-4 py-3">
        <div>
          <p className="font-pixel text-xs text-blue-300">20x20 GRID DEMO · MOCK AI SCENE</p>
          <h2 className="text-xl font-bold tracking-normal">{mission.title}</h2>
          <p className="mt-1 text-xs text-slate-400">{mission.mission}</p>
        </div>
        <div className="flex flex-wrap gap-2 font-pixel text-[11px]">
          <span className="border-2 border-slate-600 bg-slate-800 px-2 py-1">{mission.theme}</span>
          <span className="border-2 border-slate-600 bg-slate-800 px-2 py-1">20x20</span>
          <span className="border-2 border-slate-600 bg-slate-800 px-2 py-1">{turnsUsed} turns</span>
          <span className="border-2 border-emerald-500 bg-emerald-500/15 px-2 py-1 text-emerald-200">
            {completedTasks.size}/{mission.tasks.length} tasks
          </span>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="min-w-0">
          <div
            className="grid aspect-square w-full max-w-[760px] overflow-hidden border-[6px] border-slate-950 bg-slate-800"
            style={{
              gridTemplateColumns: "repeat(20, minmax(0, 1fr))",
            }}
          >
            {map.flatMap((row, y) =>
              row.map((tile, x) => {
                const position = { x, y };
                const npc = npcs.find((item) => isSamePosition(item.position, position));
                const object = mission.objects.find((item) => isSamePosition(item.position, position));
                const isPlayer = isSamePosition(playerPosition, position);
                const isNearby = Boolean(
                  (npc && isAdjacent(playerPosition, npc.position)) ||
                    (object && isAdjacent(playerPosition, object.position)),
                );

                return (
                  <button
                    type="button"
                    key={`${x}-${y}`}
                    className={`relative aspect-square border border-slate-950/20 text-[8px] ${tileClass(tile.type)} ${
                      isNearby ? "z-30 ring-2 ring-yellow-300" : ""
                    }`}
                    onClick={() => {
                      if (npc) {
                        interactWithNpc(npc);
                      } else if (object) {
                        interactWithObject(object);
                      } else if (isAdjacent(playerPosition, position) && tile.walkable) {
                        setPlayerPosition(position);
                      } else {
                        pushLog("Move one tile at a time with arrows, WASD, or the D-pad.");
                      }
                    }}
                    aria-label={`Tile ${x}, ${y}`}
                  >
                    {object ? <ObjectToken object={object} explored={exploredInteractions.has(object.id)} /> : null}
                    {npc ? <NpcToken npc={npc} explored={exploredInteractions.has(npc.id)} /> : null}
                    {isPlayer ? <PlayerToken /> : null}
                  </button>
                );
              }),
            )}
          </div>

          <div className="mt-3 grid gap-3 lg:grid-cols-[minmax(0,1fr)_180px]">
            <div className="pixel-panel bg-slate-900 p-3 font-pixel text-xs leading-5">
              <div className="mb-2 text-blue-300">Story Log</div>
              <p className="whitespace-pre-line text-slate-100">{highlightWords(activeMessage, mission.targetWords)}</p>
            </div>
            <DPad onMove={movePlayer} onInteract={interactWithNearest} />
          </div>
        </div>

        <aside className="grid content-start gap-4">
          <section className="pixel-panel bg-blue-950 p-3 font-pixel text-xs leading-5">
            <div className="mb-2 border-b-2 border-blue-800 pb-2 font-bold text-blue-200">Current Goal</div>
            <p className="font-bold text-white">{currentGoal}</p>
            <p className="mt-2 text-blue-100">Hint: {currentHint}</p>
            <div className="mt-3 h-3 border-2 border-slate-950 bg-slate-800">
              <div
                className="h-full bg-emerald-400"
                style={{ width: `${Math.round((completedTasks.size / mission.tasks.length) * 100)}%` }}
              />
            </div>
          </section>

          <section className="pixel-panel bg-slate-900 p-3 font-pixel text-xs leading-5">
            <div className="mb-2 border-b-2 border-slate-700 pb-2 font-bold text-blue-300">How to play</div>
            <p className="text-slate-300">
              Use arrow keys or WASD. Stand next to NPCs or objects, then click them or press Space.
            </p>
            <div className="mt-3 text-emerald-300">
              Nearby: {nearbyEntities.map((item) => item.label).join(", ") || "none"}
            </div>
          </section>

          <WordChecklist words={words} />
          <TaskPanel tasks={tasks} />

          {missionClear ? (
            <section className="pixel-panel bg-yellow-300 p-3 font-pixel text-xs leading-5 text-slate-950">
              <div className="text-sm font-bold">Mission Clear</div>
              <p className="mt-1">Badge: {mission.rewardBadge}</p>
              <p className="mt-1">Turns used: {turnsUsed}</p>
              <button
                type="button"
                onClick={() => setQuizOpen(true)}
                className="pixel-button mt-3 w-full bg-blue-600 px-3 py-2 text-white"
              >
                Start final spelling
              </button>
              <button
                type="button"
                onClick={replayMission}
                className="pixel-button mt-3 w-full bg-white px-3 py-2 text-slate-950"
              >
                Replay
              </button>
            </section>
          ) : (
            <section className="pixel-panel bg-slate-800 p-3 font-pixel text-xs leading-5 text-slate-300">
              Final door unlocks after you collect confirm and schedule.
            </section>
          )}

          <section className="pixel-panel max-h-48 overflow-auto bg-slate-900 p-3 font-pixel text-[11px] leading-5 text-slate-300">
            {storyLog.map((entry, index) => (
              <p key={`${entry}-${index}`} className="mb-2 whitespace-pre-line border-b border-slate-700 pb-2">
                {entry}
              </p>
            ))}
          </section>
        </aside>
      </div>

      {quizOpen ? (
        <SpellingQuiz
          questions={mission.quiz}
          onClose={() => setQuizOpen(false)}
          onComplete={handleQuizComplete}
        />
      ) : null}

      {!missionStarted ? (
        <MissionStartOverlay
          mission={mission}
          onStart={() => {
            setMissionStarted(true);
            pushLog(mission.intro);
          }}
        />
      ) : null}

      {missionClear && !quizOpen ? (
        <MissionClearOverlay
          mission={mission}
          taskCount={completedTasks.size}
          turnsUsed={turnsUsed}
          wordCount={seenWords.size}
          onReplay={replayMission}
          onSpelling={() => setQuizOpen(true)}
        />
      ) : null}
    </section>
  );
}

function MissionStartOverlay({
  mission,
  onStart,
}: {
  mission: GridMission;
  onStart: () => void;
}) {
  return (
    <div className="absolute inset-0 z-50 grid place-items-center bg-slate-950/75 p-4">
      <section className="pixel-panel w-full max-w-2xl bg-slate-100 p-5 font-pixel text-slate-950">
        <p className="mb-2 text-xs font-bold text-blue-700">MOCK AI MISSION</p>
        <h3 className="text-2xl font-bold">{mission.title}</h3>
        <p className="mt-3 text-sm leading-6 text-slate-700">{mission.intro}</p>

        <div className="mt-4 border-4 border-slate-950 bg-white p-4">
          <p className="text-xs text-slate-500">Goal</p>
          <p className="mt-1 text-sm font-bold">{mission.startGoal}</p>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <div className="border-4 border-slate-950 bg-white p-3">
            <p className="text-xs text-slate-500">Words</p>
            <p className="mt-1 text-lg font-bold">{mission.targetWords.length}</p>
          </div>
          <div className="border-4 border-slate-950 bg-white p-3">
            <p className="text-xs text-slate-500">Tasks</p>
            <p className="mt-1 text-lg font-bold">{mission.tasks.length}</p>
          </div>
          <div className="border-4 border-slate-950 bg-white p-3">
            <p className="text-xs text-slate-500">Map</p>
            <p className="mt-1 text-lg font-bold">20x20</p>
          </div>
        </div>

        <button
          type="button"
          onClick={onStart}
          className="pixel-button mt-5 w-full bg-yellow-300 px-4 py-3 text-sm font-bold text-slate-950"
        >
          Start Mission
        </button>
      </section>
    </div>
  );
}

function MissionClearOverlay({
  mission,
  onReplay,
  onSpelling,
  taskCount,
  turnsUsed,
  wordCount,
}: {
  mission: GridMission;
  taskCount: number;
  turnsUsed: number;
  wordCount: number;
  onReplay: () => void;
  onSpelling: () => void;
}) {
  return (
    <div className="absolute inset-0 z-50 grid place-items-center bg-slate-950/70 p-4">
      <section className="pixel-panel w-full max-w-xl bg-yellow-300 p-5 font-pixel text-slate-950">
        <p className="mb-2 text-xs font-bold">MISSION CLEAR</p>
        <h3 className="text-2xl font-bold">{mission.rewardBadge}</h3>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <div className="border-4 border-slate-950 bg-white p-3">
            <p className="text-xs text-slate-500">Words</p>
            <p className="mt-1 text-lg font-bold">{wordCount}/{mission.targetWords.length}</p>
          </div>
          <div className="border-4 border-slate-950 bg-white p-3">
            <p className="text-xs text-slate-500">Tasks</p>
            <p className="mt-1 text-lg font-bold">{taskCount}/{mission.tasks.length}</p>
          </div>
          <div className="border-4 border-slate-950 bg-white p-3">
            <p className="text-xs text-slate-500">Turns</p>
            <p className="mt-1 text-lg font-bold">{turnsUsed}</p>
          </div>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <button
            type="button"
            onClick={onSpelling}
            className="pixel-button bg-blue-600 px-4 py-3 text-sm font-bold text-white"
          >
            Final Spelling
          </button>
          <button
            type="button"
            onClick={onReplay}
            className="pixel-button bg-white px-4 py-3 text-sm font-bold text-slate-950"
          >
            Replay
          </button>
        </div>
      </section>
    </div>
  );
}

function buildNpcRuntime(npcs: GridNpc[]): NpcRuntime[] {
  return npcs.map((npc) => ({
    ...npc,
    patrolIndex: 0,
  }));
}

function DPad({
  onInteract,
  onMove,
}: {
  onInteract: () => void;
  onMove: (direction: keyof typeof DIRECTIONS) => void;
}) {
  return (
    <div className="grid grid-cols-3 gap-2 self-start font-pixel text-xs">
      <span />
      <button type="button" onClick={() => onMove("up")} className="pixel-button bg-slate-200 px-2 py-2 text-slate-950">
        ↑
      </button>
      <span />
      <button type="button" onClick={() => onMove("left")} className="pixel-button bg-slate-200 px-2 py-2 text-slate-950">
        ←
      </button>
      <button type="button" onClick={onInteract} className="pixel-button bg-yellow-300 px-2 py-2 text-slate-950">
        ACT
      </button>
      <button type="button" onClick={() => onMove("right")} className="pixel-button bg-slate-200 px-2 py-2 text-slate-950">
        →
      </button>
      <span />
      <button type="button" onClick={() => onMove("down")} className="pixel-button bg-slate-200 px-2 py-2 text-slate-950">
        ↓
      </button>
      <span />
    </div>
  );
}

function PlayerToken() {
  return (
    <span className="absolute inset-0 z-30 grid place-items-center">
      <span className="grid h-[80%] w-[70%] place-items-center border-[3px] border-slate-950 bg-yellow-400 font-pixel text-[9px] font-bold text-slate-950">
        YOU
      </span>
    </span>
  );
}

function NpcToken({ explored, npc }: { explored: boolean; npc: GridNpc }) {
  const sprite = getCharacterSprite(npc.spriteId);

  return (
    <span className="absolute inset-0 z-20 grid place-items-center">
      <span
        className={`grid h-[78%] w-[72%] place-items-center border-[3px] border-slate-950 font-pixel text-[8px] font-bold text-white ${
          explored ? "ring-2 ring-emerald-300" : ""
        }`}
        style={{ backgroundColor: sprite.color }}
      >
        {sprite.label}
      </span>
    </span>
  );
}

function ObjectToken({ explored, object }: { explored: boolean; object: GridObject }) {
  const sprite = getObjectSprite(object.spriteId);

  return (
    <span className="absolute inset-0 z-10 grid place-items-center">
      <span
        className={`grid h-[72%] w-[72%] place-items-center border-[3px] border-slate-950 font-pixel text-[10px] font-bold text-slate-950 ${
          explored ? "ring-2 ring-emerald-300" : ""
        }`}
        style={{ backgroundColor: sprite.color }}
      >
        {sprite.symbol}
      </span>
    </span>
  );
}

function highlightWords(text: string, words: string[]) {
  if (words.length === 0) {
    return text;
  }

  const pattern = new RegExp(`\\b(${words.map(escapeRegExp).join("|")})(ed|d|s)?\\b`, "gi");
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;

  for (const match of text.matchAll(pattern)) {
    const index = match.index ?? 0;
    if (index > lastIndex) {
      parts.push(text.slice(lastIndex, index));
    }
    parts.push(
      <mark key={`${match[0]}-${index}`} className="bg-yellow-300 px-1 text-slate-950">
        {match[0]}
      </mark>,
    );
    lastIndex = index + match[0].length;
  }

  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return parts;
}

function getNearbyEntities(playerPosition: GridPosition, npcs: GridNpc[], objects: GridObject[]) {
  const npcEntities = npcs
    .filter((npc) => isAdjacent(playerPosition, npc.position))
    .map((npc) => ({ kind: "npc" as const, label: npc.name, entity: npc }));
  const objectEntities = objects
    .filter((object) => isAdjacent(playerPosition, object.position))
    .map((object) => ({ kind: "object" as const, label: object.label, entity: object }));

  return [...npcEntities, ...objectEntities];
}

function isAdjacent(a: GridPosition, b: GridPosition) {
  return Math.abs(a.x - b.x) + Math.abs(a.y - b.y) === 1;
}

function isSamePosition(a: GridPosition, b: GridPosition) {
  return a.x === b.x && a.y === b.y;
}

function isWalkable(map: ReturnType<typeof buildGridMap>, position: GridPosition) {
  return Boolean(map[position.y]?.[position.x]?.walkable);
}

function tileClass(type: string) {
  switch (type) {
    case "wall":
      return "bg-slate-950";
    case "table":
      return "bg-[#5b4636]";
    case "chair":
      return "bg-[#334155]";
    case "decor":
      return "bg-[#34623f]";
    default:
      return "bg-[#8fa9bf]";
  }
}

function wordIcon(word: string) {
  return word.charAt(0).toUpperCase();
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
