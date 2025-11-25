"use client";

import { useState, useEffect } from "react";
import client from "@/api/client";
import useAuth from "@/hooks/useAuth";

export default function Dashboard() {
  const [records, setRecords] = useState([]);
  const [newRecord, setNewRecord] = useState({
    patientName: "",
    patientChart: "",
    patientMedication: "",
    patientHistory: "",
  });
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchRecords = async () => {
    const { data: session } = await client.auth.getSession();
    const token = session?.session?.access_token;

    if (!token) {
      console.log("No access token found — user may not be logged in.");
      return;
    }

    const res = await fetch("/api/patients", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (res.ok) {
      const data = await res.json();
      setRecords(data);
    } else {
      console.log("Failed to fetch records");
    }
  };

  useEffect(() => {
    fetchRecords();
  }, []);

  const { user } = useAuth();

  const createRecord = async () => {
    setLoading(true);
    const payload = {
      ...newRecord,
      doctor_id: user.id,
    };

    const token = (await client.auth.getSession()).data.session?.access_token;

    const res = await fetch("/api/patients", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      await fetchRecords();
      setNewRecord({
        patientName: "",
        patientChart: "",
        patientMedication: "",
        patientHistory: "",
      });
    } else {
      console.log("Failed to create record");
    }

    setLoading(false);
  };

  const updateRecord = async (id) => {
    setLoading(true);
    const res = await fetch(`/api/patients/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newRecord),
    });
    if (res.ok) {
      setEditingId(null);
      setNewRecord({ patientName: "", patientChart: "", patientMedication: "", patientHistory: "" });
      fetchRecords();
    } else {
      console.error("Failed to update");
    }
    setLoading(false);
  };

  const deleteRecord = async (id) => {
    const res = await fetch(`/api/patients/${id}`, { method: "DELETE" });
    if (res.ok) fetchRecords();
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8 text-black">
      <div className="max-w-3xl mx-auto bg-white shadow-md rounded-lg p-6">
        <h1 className="text-2xl font-bold mb-6">Patient Records</h1>

        {/* Input fields */}
        <div className="flex flex-col gap-4 mb-6">
          <input
            className="border p-2 rounded text-black placeholder-gray-500"
            type="text"
            placeholder="Patient Name"
            value={newRecord.patientName}
            onChange={(e) =>
              setNewRecord({ ...newRecord, patientName: e.target.value })
            }
          />
          <input
            className="border p-2 rounded text-black placeholder-gray-500"
            type="text"
            placeholder="Patient Chart"
            value={newRecord.patientChart}
            onChange={(e) =>
              setNewRecord({ ...newRecord, patientChart: e.target.value })
            }
          />
          <input
            className="border p-2 rounded text-black placeholder-gray-500"
            type="text"
            placeholder="Patient Medication"
            value={newRecord.patientMedication}
            onChange={(e) =>
              setNewRecord({ ...newRecord, patientMedication: e.target.value })
            }
          />
          <input
            className="border p-2 rounded text-black placeholder-gray-500"
            type="text"
            placeholder="Patient Medication History"
            value={newRecord.patientHistory}
            onChange={(e) =>
              setNewRecord({ ...newRecord, patientHistory: e.target.value })
            }
          />

          {editingId ? (
            <button
              onClick={() => updateRecord(editingId)}
              disabled={loading}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
            >
              {loading ? "Updating..." : "Update Record"}
            </button>
          ) : (
            <button
              onClick={createRecord}
              disabled={loading}
              className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-red-500 disabled:opacity-50"
            >
              {loading ? "Saving..." : "Add Record"}
            </button>
          )}
        </div>

        {/* Records list */}
        <ul className="space-y-3">
          {records.map((rec) => (
            <li
              key={rec.id}
              className="flex justify-between items-start border-b pb-2"
            >
              <div className="flex flex-col gap-1">
                <p className="font-semibold">Patient Name: {rec.patientName}</p>
                <p className="text-sm text-gray-600">Patient Chart: {rec.patientChart}</p>
                <p className="text-sm text-gray-600">Patient Medication: {rec.patientMedication}</p>
                <p className="text-sm text-gray-600">Patient History: {rec.patientHistory}</p>
                
                {/* Nurse comments */}
                <p className="text-sm text-gray-500 italic">
                  Nurse Comments: {rec.nurseComment ? rec.nurseComment : "No comments yet"}
                </p>
              </div>
              
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setEditingId(rec.id);
                    setNewRecord({
                      patientName: rec.patientName,
                      patientChart: rec.patientChart,
                      patientMedication: rec.patientMedication,
                      patientHistory: rec.patientHistory,
                    });
                  }}
                  className="bg-yellow-400 text-white px-3 py-1 rounded hover:bg-yellow-500"
                >
                  Edit
                </button>
                <button
                  onClick={() => deleteRecord(rec.id)}
                  className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
        {/* Sign out */}
        <div className="mt-6">
          <button
            onClick={() => client.auth.signOut()}
            className="bg-gray-800 text-white px-4 py-2 rounded hover:bg-gray-900"
          >
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
}
