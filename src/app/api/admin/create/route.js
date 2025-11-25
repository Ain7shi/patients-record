import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const admin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function POST(req) {
  const body = await req.json();
  const { email, password, name, type, birthdate, employeeId } = body;

  const { data, error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: {
      name,
      type,
      birthdate,
      id: employeeId,
    },
  });

  if (error) return NextResponse.json({ error }, { status: 400 });

  return NextResponse.json({ success: true });
}
