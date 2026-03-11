import { QuestionCard } from "@/components/quiz/QuestionCard";
import { RetryButton } from "@/components/quiz/RetryButton";
import type { Question, QuizResultItem } from "@/types/quiz";

type QuizResultProps = {
  score: number;
  total: number;
  questions: Question[];
  results: QuizResultItem[];
  onRetryWrong: () => void;
  onNewQuiz: () => void;
};

export function QuizResult({
  score,
  total,
  questions,
  results,
  onRetryWrong,
  onNewQuiz,
}: QuizResultProps) {
  const ratio = total > 0 ? score / total : 0;
  const message = ratio >= 0.8 ? "Excellent! 🎉" : ratio >= 0.6 ? "Good job! 💪" : "Keep studying! 📚";
  const wrongCount = total - score;

  return (
    <section>
      <div className="mb-6 rounded-card bg-card p-6 shadow-card">
        <div className="flex items-center gap-4">
          <div className="flex h-24 w-24 items-center justify-center rounded-full border-4 border-accent text-2xl font-bold text-text-primary">
            {score}/{total}
          </div>
          <div>
            <p className="text-xl font-bold text-text-primary">{message}</p>
            <p className="text-sm text-text-secondary">Review each explanation below.</p>
          </div>
        </div>
        <RetryButton wrongCount={wrongCount} onRetry={onRetryWrong} onNewQuiz={onNewQuiz} />
      </div>

      {questions.map((question, idx) => {
        const result = results.find((item) => item.questionId === question.id);
        if (!result) return null;

        return (
          <QuestionCard
            key={question.id}
            question={question}
            index={idx + 1}
            selectedIndex={result.selectedIndex}
            result={result}
          />
        );
      })}
    </section>
  );
}
