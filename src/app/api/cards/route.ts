import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const categoryId = searchParams.get("categoryId");
  const search = searchParams.get("search")?.trim();
  const page = Math.max(Number(searchParams.get("page") ?? "1"), 1);
  const limit = Math.min(Math.max(Number(searchParams.get("limit") ?? "50"), 1), 100);
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  let query = supabase
    .from("cards")
    .select("id,title,summary,content,illustration_url,is_favorited,is_starred,created_at,categories(name)", {
      count: "exact",
    })
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .range(from, to);

  if (categoryId) {
    query = query.eq("category_id", categoryId);
  }

  if (search) {
    query = query.or(`title.ilike.%${search}%,summary.ilike.%${search}%`);
  }

  const { data, error, count } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ cards: data ?? [], total: count ?? 0, page, limit });
}

export async function POST(request: Request) {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  if (!body || typeof body.title !== "string" || typeof body.summary !== "string") {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const source = body.source === "document_analysis" ? "document_analysis" : "manual";
  const content = typeof body.content === "string" && body.content.trim() ? body.content : body.summary;

  const { data, error } = await supabase
    .from("cards")
    .insert({
      user_id: user.id,
      category_id: typeof body.categoryId === "string" ? body.categoryId : null,
      title: body.title,
      summary: body.summary,
      content,
      source,
      source_document_id: typeof body.sourceDocumentId === "string" ? body.sourceDocumentId : null,
      illustration_url: null,
    })
    .select("id,title,summary,content,illustration_url,is_favorited,is_starred,created_at")
    .single();

  if (error || !data) {
    return NextResponse.json({ error: error?.message ?? "Create card failed" }, { status: 500 });
  }

  return NextResponse.json(data);
}
