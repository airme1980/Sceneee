"use client";

import { useState } from "react";
import type { QuizAnswerResult, QuizQuestion, QuizResult } from "@/types";

type SpellingQuizProps = {
  questions: QuizQuestion[];
  onComplete: (result: QuizResult) => void;
  onClose: () => void;
};

export function SpellingQuiz({ onClose, onComplete, questions }: SpellingQuizProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState<"correct" | "incorrect" | null>(null);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);
  const [answers, setAnswers] = useState<QuizAnswerResult[]>([]);

  const currentQuestion = questions[currentIndex];
  const mistakes = answers.filter((item) => !item.correct).map((item) => item.answer);

  function handleCheck() {
    if (!currentQuestion || feedback) {
      return;
    }

    const userAnswer = answer.trim();
    const isCorrect = userAnswer.toLowerCase() === currentQuestion.answer.toLowerCase();
    const result: QuizAnswerResult = {
      prompt: currentQuestion.prompt,
      answer: currentQuestion.answer,
      userAnswer,
      correct: isCorrect,
    };

    setAnswers((items) => [...items, result]);
    setFeedback(isCorrect ? "correct" : "incorrect");
    if (isCorrect) {
      setScore((value) => value + 1);
    }
  }

  function handleNext() {
    if (currentIndex === questions.length - 1) {
      const finalAnswers = answers;
      const finalScore = finalAnswers.filter((item) => item.correct).length;
      onComplete({
        score: finalScore,
        total: questions.length,
        answers: finalAnswers,
        mistakes: finalAnswers.filter((item) => !item.correct).map((item) => item.answer),
      });
      setFinished(true);
      return;
    }

    setCurrentIndex((index) => index + 1);
    setAnswer("");
    setFeedback(null);
  }

  function handleRestart() {
    setCurrentIndex(0);
    setAnswer("");
    setFeedback(null);
    setScore(0);
    setFinished(false);
    setAnswers([]);
  }

  return (
    <div className="absolute inset-0 z-40 grid place-items-center bg-slate-950/70 p-4">
      <section className="pixel-panel w-full max-w-xl bg-slate-100 p-5 font-pixel text-slate-950">
        <div className="mb-4 flex items-center justify-between border-b-4 border-slate-950 pb-3">
          <div>
            <h2 className="text-lg font-bold">Spelling Practice</h2>
            <p className="mt-1 text-xs text-slate-600">Score: {score}/{questions.length}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="border-2 border-slate-950 bg-white px-2 py-1 text-xs font-bold"
          >
            CLOSE
          </button>
        </div>

        {finished ? (
          <div className="space-y-5">
            <div className="border-4 border-slate-950 bg-white p-5 text-center">
              <p className="text-sm text-slate-500">Final Score</p>
              <p className="mt-2 text-4xl font-bold text-blue-700">{score}/{questions.length}</p>
            </div>
            <div className="border-4 border-slate-950 bg-white p-4">
              <p className="mb-2 text-sm font-bold">Review Report</p>
              {mistakes.length > 0 ? (
                <div className="space-y-2 text-xs leading-5">
                  <p className="text-red-700">Wrong words: {mistakes.join(", ")}</p>
                  <p className="text-slate-600">Recommended review: {mistakes.slice(0, 3).join(", ")}</p>
                </div>
              ) : (
                <p className="text-xs leading-5 text-emerald-700">
                  All correct. These words are now marked as mastered.
                </p>
              )}
            </div>
            <button
              type="button"
              onClick={handleRestart}
              className="pixel-button w-full bg-yellow-300 px-4 py-3 text-sm font-bold text-slate-950"
            >
              再练一次
            </button>
            <button
              type="button"
              onClick={onClose}
              className="pixel-button w-full bg-blue-600 px-4 py-3 text-sm font-bold text-white"
            >
              Back to Scene
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="border-4 border-slate-950 bg-white p-4">
              <p className="mb-2 text-xs text-slate-500">Question {currentIndex + 1}/{questions.length}</p>
              <p className="text-lg font-bold leading-8">{currentQuestion.prompt}</p>
            </div>

            <input
              value={answer}
              onChange={(event) => setAnswer(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  feedback ? handleNext() : handleCheck();
                }
              }}
              className="w-full border-4 border-slate-950 bg-white px-4 py-3 text-base font-bold outline-none focus:ring-4 focus:ring-blue-200"
              placeholder="Type the full word"
              autoFocus
            />

            {feedback ? (
              <div
                className={`border-4 p-3 text-sm font-bold ${
                  feedback === "correct"
                    ? "border-emerald-700 bg-emerald-100 text-emerald-900"
                    : "border-red-700 bg-red-100 text-red-900"
                }`}
              >
                {feedback === "correct"
                  ? "Correct"
                  : `Incorrect. Answer: ${currentQuestion.answer}`}
              </div>
            ) : null}

            <button
              type="button"
              onClick={feedback ? handleNext : handleCheck}
              className="pixel-button w-full bg-yellow-300 px-4 py-3 text-sm font-bold text-slate-950"
            >
              {feedback ? (currentIndex === questions.length - 1 ? "Show Score" : "Next") : "检查"}
            </button>
          </div>
        )}
      </section>
    </div>
  );
}
