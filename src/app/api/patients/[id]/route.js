import { NextResponse } from "next/server";
import client from "@/api/client";

export async function PATCH(req, { params }) {
  const { id } = params;
  const accessToken = req.headers.get("authorization")?.split(" ")[1];
  const { data: { user } } = await client.auth.getUser(accessToken);

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();

  if (user.user_metadata.type === "nurse") {
    const { nurseComment } = body;

    // Fetch existing record
    const { data: record, error: fetchErr } = await client
      .from("patient_records")
      .select("nurseComment")
      .eq("id", id)
      .single();

    if (fetchErr) return NextResponse.json({ error: fetchErr.message }, { status: 500 });

    const updatedComments = record.nurseComment
      ? record.nurseComment + "\n" + nurseComment
      : nurseComment;

    const { error } = await client
      .from("patient_records")
      .update({ nurseComment: updatedComments })
      .eq("id", id);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ message: "Nurse comment updated" });
  }


  // Doctors can update all fields
  const { error } = await client
    .from("patient_records")
    .update(body)
    .eq("id", id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ message: "Record updated" });
}

// DELETE — Delete record
export async function DELETE(req, { params }) {
  const { id } = params;

  const { error } = await client
    .from("patient_records")
    .delete()
    .eq("id", id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ message: "Record deleted" });
}