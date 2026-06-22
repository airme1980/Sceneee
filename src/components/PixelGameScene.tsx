"use client";

import { useEffect, useMemo, useState } from "react";
import { DialogueBox } from "@/components/DialogueBox";
import { GameHUD } from "@/components/GameHUD";
import { PixelNpc } from "@/components/PixelNpc";
import { PixelObject } from "@/components/PixelObject";
import { SpellingQuiz } from "@/components/SpellingQuiz";
import { DEFAULT_WORDS, QUIZ_QUESTIONS } from "@/lib/mockScene";
import type { DialogueState, SceneRecord, TaskItem, WordItem } from "@/types";

type PixelGameSceneProps = {
  record: SceneRecord;
  resetKey: number;
};

const WORD_ICONS: Record<string, string> = {
  confirm: "✓",
  delay: "!",
  arrange: "▣",
  urgent: "▲",
  available: "●",
  schedule: "□",
  client: "◆",
};

const TASKS = [
  { id: "manager", label: "Talk to manager" },
  { id: "coworker", label: "Check who is available" },
  { id: "confirmSchedule", label: "Confirm the schedule" },
  { id: "client", label: "Talk to client" },
];

const START_DIALOGUE: DialogueState = {
  speaker: "Coach",
  text: "Click NPCs and office objects to learn the meeting words.",
  highlights: [],
};

export function PixelGameScene({ record, resetKey }: PixelGameSceneProps) {
  const [learnedWords, setLearnedWords] = useState<Set<string>>(new Set());
  const [completedTaskIds, setCompletedTaskIds] = useState<Set<string>>(new Set());
  const [dialogue, setDialogue] = useState<DialogueState>(START_DIALOGUE);
  const [quizOpen, setQuizOpen] = useState(false);

  useEffect(() => {
    setLearnedWords(new Set());
    setCompletedTaskIds(new Set());
    setDialogue(START_DIALOGUE);
    setQuizOpen(false);
  }, [resetKey]);

  const words: WordItem[] = useMemo(
    () =>
      DEFAULT_WORDS.map((word) => ({
        text: word,
        learned: learnedWords.has(word),
        icon: WORD_ICONS[word],
      })),
    [learnedWords],
  );

  const tasks: TaskItem[] = useMemo(
    () =>
      TASKS.map((task) => ({
        ...task,
        completed:
          completedTaskIds.has(task.id) ||
          (task.id === "confirmSchedule" && learnedWords.has("confirm") && learnedWords.has("schedule")),
      })),
    [completedTaskIds, learnedWords],
  );

  const completedTaskCount = tasks.filter((task) => task.completed).length;

  function interact(dialogueState: DialogueState, wordsToLearn: string[], tasksToComplete: string[] = []) {
    setDialogue(dialogueState);
    setLearnedWords((currentWords) => {
      const nextWords = new Set(currentWords);
      wordsToLearn.forEach((word) => nextWords.add(word));
      return nextWords;
    });
    setCompletedTaskIds((currentTasks) => {
      const nextTasks = new Set(currentTasks);
      tasksToComplete.forEach((task) => nextTasks.add(task));
      return nextTasks;
    });
  }

  return (
    <section className="relative overflow-hidden rounded-[22px] bg-slate-950 p-3 text-white shadow-soft">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-700 bg-slate-900 px-4 py-3">
        <div>
          <p className="font-pixel text-xs text-blue-300">OFFICE QUEST</p>
          <h2 className="text-xl font-bold tracking-normal">{record.title}</h2>
        </div>
        <div className="flex flex-wrap gap-2 font-pixel text-[11px]">
          <span className="border-2 border-slate-600 bg-slate-800 px-2 py-1">{record.goal}</span>
          <span className="border-2 border-slate-600 bg-slate-800 px-2 py-1">{record.difficulty}</span>
          <span className="border-2 border-emerald-500 bg-emerald-500/15 px-2 py-1 text-emerald-200">
            {completedTaskCount}/4 tasks
          </span>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_230px]">
        <div className="pixel-map pixelated relative min-h-[660px] overflow-hidden border-[6px] border-slate-950 bg-slate-800">
          <div className="absolute inset-x-0 top-0 h-28 border-b-[6px] border-slate-950 bg-[#6f8fb0]" />
          <div className="absolute left-8 top-5 h-12 w-24 border-4 border-slate-950 bg-[#d8f1ff]">
            <div className="h-full w-1/2 border-r-4 border-slate-950 bg-[#b8ddf2]" />
          </div>
          <div className="absolute right-8 top-5 h-12 w-24 border-4 border-slate-950 bg-[#d8f1ff]">
            <div className="h-full w-1/2 border-r-4 border-slate-950 bg-[#b8ddf2]" />
          </div>

          <PixelObject
            ariaLabel="Read urgent notice"
            onClick={() =>
              interact(
                {
                  speaker: "Notice",
                  text: "This is an urgent notice from the client.",
                  highlights: ["urgent"],
                },
                ["urgent"],
              )
            }
            className="left-[42%] top-5 border-4 border-slate-950 bg-red-500 px-5 py-3 text-center font-pixel text-xs font-bold text-white shadow-[0_4px_0_#111827]"
          >
            <span className="block text-[10px] text-red-100">NOTICE</span>
            <span className="block text-base">URGENT</span>
          </PixelObject>

          <PixelObject
            ariaLabel="Read delay whiteboard"
            onClick={() =>
              interact(
                {
                  speaker: "Whiteboard",
                  text: "The project may be delayed because of a vendor response.",
                  highlights: ["delay"],
                },
                ["delay"],
              )
            }
            className="left-[12%] top-24 w-44 border-4 border-slate-950 bg-white p-3 font-pixel text-slate-950 shadow-[0_4px_0_#111827]"
          >
            <span className="block text-[10px] text-slate-500">WHITEBOARD</span>
            <span className="mt-1 block text-2xl font-bold text-blue-700">DELAY</span>
            <span className="mt-2 block h-2 w-28 bg-slate-300" />
          </PixelObject>

          <PixelObject
            ariaLabel="Check schedule calendar"
            onClick={() =>
              interact(
                {
                  speaker: "Calendar",
                  text: "The schedule has changed.",
                  highlights: ["schedule"],
                },
                ["schedule"],
              )
            }
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

          <PixelObject
            className="left-[34%] top-[37%] h-28 w-[32%] border-[6px] border-slate-950 bg-[#546a86] shadow-[0_8px_0_#111827]"
          >
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

          <PixelNpc
            name="Manager"
            role="ARRANGE"
            color="#2563eb"
            x="50%"
            y="37%"
            onClick={() =>
              interact(
                {
                  speaker: "Manager",
                  text: "Please arrange another meeting and confirm the schedule.",
                  highlights: ["arrange", "confirm", "schedule"],
                },
                ["arrange", "confirm", "schedule"],
                ["manager"],
              )
            }
          />

          <PixelNpc
            name="Coworker"
            role="AVAILABLE"
            color="#16a34a"
            x="21%"
            y="60%"
            onClick={() =>
              interact(
                {
                  speaker: "Coworker",
                  text: "I am available this afternoon.",
                  highlights: ["available"],
                },
                ["available"],
                ["coworker"],
              )
            }
          />

          <PixelNpc
            name="Client"
            role="CLIENT"
            color="#7c3aed"
            x="79%"
            y="58%"
            onClick={() =>
              interact(
                {
                  speaker: "Client",
                  text: "Please confirm the new schedule.",
                  highlights: ["client", "confirm", "schedule"],
                },
                ["client", "confirm", "schedule"],
                ["client"],
              )
            }
          />

          <PixelNpc
            name="You"
            role="PLAYER"
            color="#f59e0b"
            x="50%"
            y="74%"
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

          <DialogueBox dialogue={dialogue} />

          {quizOpen ? (
            <SpellingQuiz
              questions={QUIZ_QUESTIONS}
              onClose={() => setQuizOpen(false)}
            />
          ) : null}
        </div>

        <GameHUD
          words={words}
          tasks={tasks}
          quizAvailable={completedTaskCount >= 3}
          quizOpen={quizOpen}
          onStartQuiz={() => setQuizOpen(true)}
        />
      </div>
    </section>
  );
}
