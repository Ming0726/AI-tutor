import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { quizQuestionsSchema, quizSubmitSchema } from "@/lib/utils/validators";

export async function POST(request: Request) {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const rawBody = await request.json().catch(() => null);
  const parsed = quizSubmitSchema.safeParse(rawBody);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const { quizId, answers } = parsed.data;

  const { data: quizRow, error: quizError } = await supabase
    .from("quizzes")
    .select("questions")
    .eq("id", quizId)
    .eq("user_id", user.id)
    .single();

  if (quizError || !quizRow) {
    return NextResponse.json({ error: "Quiz not found" }, { status: 404 });
  }

  const parsedQuestions = quizQuestionsSchema.safeParse(quizRow.questions);
  if (!parsedQuestions.success) {
    return NextResponse.json({ error: "Invalid quiz data" }, { status: 500 });
  }

  const questions = parsedQuestions.data.questions;
  const questionMap = new Map(questions.map((q) => [q.id, q]));

  const results = answers.map((answer) => {
    const question = questionMap.get(answer.questionId);
    if (!question) {
      return null;
    }

    const isCorrect = answer.selectedIndex === question.correctIndex;

    return {
      questionId: question.id,
      selectedIndex: answer.selectedIndex,
      correctIndex: question.correctIndex,
      isCorrect,
      explanation: question.explanation,
    };
  });

  if (results.some((item) => item === null)) {
    return NextResponse.json({ error: "Answer contains unknown question id" }, { status: 400 });
  }

  const normalizedResults = results.filter((item): item is NonNullable<typeof item> => item !== null);
  const score = normalizedResults.filter((item) => item.isCorrect).length;
  const wrongIds = normalizedResults.filter((item) => !item.isCorrect).map((item) => item.questionId);

  const { error: insertError } = await supabase.from("quiz_results").insert({
    quiz_id: quizId,
    user_id: user.id,
    answers,
    score,
    total: normalizedResults.length,
    wrong_ids: wrongIds,
  });

  if (insertError) {
    return NextResponse.json({ error: insertError.message }, { status: 500 });
  }

  return NextResponse.json({
    score,
    total: normalizedResults.length,
    results: normalizedResults,
  });
}
