import { NextResponse } from "next/server";
import client from "@/api/client";

// app/api/patients/route.js
export async function GET(req) {
  const accessToken = req.headers.get("authorization")?.split(" ")[1];
  const { data: { user } } = await client.auth.getUser(accessToken);

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let query = client.from("patient_records").select("*");

  // Doctors: only their patients
  if (user.user_metadata.type === "doctor") {
    query = query.eq("doctor_id", user.id);
  }
  // Nurses: no filter, see all patients

  const { data, error } = await query;

  if (error) {
    console.error(error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function POST(req) {
  const accessToken = req.headers.get("authorization")?.split(" ")[1];
  const { data: { user } } = await client.auth.getUser(accessToken);

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  //only doctors can create
  if (user.user_metadata.type !== "doctor") {
    return NextResponse.json({ error: "Forbidden: Only doctors can add patients" }, { status: 403 });
  }

  const { patientName, patientChart, patientMedication, patientHistory } = await req.json();

  if (!patientName || !patientChart || !patientMedication || !patientHistory) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const { error } = await client.from("patient_records").insert([
    {
      patientName,
      patientChart,
      patientMedication,
      patientHistory,
      doctor_id: user.id, //assign owner
    },
  ]);

  if (error) {
    console.error(error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ message: "Record created successfully" }, { status: 201 });
}
