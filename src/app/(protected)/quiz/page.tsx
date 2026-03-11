"use client";

import Link from "next/link";
import { QuestionCard } from "@/components/quiz/QuestionCard";
import { QuizForm } from "@/components/quiz/QuizForm";
import { QuizResult } from "@/components/quiz/QuizResult";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { useQuiz } from "@/hooks/useQuiz";

function QuizLoadingSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 4 }).map((_, index) => (
        <div key={index} className="rounded-card bg-card p-5 shadow-card">
          <Skeleton variant="text" className="h-5 w-2/3" />
          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            <Skeleton variant="button" className="h-11 w-full" />
            <Skeleton variant="button" className="h-11 w-full" />
            <Skeleton variant="button" className="h-11 w-full" />
            <Skeleton variant="button" className="h-11 w-full" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function QuizPage() {
  const {
    mode,
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
  } = useQuiz();

  const allAnswered =
    questionsToAnswer.length > 0 && questionsToAnswer.every((question) => answers[question.id] !== undefined);

  return (
    <main className="min-h-screen bg-cream px-4 py-4">
      <div className="mx-auto max-w-4xl">
        <header className="mb-4 flex items-center gap-3">
          <Link
            href="/"
            className="inline-flex h-10 w-10 items-center justify-center rounded-card border border-card-border bg-card"
            aria-label="Back"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M15 18 9 12l6-6" />
            </svg>
          </Link>
          <h1 className="font-display text-3xl text-text-primary">AI Quiz</h1>
        </header>

        {error ? <p className="mb-3 text-sm font-semibold text-error">{error}</p> : null}

        {mode === "idle" ? (
          <>
            {loading ? (
              <QuizLoadingSkeleton />
            ) : (
              <QuizForm
                initialKeyword={lastKeyword}
                initialCount={lastCount}
                loading={loading}
                onGenerate={generateQuiz}
              />
            )}
            <div className="mt-4 rounded-card bg-card p-5 text-sm text-text-secondary shadow-card">
              Your quizzes will appear here.
            </div>
          </>
        ) : null}

        {mode === "answering" ? (
          <section>
            {questionsToAnswer.map((question) => {
              const realIndex = questions.findIndex((item) => item.id === question.id) + 1;
              return (
                <QuestionCard
                  key={question.id}
                  question={question}
                  index={realIndex}
                  selectedIndex={answers[question.id]}
                  onSelect={(optionIndex) => selectAnswer(question.id, optionIndex)}
                />
              );
            })}

            <div className="mt-4 flex gap-3">
              <Button loading={loading} disabled={!allAnswered} onClick={() => void submitQuiz()}>
                Submit Answers
              </Button>
              <Button variant="secondary" onClick={resetToForm}>
                Cancel
              </Button>
            </div>
          </section>
        ) : null}

        {mode === "result" ? (
          <QuizResult
            score={score}
            total={total}
            questions={questions}
            results={results}
            onRetryWrong={retryWrongAnswers}
            onNewQuiz={() => void regenerateQuiz()}
          />
        ) : null}
      </div>
    </main>
  );
}
