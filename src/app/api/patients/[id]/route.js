import { NextResponse } from "next/server";
import client from "@/api/client";

// PATCH — Update record
// export async function PATCH(req, { params }) {
//   const { id } = params;
//   const body = await req.json();

//   const { error } = await client
//     .from("patient_records")
//     .update(body)
//     .eq("id", id);

//   if (error) return NextResponse.json({ error: error.message }, { status: 500 });

//   return NextResponse.json({ message: "Record updated" });
// }
export async function PATCH(req, { params }) {
  const { id } = params;
  const accessToken = req.headers.get("authorization")?.split(" ")[1];
  const { data: { user } } = await client.auth.getUser(accessToken);

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: record } = await client
    .from("patient_records")
    .select("doctor_id")
    .eq("id", id)
    .single();

  if (record.doctor_id !== user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
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
