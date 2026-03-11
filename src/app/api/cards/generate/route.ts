import { randomUUID } from "crypto";
import { NextResponse } from "next/server";
import { openai } from "@/lib/openai/client";
import { safeJSONParse } from "@/lib/openai/parsers";
import { getCardSystemPrompt } from "@/lib/openai/prompts";
import { createServerClient } from "@/lib/supabase/server";
import { cardGenerateSchema, cardPayloadSchema } from "@/lib/utils/validators";

export async function POST(request: Request) {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const rawBody = await request.json().catch(() => null);
  const parsed = cardGenerateSchema.safeParse(rawBody);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const { topic, categoryId } = parsed.data;

  let payloadText = "";
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: getCardSystemPrompt() },
        { role: "user", content: topic },
      ],
    });
    payloadText = completion.choices[0]?.message?.content ?? "";
  } catch (error) {
    const message = error instanceof Error ? error.message : "OpenAI generate failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }

  const parsedPayload = cardPayloadSchema.safeParse(safeJSONParse(payloadText, {}));
  if (!parsedPayload.success) {
    return NextResponse.json({ error: "Invalid card format from model" }, { status: 500 });
  }

  const { title, summary, content } = parsedPayload.data;

  const { data: insertedCard, error: insertError } = await supabase
    .from("cards")
    .insert({
      user_id: user.id,
      category_id: categoryId ?? null,
      title,
      summary,
      content,
      illustration_url: null,
      source: "manual",
    })
    .select("id,user_id,category_id,title,summary,content,illustration_url,is_favorited,is_starred,created_at,categories(name)")
    .single();

  if (insertError || !insertedCard) {
    return NextResponse.json({ error: insertError?.message ?? "Failed to save card" }, { status: 500 });
  }

  let illustrationUrl: string | null = null;

  try {
    const imageResponse = await openai.images.generate({
      model: "dall-e-3",
      prompt: `Educational illustration for the concept: "${title}". Style: hand-drawn, warm colors, simple and clear, suitable for a study flashcard.`,
      n: 1,
      size: "1024x1024",
      quality: "standard",
    });

    const remoteUrl = imageResponse.data?.[0]?.url;
    if (remoteUrl) {
      const imageBinary = await fetch(remoteUrl).then((res) => res.arrayBuffer());
      const filePath = `${user.id}/${insertedCard.id}-${randomUUID()}.png`;

      const uploadResult = await supabase.storage
        .from("illustrations")
        .upload(filePath, imageBinary, { contentType: "image/png", upsert: false });

      if (!uploadResult.error) {
        const { data: publicData } = supabase.storage.from("illustrations").getPublicUrl(filePath);
        illustrationUrl = publicData.publicUrl;

        await supabase
          .from("cards")
          .update({ illustration_url: illustrationUrl })
          .eq("id", insertedCard.id)
          .eq("user_id", user.id);
      }
    }
  } catch {
    illustrationUrl = null;
  }

  return NextResponse.json({
    id: insertedCard.id,
    title,
    summary,
    content,
    illustration_url: illustrationUrl,
    is_favorited: insertedCard.is_favorited ?? false,
    is_starred: insertedCard.is_starred ?? false,
    category_name: null,
    created_at: insertedCard.created_at,
  });
}
