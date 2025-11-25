import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const admin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function POST(req) {
  const { id } = await req.json();

  const { error } = await admin.auth.admin.deleteUser(id);

  if (error) return NextResponse.json({ error }, { status: 400 });

  return NextResponse.json({ success: true });
}
