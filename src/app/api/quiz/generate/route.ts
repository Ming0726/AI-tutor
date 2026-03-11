import { NextResponse } from "next/server";
import { openai } from "@/lib/openai/client";
import { safeJSONParse } from "@/lib/openai/parsers";
import { getQuizSystemPrompt } from "@/lib/openai/prompts";
import { createServerClient } from "@/lib/supabase/server";
import { quizGenerateSchema, quizQuestionsSchema } from "@/lib/utils/validators";

export async function POST(request: Request) {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const rawBody = await request.json().catch(() => null);
  const parsed = quizGenerateSchema.safeParse(rawBody);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const { keyword, count, categoryId } = parsed.data;
  const countNum = Number(count);

  let completionText = "";
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: getQuizSystemPrompt(countNum) },
        { role: "user", content: keyword },
      ],
    });
    completionText = completion.choices[0]?.message?.content ?? "";
  } catch (error) {
    const message = error instanceof Error ? error.message : "OpenAI generate failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }

  const parsedAI = quizQuestionsSchema.safeParse(safeJSONParse(completionText, {}));
  if (!parsedAI.success) {
    return NextResponse.json({ error: "Invalid quiz format from model" }, { status: 500 });
  }

  const fullQuestions = parsedAI.data.questions.slice(0, countNum);
  if (fullQuestions.length !== countNum) {
    return NextResponse.json({ error: "Model did not return expected question count" }, { status: 500 });
  }

  const { data: quizRow, error: insertError } = await supabase
    .from("quizzes")
    .insert({
      user_id: user.id,
      category_id: categoryId ?? null,
      keyword,
      questions: fullQuestions,
    })
    .select("id")
    .single();

  if (insertError || !quizRow) {
    return NextResponse.json({ error: insertError?.message ?? "Failed to save quiz" }, { status: 500 });
  }

  const safeQuestions = fullQuestions.map(({ id, question, options }) => ({ id, question, options }));

  return NextResponse.json({
    quizId: quizRow.id,
    questions: safeQuestions,
  });
}
