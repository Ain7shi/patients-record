import { NextResponse } from "next/server";
import client from "@/api/client";

export async function PATCH(req, { params }) {
  const { id } = params;
  const accessToken = req.headers.get("authorization")?.split(" ")[1];
  const { data: { user } } = await client.auth.getUser(accessToken);

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Only nurses can delete their comments
  if (user.user_metadata.type !== "nurse") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Clear nurseComment
  const { error } = await client
    .from("patient_records")
    .update({ nurseComment: null })
    .eq("id", id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ message: "Nurse comment deleted" });
}
