// import { NextResponse } from "next/server";
// import { createClient } from "@supabase/supabase-js";

// export async function GET() {
//   const supabase = createClient(
//     process.env.NEXT_PUBLIC_SUPABASE_URL,
//     process.env.SUPABASE_SERVICE_ROLE_KEY,
//     { auth: { persistSession: false } }
//   );

//   const { data, error } = await supabase.auth.admin.listUsers();

//   if (error) {
//     console.error(error);
//     return NextResponse.json({ users: [] }, { status: 500 });
//   }

//   return NextResponse.json({ users: data.users });
// }
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function GET() {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY,   // IMPORTANT
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    const { data, error } = await supabase.auth.admin.listUsers();

    if (error) {
      console.error("List users error:", error);
      return NextResponse.json({ users: [] }, { status: 500 });
    }

    // Ensure banned_until, metadata and timestamps are included
    const users = data.users.map(u => ({
      id: u.id,
      email: u.email,
      created_at: u.created_at,
      banned_until: u.banned_until || null,
      user_metadata: u.user_metadata || {}
    }));

    return NextResponse.json({ users }, { status: 200 });

  } catch (err) {
    console.error("Users route error:", err);
    return NextResponse.json({ users: [] }, { status: 500 });
  }
}
