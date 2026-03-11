import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";

const MAX_FILE_SIZE = 10 * 1024 * 1024;

export async function POST(request: Request) {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "File is required" }, { status: 400 });
  }

  if (file.size > MAX_FILE_SIZE) {
    return NextResponse.json({ error: "File too large (max 10MB)" }, { status: 400 });
  }

  const ext = file.name.toLowerCase().endsWith(".pdf")
    ? "pdf"
    : file.name.toLowerCase().endsWith(".txt")
      ? "txt"
      : null;

  if (!ext) {
    return NextResponse.json({ error: "Only .txt and .pdf are supported" }, { status: 400 });
  }

  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
  const storagePath = `${user.id}/${Date.now()}_${safeName}`;
  const buffer = Buffer.from(await file.arrayBuffer());

  const { error: uploadError } = await supabase.storage
    .from("documents")
    .upload(storagePath, buffer, { contentType: file.type || undefined, upsert: false });

  if (uploadError) {
    return NextResponse.json({ error: uploadError.message }, { status: 500 });
  }

  const { data: row, error: insertError } = await supabase
    .from("documents")
    .insert({
      user_id: user.id,
      file_name: file.name,
      file_type: ext,
      storage_path: storagePath,
      file_size: file.size,
      status: "pending",
    })
    .select("id,file_name,status")
    .single();

  if (insertError || !row) {
    return NextResponse.json({ error: insertError?.message ?? "Failed to create document" }, { status: 500 });
  }

  return NextResponse.json({
    documentId: row.id,
    fileName: row.file_name,
    status: row.status,
  });
}
