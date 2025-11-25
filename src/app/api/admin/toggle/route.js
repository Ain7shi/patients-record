import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(req) {
  try {
    const { id, status } = await req.json();

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY,
      { auth: { persistSession: false } }
    );

    const { error, data } = await supabase.auth.admin.updateUserById(id, {
      user_metadata: { status }, // update the custom status
    });

    await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/mail/send`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        to: user.email,
        subject: disable
          ? "Your Account Has Been Deactivated"
          : "Your Account Has Been Reactivated",
        html: `
          <p>Hello ${user.user_metadata?.name},</p>
          <p>Your account has been <b>${disable ? "deactivated" : "reactivated"}</b> by the admin.</p>
          <p>If you believe this is a mistake, please contact support.</p>
        `,
      }),
    });

    if (error) {
      console.error("Toggle error:", error);
      return NextResponse.json({ error: "Toggle failed" }, { status: 500 });
    }

    return NextResponse.json({ success: true, user: data.user });
  } catch (err) {
    console.error("Route exception:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
