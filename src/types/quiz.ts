export type Question = {
  id: string;
  question: string;
  options: string[];
};

export type QuizState = {
  quizId: string;
  keyword: string;
  count: "5" | "8" | "10";
  questions: Question[];
  answers: Record<string, number>;
  submitted: boolean;
};

export type QuizResultItem = {
  questionId: string;
  selectedIndex: number;
  correctIndex: number;
  isCorrect: boolean;
  explanation: string;
};
