import { NextResponse } from "next/server";
import { openai } from "@/lib/openai/client";
import { safeJSONParse } from "@/lib/openai/parsers";
import { getDocumentAnalysisPrompt } from "@/lib/openai/prompts";
import { createServerClient } from "@/lib/supabase/server";
import { ApiError, handleApiError } from "@/lib/utils/apiError";
import { extractText } from "@/lib/utils/fileParser";
import { documentAnalyzeRequestSchema, documentKeyPointsSchema } from "@/lib/utils/validators";

export async function POST(request: Request) {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const rawBody = await request.json().catch(() => null);
  const parsed = documentAnalyzeRequestSchema.safeParse(rawBody);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const { documentId } = parsed.data;

  const { data: docRow, error: docError } = await supabase
    .from("documents")
    .select("id,file_type,storage_path")
    .eq("id", documentId)
    .eq("user_id", user.id)
    .single();

  if (docError || !docRow) {
    return NextResponse.json({ error: "Document not found" }, { status: 404 });
  }

  await supabase.from("documents").update({ status: "processing" }).eq("id", documentId);

  try {
    const { data: blob, error: downloadError } = await supabase.storage
      .from("documents")
      .download(docRow.storage_path);

    if (downloadError || !blob) {
      throw new ApiError(downloadError?.message ?? "Failed to download file", 500);
    }

    const buffer = Buffer.from(await blob.arrayBuffer());
    const text = (await extractText(buffer, docRow.file_type)).trim();

    if (!text) {
      throw new ApiError("Empty or unreadable document", 400);
    }

    const excerpt = text.slice(0, 10000);

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: getDocumentAnalysisPrompt() },
        { role: "user", content: excerpt },
      ],
    });

    const completionText = completion.choices[0]?.message?.content ?? "";
    const parsedPoints = documentKeyPointsSchema.safeParse(safeJSONParse(completionText, {}));

    if (!parsedPoints.success) {
      throw new ApiError("Model returned invalid key points format", 500);
    }

    const keyPoints = parsedPoints.data.keyPoints;

    await supabase
      .from("documents")
      .update({ status: "completed", key_points: keyPoints })
      .eq("id", documentId)
      .eq("user_id", user.id);

    return NextResponse.json({ documentId, keyPoints, status: "completed" });
  } catch (error) {
    await supabase
      .from("documents")
      .update({ status: "failed" })
      .eq("id", documentId)
      .eq("user_id", user.id);

    return handleApiError(error);
  }
}
