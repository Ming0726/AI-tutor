import { randomUUID } from "crypto";
import { NextResponse } from "next/server";
import type { ChatCompletionMessageParam } from "openai/resources/chat/completions";
import { createServerClient } from "@/lib/supabase/server";
import { openai } from "@/lib/openai/client";
import { getExplainSystemPrompt } from "@/lib/openai/prompts";
import { explainRequestSchema } from "@/lib/utils/validators";

export async function POST(request: Request) {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const rawBody = await request.json().catch(() => null);
  const parsed = explainRequestSchema.safeParse(rawBody);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const { message, style, level, history } = parsed.data;
  const conversationId = parsed.data.conversationId ?? randomUUID();

  const systemPrompt = getExplainSystemPrompt(style, level);
  const completionMessages: ChatCompletionMessageParam[] = [
    { role: "system", content: systemPrompt },
    ...history.map((item) => ({ role: item.role, content: item.content })),
    { role: "user", content: message },
  ];

  let stream;
  try {
    stream = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: completionMessages,
      stream: true,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "OpenAI request failed";
    return NextResponse.json({ error: message }, { status: 500 });
  };

  const encoder = new TextEncoder();
  let assistantText = "";

  const readableStream = new ReadableStream({
    async start(controller) {
      try {
        for await (const chunk of stream) {
          const delta = chunk.choices[0]?.delta?.content ?? "";
          if (!delta) continue;

          assistantText += delta;
          controller.enqueue(encoder.encode(delta));
        }
      } catch (error) {
        controller.error(error);
        return;
      }

      const fullMessages = [
        ...history,
        { role: "user" as const, content: message },
        { role: "assistant" as const, content: assistantText },
      ];

      void supabase.from("conversations").upsert(
        {
          id: conversationId,
          user_id: user.id,
          title: message.slice(0, 80),
          messages: fullMessages,
          explain_style: style,
          knowledge_level: level,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "id" },
      );

      controller.close();
    },
  });

  return new Response(readableStream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Conversation-Id": conversationId,
    },
  });
}
