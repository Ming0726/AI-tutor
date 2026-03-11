import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";

type PatchBody = {
  is_favorited?: boolean;
  is_starred?: boolean;
};

type RouteContext = {
  params: Promise<{ cardId: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  const { cardId } = await context.params;
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data, error } = await supabase
    .from("cards")
    .select("id,title,summary,content,illustration_url,is_favorited,is_starred,created_at,categories(name)")
    .eq("id", cardId)
    .eq("user_id", user.id)
    .single();

  if (error || !data) {
    return NextResponse.json({ error: "Card not found" }, { status: 404 });
  }

  return NextResponse.json(data);
}

export async function PATCH(request: Request, context: RouteContext) {
  const { cardId } = await context.params;
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json().catch(() => null)) as PatchBody | null;
  if (!body || (body.is_favorited === undefined && body.is_starred === undefined)) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const updates: PatchBody = {};
  if (body.is_favorited !== undefined) updates.is_favorited = body.is_favorited;
  if (body.is_starred !== undefined) updates.is_starred = body.is_starred;

  const { data, error } = await supabase
    .from("cards")
    .update(updates)
    .eq("id", cardId)
    .eq("user_id", user.id)
    .select("id,is_favorited,is_starred")
    .single();

  if (error || !data) {
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }

  return NextResponse.json(data);
}
