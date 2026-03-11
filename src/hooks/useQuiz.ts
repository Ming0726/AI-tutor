"use client";

import { useCallback, useMemo, useState } from "react";
import { useToastStore } from "@/stores/toastStore";
import type { Question, QuizResultItem } from "@/types/quiz";

type QuizCount = "5" | "8" | "10";

type QuizMode = "idle" | "answering" | "result";

type QuizPayload = {
  keyword: string;
  count: QuizCount;
};

type GenerateResponse = {
  quizId: string;
  questions: Question[];
};

type SubmitResponse = {
  score: number;
  total: number;
  results: QuizResultItem[];
};

export function useQuiz() {
  const showToast = useToastStore((state) => state.showToast);
  const [mode, setMode] = useState<QuizMode>("idle");
  const [quizId, setQuizId] = useState<string | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [resultMap, setResultMap] = useState<Record<string, QuizResultItem>>({});
  const [retryQuestionIds, setRetryQuestionIds] = useState<string[]>([]);
  const [lastKeyword, setLastKeyword] = useState("");
  const [lastCount, setLastCount] = useState<QuizCount>("5");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const questionsToAnswer = useMemo(() => {
    if (retryQuestionIds.length === 0) return questions;
    return questions.filter((item) => retryQuestionIds.includes(item.id));
  }, [questions, retryQuestionIds]);

  const results = useMemo(() => {
    return questions
      .map((question) => resultMap[question.id])
      .filter((item): item is QuizResultItem => Boolean(item));
  }, [questions, resultMap]);

  const score = useMemo(() => {
    return questions.reduce((sum, item) => sum + (resultMap[item.id]?.isCorrect ? 1 : 0), 0);
  }, [questions, resultMap]);

  const total = questions.length;

  const generateQuiz = useCallback(async ({ keyword, count }: QuizPayload) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/quiz/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ keyword, count }),
      });

      if (!response.ok) {
        const body = await response.json().catch(() => null);
        throw new Error(body?.error ?? "Failed to generate quiz");
      }

      const data = (await response.json()) as GenerateResponse;
      setQuizId(data.quizId);
      setQuestions(data.questions);
      setAnswers({});
      setResultMap({});
      setRetryQuestionIds([]);
      setLastKeyword(keyword);
      setLastCount(count);
      setMode("answering");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to generate quiz";
      setError(message);
      showToast({ message, type: "error" });
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  const selectAnswer = useCallback((questionId: string, optionIndex: number) => {
    setAnswers((prev) => ({ ...prev, [questionId]: optionIndex }));
  }, []);

  const submitQuiz = useCallback(async () => {
    if (!quizId) return;

    const answerArray = questionsToAnswer.map((question) => ({
      questionId: question.id,
      selectedIndex: answers[question.id],
    }));

    if (answerArray.some((item) => typeof item.selectedIndex !== "number")) {
      const message = "Please answer all questions before submit.";
      setError(message);
      showToast({ message, type: "error" });
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/quiz/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quizId, answers: answerArray }),
      });

      if (!response.ok) {
        const body = await response.json().catch(() => null);
        throw new Error(body?.error ?? "Failed to submit quiz");
      }

      const data = (await response.json()) as SubmitResponse;
      setResultMap((prev) => {
        const next = { ...prev };
        data.results.forEach((item) => {
          next[item.questionId] = item;
        });
        return next;
      });

      setRetryQuestionIds([]);
      setMode("result");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to submit quiz";
      setError(message);
      showToast({ message, type: "error" });
    } finally {
      setLoading(false);
    }
  }, [answers, questionsToAnswer, quizId, showToast]);

  const retryWrongAnswers = useCallback(() => {
    const wrongIds = questions
      .map((question) => question.id)
      .filter((id) => resultMap[id] && !resultMap[id].isCorrect);

    if (wrongIds.length === 0) return;

    setAnswers((prev) => {
      const next = { ...prev };
      wrongIds.forEach((id) => {
        delete next[id];
      });
      return next;
    });
    setRetryQuestionIds(wrongIds);
    setMode("answering");
  }, [questions, resultMap]);

  const regenerateQuiz = useCallback(async () => {
    if (!lastKeyword) {
      setMode("idle");
      return;
    }
    await generateQuiz({ keyword: lastKeyword, count: lastCount });
  }, [generateQuiz, lastCount, lastKeyword]);

  const resetToForm = useCallback(() => {
    setMode("idle");
    setQuizId(null);
    setQuestions([]);
    setAnswers({});
    setResultMap({});
    setRetryQuestionIds([]);
    setError(null);
  }, []);

  return {
    mode,
    quizId,
    questions,
    questionsToAnswer,
    answers,
    results,
    score,
    total,
    loading,
    error,
    lastKeyword,
    lastCount,
    generateQuiz,
    selectAnswer,
    submitQuiz,
    retryWrongAnswers,
    regenerateQuiz,
    resetToForm,
  };
}
