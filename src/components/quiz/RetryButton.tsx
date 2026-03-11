import { Button } from "@/components/ui/Button";

type RetryButtonProps = {
  wrongCount: number;
  onRetry: () => void;
  onNewQuiz: () => void;
};

export function RetryButton({ wrongCount, onRetry, onNewQuiz }: RetryButtonProps) {
  return (
    <div className="mt-6 flex flex-wrap gap-3">
      {wrongCount > 0 ? (
        <Button variant="secondary" onClick={onRetry}>
          Retry Wrong ({wrongCount})
        </Button>
      ) : null}
      <Button onClick={onNewQuiz}>New Quiz</Button>
    </div>
  );
}
